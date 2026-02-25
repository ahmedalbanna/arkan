export type NotificationIcon = 'credit-card' | 'bot' | 'file-text' | 'user-plus' | 'default';

export interface Notification {
  id: string;
  title: string;
  description: string;
  icon: NotificationIcon;
  isRead: boolean;
  createdAt: string;
  link?: string;
}
