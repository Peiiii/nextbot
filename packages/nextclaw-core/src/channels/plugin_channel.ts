import type { MessageBus } from "../bus/queue.js";
import type { OutboundMessage } from "../bus/events.js";
import type { Config } from "../config/schema.js";
import { BaseChannel } from "./base.js";
import type { PluginChannelRegistration } from "../plugins/types.js";

export class PluginChannel extends BaseChannel<Record<string, unknown>> {
  constructor(
    private readonly runtimeConfig: Config,
    bus: MessageBus,
    private readonly registration: PluginChannelRegistration
  ) {
    super({}, bus);
  }

  get name(): string {
    return this.registration.channel.id;
  }

  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  async send(msg: OutboundMessage): Promise<void> {
    const outbound = this.registration.channel.outbound;
    if (!outbound) {
      throw new Error(`plugin channel '${this.name}' has no outbound adapter`);
    }

    const to = msg.chatId;
    const text = msg.content;
    const accountId =
      typeof msg.metadata.accountId === "string" && msg.metadata.accountId.trim().length > 0
        ? msg.metadata.accountId
        : null;

    if (outbound.sendPayload) {
      await outbound.sendPayload({
        cfg: this.runtimeConfig,
        to,
        text,
        payload: msg.metadata.payload,
        accountId
      });
      return;
    }

    if (outbound.sendText) {
      await outbound.sendText({
        cfg: this.runtimeConfig,
        to,
        text,
        accountId
      });
      return;
    }

    throw new Error(`plugin channel '${this.name}' outbound handler is not configured`);
  }
}
