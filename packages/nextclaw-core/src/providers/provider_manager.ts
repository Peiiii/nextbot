import type { LLMProvider } from "./base.js";

export class ProviderManager {
  private provider: LLMProvider;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  get(): LLMProvider {
    return this.provider;
  }

  set(next: LLMProvider): void {
    this.provider = next;
  }
}
