import { useUiStore } from '@/stores/ui.store';
import { t } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Cpu, Server, MessageSquare, Settings } from 'lucide-react';

const navItems = [
  { id: 'model' as const, label: t('model'), icon: Cpu, description: '模型设置' },
  { id: 'providers' as const, label: t('providers'), icon: Server, description: 'AI 提供商' },
  { id: 'channels' as const, label: t('channels'), icon: MessageSquare, description: '消息渠道' },
  { id: 'ui' as const, label: t('uiConfig'), icon: Settings, description: '界面设置' }
];

export function Sidebar() {
  const { activeTab, setActiveTab } = useUiStore();

  return (
    <nav className="w-64 border-r border-border/30 bg-muted/20 backdrop-blur-md p-4 flex flex-col">
      {/* Logo 区域 */}
      <div className="mb-6 px-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <Cpu className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-foreground">nextclaw</h2>
            <p className="text-xs text-muted-foreground">系统配置中心</p>
          </div>
        </div>
      </div>

      {/* 导航菜单 */}
      <ul className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg'
                    : 'hover:bg-muted/50 hover:text-foreground'
                )}
              >
                {/* 激活指示条 */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground rounded-full" />
                )}

                <Icon className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                )} />
                <div className="flex flex-col items-start flex-1">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs text-muted-foreground/60">{item.description}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {/* 底部版本信息 */}
      <div className="mt-auto px-3 py-4 border-t border-border/30">
        <p className="text-xs text-muted-foreground text-center">
          v0.2.0 • Phase 1
        </p>
      </div>
    </nav>
  );
}
