import type { Config } from "../config/schema.js";
import { getPackageVersion } from "../utils/helpers.js";
import { MemoryGetTool, MemorySearchTool } from "../agent/tools/memory.js";
import type { OpenClawPluginTool, PluginRuntime } from "./types.js";

function toPluginTool(tool: MemorySearchTool | MemoryGetTool): OpenClawPluginTool {
  return {
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters,
    execute: (params: Record<string, unknown>) => tool.execute(params)
  };
}

export function createPluginRuntime(params: { workspace: string; config?: Config }): PluginRuntime {
  return {
    version: getPackageVersion(),
    tools: {
      createMemorySearchTool: () => toPluginTool(new MemorySearchTool(params.workspace)),
      createMemoryGetTool: () => toPluginTool(new MemoryGetTool(params.workspace))
    }
  };
}
