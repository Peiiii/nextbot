import { Tool } from "./base.js";

export type GatewayController = {
  status?: () => Promise<Record<string, unknown> | string> | Record<string, unknown> | string;
  reloadConfig?: (reason?: string) => Promise<string | void> | string | void;
  restart?: () => Promise<string | void> | string | void;
};

export class GatewayTool extends Tool {
  constructor(private controller?: GatewayController) {
    super();
  }

  get name(): string {
    return "gateway";
  }

  get description(): string {
    return "Control the running gateway (status / reload config / restart if supported)";
  }

  get parameters(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["status", "reload_config", "restart"],
          description: "Action to perform"
        },
        reason: { type: "string", description: "Optional reason for the action" }
      },
      required: ["action"]
    };
  }

  async execute(params: Record<string, unknown>): Promise<string> {
    const action = String(params.action ?? "");
    if (!this.controller) {
      return "Error: gateway controller not available in this runtime";
    }
    if (action === "status") {
      if (!this.controller.status) {
        return "Error: status not supported";
      }
      const result = await this.controller.status();
      return typeof result === "string" ? result : JSON.stringify(result, null, 2);
    }
    if (action === "reload_config") {
      if (!this.controller.reloadConfig) {
        return "Error: reload_config not supported";
      }
      const reason = params.reason ? String(params.reason) : undefined;
      const result = await this.controller.reloadConfig(reason);
      return result ? String(result) : "Config reload triggered";
    }
    if (action === "restart") {
      if (!this.controller.restart) {
        return "Error: restart not supported";
      }
      const result = await this.controller.restart();
      return result ? String(result) : "Restart triggered";
    }
    return "Error: invalid action";
  }
}
