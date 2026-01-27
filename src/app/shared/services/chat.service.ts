/**
 * Chat Service
 * Handles real-time messaging and conversations
 */

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, orderBy, limit, onSnapshot } from '@angular/fire/firestore';
import { ChatConversation, Message, Notification, NotificationType } from '../../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private firestore = inject(Firestore);
  
  /**
   * Create or get conversation between two users
   */
  async getOrCreateConversation(userId1: string, userId2: string, names: { name1: string; name2: string }): Promise<ChatConversation> {
    try {
      // Look for existing conversation
      const conversationRef = collection(this.firestore, 'conversations');
      const q = query(
        conversationRef,
        where('participantIds', 'array-contains', userId1)
      );
      
      const snapshot = await getDocs(q);
      
      const existingConversation = snapshot.docs.find(doc => {
        const conv = doc.data() as ChatConversation;
        return conv.participantIds.includes(userId2);
      });
      
      if (existingConversation) {
        return existingConversation.data() as ChatConversation;
      }
      
      // Create new conversation
      const newConversation: ChatConversation = {
        id: '', // Will be set by Firestore
        participantIds: [userId1, userId2],
        participantNames: [names.name1, names.name2],
        unreadBy: [userId1, userId2],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(conversationRef, newConversation);
      
      return {
        ...newConversation,
        id: docRef.id
      };
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
  
  /**
   * Get user's conversations
   */
  async getUserConversations(userId: string): Promise<ChatConversation[]> {
    try {
      const conversationRef = collection(this.firestore, 'conversations');
      const q = query(
        conversationRef,
        where('participantIds', 'array-contains', userId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as ChatConversation);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }
  
  /**
   * Send a message
   */
  async sendMessage(conversationId: string, message: Message): Promise<string> {
    try {
      const messagesRef = collection(this.firestore, `conversations/${conversationId}/messages`);
      const docRef = await addDoc(messagesRef, message);
      
      // Update conversation's last message
      const conversationRef = doc(this.firestore, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: message.content,
        lastMessageTime: new Date(),
        updatedAt: new Date()
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: string, limitCount: number = 50): Promise<Message[]> {
    try {
      const messagesRef = collection(this.firestore, `conversations/${conversationId}/messages`);
      const q = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => doc.data() as Message)
        .reverse(); // Return in ascending order
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
  
  /**
   * Listen to messages in real-time
   */
  listenToMessages(conversationId: string): Observable<Message[]> {
    return new Observable(observer => {
      const messagesRef = collection(this.firestore, `conversations/${conversationId}/messages`);
      const q = query(
        messagesRef,
        orderBy('createdAt', 'asc'),
        limit(100)
      );
      
      const unsubscribe = onSnapshot(q, snapshot => {
        const messages = snapshot.docs.map(doc => doc.data() as Message);
        observer.next(messages);
      }, error => {
        observer.error(error);
      });
      
      return () => unsubscribe();
    });
  }
  
  /**
   * Mark message as read
   */
  async markMessageAsRead(conversationId: string, messageId: string, userId: string): Promise<void> {
    try {
      const messageRef = doc(this.firestore, `conversations/${conversationId}/messages/${messageId}`);
      const messageSnapshot = await getDoc(messageRef);
      
      if (messageSnapshot.exists()) {
        const message = messageSnapshot.data() as Message;
        const readBy = message.readBy || [];
        
        if (!readBy.includes(userId)) {
          readBy.push(userId);
          await updateDoc(messageRef, {
            isRead: true,
            readBy
          });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  }
}
