import { useEffect, useState } from 'react';
import { ConfigWebSocket } from '@/api/websocket';
import { API_BASE } from '@/api/client';
import { useUiStore } from '@/stores/ui.store';
import type { QueryClient } from '@tanstack/react-query';

export function useWebSocket(queryClient?: QueryClient) {
  const [ws, setWs] = useState<ConfigWebSocket | null>(null);
  const { setConnectionStatus } = useUiStore();

  useEffect(() => {
    const wsUrl = (() => {
      const base = API_BASE?.replace(/\/$/, '');
      if (!base) {
        return 'ws://127.0.0.1:18791/ws';
      }
      try {
        const resolved = new URL(base, window.location.origin);
        const protocol =
          resolved.protocol === 'https:'
            ? 'wss:'
            : resolved.protocol === 'http:'
              ? 'ws:'
              : resolved.protocol;
        return `${protocol}//${resolved.host}/ws`;
      } catch {
        if (base.startsWith('wss://') || base.startsWith('ws://')) {
          return `${base}/ws`;
        }
        if (base.startsWith('https://')) {
          return `${base.replace(/^https:/, 'wss:')}/ws`;
        }
        if (base.startsWith('http://')) {
          return `${base.replace(/^http:/, 'ws:')}/ws`;
        }
        return `${base}/ws`;
      }
    })();
    const client = new ConfigWebSocket(wsUrl);

    client.on('connection.open', () => {
      setConnectionStatus('connected');
    });

    client.on('config.updated', () => {
      // Trigger refetch of config
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['config'] });
      }
    });

    client.on('error', (event) => {
      if (event.type === 'error') {
        console.error('WebSocket error:', event.payload.message);
      }
    });

    client.connect();
    setWs(client);

    return () => client.disconnect();
  }, [setConnectionStatus, queryClient]);

  return ws;
}
