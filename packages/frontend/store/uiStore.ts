import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  activeModal: string | null;
  isLoading: boolean;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setModal: (modalId: string | null) => void;
  clearModal: () => void;
  setLoading: (loading: boolean) => void;
  addNotification: (type: UIState['notifications'][number]['type'], message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  activeModal: null,
  isLoading: false,
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setModal: (modalId) => set({ activeModal: modalId }),
  
  clearModal: () => set({ activeModal: null }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  addNotification: (type, message) =>
    set((state) => {
      const MAX_NOTIFICATIONS = 5;
      const next = [
        ...state.notifications,
        { id: crypto.randomUUID(), type, message },
      ];
      return {
        notifications: next.length > MAX_NOTIFICATIONS ? next.slice(-MAX_NOTIFICATIONS) : next,
      };
    }),
  
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  
  clearNotifications: () => set({ notifications: [] }),
}));

export default useUIStore;