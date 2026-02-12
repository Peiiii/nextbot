import { useState, useEffect } from 'react';
import { useConfig, useUpdateModel } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Save, Sparkles, Sliders, Folder } from 'lucide-react';

export function ModelConfig() {
  const { data: config, isLoading } = useConfig();
  const updateModel = useUpdateModel();

  const [model, setModel] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [maxTokens, setMaxTokens] = useState(8192);
  const [temperature, setTemperature] = useState(0.7);

  useEffect(() => {
    if (config?.agents?.defaults) {
      setModel(config.agents.defaults.model || '');
      setWorkspace(config.agents.defaults.workspace || '');
      setMaxTokens(config.agents.defaults.maxTokens || 8192);
      setTemperature(config.agents.defaults.temperature || 0.7);
    }
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateModel.mutate({ model });
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
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </Card>
        <Card className="rounded-2xl border-[hsl(40,20%,90%)] p-6">
          <Skeleton className="h-5 w-24 mb-2" />
          <Skeleton className="h-3 w-40 mb-6" />
          <div className="space-y-6">
            <div>
              <Skeleton className="h-4 w-28 mb-3" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-3" />
              <Skeleton className="h-2 w-full rounded-full" />
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
        <h2 className="text-xl font-semibold text-[hsl(30,20%,12%)]">模型配置</h2>
        <p className="text-sm text-[hsl(30,8%,45%)] mt-1">配置默认 AI 模型和行为参数</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card className="rounded-2xl border-[hsl(40,20%,90%)] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-[hsl(30,20%,12%)]">默认模型</CardTitle>
                <CardDescription className="text-xs text-[hsl(30,8%,45%)]">选择要使用的 AI 模型</CardDescription>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model" className="text-sm font-medium text-[hsl(30,20%,12%)]">模型名称</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="例如: gpt-4, claude-3-opus"
                className="rounded-xl border-[hsl(40,20%,90%)] bg-[hsl(40,20%,98%)] focus:bg-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[hsl(40,20%,90%)] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                <Sliders className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-[hsl(30,20%,12%)]">生成参数</CardTitle>
                <CardDescription className="text-xs text-[hsl(30,8%,45%)]">调整模型生成文本的行为</CardDescription>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maxTokens" className="text-sm font-medium text-[hsl(30,20%,12%)]">最大 Token 数</Label>
                  <span className="text-sm font-medium text-[hsl(25,95%,53%)] bg-orange-50 px-2 py-0.5 rounded-lg">{maxTokens.toLocaleString()}</span>
                </div>
                <input
                  id="maxTokens"
                  type="range"
                  min="1000"
                  max="32000"
                  step="1000"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                  className="w-full h-2 bg-[hsl(40,20%,90%)] rounded-lg appearance-none cursor-pointer accent-[hsl(25,95%,53%)]"
                />
                <div className="flex justify-between text-xs text-[hsl(30,8%,55%)]">
                  <span>1,000</span>
                  <span>32,000</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="temperature" className="text-sm font-medium text-[hsl(30,20%,12%)]">温度 (Temperature)</Label>
                  <span className="text-sm font-medium text-[hsl(25,95%,53%)] bg-orange-50 px-2 py-0.5 rounded-lg">{temperature}</span>
                </div>
                <input
                  id="temperature"
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[hsl(40,20%,90%)] rounded-lg appearance-none cursor-pointer accent-[hsl(25,95%,53%)]"
                />
                <div className="flex justify-between text-xs text-[hsl(30,8%,55%)]">
                  <span>精确 (0)</span>
                  <span>平衡 (1)</span>
                  <span>创意 (2)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[hsl(40,20%,90%)] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Folder className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-[hsl(30,20%,12%)]">工作区</CardTitle>
                <CardDescription className="text-xs text-[hsl(30,8%,45%)]">设置默认工作目录</CardDescription>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace" className="text-sm font-medium text-[hsl(30,20%,12%)]">工作区路径</Label>
              <Input
                id="workspace"
                value={workspace}
                onChange={(e) => setWorkspace(e.target.value)}
                placeholder="/path/to/workspace"
                className="rounded-xl border-[hsl(40,20%,90%)] bg-[hsl(40,20%,98%)] focus:bg-white"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={updateModel.isPending}
            className="gap-2 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white border-0"
          >
            {updateModel.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                保存配置
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
