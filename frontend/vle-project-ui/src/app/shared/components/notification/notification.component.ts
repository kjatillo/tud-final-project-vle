import { Component, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { NotificationService } from '../../services/notification.service';
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Notification } from '../../models/notification.model';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  isOpen = false;
  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;
  unreadCount: number = 0;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private elementRef: ElementRef,
    private router: Router
  ) {
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit(): void {
    const unreadSub = this.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.add(unreadSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isOpen) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (this.isOpen) {
      this.isOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id);
  }

  navigateToModule(notification: Notification, event: Event): void {
    if (notification.moduleId) {
      event.preventDefault();
      event.stopPropagation();
      
      this.isOpen = false;
      
      if (!notification.isRead) {
        this.notificationService.markAsRead(notification.id);
      }
      
      this.router.navigate(['/module', notification.moduleId]);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clearNotifications();
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const utcDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - utcDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }
}
