import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Notification } from '../../models/notification.model';
import { DropdownService } from '../../services/dropdown.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications$: Observable<Notification[]>;
  unreadCount$: Observable<number>;
  unreadCount: number = 0;
  isNotificationOpen: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private elementRef: ElementRef,
    private router: Router,
    private dropdownService: DropdownService
  ) {
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit(): void {
    const unreadSub = this.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
    this.subscriptions.add(unreadSub);

    const dropdownSub = this.dropdownService.dropdownOpen$.subscribe(dropdownId => {
      if (dropdownId !== 'notificationDropdown' && this.isNotificationOpen) {
        this.isNotificationOpen = false;
      }
    });
    this.subscriptions.add(dropdownSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isNotificationOpen) return;
    
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!this.elementRef.nativeElement.contains(target)) {
      this.isNotificationOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (this.isNotificationOpen) {
      this.isNotificationOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isNotificationOpen = !this.isNotificationOpen;

    if (this.isNotificationOpen) {
      this.dropdownService.notifyDropdownOpened('notificationDropdown');
    }
  }

  markAsRead(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.markAsRead(notification.id);
  }

  navigateToModule(notification: Notification, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id);
    }

    if (notification.moduleId) {
      this.isNotificationOpen = false;
      this.router.navigate(['/module', notification.moduleId], { queryParams: { view: 'grades' } });
    } else if (notification.notificationType === 'Admin') {
      this.isNotificationOpen = false;
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clearNotifications();
  }

  deleteNotification(notification: Notification, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.notificationService.deleteNotification(notification.id);
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
