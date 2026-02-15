import type { OutboundMessage } from "../../bus/events.js";
import { Tool } from "./base.js";

export class MessageTool extends Tool {
  private channel = "cli";
  private chatId = "direct";

  constructor(private sendCallback: (msg: OutboundMessage) => Promise<void>) {
    super();
  }

  get name(): string {
    return "message";
  }

  get description(): string {
    return "Send a message to a chat channel";
  }

  get parameters(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        action: { type: "string", enum: ["send"], description: "Action to perform" },
        content: { type: "string", description: "Message to send" },
        channel: { type: "string", description: "Channel name" },
        chatId: { type: "string", description: "Chat ID" },
        replyTo: { type: "string", description: "Message ID to reply to" },
        silent: { type: "boolean", description: "Send without notification where supported" }
      },
      required: ["content"]
    };
  }

  setContext(channel: string, chatId: string): void {
    this.channel = channel;
    this.chatId = chatId;
  }

  async execute(params: Record<string, unknown>): Promise<string> {
    const action = params.action ? String(params.action) : "send";
    if (action !== "send") {
      return `Error: Unsupported action '${action}'`;
    }
    const content = String(params.content ?? "");
    const channel = String(params.channel ?? this.channel);
    const chatId = String(params.chatId ?? this.chatId);
    const replyTo = params.replyTo ? String(params.replyTo) : undefined;
    const silent = typeof params.silent === "boolean" ? params.silent : undefined;
    await this.sendCallback({
      channel,
      chatId,
      content,
      replyTo,
      media: [],
      metadata: silent !== undefined ? { silent } : {}
    });
    return `Message sent to ${channel}:${chatId}`;
  }
}
