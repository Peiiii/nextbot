import { useConfig, useConfigMeta } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KeyRound, Lock, Check, Plus, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { ProviderForm } from './ProviderForm';
import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';

const providerGradients: Record<string, string> = {
  openai: 'from-emerald-400 to-teal-500',
  anthropic: 'from-orange-400 to-amber-500',
  gemini: 'from-blue-400 to-indigo-500',
  azure: 'from-indigo-400 to-purple-500',
  grok: 'from-rose-400 to-pink-500',
  ollama: 'from-amber-400 to-yellow-500',
  default: 'from-slate-400 to-gray-500'
};

export function ProvidersList() {
  const { data: config } = useConfig();
  const { data: meta } = useConfigMeta();
  const { openProviderModal } = useUiStore();
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);

  if (!config || !meta) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 rounded-2xl border-[hsl(40,20%,90%)]">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mt-4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[hsl(30,20%,12%)]">AI 提供商</h2>
          <p className="text-sm text-[hsl(30,8%,45%)] mt-1">配置和管理您的 AI 服务提供商</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-xl border-[hsl(40,20%,90%)] bg-white hover:bg-[hsl(40,20%,96%)]"
          onClick={() => openProviderModal('')}
        >
          <Plus className="h-4 w-4" />
          添加提供商
        </Button>
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meta.providers.map((provider) => {
          const providerConfig = config.providers[provider.name];
          const hasConfig = providerConfig?.apiKeySet;
          const isHovered = hoveredProvider === provider.name;
          const gradientClass = providerGradients[provider.name] || providerGradients.default;

          return (
            <Card
              key={provider.name}
              className={cn(
                'group cursor-pointer transition-all duration-300 rounded-2xl border-[hsl(40,20%,90%)] bg-white',
                'hover:shadow-lg hover:shadow-[hsl(40,20%,90%)]/50 hover:-translate-y-0.5',
                isHovered && 'ring-2 ring-[hsl(25,95%,53%)]/20'
              )}
              onMouseEnter={() => setHoveredProvider(provider.name)}
              onMouseLeave={() => setHoveredProvider(null)}
              onClick={() => openProviderModal(provider.name)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300',
                    hasConfig ? `bg-gradient-to-br ${gradientClass}` : 'bg-[hsl(40,20%,96%)]'
                  )}>
                    {hasConfig ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : (
                      <KeyRound className="h-5 w-5 text-[hsl(30,8%,45%)]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[hsl(30,20%,12%)] truncate">
                        {provider.displayName || provider.name}
                      </h3>
                      {hasConfig && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-medium">
                          <Lock className="h-3 w-3" />
                          已配置
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[hsl(30,8%,45%)] mt-0.5">{provider.name}</p>
                  </div>
                </div>
                <p className="text-sm text-[hsl(30,8%,45%)] mt-4 line-clamp-2">
                  点击配置此 AI 提供商的 API 密钥和设置
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-[hsl(30,8%,55%)]">
                  <ExternalLink className="h-3 w-3" />
                  <span>编辑配置</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ProviderForm />
    </div>
  );
}
