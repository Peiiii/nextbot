import { BaseChannel } from "./base.js";
import type { MessageBus } from "../bus/queue.js";
import type { OutboundMessage } from "../bus/events.js";
import type { Config } from "../config/schema.js";
import {
  Bot,
  ReceiverMode,
  type GroupMessageEvent,
  type GuildMessageEvent,
  type PrivateMessageEvent
} from "qq-official-bot";

type QQMessageEvent = PrivateMessageEvent | GroupMessageEvent | GuildMessageEvent;
type QQMessageType = "private" | "group" | "direct" | "guild";

export class QQChannel extends BaseChannel<Config["channels"]["qq"]> {
  name = "qq";
  private bot: Bot | null = null;
  private processedIds: string[] = [];
  private processedSet: Set<string> = new Set();

  constructor(config: Config["channels"]["qq"], bus: MessageBus) {
    super(config, bus);
  }

  async start(): Promise<void> {
    this.running = true;
    if (!this.config.appId || !this.config.secret) {
      throw new Error("QQ appId/appSecret not configured");
    }

    this.bot = new Bot({
      appid: this.config.appId,
      secret: this.config.secret,
      mode: ReceiverMode.WEBSOCKET,
      intents: ["C2C_MESSAGE_CREATE", "GROUP_AT_MESSAGE_CREATE"],
      removeAt: true,
      logLevel: "info"
    });

    this.bot.on("message.private", async (event) => {
      await this.handleIncoming(event);
    });

    this.bot.on("message.group", async (event) => {
      await this.handleIncoming(event);
    });

    await this.bot.start();
    // eslint-disable-next-line no-console
    console.log("QQ bot connected");
  }

  async stop(): Promise<void> {
    this.running = false;
    if (this.bot) {
      this.bot.removeAllListeners("message.private");
      this.bot.removeAllListeners("message.group");
      await this.bot.stop();
      this.bot = null;
    }
  }

  async send(msg: OutboundMessage): Promise<void> {
    if (!this.bot) {
      return;
    }

    const qqMeta = (msg.metadata?.qq as Record<string, unknown> | undefined) ?? {};
    const messageType = (qqMeta.messageType as QQMessageType | undefined) ?? "private";
    const source = msg.replyTo ? { id: msg.replyTo } : undefined;

    if (messageType === "group") {
      const groupId = (qqMeta.groupId as string | undefined) ?? msg.chatId;
      await this.bot.sendGroupMessage(groupId, msg.content ?? "", source);
      return;
    }

    if (messageType === "direct") {
      const guildId = (qqMeta.guildId as string | undefined) ?? msg.chatId;
      await this.bot.sendDirectMessage(guildId, msg.content ?? "", source);
      return;
    }

    if (messageType === "guild") {
      const channelId = (qqMeta.channelId as string | undefined) ?? msg.chatId;
      await this.bot.sendGuildMessage(channelId, msg.content ?? "", source);
      return;
    }

    const userId = (qqMeta.userId as string | undefined) ?? msg.chatId;
    await this.bot.sendPrivateMessage(userId, msg.content ?? "", source);
  }

  private async handleIncoming(event: QQMessageEvent): Promise<void> {
    const messageId = event.message_id || event.id || "";
    if (messageId && this.isDuplicate(messageId)) {
      return;
    }

    if (event.user_id === event.self_id) {
      return;
    }

    const content = event.raw_message?.trim() ?? "";
    if (!event.user_id || !content) {
      return;
    }

    let chatId = event.user_id;
    let messageType: QQMessageType = "private";
    const qqMeta: Record<string, unknown> = {};

    if (event.message_type === "group") {
      messageType = "group";
      chatId = event.group_id ?? "";
      qqMeta.groupId = chatId;
      qqMeta.userId = event.user_id;
    } else if (event.message_type === "guild") {
      messageType = "guild";
      chatId = event.channel_id ?? "";
      qqMeta.guildId = event.guild_id;
      qqMeta.channelId = event.channel_id;
      qqMeta.userId = event.user_id;
    } else if (event.sub_type === "direct") {
      messageType = "direct";
      chatId = event.guild_id ?? "";
      qqMeta.guildId = event.guild_id;
      qqMeta.userId = event.user_id;
    } else {
      qqMeta.userId = event.user_id;
    }

    qqMeta.messageType = messageType;

    if (!chatId) {
      return;
    }

    if (!this.isAllowed(event.user_id)) {
      return;
    }

    await this.handleMessage({
      senderId: event.user_id,
      chatId,
      content,
      media: [],
      metadata: {
        message_id: messageId,
        qq: qqMeta
      }
    });
  }

  private isDuplicate(messageId: string): boolean {
    if (this.processedSet.has(messageId)) {
      return true;
    }
    this.processedSet.add(messageId);
    this.processedIds.push(messageId);
    if (this.processedIds.length > 1000) {
      const removed = this.processedIds.splice(0, 500);
      for (const id of removed) {
        this.processedSet.delete(id);
      }
    }
    return false;
  }
}
