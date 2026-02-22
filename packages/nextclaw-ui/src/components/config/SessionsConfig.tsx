import { useEffect, useMemo, useState } from 'react';
import type { SessionEntryView, SessionMessageView } from '@/api/types';
import { useDeleteSession, useSessionHistory, useSessions, useUpdateSession } from '@/hooks/useConfig';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Save, Search, Trash2 } from 'lucide-react';

function formatDate(value?: string): string {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
}

type SessionRowProps = {
  session: SessionEntryView;
  isSelected: boolean;
  labelValue: string;
  modelValue: string;
  onToggleHistory: () => void;
  onLabelChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
  onDelete: () => void;
};

function SessionRow(props: SessionRowProps) {
  const { session } = props;
  return (
    <div className="rounded-xl border border-gray-200 p-3 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs text-gray-600">
        <div>
          <span className="font-semibold text-gray-800">Key:</span> {session.key}
        </div>
        <div>
          <span className="font-semibold text-gray-800">Messages:</span> {session.messageCount}
        </div>
        <div>
          <span className="font-semibold text-gray-800">Updated:</span> {formatDate(session.updatedAt)}
        </div>
        <div>
          <span className="font-semibold text-gray-800">Last Role:</span> {session.lastRole ?? '-'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input value={props.labelValue} onChange={(event) => props.onLabelChange(event.target.value)} placeholder="会话标签（可选）" />
        <Input
          value={props.modelValue}
          onChange={(event) => props.onModelChange(event.target.value)}
          placeholder="Preferred model（可选）"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant={props.isSelected ? 'default' : 'outline'} size="sm" onClick={props.onToggleHistory}>
          {props.isSelected ? '隐藏历史' : '查看历史'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={props.onSave}>
          <Save className="h-4 w-4 mr-1" />
          保存元信息
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={props.onClear}>
          清空历史
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={props.onDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          删除
        </Button>
      </div>
    </div>
  );
}

function SessionMessageItem({ message, index }: { message: SessionMessageView; index: number }) {
  return (
    <div key={`${message.timestamp}-${index}`} className="rounded-lg border border-gray-200 p-2">
      <div className="text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{message.role}</span> · {formatDate(message.timestamp)}
      </div>
      <div className="text-sm whitespace-pre-wrap break-words mt-1">{message.content}</div>
    </div>
  );
}

export function SessionsConfig() {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(100);
  const [activeMinutes, setActiveMinutes] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState<Record<string, string>>({});
  const [modelDraft, setModelDraft] = useState<Record<string, string>>({});

  const sessionsParams = useMemo(() => ({ q: query.trim() || undefined, limit, activeMinutes }), [query, limit, activeMinutes]);
  const sessionsQuery = useSessions(sessionsParams);
  const historyQuery = useSessionHistory(selectedKey, 200);
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  useEffect(() => {
    const sessions = sessionsQuery.data?.sessions ?? [];
    if (!sessions.length) {
      return;
    }
    setLabelDraft((prev) => {
      const next = { ...prev };
      for (const session of sessions) {
        if (!(session.key in next)) {
          next[session.key] = session.label ?? '';
        }
      }
      return next;
    });
    setModelDraft((prev) => {
      const next = { ...prev };
      for (const session of sessions) {
        if (!(session.key in next)) {
          next[session.key] = session.preferredModel ?? '';
        }
      }
      return next;
    });
  }, [sessionsQuery.data]);

  const sessions = sessionsQuery.data?.sessions ?? [];

  const saveSessionMeta = (key: string) => {
    updateSession.mutate({
      key,
      data: {
        label: (labelDraft[key] ?? '').trim() || null,
        preferredModel: (modelDraft[key] ?? '').trim() || null
      }
    });
  };

  const clearSessionHistory = (key: string) => {
    updateSession.mutate({ key, data: { clearHistory: true } });
    if (selectedKey === key) {
      setSelectedKey(null);
    }
  };

  const deleteSessionByKey = (key: string) => {
    const confirmed = window.confirm(`确认删除会话 ${key} ?`);
    if (!confirmed) {
      return;
    }
    deleteSession.mutate(
      { key },
      {
        onSuccess: () => {
          if (selectedKey === key) {
            setSelectedKey(null);
          }
        }
      }
    );
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sessions</h2>
        <p className="text-sm text-gray-500 mt-1">管理会话：筛选、查看历史、改标签/偏好模型、清空和删除。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>按关键词与活跃窗口筛选会话。</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 key 或标签" className="pl-9" />
          </div>
          <Input type="number" min={0} value={activeMinutes} onChange={(event) => setActiveMinutes(Math.max(0, Number.parseInt(event.target.value, 10) || 0))} placeholder="活跃分钟(0=不限)" />
          <div className="flex gap-2">
            <Input type="number" min={1} value={limit} onChange={(event) => setLimit(Math.max(1, Number.parseInt(event.target.value, 10) || 1))} placeholder="Limit" />
            <Button type="button" variant="outline" onClick={() => sessionsQuery.refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session List</CardTitle>
          <CardDescription>共 {sessionsQuery.data?.total ?? 0} 条；当前展示 {sessions.length} 条。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessionsQuery.isLoading ? <div className="text-sm text-gray-500">Loading sessions...</div> : null}
          {sessionsQuery.error ? <div className="text-sm text-red-600">{(sessionsQuery.error as Error).message}</div> : null}
          {!sessionsQuery.isLoading && !sessions.length ? <div className="text-sm text-gray-500">暂无会话。</div> : null}

          {sessions.map((session) => (
            <SessionRow
              key={session.key}
              session={session}
              isSelected={selectedKey === session.key}
              labelValue={labelDraft[session.key] ?? ''}
              modelValue={modelDraft[session.key] ?? ''}
              onToggleHistory={() => setSelectedKey((prev) => (prev === session.key ? null : session.key))}
              onLabelChange={(value) => setLabelDraft((prev) => ({ ...prev, [session.key]: value }))}
              onModelChange={(value) => setModelDraft((prev) => ({ ...prev, [session.key]: value }))}
              onSave={() => saveSessionMeta(session.key)}
              onClear={() => clearSessionHistory(session.key)}
              onDelete={() => deleteSessionByKey(session.key)}
            />
          ))}
        </CardContent>
      </Card>

      {selectedKey ? (
        <Card>
          <CardHeader>
            <CardTitle>History: {selectedKey}</CardTitle>
            <CardDescription>最近 200 条消息（展示窗口）。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {historyQuery.isLoading ? <div className="text-sm text-gray-500">Loading history...</div> : null}
            {historyQuery.error ? <div className="text-sm text-red-600">{(historyQuery.error as Error).message}</div> : null}
            {historyQuery.data ? (
              <div className="text-xs text-gray-500">Total: {historyQuery.data.totalMessages} · metadata: {JSON.stringify(historyQuery.data.metadata ?? {})}</div>
            ) : null}
            <div className="max-h-[480px] overflow-auto space-y-2">
              {(historyQuery.data?.messages ?? []).map((message, index) => (
                <SessionMessageItem key={`${message.timestamp}-${index}`} message={message} index={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {(updateSession.isPending || deleteSession.isPending) && <div className="text-xs text-gray-500">Applying session changes...</div>}
    </div>
  );
}
