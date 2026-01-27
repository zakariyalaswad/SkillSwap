/**
 * Notifications Component
 * Display and manage user notifications
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../shared/services/notification.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Notification, NotificationType } from '../../../models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  // State
  protected notifications = signal<Notification[]>([]);
  protected unreadNotifications = signal<Notification[]>([]);
  protected isLoading = signal(false);
  protected currentUserId = signal<string>('');
  protected showDropdown = signal(false);
  protected activeTab = signal<'unread' | 'all'>('unread');

  ngOnInit(): void {
    try {
      const user = this.authService.getCurrentUser();
      if (!user?.id) {
        return;
      }

      this.currentUserId.set(user.id);
      this.loadNotifications();

      // Refresh notifications every 5 seconds
      setInterval(() => {
        this.loadNotifications();
      }, 5000);
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  /**
   * Load notifications for current user
   */
  async loadNotifications(): Promise<void> {
    try {
      const allNotifs = await this.notificationService.getUserNotifications(
        this.currentUserId(),
        50
      );
      this.notifications.set(allNotifs);

      const unread = await this.notificationService.getUnreadNotifications(
        this.currentUserId()
      );
      this.unreadNotifications.set(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notification: Notification): Promise<void> {
    try {
      await this.notificationService.markAsRead(notification.id);
      this.loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await this.notificationService.markAllAsRead(this.currentUserId());
      this.loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }

  /**
   * Get notification icon
   */
  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      [NotificationType.NEW_MATCH]: '👥',
      [NotificationType.SWAP_REQUEST]: '🔄',
      [NotificationType.REQUEST_ACCEPTED]: '✅',
      [NotificationType.REQUEST_REJECTED]: '❌',
      [NotificationType.SESSION_REMINDER]: '⏰',
      [NotificationType.NEW_MESSAGE]: '💬',
      [NotificationType.RATING_RECEIVED]: '⭐',
      [NotificationType.SYSTEM]: 'ℹ️'
    };
    return icons[type] || 'ℹ️';
  }

  /**
   * Get notification color
   */
  getNotificationColor(type: string): string {
    const colors: { [key: string]: string } = {
      [NotificationType.NEW_MATCH]: 'blue',
      [NotificationType.SWAP_REQUEST]: 'purple',
      [NotificationType.REQUEST_ACCEPTED]: 'green',
      [NotificationType.REQUEST_REJECTED]: 'red',
      [NotificationType.SESSION_REMINDER]: 'yellow',
      [NotificationType.NEW_MESSAGE]: 'indigo',
      [NotificationType.RATING_RECEIVED]: 'yellow',
      [NotificationType.SYSTEM]: 'gray'
    };
    return colors[type] || 'gray';
  }

  /**
   * Get filtered notifications
   */
  getFilteredNotifications(): Notification[] {
    return this.activeTab() === 'unread' 
      ? this.unreadNotifications() 
      : this.notifications();
  }

  /**
   * Format time ago
   */
  formatTimeAgo(date: Date): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return d.toLocaleDateString();
  }

  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.unreadNotifications().length;
  }

  /**
   * Toggle dropdown
   */
  toggleDropdown(): void {
    this.showDropdown.set(!this.showDropdown());
  }

  /**
   * Close dropdown
   */
  closeDropdown(): void {
    this.showDropdown.set(false);
  }
}
