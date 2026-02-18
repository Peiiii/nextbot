import { spawnSync } from "node:child_process";
import { loadConfig } from "@nextclaw/core";

export class ChannelCommands {
  constructor(
    private deps: {
      logo: string;
      getBridgeDir: () => string;
    }
  ) {}

  channelsStatus(): void {
    const config = loadConfig();
    console.log("Channel Status");
    console.log(`WhatsApp: ${config.channels.whatsapp.enabled ? "✓" : "✗"}`);
    console.log(`Discord: ${config.channels.discord.enabled ? "✓" : "✗"}`);
    console.log(`Feishu: ${config.channels.feishu.enabled ? "✓" : "✗"}`);
    console.log(`Mochat: ${config.channels.mochat.enabled ? "✓" : "✗"}`);
    console.log(`Telegram: ${config.channels.telegram.enabled ? "✓" : "✗"}`);
    console.log(`Slack: ${config.channels.slack.enabled ? "✓" : "✗"}`);
    console.log(`QQ: ${config.channels.qq.enabled ? "✓" : "✗"}`);
  }

  channelsLogin(): void {
    const bridgeDir = this.deps.getBridgeDir();
    console.log(`${this.deps.logo} Starting bridge...`);
    console.log("Scan the QR code to connect.\n");
    const result = spawnSync("npm", ["start"], { cwd: bridgeDir, stdio: "inherit" });
    if (result.status !== 0) {
      console.error(`Bridge failed: ${result.status ?? 1}`);
    }
  }
}
