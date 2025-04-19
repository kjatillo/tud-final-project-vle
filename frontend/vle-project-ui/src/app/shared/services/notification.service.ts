import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, map, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { Notification } from '../models/notification.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseEndpoint = environment.baseApiEndpoint;
  private notificationsBaseEndpoint = environment.notificationApiEndpoint;
  private enrolmentsBaseEndpoint = environment.enrolmentsApiEndpoint;
  private hubConnection: signalR.HubConnection | undefined;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private enroledModuleIds: string[] = [];
  private isLoggedIn = false;
  
  public unreadCount$ = this.unreadCountSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      if (isLoggedIn) {
        this.initializeConnection();
        this.loadNotificationsFromApi();
      } else if (this.hubConnection) {
        this.stopConnection();
        this.notificationsSubject.next([]);
        this.updateUnreadCount();
        this.enroledModuleIds = [];
      }
    });
  }

  // ================== CONNECTION MANAGEMENT ==================
  
  /**
   * Creates and initializes the SignalR connection
   */
  private initializeConnection(): void {
    // Create connection if it doesn't exist
    if (!this.hubConnection) {
      this.hubConnection = this.createHubConnection();
    }

    // Only start if not already connected
    if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      this.hubConnection.start()
        .then(() => {
          this.fetchAndJoinEnroledModuleGroups();
        })
        .catch(err => console.error('Error while starting SignalR connection:', err));
    }
  }

  /**
   * Creates a new hub connection with proper configuration
   */
  private createHubConnection(): signalR.HubConnection {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseEndpoint}/notificationHub`)
      .withAutomaticReconnect()
      .build();
      
    this.setupHubConnectionEvents(connection);
    return connection;
  }

  /**
   * Sets up event handlers for the SignalR connection
   */
  private setupHubConnectionEvents(connection: signalR.HubConnection): void {
    // Connection state change handlers
    connection.onclose(err => {
      console.error('SignalR connection closed', err);
      if (this.isLoggedIn) {
        setTimeout(() => this.initializeConnection(), 5000);
      }
    });

    connection.onreconnecting(err => {
      console.error('SignalR reconnecting:', err);
    });

    connection.onreconnected(() => {
      this.joinEnroledModuleGroups();
    });

    // Notification handler
    connection.on('ReceiveGradeNotification', (message: string, moduleId: string, moduleTitle: string) => {
      const notification: Notification = {
        id: this.generateId(),
        message,
        moduleId,
        moduleTitle,
        createdAt: new Date(),
        isRead: false,
        tempId: true
      };

      this.addNotification(notification);
    });
  }

  /**
   * Safely stops the SignalR connection
   */
  private stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(err => console.error('Error while stopping SignalR connection:', err));
    }
  }

  // ================== MODULE GROUP MANAGEMENT ==================

  /**
   * Fetches enroled modules and joins their notification groups
   */
  private fetchAndJoinEnroledModuleGroups(): void {
    this.http.get<any[]>(`${this.enrolmentsBaseEndpoint}/modules`).subscribe({
      next: (modules) => {
        this.enroledModuleIds = modules.map(m => m.moduleId);
        this.joinEnroledModuleGroups();
      },
      error: (err) => console.error('Error fetching enroled modules:', err)
    });
  }

  /**
   * Joins all enroled module groups if connection is ready
   */
  private joinEnroledModuleGroups(): void {
    if (this.isHubConnected()) {
      this.enroledModuleIds.forEach(moduleId => {
        this.joinModuleGroup(moduleId);
      });
    }
  }

  /**
   * Joins a specific module notification group
   */
  public joinModuleGroup(moduleId: string): void {
    if (!moduleId) return;
    
    if (this.isHubConnected()) {
      this.hubConnection!.invoke('JoinModuleGroup', moduleId)
        .catch(err => console.error('Error while joining module group:', err));
    } else {
      console.error('Cannot join module group: SignalR not connected');
    }
  }

  /**
   * Leaves a specific module notification group
   */
  public leaveModuleGroup(moduleId: string): void {
    if (!moduleId) return;
    
    if (this.isHubConnected()) {
      this.hubConnection!.invoke('LeaveModuleGroup', moduleId)
        .catch(err => console.error('Error while leaving module group:', err));
    }
  }

  /**
   * Ensures connection is established before joining a module group
   * This prevents "SignalR not connected" errors when navigating to modules
   */
  public ensureConnectionAndJoinModule(moduleId: string): void {
    if (!moduleId || !this.isLoggedIn) return;
    
    // If connection is already established, join immediately
    if (this.isHubConnected()) {
      this.joinModuleGroup(moduleId);
      return;
    }
    
    // Create connection if it doesn't exist
    if (!this.hubConnection) {
      this.hubConnection = this.createHubConnection();
      
      // Start connection and join after it's established
      this.hubConnection.start()
        .then(() => this.joinModuleGroup(moduleId))
        .catch(err => console.error('Error starting SignalR connection:', err));
      
      return;
    }
    
    // Handle different connection states
    switch (this.hubConnection.state) {
      case signalR.HubConnectionState.Disconnected:
        // Only try to start if it's disconnected
        this.hubConnection.start()
          .then(() => this.joinModuleGroup(moduleId))
          .catch(err => console.error('Error starting SignalR connection:', err));
        break;
        
      case signalR.HubConnectionState.Connecting:
      case signalR.HubConnectionState.Reconnecting:
        // If connecting/reconnecting, wait for it to connect before joining
        this.hubConnection.onreconnected(() => this.joinModuleGroup(moduleId));
        break;
        
      case signalR.HubConnectionState.Connected:
        // Shouldn't reach here (would be caught by isHubConnected), but just in case
        this.joinModuleGroup(moduleId);
        break;
    }
  }

  // ================== NOTIFICATION MANAGEMENT ==================

  /**
   * Loads notifications from the API, with localStorage fallback
   */
  private loadNotificationsFromApi(): void {
    if (!this.isLoggedIn) return;

    this.http.get<any[]>(this.notificationsBaseEndpoint).subscribe({
      next: (notifications) => {
        const mappedNotifications = this.mapApiNotifications(notifications);
        this.notificationsSubject.next(mappedNotifications);
        this.updateUnreadCount();
        this.saveNotificationsToStorage();
      },
      error: (err) => {
        console.error('Error fetching notifications:', err);
        this.loadNotificationsFromStorage();
      }
    });
  }

  /**
   * Maps API notification format to client format
   */
  private mapApiNotifications(notifications: any[]): Notification[] {
    const mapped = notifications.map(n => ({
      id: n.notificationId,
      message: n.message,
      moduleId: n.moduleId,
      moduleTitle: n.moduleTitle,
      createdAt: new Date(n.createdAt),
      isRead: n.isRead === true
    }));
    
    return mapped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Adds a new notification to the list with duplicate checking
   */
  private addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    
    if (this.isDuplicate(notification, currentNotifications)) {
      return;
    }
    
    const updatedNotifications = [notification, ...currentNotifications];
    const sorted = updatedNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Limit to last 50 notifications to prevent storage issues
    const limitedNotifications = sorted.slice(0, 50);
    
    this.notificationsSubject.next(limitedNotifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Checks if a notification is a duplicate (same content and recent timeframe)
   */
  private isDuplicate(notification: Notification, existingNotifications: Notification[]): boolean {
    return existingNotifications.some(n => {
      const isSameContent = n.message === notification.message && 
                           n.moduleId === notification.moduleId;
                           
      // Check if notifications were created close in time (within 5 minutes)
      const timeDiffMs = Math.abs(new Date(n.createdAt).getTime() - new Date(notification.createdAt).getTime());
      const isWithin5Min = timeDiffMs < 5 * 60 * 1000;
      
      return isSameContent && isWithin5Min;
    });
  }

  /**
   * Updates the unread notification count
   */
  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Marks a notification as read, handling both temp IDs and API notifications
   */
  public markAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const notification = currentNotifications.find(n => n.id === notificationId);
    
    if (!notification) {
      console.error('Notification not found:', notificationId);
      return;
    }
    
    if (notification.tempId) {
      this.findAndMarkNotificationByContent(notification.moduleId, notification.message);
      this.updateNotificationReadStatus([notificationId]);
    } else {
      this.http.post<any>(`${this.notificationsBaseEndpoint}/${notificationId}/read`, {}).subscribe({
        next: () => this.updateNotificationReadStatus([notificationId]),
        error: (err) => console.error('Error marking notification as read:', err)
      });
    }
  }
  
  /**
   * Updates local notifications read status
   */
  private updateNotificationReadStatus(ids: string[]): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(n => {
      if (ids.includes(n.id)) {
        return { ...n, isRead: true };
      }
      return n;
    });
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    this.saveNotificationsToStorage();
  }

  /**
   * Finds and marks notification by content (for temporary notifications)
   */
  private findAndMarkNotificationByContent(moduleId: string, message: string): void {
    this.http.post<{status: string, message: string, notificationId?: string}>(
      `${this.notificationsBaseEndpoint}/mark-by-content`, 
      { moduleId, message }
    ).subscribe({
      error: (err) => console.error('Error finding notification by content:', err)
    });
  }

  /**
   * Marks all notifications as read
   */
  public markAllAsRead(): void {
    this.http.post<any>(`${this.notificationsBaseEndpoint}/mark-all-read`, {}).subscribe({
      next: () => {
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = currentNotifications.map(n => ({ ...n, isRead: true }));
        
        this.notificationsSubject.next(updatedNotifications);
        this.updateUnreadCount();
        this.saveNotificationsToStorage();
      },
      error: (err) => console.error('Error marking all notifications as read:', err)
    });
  }

  /**
   * Clears all notifications
   */
  public clearNotifications(): void {
    this.http.delete<any>(this.notificationsBaseEndpoint).subscribe({
      next: () => {
        this.notificationsSubject.next([]);
        this.updateUnreadCount();
        localStorage.removeItem('notifications');
      },
      error: (err) => console.error('Error clearing notifications:', err)
    });
  }

  // ================== SENDING NOTIFICATIONS ==================

  /**
   * Sends a grade notification with API and SignalR fallback
   */
  public sendGradeNotification(moduleId: string, message: string, moduleTitle?: string): Observable<boolean> {
    return this.sendGradeNotificationApi(moduleId, message, moduleTitle).pipe(
      switchMap(success => {
        if (success) {
          return of(true);
        } else {
          return this.sendGradeNotificationSignalR(moduleId, message, moduleTitle);
        }
      })
    );
  }

  /**
   * Sends notification via API for persistence
   */
  private sendGradeNotificationApi(moduleId: string, message: string, moduleTitle?: string): Observable<boolean> {
    return this.http.post<{success: boolean}>(`${this.notificationsBaseEndpoint}/send-grade-notification`, {
      moduleId,
      message,
      moduleTitle
    }).pipe(
      map(response => response.success),
      tap({
        error: err => console.error('Error sending notification via API:', err)
      })
    );
  }

  /**
   * Sends notification via SignalR directly (fallback)
   */
  private sendGradeNotificationSignalR(moduleId: string, message: string, moduleTitle?: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      if (this.isHubConnected()) {
        this.hubConnection!.invoke('SendGradeNotification', moduleId, message, moduleTitle || '')
          .then(() => {
            observer.next(true);
            observer.complete();
          })
          .catch(err => {
            console.error('Error sending grade notification via SignalR:', err);
            observer.next(false);
            observer.complete();
          });
      } else {
        console.error('Cannot send notification: connection not established');
        observer.next(false);
        observer.complete();
      }
    });
  }

  // ================== STORAGE METHODS ==================

  /**
   * Saves notifications to localStorage as fallback
   */
  private saveNotificationsToStorage(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notificationsSubject.value));
  }

  /**
   * Loads notifications from localStorage
   */
  private loadNotificationsFromStorage(): void {
    const storedNotifications = localStorage.getItem('notifications');
    if (!storedNotifications) return;
    
    try {
      const notifications = JSON.parse(storedNotifications) as Notification[];
      
      const parsedNotifications = notifications.map(n => ({
        ...n,
        createdAt: new Date(n.createdAt),
        isRead: n.isRead === true
      }));
      
      parsedNotifications.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      this.notificationsSubject.next(parsedNotifications);
      this.updateUnreadCount();
    } catch (e) {
      console.error('Error parsing stored notifications', e);
      this.notificationsSubject.next([]);
    }
  }

  // ================== UTILITY METHODS ==================

  /**
   * Checks if hub connection is established
   */
  private isHubConnected(): boolean {
    return !!this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Generates a unique temporary ID for notifications
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
