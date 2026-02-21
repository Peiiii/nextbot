import { resolveBuiltinChannelRuntime } from "@nextclaw/channel-runtime";

const runtime = resolveBuiltinChannelRuntime("wecom");

const plugin = {
  id: "builtin-channel-wecom",
  name: "Builtin WeCom Channel",
  description: "Builtin NextClaw channel plugin for wecom",
  configSchema: {
    type: "object",
    additionalProperties: false,
    properties: {}
  },
  register(api) {
    api.registerChannel({
      plugin: {
        id: "wecom",
        nextclaw: {
          isEnabled: runtime.isEnabled,
          createChannel: runtime.createChannel
        }
      }
    });
  }
};

export default plugin;
