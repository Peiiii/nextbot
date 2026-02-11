import { StatusBadge } from '@/components/common/StatusBadge';
import { useUiStore } from '@/stores/ui.store';
import { Cpu } from 'lucide-react';

export function Header() {
  const { connectionStatus } = useUiStore();

  return (
    <header className="h-16 border-b border-border/40 bg-gradient-to-r from-background to-muted/20 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg">
            <Cpu className="h-5 w-5 text-primary-foreground" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent bg-primary-foreground">
              nextclaw
            </h1>
            <p className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
              系统配置
            </p>
          </div>
        </div>
      </div>
      <StatusBadge status={connectionStatus} />
    </header>
  );
}
