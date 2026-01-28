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
        const conv = doc.data();
        return conv['participantIds']?.includes(userId2);
      });
      
      if (existingConversation) {
        const data = existingConversation.data();
        return {
          ...data,
          id: existingConversation.id,
          createdAt: data['createdAt']?.toDate?.() || data['createdAt'],
          updatedAt: data['updatedAt']?.toDate?.() || data['updatedAt']
        } as ChatConversation;
      }
      
      // Create new conversation
      const newConversation = {
        participantIds: [userId1, userId2],
        participantNames: [names.name1, names.name2],
        unreadBy: [userId1, userId2],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(conversationRef, newConversation);
      
      // Update the document with the ID
      const conversationDocRef = doc(this.firestore, 'conversations', docRef.id);
      await updateDoc(conversationDocRef, {
        id: docRef.id
      });
      
      return {
        ...newConversation,
        id: docRef.id
      } as ChatConversation;
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
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data['createdAt']?.toDate?.() || data['createdAt'],
          updatedAt: data['updatedAt']?.toDate?.() || data['updatedAt']
        } as ChatConversation;
      });
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
      
      // Prepare message without id field (Firestore will generate it)
      const { id, ...messageToSend } = message;
      
      const docRef = await addDoc(messagesRef, messageToSend);
      
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
        .map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data['createdAt']?.toDate?.() || new Date(data['createdAt']),
            editedAt: data['editedAt']?.toDate?.() || data['editedAt']
          } as Message;
        })
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
        const messages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data['createdAt']?.toDate?.() || new Date(data['createdAt']),
            editedAt: data['editedAt']?.toDate?.() || data['editedAt']
          } as Message;
        });
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
