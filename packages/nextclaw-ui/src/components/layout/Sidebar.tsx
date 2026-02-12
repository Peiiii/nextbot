import { useUiStore } from '@/stores/ui.store';
import { cn } from '@/lib/utils';
import {
  Cpu,
  Server,
  MessageSquare,
  Settings,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const navItems = [
  {
    id: 'model' as const,
    label: '模型',
    icon: Cpu,
    description: 'AI 模型配置',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'providers' as const,
    label: '提供商',
    icon: Server,
    description: 'API 服务管理',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'channels' as const,
    label: '渠道',
    icon: MessageSquare,
    description: '消息集成设置',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'ui' as const,
    label: '界面',
    icon: Settings,
    description: '系统偏好设置',
    color: 'bg-purple-100 text-purple-600'
  }
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useUiStore();

  return (
    <aside className="w-[260px] bg-white border-r border-[hsl(40,20%,90%)] flex flex-col">
      {/* Logo Area */}
      <div className="p-5 border-b border-[hsl(40,20%,90%)]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-sm">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-[hsl(30,20%,12%)] tracking-tight">nextclaw</h1>
            <p className="text-[11px] text-[hsl(30,8%,45%)] font-medium">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="mb-3 px-2">
          <span className="text-[11px] font-semibold text-[hsl(30,8%,45%)] uppercase tracking-wider">配置</span>
        </div>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-[hsl(40,20%,96%)] text-[hsl(30,20%,12%)]'
                      : 'text-[hsl(30,8%,45%)] hover:bg-[hsl(40,20%,96%)] hover:text-[hsl(30,20%,12%)]'
                  )}
                >
                  <div className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center transition-colors',
                    isActive ? item.color : 'bg-[hsl(40,20%,94%)] text-[hsl(30,8%,45%)]'
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-all duration-200',
                      isActive
                        ? 'opacity-100 translate-x-0 text-[hsl(30,8%,45%)]'
                        : 'opacity-0 -translate-x-2'
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Status */}
      <div className="p-3 border-t border-[hsl(40,20%,90%)]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[hsl(40,20%,96%)]">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-[hsl(30,10%,35%)]">系统运行正常</span>
        </div>
        <p className="mt-3 text-[10px] text-[hsl(30,8%,55%)] text-center">
          v0.2.0
        </p>
      </div>
    </aside>
  );
}
