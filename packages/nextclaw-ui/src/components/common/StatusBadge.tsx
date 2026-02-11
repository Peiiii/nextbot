import { cn } from '@/lib/utils';

type Status = 'connected' | 'disconnected' | 'connecting';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<
  Status,
  { label: string; color: string; pulseColor: string; icon: string }
> = {
  connected: {
    label: '已连接',
    color: 'bg-green-500',
    pulseColor: 'bg-green-400',
    icon: 'Check'
  },
  disconnected: {
    label: '未连接',
    color: 'bg-gray-400',
    pulseColor: '',
    icon: 'X'
  },
  connecting: {
    label: '连接中...',
    color: 'bg-yellow-500',
    pulseColor: 'bg-yellow-400',
    icon: 'Loader2'
  }
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* 脉冲动画圆点 */}
      <div className="relative">
        {status === 'connected' && (
          <div className="absolute inset-0 rounded-full bg-green-400 opacity-75 animate-ping" />
        )}
        <div
          className={cn(
            'h-2.5 w-2.5 rounded-full transition-all duration-300',
            config.color,
            status === 'connecting' && 'animate-pulse'
          )}
        />
      </div>

      {/* 状态文字 */}
      <span className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
        {status === 'connected' && (
          <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M20 6L9 17l-5-5 5-5 5 5 4 6 6 9 9l5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {status === 'connecting' && (
          <svg className="h-4 w-4 text-yellow-500 animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32 4" opacity="0.4" />
          </svg>
        )}
        {status === 'disconnected' && (
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        <span>{config.label}</span>
      </span>
    </div>
  );
}
