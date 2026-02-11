import { cn } from '@/lib/utils';
import { Check, X, Loader2 } from 'lucide-react';

type Status = 'connected' | 'disconnected' | 'connecting';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<
  Status,
  { label: string; dotClass: string; textClass: string; icon: typeof Check }
> = {
  connected: {
    label: '已连接',
    dotClass: 'bg-emerald-500',
    textClass: 'text-emerald-600',
    icon: Check
  },
  disconnected: {
    label: '未连接',
    dotClass: 'bg-slate-300',
    textClass: 'text-slate-400',
    icon: X
  },
  connecting: {
    label: '连接中',
    dotClass: 'bg-amber-400',
    textClass: 'text-amber-600',
    icon: Loader2
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('h-2 w-2 rounded-full', config.dotClass)} />
      <span className={cn('text-sm font-medium flex items-center gap-1.5', config.textClass)}>
        <Icon className={cn('h-3.5 w-3.5', status === 'connecting' && 'animate-spin')} />
        {config.label}
      </span>
    </div>
  );
}
