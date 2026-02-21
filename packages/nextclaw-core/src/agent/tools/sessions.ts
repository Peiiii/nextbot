import crypto from "node:crypto";
import { Tool } from "./base.js";
import type { SessionManager } from "../../session/manager.js";
import type { MessageBus } from "../../bus/queue.js";
import type { InboundMessage, OutboundMessage } from "../../bus/events.js";

const DEFAULT_LIMIT = 20;
const DEFAULT_MESSAGE_LIMIT = 0;
const MAX_MESSAGE_LIMIT = 20;
const HISTORY_MAX_BYTES = 80 * 1024;
const HISTORY_TEXT_MAX_CHARS = 4000;

const toInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : fallback;
};

const parseSessionKey = (key: string): { channel: string; chatId: string } | null => {
  const trimmed = key.trim();
  const separator = trimmed.indexOf(":");
  if (separator <= 0 || separator >= trimmed.length - 1) {
    return null;
  }
  const channel = trimmed.slice(0, separator);
  const chatId = trimmed.slice(separator + 1);
  if (!channel || !chatId) {
    return null;
  }
  return { channel, chatId };
};

const parseAgentIdFromSessionKey = (key: string): string | null => {
  const normalized = key.trim().toLowerCase();
  if (!normalized.startsWith("agent:")) {
    return null;
  }
  const parts = normalized.split(":");
  const agentId = parts[1]?.trim();
  return agentId || null;
};

const parseAgentSessionRoute = (key: string): { channel: string; chatId: string; accountId?: string } | null => {
  const normalized = key.trim().toLowerCase();
  if (!normalized.startsWith("agent:")) {
    return null;
  }
  const parts = normalized.split(":");
  if (parts.length >= 6 && ["direct", "group", "channel"].includes(parts[4])) {
    const chatId = parts.slice(5).join(":");
    if (!chatId) {
      return null;
    }
    return {
      channel: parts[2],
      accountId: parts[3],
      chatId
    };
  }
  if (parts.length >= 5 && ["direct", "group", "channel"].includes(parts[3])) {
    const chatId = parts.slice(4).join(":");
    if (!chatId) {
      return null;
    }
    return {
      channel: parts[2],
      chatId
    };
  }
  return null;
};

const normalizeOptionalString = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
};

const resolveDeliveryRouteFromSession = (session: { metadata: Record<string, unknown> } | null | undefined) => {
  if (!session) {
    return null;
  }
  const metadata = session.metadata ?? {};
  const deliveryContext =
    metadata.last_delivery_context && typeof metadata.last_delivery_context === "object"
      ? (metadata.last_delivery_context as Record<string, unknown>)
      : undefined;
  const contextChannel = normalizeOptionalString(deliveryContext?.channel);
  const contextChatId = normalizeOptionalString(deliveryContext?.chatId);
  const fallbackChannel = normalizeOptionalString(metadata.last_channel);
  const fallbackChatId = normalizeOptionalString(metadata.last_to);
  const accountId =
    normalizeOptionalString(deliveryContext?.accountId) ??
    normalizeOptionalString(metadata.last_account_id) ??
    normalizeOptionalString(metadata.last_accountId);
  const channel = contextChannel ?? fallbackChannel;
  const chatId = contextChatId ?? fallbackChatId;
  if (!channel || !chatId) {
    return null;
  }
  return {
    channel,
    chatId,
    accountId
  };
};

type SessionsSendContext = {
  currentSessionKey?: string;
  currentAgentId?: string;
  channel?: string;
  chatId?: string;
  maxPingPongTurns?: number;
  currentHandoffDepth?: number;
};

const classifySessionKind = (key: string): string => {
  if (key.startsWith("cron:") || key === "heartbeat") {
    return "cron";
  }
  if (key.startsWith("hook:")) {
    return "hook";
  }
  if (key.startsWith("subagent:") || key.startsWith("node:")) {
    return "node";
  }
  if (key.startsWith("system:")) {
    return "other";
  }
  return "main";
};

const truncateHistoryText = (text: string): { text: string; truncated: boolean } => {
  if (text.length <= HISTORY_TEXT_MAX_CHARS) {
    return { text, truncated: false };
  }
  return { text: `${text.slice(0, HISTORY_TEXT_MAX_CHARS)}\n…(truncated)…`, truncated: true };
};

const sanitizeHistoryMessage = (msg: { role: string; content: string; timestamp: string }) => {
  const entry = { ...msg };
  const res = truncateHistoryText(entry.content ?? "");
  return { message: { ...entry, content: res.text }, truncated: res.truncated };
};

const jsonBytes = (value: unknown): number => {
  try {
    return Buffer.byteLength(JSON.stringify(value), "utf8");
  } catch {
    return Buffer.byteLength(String(value), "utf8");
  }
};

const enforceHistoryHardCap = (items: unknown[]): unknown[] => {
  const bytes = jsonBytes(items);
  if (bytes <= HISTORY_MAX_BYTES) {
    return items;
  }
  const last = items.at(-1);
  if (last && jsonBytes([last]) <= HISTORY_MAX_BYTES) {
    return [last];
  }
  return [{ role: "assistant", content: "[sessions_history omitted: message too large]" }];
};

const toTimestamp = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

export class SessionsListTool extends Tool {
  constructor(private sessions: SessionManager) {
    super();
  }

  get name(): string {
    return "sessions_list";
  }

  get description(): string {
    return "List available sessions with timestamps";
  }

  get parameters(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        kinds: {
          type: "array",
          items: { type: "string" },
          description: "Filter by session kinds (main/group/cron/hook/other)"
        },
        limit: { type: "integer", minimum: 1, description: "Maximum number of sessions to return" },
        activeMinutes: { type: "integer", minimum: 1, description: "Only include active sessions" },
        messageLimit: { type: "integer", minimum: 0, description: "Include last N messages (max 20)" }
      }
    };
  }

  async execute(params: Record<string, unknown>): Promise<string> {
    const limit = toInt(params.limit, DEFAULT_LIMIT);
    const rawKinds = Array.isArray(params.kinds) ? params.kinds.map((k) => String(k).toLowerCase()) : [];
    const kinds = rawKinds.length ? new Set(rawKinds) : null;
    const activeMinutes = toInt(params.activeMinutes, 0);
    const messageLimit = Math.min(toInt(params.messageLimit, DEFAULT_MESSAGE_LIMIT), MAX_MESSAGE_LIMIT);
    const now = Date.now();
    const sessions = this.sessions
      .listSessions()
      .sort((a, b) => (toTimestamp(b.updated_at) ?? 0) - (toTimestamp(a.updated_at) ?? 0))
      .filter((entry) => {
        if (activeMinutes > 0 && entry.updated_at) {
          const updated = Date.parse(String(entry.updated_at));
          if (Number.isFinite(updated) && now - updated > activeMinutes * 60 * 1000) {
            return false;
          }
        }
        if (kinds) {
          const kind = classifySessionKind(String(entry.key ?? ""));
          if (!kinds.has(kind)) {
            return false;
          }
        }
        return true;
      })
      .slice(0, limit)
      .map((entry) => {
        const key = String(entry.key ?? "");
        const kind = classifySessionKind(key);
        const parsed = parseSessionKey(key);
        const metadata = (entry.metadata as Record<string, unknown> | undefined) ?? {};
        const label =
          typeof metadata.label === "string"
            ? metadata.label
            : typeof metadata.session_label === "string"
              ? metadata.session_label
              : undefined;
        const displayName =
          typeof metadata.displayName === "string"
            ? metadata.displayName
            : typeof metadata.display_name === "string"
              ? metadata.display_name
              : undefined;
        const deliveryContext =
          metadata.deliveryContext && typeof metadata.deliveryContext === "object"
            ? (metadata.deliveryContext as Record<string, unknown>)
            : undefined;
        const updatedAt = toTimestamp(entry.updated_at);
        const createdAt = toTimestamp(entry.created_at);
        const base: Record<string, unknown> = {
          key,
          kind,
          channel: parsed?.channel,
          label,
          displayName,
          deliveryContext,
          updatedAt,
          createdAt,
          sessionId: key,
          lastChannel:
            typeof metadata.last_channel === "string"
              ? metadata.last_channel
              : parsed?.channel ?? undefined,
          lastTo:
            typeof metadata.last_to === "string" ? metadata.last_to : parsed?.chatId ?? undefined,
          lastAccountId: typeof metadata.last_account_id === "string" ? metadata.last_account_id : undefined,
          transcriptPath: entry.path
        };
        if (messageLimit > 0) {
          const session = this.sessions.getIfExists(key);
          if (session) {
            const filtered = session.messages.filter((msg) => msg.role !== "tool");
            const recent = filtered.slice(-messageLimit).map((msg) => ({
              role: msg.role,
              content: msg.content,
              timestamp: msg.timestamp
            }));
            const sanitized = recent.map((msg) => sanitizeHistoryMessage(msg).message);
            base.messages = sanitized;
          }
        }
        return base;
      });
    return JSON.stringify({ sessions }, null, 2);
  }
}

export class SessionsHistoryTool extends Tool {
  constructor(private sessions: SessionManager) {
    super();
  }

  get name(): string {
    return "sessions_history";
  }

  get description(): string {
    return "Fetch recent messages from a session";
  }

  get parameters(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        sessionKey: { type: "string", description: "Session key in the format channel:chatId" },
        limit: { type: "integer", minimum: 1, description: "Maximum number of messages to return" },
        includeTools: { type: "boolean", description: "Include tool messages" }
      },
      required: ["sessionKey"]
    };
  }

  async execute(params: Record<string, unknown>): Promise<string> {
    const sessionKey = String(params.sessionKey ?? "").trim();
    if (!sessionKey) {
      return "Error: sessionKey is required";
    }
    let session = this.sessions.getIfExists(sessionKey);
    if (!session) {
      const candidates = this.sessions.listSessions();
      const match = candidates.find((entry) => {
        const key = typeof entry.key === "string" ? entry.key : "";
        if (key === sessionKey || key.endsWith(`:${sessionKey}`)) {
          return true;
        }
        const meta = entry.metadata as Record<string, unknown> | undefined;
        const metaLabel = meta?.label ?? meta?.session_label;
        return typeof metaLabel === "string" && metaLabel.trim() === sessionKey;
      });
      const resolvedKey = match && typeof match.key === "string" ? match.key : "";
      if (resolvedKey) {
        session = this.sessions.getIfExists(resolvedKey);
      }
    }
    if (!session) {
      return `Error: session '${sessionKey}' not found`;
    }
    const limit = toInt(params.limit, DEFAULT_LIMIT);
    const includeTools = typeof params.includeTools === "boolean" ? params.includeTools : false;
    const filtered = includeTools ? session.messages : session.messages.filter((msg) => msg.role !== "tool");
    const recent = filtered.slice(-limit).map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));
    const sanitized = recent.map((msg) => sanitizeHistoryMessage(msg).message);
    const capped = enforceHistoryHardCap(sanitized);
    return JSON.stringify({ sessionKey, messages: capped }, null, 2);
  }
}

export class SessionsSendTool extends Tool {
  private context: SessionsSendContext = {};

  constructor(
    private sessions: SessionManager,
    private bus: MessageBus
  ) {
    super();
  }

  setContext(context: SessionsSendContext): void {
    this.context = {
      ...context,
      currentAgentId: context.currentAgentId?.trim().toLowerCase() || undefined
    };
  }

  get name(): string {
    return "sessions_send";
  }

  get description(): string {
    return "Send a message to another session (cross-channel delivery)";
  }

  get parameters(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        sessionKey: {
          type: "string",
          description: "Target session key (channel:chatId or agent-scoped session key)"
        },
        label: { type: "string", description: "Session label (if sessionKey not provided)" },
        agentId: { type: "string", description: "Optional target agent id for internal handoff" },
        message: { type: "string", description: "Message content to send" },
        timeoutSeconds: { type: "number", description: "Optional timeout in seconds" },
        content: { type: "string", description: "Alias for message" },
        replyTo: { type: "string", description: "Message ID to reply to" },
        silent: { type: "boolean", description: "Send without notification where supported" }
      },
      required: []
    };
  }

  async execute(params: Record<string, unknown>): Promise<string> {
    const runId = crypto.randomUUID();
    const sessionKeyParam = String(params.sessionKey ?? "").trim();
    const labelParam = String(params.label ?? "").trim();
    const targetAgentParam = String(params.agentId ?? "").trim().toLowerCase();
    if (sessionKeyParam && labelParam) {
      return JSON.stringify(
        { runId, status: "error", error: "Provide either sessionKey or label (not both)" },
        null,
        2
      );
    }
    let sessionKey = sessionKeyParam;
    const message = String(params.message ?? params.content ?? "");
    if (!message) {
      return JSON.stringify({ runId, status: "error", error: "message is required" }, null, 2);
    }
    if (!sessionKey) {
      const label = labelParam;
      if (!label) {
        return JSON.stringify({ runId, status: "error", error: "sessionKey or label is required" }, null, 2);
      }
      const candidates = this.sessions.listSessions();
      const match = candidates.find((entry) => {
        const key = typeof entry.key === "string" ? entry.key : "";
        if (key === label || key.endsWith(`:${label}`)) {
          return true;
        }
        const meta = entry.metadata as Record<string, unknown> | undefined;
        const metaLabel = meta?.label ?? meta?.session_label;
        return typeof metaLabel === "string" && metaLabel.trim() === label;
      });
      sessionKey = match && typeof match.key === "string" ? match.key : "";
      if (!sessionKey) {
        return JSON.stringify(
          { runId, status: "error", error: `no session found for label '${label}'` },
          null,
          2
        );
      }
    }

    const session = this.sessions.getIfExists(sessionKey);
    const parsed = parseSessionKey(sessionKey);
    const routeFromSession = resolveDeliveryRouteFromSession(session);
    const routeFromAgentSession = parseAgentSessionRoute(sessionKey);
    const route: { channel: string; chatId: string; accountId?: string } | null =
      routeFromSession ??
      routeFromAgentSession ??
      (parsed && parsed.channel !== "agent" ? { channel: parsed.channel, chatId: parsed.chatId } : null);
    if (!route) {
      return JSON.stringify(
        {
          runId,
          status: "error",
          error: "Cannot resolve delivery route for session. Use a routable session key or an existing session label."
        },
        null,
        2
      );
    }

    const callerAgentId = this.context.currentAgentId;
    const targetAgentId = targetAgentParam || parseAgentIdFromSessionKey(sessionKey) || callerAgentId;
    const isCrossAgent = Boolean(callerAgentId && targetAgentId && callerAgentId !== targetAgentId);
    const currentHandoffDepth = toInt(this.context.currentHandoffDepth, 0);
    const maxPingPongTurns = toInt(this.context.maxPingPongTurns, 0);
    const nextHandoffDepth = currentHandoffDepth + 1;
    if (isCrossAgent) {
      if (maxPingPongTurns <= 0) {
        return JSON.stringify(
          {
            runId,
            status: "error",
            error: "Cross-agent handoff blocked by session.agentToAgent.maxPingPongTurns=0"
          },
          null,
          2
        );
      }
      if (nextHandoffDepth > maxPingPongTurns) {
        return JSON.stringify(
          {
            runId,
            status: "error",
            error: `Cross-agent handoff blocked: depth ${nextHandoffDepth} exceeds max ${maxPingPongTurns}`
          },
          null,
          2
        );
      }
    }

    const replyTo = params.replyTo ? String(params.replyTo) : undefined;
    const silent = typeof params.silent === "boolean" ? params.silent : undefined;

    if (isCrossAgent && targetAgentId) {
      const metadata: Record<string, unknown> = {
        source: "sessions_send",
        target_agent_id: targetAgentId,
        session_key_override: sessionKey,
        agent_handoff_depth: nextHandoffDepth,
        ...(callerAgentId ? { agent_handoff_from: callerAgentId } : {}),
        ...(route.accountId ? { account_id: route.accountId, accountId: route.accountId } : {})
      };
      const inbound: InboundMessage = {
        channel: route.channel,
        chatId: route.chatId,
        senderId: callerAgentId ? `agent:${callerAgentId}` : "agent:unknown",
        content: message,
        timestamp: new Date(),
        attachments: [],
        metadata
      };
      await this.bus.publishInbound(inbound);

      const targetSession = this.sessions.getOrCreate(sessionKey);
      this.sessions.addMessage(targetSession, "user", message, {
        via: "sessions_send",
        from_agent: callerAgentId ?? "unknown"
      });
      this.sessions.save(targetSession);

      return JSON.stringify(
        {
          runId,
          status: "ok",
          sessionKey,
          dispatched: "inbound",
          targetAgentId,
          handoffDepth: nextHandoffDepth
        },
        null,
        2
      );
    }

    const outbound: OutboundMessage = {
      channel: route.channel,
      chatId: route.chatId,
      content: message,
      replyTo,
      media: [],
      metadata: silent !== undefined ? { silent } : {}
    };
    await this.bus.publishOutbound(outbound);

    const targetSession = this.sessions.getOrCreate(sessionKey);
    this.sessions.addMessage(targetSession, "assistant", message, { via: "sessions_send" });
    this.sessions.save(targetSession);

    return JSON.stringify(
      {
        runId,
        status: "ok",
        sessionKey,
        route: `${route.channel}:${route.chatId}`
      },
      null,
      2
    );
  }
}
