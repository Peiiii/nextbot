import { useState, useEffect } from 'react';
import { useConfig, useUpdateUiConfig, useReloadConfig } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { RefreshCw, Globe } from 'lucide-react';

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
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">加载中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
        <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/20">
              <Globe className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="text-foreground">界面设置</CardTitle>
              <CardDescription className="text-muted-foreground/80">
                配置 Web UI 服务器和访问选项
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/80 to-primary/20 flex items-center justify-center shadow-lg">
                  <RefreshCw className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{enabled ? 'UI 已启用' : 'UI 已禁用'}</h3>
                  <p className="text-xs text-muted-foreground">
                    {enabled ? 'Web UI 将在配置的端口上运行' : 'Web UI 未运行'}
                  </p>
                </div>
              </div>
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={setEnabled}
                className="scale-125"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="host" className="text-sm font-medium text-foreground">
                监听地址
              </Label>
              <Input
                id="host"
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="127.0.0.1"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port" className="text-sm font-medium text-foreground">
                端口
              </Label>
              <Input
                id="port"
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value) || 18791)}
                placeholder="18791"
                className="font-mono"
                min="1"
                max="65535"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Globe className="h-6 w-6 text-secondary-foreground" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">自动打开浏览器</h3>
                  <p className="text-xs text-muted-foreground">
                    启动时自动打开浏览器访问配置界面
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-4">
              <Button
                type="submit"
                disabled={updateUiConfig.isPending}
                className="px-8 shadow-lg hover:shadow-xl transition-all"
              >
                {updateUiConfig.isPending ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                    保存中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    保存配置
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
        <CardHeader className="bg-gradient-to-br from-secondary/10 to-secondary/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-secondary flex items-center justify-center shadow-lg">
              <RefreshCw className="h-6 w-6 text-secondary-foreground" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="text-foreground">重载配置</CardTitle>
              <CardDescription className="text-muted-foreground/80">
                应用配置更改并重启服务
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            点击下方按钮将重载配置文件，使所有更改生效。
          </p>
          <Button
            variant="outline"
            onClick={handleReload}
            disabled={reloadConfig.isPending}
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            {reloadConfig.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                重载中...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                重载配置
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
