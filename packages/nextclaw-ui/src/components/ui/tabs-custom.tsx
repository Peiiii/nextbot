import React from 'react';
import { cn } from '@/lib/utils';

interface Tab {
    id: string;
    label: string;
    count?: number;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
    return (
        <div className={cn('flex items-center gap-8 border-b border-[hsl(40,10%,94%)] mb-8', className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            'relative pb-4 text-[15px] font-semibold transition-all duration-200 flex items-center gap-2',
                            isActive
                                ? 'text-[hsl(30,15%,10%)]'
                                : 'text-[hsl(30,8%,55%)] hover:text-[hsl(30,15%,10%)]'
                        )}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="text-[11px] font-medium text-[hsl(30,8%,65%)]">{tab.count.toLocaleString()}</span>
                        )}
                        {isActive && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(30,15%,10%)] animate-in fade-in slide-in-from-left-2 duration-300" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
