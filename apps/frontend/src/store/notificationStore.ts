import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  markAllRead: () => void;
  markRead: (id: string) => void;
  unreadCount: () => number;
  addNotification: (title: string, message: string) => void;
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      addNotification: (title: string, message: string) =>
        set((state) => ({
          notifications: [
            {
              id: Math.random().toString(36).substring(2, 9),
              title,
              message,
              time: 'Just now',
              read: false,
            },
            ...state.notifications,
          ],
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),
      markRead: (id: string) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: 'vedaai-notifications',
    }
  )
);
