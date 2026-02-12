import { useConfig, useConfigMeta } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Settings2, Bell, Mail, MessageSquare, Slack } from 'lucide-react';
import { useState } from 'react';
import { ChannelForm } from './ChannelForm';
import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';

const channelIcons: Record<string, typeof MessageCircle> = {
  telegram: MessageCircle,
  slack: Slack,
  email: Mail,
  webhook: Bell,
  default: MessageSquare
};

const channelColors: Record<string, string> = {
  telegram: 'from-sky-400 to-blue-500',
  slack: 'from-purple-400 to-indigo-500',
  email: 'from-rose-400 to-pink-500',
  webhook: 'from-amber-400 to-orange-500',
  default: 'from-slate-400 to-gray-500'
};

export function ChannelsList() {
  const { data: config } = useConfig();
  const { data: meta } = useConfigMeta();
  const { openChannelModal } = useUiStore();
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);

  if (!config || !meta) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
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
              <Skeleton className="h-9 w-full mt-4 rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[hsl(30,20%,12%)]">消息渠道</h2>
        <p className="text-sm text-[hsl(30,8%,45%)] mt-1">配置和管理各种消息通知渠道</p>
      </div>

      {/* Channel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meta.channels.map((channel) => {
          const channelConfig = config.channels[channel.name];
          const enabled = channelConfig?.enabled || false;
          const isHovered = hoveredChannel === channel.name;
          const Icon = channelIcons[channel.name] || channelIcons.default;
          const gradientClass = channelColors[channel.name] || channelColors.default;

          return (
            <Card
              key={channel.name}
              className={cn(
                'group cursor-pointer transition-all duration-300 rounded-2xl border-[hsl(40,20%,90%)] bg-white',
                'hover:shadow-lg hover:shadow-[hsl(40,20%,90%)]/50 hover:-translate-y-0.5',
                isHovered && 'ring-2 ring-[hsl(25,95%,53%)]/20'
              )}
              onMouseEnter={() => setHoveredChannel(channel.name)}
              onMouseLeave={() => setHoveredChannel(null)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300',
                    enabled ? `bg-gradient-to-br ${gradientClass}` : 'bg-[hsl(40,20%,96%)]'
                  )}>
                    <Icon className={cn(
                      'h-5 w-5',
                      enabled ? 'text-white' : 'text-[hsl(30,8%,45%)]'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[hsl(30,20%,12%)] truncate">
                        {channel.displayName || channel.name}
                      </h3>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[10px] font-medium',
                        enabled
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-[hsl(40,20%,96%)] text-[hsl(30,8%,45%)]'
                      )}>
                        {enabled ? '已启用' : '已禁用'}
                      </span>
                    </div>
                    <p className="text-xs text-[hsl(30,8%,45%)] mt-0.5">{channel.name}</p>
                  </div>
                </div>
                <p className="text-sm text-[hsl(30,8%,45%)] mt-4">
                  {enabled ? '渠道已配置并正常运行' : '点击配置此消息渠道'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full gap-2 rounded-xl bg-[hsl(40,20%,96%)] hover:bg-[hsl(40,20%,94%)] text-[hsl(30,10%,35%)]"
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
