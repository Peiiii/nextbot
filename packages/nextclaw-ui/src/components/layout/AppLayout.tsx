import { Sidebar } from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="h-screen flex bg-[hsl(40,20%,98%)] p-2">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-[2rem] shadow-sm overflow-hidden border border-[hsl(40,10%,94%)]">
        <main className="flex-1 overflow-auto custom-scrollbar p-8">
          <div className="max-w-6xl mx-auto animate-fade-in h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
