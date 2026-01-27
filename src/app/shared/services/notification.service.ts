/**
 * Notification Service
 * Handles notifications for users
 */

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, query, where, updateDoc, doc } from '@angular/fire/firestore';
import { Notification, NotificationType } from '../../models';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore = inject(Firestore);
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  /**
   * Create a notification
   */
  async createNotification(notification: Notification): Promise<string> {
    try {
      const notificationsRef = collection(this.firestore, 'notifications');
      const docRef = await addDoc(notificationsRef, {
        ...notification,
        createdAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }
  
  /**
   * Get unread notifications for a user
   */
  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsRef = collection(this.firestore, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('isRead', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => doc.data() as Notification);
      
      this.notificationsSubject.next(notifications);
      return notifications;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }
  
  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string, limitCount: number = 50): Promise<Notification[]> {
    try {
      const notificationsRef = collection(this.firestore, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => doc.data() as Notification)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, limitCount);
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }
  
  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(this.firestore, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: new Date()
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notifications = await this.getUserNotifications(userId);
      
      for (const notification of notifications) {
        if (!notification.isRead) {
          const notificationRef = doc(this.firestore, 'notifications', notification.id);
          await updateDoc(notificationRef, {
            isRead: true,
            readAt: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}
