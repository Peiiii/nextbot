import { useConfig, useConfigMeta } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Settings2, Bell, Mail, MessageSquare, Slack, MoreHorizontal, Plus } from 'lucide-react';
import { useState } from 'react';
import { ChannelForm } from './ChannelForm';
import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import { Tabs } from '@/components/ui/tabs-custom';

const channelIcons: Record<string, typeof MessageCircle> = {
  telegram: MessageCircle,
  slack: Slack,
  email: Mail,
  webhook: Bell,
  default: MessageSquare
};

export function ChannelsList() {
  const { data: config } = useConfig();
  const { data: meta } = useConfigMeta();
  const { openChannelModal } = useUiStore();
  const [activeTab, setActiveTab] = useState('active');

  if (!config || !meta) {
    return <div className="p-8 text-[hsl(30,8%,55%)]">Loading channels...</div>;
  }

  const tabs = [
    { id: 'active', label: 'Enabled', count: meta.channels.filter(c => config.channels[c.name]?.enabled).length },
    { id: 'all', label: 'All Channels', count: meta.channels.length }
  ];

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[hsl(30,15%,10%)]">Message Channels</h2>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <div className="space-y-1">
        {meta.channels.map((channel, index) => {
          const channelConfig = config.channels[channel.name];
          const enabled = channelConfig?.enabled || false;
          const Icon = channelIcons[channel.name] || channelIcons.default;

          return (activeTab === 'all' || enabled) && (
            <div
              key={channel.name}
              className="group flex items-center gap-5 p-3 rounded-2xl hover:bg-[hsl(40,10%,96%)] transition-all cursor-pointer border border-transparent hover:border-[hsl(40,10%,94%)]"
              onClick={() => openChannelModal(channel.name)}
            >
              {/* Icon */}
              <div className={cn(
                'h-10 w-10 flex items-center justify-center rounded-xl transition-all group-hover:scale-105',
                enabled ? 'bg-[hsl(30,15%,10%)] text-white' : 'bg-transparent border border-[hsl(40,10%,92%)] text-[hsl(30,8%,55%)]'
              )}>
                <Icon className="h-5 w-5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-[hsl(30,15%,10%)] truncate">
                    {channel.displayName || channel.name}
                  </h3>
                  {enabled && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  )}
                </div>
                <p className="text-[12px] text-[hsl(30,8%,55%)] truncate leading-tight mt-0.5">
                  {enabled ? 'Channel is active and processing messages' : 'Click to configure this communication channel'}
                </p>
              </div>

              {/* Status/Actions */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl bg-[hsl(40,10%,92%)] hover:bg-[hsl(40,10%,90%)] text-[hsl(30,10%,35%)] text-[11px] font-bold px-4 h-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    openChannelModal(channel.name);
                  }}
                >
                  Configure
                </Button>
                <button className="h-8 w-8 flex items-center justify-center text-[hsl(30,8%,45%)]">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ChannelForm />
    </div>
  );
}
