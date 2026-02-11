import { useConfig, useConfigMeta } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useUiStore } from '@/stores/ui.store';
import { ChannelForm } from './ChannelForm';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export function ChannelsList() {
  const { data: config } = useConfig();
  const { data: meta } = useConfigMeta();
  const { openChannelModal } = useUiStore();
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);

  if (!config || !meta) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">消息渠道</h2>
          <p className="text-sm text-muted-foreground mt-1">配置和管理各种消息通知渠道</p>
        </div>
      </div>

      {/* Channel 卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {meta.channels.map((channel) => {
          const channelConfig = config.channels[channel.name];
          const enabled = channelConfig?.enabled || false;
          const isHovered = hoveredChannel === channel.name;

          return (
            <Card
              key={channel.name}
              className={cn(
                'group relative overflow-hidden transition-all duration-300',
                isHovered ? 'shadow-xl scale-[1.02]' : 'hover:shadow-lg hover:scale-[1.01]'
              )}
              onMouseEnter={() => setHoveredChannel(channel.name)}
              onMouseLeave={() => setHoveredChannel(null)}
            >
              <CardHeader className="pb-4 bg-gradient-to-br from-muted/30 to-muted/10">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/80 to-primary group-hover:bg-primary transition-all shadow-inner">
                      <MessageCircle className={cn('h-6 w-6 transition-transform duration-300', enabled ? 'text-green-400' : 'text-muted-foreground')} strokeWidth={2} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{channel.displayName || channel.name}</span>
                      <span className="text-xs text-muted-foreground/70 uppercase tracking-wider">{channel.name}</span>
                    </div>
                  </div>
                  <div className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300',
                    enabled ? 'bg-green-500' : 'bg-muted'
                  )}>
                    <div className={cn(
                      'w-3 h-3 rounded-full transition-all duration-300',
                      enabled ? 'bg-white' : 'bg-current'
                    )} />
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-2">
                <div className="space-y-4">
                  {/* 状态指示 */}
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">状态</span>
                      <span className={cn(
                        'text-sm font-semibold',
                        enabled ? 'text-green-600' : 'text-muted-foreground'
                      )}>
                        {enabled ? '已启用' : '已禁用'}
                      </span>
                    </div>
                  </div>

                  {/* 快捷操作 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-primary/10 transition-all"
                    onClick={() => openChannelModal(channel.name)}
                  >
                    <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    配置
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ChannelForm />
    </div>
  );
}
