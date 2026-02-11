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
    description: 'AI 模型配置'
  },
  { 
    id: 'providers' as const, 
    label: '提供商', 
    icon: Server, 
    description: 'API 服务管理'
  },
  { 
    id: 'channels' as const, 
    label: '渠道', 
    icon: MessageSquare, 
    description: '消息集成设置'
  },
  { 
    id: 'ui' as const, 
    label: '界面', 
    icon: Settings, 
    description: '系统偏好设置'
  }
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useUiStore();

  return (
    <aside className="w-[280px] bg-white border-r border-gray-100 flex flex-col">
      {/* Logo Area */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">nextclaw</h1>
            <p className="text-xs text-gray-400 font-medium">AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="mb-4 px-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">配置</span>
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
                    'group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon 
                    className={cn(
                      'h-4 w-4 transition-transform duration-200',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                    )} 
                  />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronRight 
                    className={cn(
                      'h-4 w-4 transition-all duration-200',
                      isActive 
                        ? 'opacity-100 translate-x-0 text-white' 
                        : 'opacity-0 -translate-x-2 text-gray-400'
                    )} 
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Status */}
      <div className="p-4 border-t border-gray-50">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-medium text-gray-600">系统运行正常</span>
        </div>
        <p className="mt-3 text-[10px] text-gray-300 text-center">
          v0.2.0 • nextclaw
        </p>
      </div>
    </aside>
  );
}
