import { useState, useEffect } from 'react';
import { useConfig, useUpdateUiConfig, useReloadConfig } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Save, Monitor, Power } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UiConfig() {
  const { data: config, isLoading } = useConfig();
  const updateUiConfig = useUpdateUiConfig();
  const reloadConfig = useReloadConfig();

  const [enabled, setEnabled] = useState(false);
  const [host, setHost] = useState('127.0.0.1');
  const [port, setPort] = useState(18791);

  useEffect(() => {
    if (config?.ui) {
      setEnabled(config.ui.enabled);
      setHost(config.ui.host);
      setPort(config.ui.port);
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUiConfig.mutate({ enabled, host, port, open: true });
  };

  const handleReload = () => {
    reloadConfig.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card className="rounded-2xl border-[hsl(40,20%,90%)] p-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
          <Skeleton className="h-16 w-full rounded-xl mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-[hsl(30,20%,12%)]">界面设置</h2>
        <p className="text-sm text-[hsl(30,8%,45%)] mt-1">配置 Web UI 服务器和访问选项</p>
      </div>

      <Card className="rounded-2xl border-[hsl(40,20%,90%)] bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-[hsl(30,20%,12%)]">Web UI 服务器</CardTitle>
              <CardDescription className="text-xs text-[hsl(30,8%,45%)]">配置界面服务的运行参数</CardDescription>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={cn(
              "flex items-center justify-between p-4 rounded-xl transition-colors",
              enabled ? "bg-emerald-50" : "bg-[hsl(40,20%,96%)]"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  enabled ? "bg-emerald-100 text-emerald-600" : "bg-[hsl(40,20%,94%)] text-[hsl(30,8%,45%)]"
                )}>
                  <Power className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-[hsl(30,20%,12%)]">启用 Web UI</h3>
                  <p className={cn(
                    "text-xs",
                    enabled ? "text-emerald-600" : "text-[hsl(30,8%,45%)]"
                  )}>
                    {enabled ? '服务正在运行' : '服务已停止'}
                  </p>
                </div>
              </div>
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="host" className="text-sm font-medium text-[hsl(30,20%,12%)]">监听地址</Label>
                <Input
                  id="host"
                  type="text"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="127.0.0.1"
                  className="rounded-xl border-[hsl(40,20%,90%)] bg-[hsl(40,20%,98%)] focus:bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="port" className="text-sm font-medium text-[hsl(30,20%,12%)]">端口</Label>
                <Input
                  id="port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value) || 18791)}
                  placeholder="18791"
                  min="1"
                  max="65535"
                  className="rounded-xl border-[hsl(40,20%,90%)] bg-[hsl(40,20%,98%)] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={updateUiConfig.isPending}
                className="gap-2 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white border-0"
              >
                <Save className="h-4 w-4" />
                保存配置
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-[hsl(40,20%,90%)] bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center">
              <RefreshCw className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-[hsl(30,20%,12%)]">重载配置</CardTitle>
              <CardDescription className="text-xs text-[hsl(30,8%,45%)]">应用配置更改并重启服务</CardDescription>
            </div>
          </div>
          <p className="text-sm text-[hsl(30,8%,45%)] mb-4">
            点击下方按钮将重载配置文件，使所有更改生效。
          </p>
          <Button
            variant="outline"
            onClick={handleReload}
            disabled={reloadConfig.isPending}
            className="w-full gap-2 rounded-xl border-[hsl(40,20%,90%)] bg-[hsl(40,20%,98%)] hover:bg-[hsl(40,20%,94%)] text-[hsl(30,10%,35%)]"
          >
            <RefreshCw className="h-4 w-4" />
            重载配置
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
