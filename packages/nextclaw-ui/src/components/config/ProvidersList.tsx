import { useConfig, useConfigMeta } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KeyRound, Lock, Check, Plus, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { ProviderForm } from './ProviderForm';
import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import { Tabs } from '@/components/ui/tabs-custom';
import { HighlightCard } from '@/components/ui/HighlightCard';

export function ProvidersList() {
  const { data: config } = useConfig();
  const { data: meta } = useConfigMeta();
  const { openProviderModal } = useUiStore();
  const [activeTab, setActiveTab] = useState('featured');

  if (!config || !meta) {
    return <div className="p-8">Loading...</div>; // Skeleton optimization can follow
  }

  const tabs = [
    { id: 'all', label: 'All Providers' },
    { id: 'installed', label: 'Configured', count: config.providers ? Object.keys(config.providers).filter(k => config.providers[k].apiKeySet).length : 0 }
  ];

  return (
    <div className="animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[hsl(30,15%,10%)]">AI Providers</h2>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab === 'featured' ? 'all' : activeTab} onChange={setActiveTab} />

      {/* Provider List Row-Style */}
      <div className="space-y-1">
        {meta.providers.map((provider, index) => {
          const providerConfig = config.providers[provider.name];
          const hasConfig = providerConfig?.apiKeySet;

          return (
            <div
              key={provider.name}
              className="group flex items-center gap-5 p-3 rounded-2xl hover:bg-[hsl(40,10%,96%)] transition-all cursor-pointer border border-transparent hover:border-[hsl(40,10%,94%)]"
              onClick={() => openProviderModal(provider.name)}
            >
              {/* Logo/Icon */}
              <div className="h-10 w-10 flex items-center justify-center bg-transparent border border-[hsl(40,10%,92%)] rounded-xl group-hover:scale-105 transition-transform overflow-hidden">
                <span className="text-xl font-bold uppercase text-[hsl(30,15%,10%)]">{provider.name[0]}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-bold text-[hsl(30,15%,10%)] truncate">
                  {provider.displayName || provider.name}
                </h3>
                <p className="text-[12px] text-[hsl(30,8%,55%)] truncate leading-tight">
                  {provider.name === 'openai' ? 'TypeScript authentication framework integration guide' : 'Configure AI services for your agents'}
                </p>
              </div>

              {/* Status/Actions */}
              <div className="flex items-center gap-4">
                {hasConfig ? (
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <Check className="h-4 w-4" />
                    <span className="text-[11px] font-bold">Ready</span>
                  </div>
                ) : (
                  <button className="h-8 w-8 flex items-center justify-center text-[hsl(30,8%,45%)] hover:text-[hsl(30,15%,10%)] group-hover:opacity-100 opacity-0 transition-opacity">
                    <Plus className="h-4 w-4" />
                  </button>
                )}
                <button className="h-8 w-8 flex items-center justify-center text-[hsl(30,8%,45%)]">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ProviderForm />
    </div>
  );
}
