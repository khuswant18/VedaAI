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
}

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: '1',
          title: 'Paper Generated',
          message: 'Quiz on Electricity is ready to view.',
          time: '2 min ago',
          read: false,
        },
        {
          id: '2',
          title: 'Assignment Created',
          message: 'New assignment has been created successfully.',
          time: '1 hour ago',
          read: false,
        },
        {
          id: '3',
          title: 'Welcome to VedaAI',
          message: 'Start creating AI-powered question papers.',
          time: '1 day ago',
          read: true,
        },
      ],
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
