import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MessageBus } from "../../bus/queue.js";
import { SessionManager } from "../../session/manager.js";
import { SessionsSendTool } from "./sessions.js";

const HOME_ENV_KEY = "NEXTCLAW_HOME";

describe("SessionsSendTool agent handoff", () => {
  let tempHome: string;
  let previousHome: string | undefined;

  beforeEach(() => {
    previousHome = process.env[HOME_ENV_KEY];
    tempHome = mkdtempSync(join(tmpdir(), "nextclaw-test-"));
    process.env[HOME_ENV_KEY] = tempHome;
  });

  afterEach(() => {
    if (previousHome === undefined) {
      delete process.env[HOME_ENV_KEY];
    } else {
      process.env[HOME_ENV_KEY] = previousHome;
    }
    rmSync(tempHome, { recursive: true, force: true });
  });

  it("blocks cross-agent handoff when max ping-pong turns is zero", async () => {
    const bus = new MessageBus();
    const sessions = new SessionManager(tempHome);
    const targetSessionKey = "agent:engineer:discord:channel:room-1";
    const targetSession = sessions.getOrCreate(targetSessionKey);
    targetSession.metadata.last_channel = "discord";
    targetSession.metadata.last_to = "room-1";
    sessions.save(targetSession);

    const tool = new SessionsSendTool(sessions, bus);
    tool.setContext({
      currentAgentId: "main",
      maxPingPongTurns: 0,
      currentHandoffDepth: 0
    });

    const payload = JSON.parse(
      await tool.execute({
        sessionKey: targetSessionKey,
        agentId: "engineer",
        message: "please continue"
      })
    ) as { status: string; error?: string };

    expect(payload.status).toBe("error");
    expect(payload.error).toContain("maxPingPongTurns=0");
  });

  it("publishes inbound handoff when cross-agent is allowed", async () => {
    const bus = new MessageBus();
    const sessions = new SessionManager(tempHome);
    const targetSessionKey = "agent:engineer:discord:channel:room-2";
    const targetSession = sessions.getOrCreate(targetSessionKey);
    targetSession.metadata.last_channel = "discord";
    targetSession.metadata.last_to = "room-2";
    targetSession.metadata.last_account_id = "default";
    sessions.save(targetSession);

    const tool = new SessionsSendTool(sessions, bus);
    tool.setContext({
      currentAgentId: "main",
      maxPingPongTurns: 2,
      currentHandoffDepth: 0
    });

    const payload = JSON.parse(
      await tool.execute({
        sessionKey: targetSessionKey,
        agentId: "engineer",
        message: "handoff task"
      })
    ) as { status: string; dispatched?: string };

    expect(payload.status).toBe("ok");
    expect(payload.dispatched).toBe("inbound");

    const inbound = await bus.consumeInbound();
    expect(inbound.channel).toBe("discord");
    expect(inbound.chatId).toBe("room-2");
    expect(inbound.metadata.target_agent_id).toBe("engineer");
    expect(inbound.metadata.agent_handoff_depth).toBe(1);
  });
});
