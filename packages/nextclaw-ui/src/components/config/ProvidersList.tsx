import { useConfig, useConfigMeta } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { t } from '@/lib/i18n';
import { KeyRound, Lock, Check } from 'lucide-react';
import { useState } from 'react';
import { ProviderForm } from './ProviderForm';
import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';

export function ProvidersList() {
  const { data: config } = useConfig();
  const { data: meta } = useConfigMeta();
  const { openProviderModal } = useUiStore();
  const [hoveredProvider, setHoveredProvider] = useState<string | null>(null);

  if (!config || !meta) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">{t('loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">AI 提供商</h2>
          <p className="text-sm text-muted-foreground mt-1">配置 API 密钥和基础 URL</p>
        </div>
      </div>

      {/* Provider 列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {meta.providers.map((provider) => {
          const providerConfig = config.providers[provider.name];
          const isSet = providerConfig?.apiKeySet || false;
          const isHovered = hoveredProvider === provider.name;

          return (
            <Card
              key={provider.name}
              className={cn(
                'group relative overflow-hidden transition-all duration-300',
                isHovered ? 'shadow-xl scale-[1.02]' : 'hover:shadow-lg hover:scale-[1.01]'
              )}
              onMouseEnter={() => setHoveredProvider(provider.name)}
              onMouseLeave={() => setHoveredProvider(null)}
            >
              <CardHeader className="pb-4 bg-gradient-to-br from-muted/50 to-muted/20">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      {isSet ? (
                        <Check className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" strokeWidth={2} />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{provider.displayName || provider.name}</div>
                      <div className="text-xs text-muted-foreground/60">{provider.name}</div>
                    </div>
                  </div>
                  <KeyRound className={cn('h-4 w-4 transition-colors', isSet ? 'text-green-500' : 'text-muted-foreground/40')} />
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="space-y-4">
                  {/* API Key 状态 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                      <span className="text-sm font-medium text-muted-foreground/80">
                        {t('apiKey')}
                      </span>
                    </div>
                    <div className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                      isSet
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-100'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {isSet ? '已设置' : '未设置'}
                    </div>
                  </div>

                  {/* API Base URL */}
                  {provider.defaultApiBase && (
                    <div className="text-xs text-muted-foreground bg-muted/40 rounded px-2 py-1 truncate">
                      {provider.defaultApiBase}
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <Button
                    variant={isSet ? 'secondary' : 'default'}
                    size="sm"
                    className="w-full group-hover:bg-primary/90"
                    onClick={() => openProviderModal(provider.name)}
                  >
                    {isSet ? '编辑配置' : '添加密钥'}
                  </Button>
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
