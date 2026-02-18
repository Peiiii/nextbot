import { LLMProvider } from "@nextclaw/core";

export class MissingProvider extends LLMProvider {
  constructor(private defaultModel: string) {
    super(null, null);
  }

  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }

  async chat(): Promise<never> {
    throw new Error("No API key configured yet. Configure provider credentials in UI and retry.");
  }

  getDefaultModel(): string {
    return this.defaultModel;
  }
}
