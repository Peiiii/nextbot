import { Tool } from "./base.js";
import type { SubagentManager } from "../subagent.js";

export class SubagentsTool extends Tool {
  constructor(private manager: SubagentManager) {
    super();
  }

  get name(): string {
    return "subagents";
  }

  get description(): string {
    return "Manage running subagents (list or cancel)";
  }

  get parameters(): Record<string, unknown> {
    return {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["list", "cancel", "kill", "steer"],
          description: "Action to perform"
        },
        id: { type: "string", description: "Subagent id" },
        note: { type: "string", description: "Steer instruction for a running subagent" }
      },
      required: ["action"]
    };
  }

  async execute(params: Record<string, unknown>): Promise<string> {
    const action = String(params.action ?? "");
    if (action === "list") {
      const runs = this.manager.listRuns();
      return JSON.stringify({ runs }, null, 2);
    }
    if (action === "cancel") {
      const id = String(params.id ?? "").trim();
      if (!id) {
        return "Error: id is required for cancel";
      }
      const ok = this.manager.cancelRun(id);
      return ok ? `Subagent ${id} cancelled` : `Subagent ${id} not found`;
    }
    if (action === "kill") {
      const id = String(params.id ?? "").trim();
      if (!id) {
        return "Error: id is required for kill";
      }
      const ok = this.manager.cancelRun(id);
      return ok ? `Subagent ${id} killed` : `Subagent ${id} not found`;
    }
    if (action === "steer") {
      const id = String(params.id ?? "").trim();
      const note = String(params.note ?? "").trim();
      if (!id || !note) {
        return "Error: id and note are required for steer";
      }
      const ok = this.manager.steerRun(id, note);
      return ok ? `Subagent ${id} steer applied` : `Subagent ${id} not running`;
    }
    return "Error: invalid action";
  }
}
