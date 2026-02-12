import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title?: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-[hsl(40,20%,90%)] flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {title && (
          <div>
            <h2 className="text-base font-semibold text-[hsl(30,20%,12%)]">{title}</h2>
            {description && (
              <p className="text-xs text-[hsl(30,8%,45%)]">{description}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button className="h-9 w-9 rounded-lg bg-[hsl(40,20%,96%)] flex items-center justify-center text-[hsl(30,8%,45%)] hover:bg-[hsl(40,20%,94%)] hover:text-[hsl(30,20%,12%)] transition-colors">
          <Search className="h-4 w-4" />
        </button>
        <button className="h-9 w-9 rounded-lg bg-[hsl(40,20%,96%)] flex items-center justify-center text-[hsl(30,8%,45%)] hover:bg-[hsl(40,20%,94%)] hover:text-[hsl(30,20%,12%)] transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
        </button>
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">N</span>
        </div>
      </div>
    </header>
  );
}
