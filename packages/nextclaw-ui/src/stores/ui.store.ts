import { create } from 'zustand';

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting';

interface UiState {
  // Connection status
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;

  // Provider modal
  providerModal: { open: boolean; provider?: string };
  openProviderModal: (provider?: string) => void;
  closeProviderModal: () => void;

  // Channel modal
  channelModal: { open: boolean; channel?: string };
  openChannelModal: (channel?: string) => void;
  closeChannelModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  connectionStatus: 'disconnected',
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  providerModal: { open: false },
  openProviderModal: (provider) => set({ providerModal: { open: true, provider } }),
  closeProviderModal: () => set({ providerModal: { open: false } }),

  channelModal: { open: false },
  openChannelModal: (channel) => set({ channelModal: { open: true, channel } }),
  closeChannelModal: () => set({ channelModal: { open: false } })
}));
