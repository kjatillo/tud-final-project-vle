export interface Notification {
    id: string;
    message: string;
    moduleId?: string;
    moduleTitle?: string;
    createdAt: Date;
    isRead: boolean;
    tempId?: boolean; // Flag to identify client-generated IDs
    notificationType?: string;
  }
  