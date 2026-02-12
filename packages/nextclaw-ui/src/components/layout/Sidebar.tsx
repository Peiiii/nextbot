import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import {
  Cpu,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Settings
} from 'lucide-react';

const navItems = [
  {
    id: 'model' as const,
    label: 'Models',
    icon: Cpu,
    color: 'text-[hsl(30,15%,10%)]'
  },
  {
    id: 'providers' as const,
    label: 'Providers',
    icon: Sparkles,
    color: 'text-[hsl(30,15%,10%)]'
  },
  {
    id: 'channels' as const,
    label: 'Channels',
    icon: MessageSquare,
    color: 'text-[hsl(30,15%,10%)]'
  },
  {
    id: 'ui' as const,
    label: 'Appearance',
    icon: Settings,
    color: 'text-[hsl(30,15%,10%)]'
  }
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useUiStore();

  return (
    <aside className="w-[240px] bg-transparent flex flex-col h-full py-6 px-4">
      {/* Logo Area */}
      <div className="px-3 mb-8">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="h-6 w-6 rounded-md bg-[hsl(30,15%,10%)] flex items-center justify-center transition-transform group-hover:scale-110">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-[hsl(30,15%,10%)] tracking-tight">nextclaw</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[hsl(40,10%,92%)] text-[hsl(30,15%,10%)]'
                      : 'text-[hsl(30,8%,45%)] hover:bg-[hsl(40,10%,94%)] hover:text-[hsl(30,15%,10%)]'
                  )}
                >
                  <Icon className={cn('h-4 w-4 transition-transform group-hover:scale-110', isActive ? 'text-[hsl(30,15%,10%)]' : 'text-[hsl(30,8%,45%)]')} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

      </nav>

      {/* Bottom Profile Section */}
      <div className="mt-auto px-1 pt-4">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="flex gap-1.5 items-center">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] text-[hsl(30,8%,65%)]">Starting...</span>
          </div>
        </div>

        <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[hsl(40,10%,94%)] transition-all group">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
            WX
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-[13px] font-semibold text-[hsl(30,15%,10%)] truncate">Wang Xiaotiao</p>
            <p className="text-[11px] text-[hsl(30,8%,55%)] truncate">Free plan</p>
          </div>
          <ChevronRight className="h-4 w-4 text-[hsl(30,8%,65%)] group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </aside>
  );
}
