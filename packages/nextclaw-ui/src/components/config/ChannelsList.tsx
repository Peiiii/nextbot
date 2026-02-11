import { useConfig, useConfigMeta } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Settings2, Check } from 'lucide-react';
import { useState } from 'react';
import { ChannelForm } from './ChannelForm';
import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';

export function ChannelsList() {
  const { data: config } = useConfig();
  const { data: meta } = useConfigMeta();
  const { openChannelModal } = useUiStore();
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);

  if (!config || !meta) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
          <span className="text-slate-400">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">消息渠道</h2>
          <p className="text-sm text-slate-500 mt-1">配置和管理各种消息通知渠道</p>
        </div>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meta.channels.map((channel) => {
          const channelConfig = config.channels[channel.name];
          const enabled = channelConfig?.enabled || false;
          const isHovered = hoveredChannel === channel.name;

          return (
            <Card
              key={channel.name}
              className={cn(
                'group cursor-pointer transition-all duration-200',
                'hover:shadow-lg hover:-translate-y-0.5',
                isHovered && 'ring-2 ring-slate-900'
              )}
              onMouseEnter={() => setHoveredChannel(channel.name)}
              onMouseLeave={() => setHoveredChannel(null)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center transition-colors',
                      enabled ? 'bg-slate-900' : 'bg-slate-100'
                    )}>
                      {enabled ? (
                        <Check className="h-5 w-5 text-white" />
                      ) : (
                        <MessageCircle className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {channel.displayName || channel.name}
                      </CardTitle>
                      <p className="text-xs text-slate-400">{channel.name}</p>
                    </div>
                  </div>
                  <div className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    enabled 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'bg-slate-100 text-slate-500'
                  )}>
                    {enabled ? '已启用' : '已禁用'}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-500">
                  {enabled ? '渠道已配置并正常运行' : '点击配置此消息渠道'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full gap-2"
                  onClick={() => openChannelModal(channel.name)}
                >
                  <Settings2 className="h-4 w-4" />
                  配置
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <ChannelForm />
    </div>
  );
}
