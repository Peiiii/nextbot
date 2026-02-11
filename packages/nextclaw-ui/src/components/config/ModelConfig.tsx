import { useState, useEffect } from 'react';
import { useConfig, useUpdateModel } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Cpu, Settings2 } from 'lucide-react';

export function ModelConfig() {
  const { data: config, isLoading } = useConfig();
  const updateModel = useUpdateModel();
  const [model, setModel] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [maxTokens, setMaxTokens] = useState(8192);
  const [temperature, setTemperature] = useState(0.7);
  const [maxToolIterations, setMaxToolIterations] = useState(20);

  // Initialize form data when config loads
  useEffect(() => {
    if (config?.agents?.defaults) {
      setModel(config.agents.defaults.model || '');
      setWorkspace(config.agents.defaults.workspace || '');
      setMaxTokens(config.agents.defaults.maxTokens || 8192);
      setTemperature(config.agents.defaults.temperature || 0.7);
      setMaxToolIterations(config.agents.defaults.maxToolIterations || 20);
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateModel.mutate({ model });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground">加载配置中...</span>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="flex items-center gap-3">
          <Cpu className="h-6 w-6 text-primary-foreground" strokeWidth={2} />
          <div>
            <CardTitle className="text-foreground">模型设置</CardTitle>
            <CardDescription className="text-muted-foreground">
              配置 AI 模型的基本参数
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 模型选择 */}
          <div className="space-y-4 p-6 bg-muted/30 rounded-xl border border-border/40">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Cpu className="h-6 w-6 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <Label htmlFor="model" className="text-base font-semibold">模型名称</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  选择要使用的 AI 模型，支持 OpenAI、Anthropic、Claude 等
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workspace" className="text-sm font-medium">工作空间路径</Label>
                <Input
                  id="workspace"
                  type="text"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                  placeholder="/path/to/workspace"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="maxTokens" className="text-sm font-medium">最大 Token 数</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 8192)}
                  placeholder="8192"
                  min="1"
                  max="100000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="temperature" className="text-sm font-medium">温度</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value) || 0.7)}
                  placeholder="0.7"
                  className="font-mono"
                />
              </div>
              <div>
                <Label htmlFor="maxToolIterations" className="text-sm font-medium">最大工具迭代</Label>
                <Input
                  id="maxToolIterations"
                  type="number"
                  value={maxToolIterations}
                  onChange={(e) => setMaxToolIterations(parseInt(e.target.value) || 20)}
                  placeholder="20"
                  min="1"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* 提交按钮 */}
          <div className="flex items-center justify-end pt-4">
            <Button
              type="submit"
              disabled={updateModel.isPending}
              className="px-8 shadow-lg hover:shadow-lg transition-all"
            >
              {updateModel.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Settings2 className="mr-2 h-4 w-4" />
                  保存模型配置
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
