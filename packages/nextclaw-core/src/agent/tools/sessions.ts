import { Tool } from "./base.js";
import type { SessionManager } from "../../session/manager.js";
import type { MessageBus } from "../../bus/queue.js";
import type { OutboundMessage } from "../../bus/events.js";

const DEFAULT_LIMIT = 20;

const toInt = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : fallback;
};

const parseSessionKey = (key: string): { channel: string; chatId: string } | null => {
  const trimmed = key.trim();
  if (!trimmed.includes(":")) {
    return null;
  }
  const [channel, chatId] = trimmed.split(":", 2);
  if (!channel || !chatId) {
    return null;
  }
  return { channel, chatId };
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
        limit: { type: "integer", minimum: 1, description: "Maximum number of sessions to return" }
      }
    };
  }

  async execute(params: Record<string, unknown>): Promise<string> {
    const limit = toInt(params.limit, DEFAULT_LIMIT);
    const sessions = this.sessions
      .listSessions()
      .sort((a, b) => String(b.updated_at ?? "").localeCompare(String(a.updated_at ?? "")))
      .slice(0, limit);
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
        limit: { type: "integer", minimum: 1, description: "Maximum number of messages to return" }
      },
      required: ["sessionKey"]
    };
  }

  async execute(params: Record<string, unknown>): Promise<string> {
    const sessionKey = String(params.sessionKey ?? "").trim();
    if (!sessionKey) {
      return "Error: sessionKey is required";
    }
    const session = this.sessions.getIfExists(sessionKey);
    if (!session) {
      return `Error: session '${sessionKey}' not found`;
    }
    const limit = toInt(params.limit, DEFAULT_LIMIT);
    const history = session.messages.slice(-limit).map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));
    return JSON.stringify({ sessionKey, history }, null, 2);
  }
}

export class SessionsSendTool extends Tool {
  constructor(
    private sessions: SessionManager,
    private bus: MessageBus
  ) {
    super();
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
        sessionKey: { type: "string", description: "Target session key in the format channel:chatId" },
        message: { type: "string", description: "Message content to send" }
      },
      required: ["sessionKey", "message"]
    };
  }

  async execute(params: Record<string, unknown>): Promise<string> {
    const sessionKey = String(params.sessionKey ?? "").trim();
    const message = String(params.message ?? "");
    if (!sessionKey) {
      return "Error: sessionKey is required";
    }
    const parsed = parseSessionKey(sessionKey);
    if (!parsed) {
      return "Error: sessionKey must be in the format channel:chatId";
    }
    const outbound: OutboundMessage = {
      channel: parsed.channel,
      chatId: parsed.chatId,
      content: message,
      media: [],
      metadata: {}
    };
    await this.bus.publishOutbound(outbound);

    const session = this.sessions.getOrCreate(sessionKey);
    this.sessions.addMessage(session, "assistant", message, { via: "sessions_send" });
    this.sessions.save(session);

    return `Message sent to ${parsed.channel}:${parsed.chatId}`;
  }
}
