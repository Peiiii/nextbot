import { StatusBadge } from '@/components/common/StatusBadge';
import { useUiStore } from '@/stores/ui.store';

export function Header() {
  const { connectionStatus } = useUiStore();

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">系统配置</h2>
        <p className="text-xs text-slate-400">管理您的 AI 助手设置</p>
      </div>
      <StatusBadge status={connectionStatus} />
    </header>
  );
}
