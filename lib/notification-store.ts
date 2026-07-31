export type NotificationType = "success" | "info" | "warning" | "error" | "loading";

export interface NotificationItem {
  id: string;
  title: string;
  type?: NotificationType;
  timestamp: number;
  read: boolean;
  action?: React.ReactNode;
}

type Listener = (notifications: NotificationItem[]) => void;

class NotificationStoreImpl {
  private notifications: NotificationItem[] = [];
  private listeners: Set<Listener> = new Set();

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Give them the initial state immediately
    listener(this.notifications);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.notifications));
  }

  public add(notification: Omit<NotificationItem, "id" | "timestamp" | "read">) {
    const newItem: NotificationItem = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      read: false,
    };
    
    // Unshift to add to the beginning of the list (newest first)
    this.notifications = [newItem, ...this.notifications];
    this.notify();
  }

  public markAsRead(id: string) {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notify();
  }
  
  public markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notify();
  }

  public clearAll() {
    this.notifications = [];
    this.notify();
  }

  public remove(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  public getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }
  
  public getNotifications() {
    return this.notifications;
  }
}

export const NotificationStore = new NotificationStoreImpl();
