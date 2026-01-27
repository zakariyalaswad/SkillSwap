/**
 * Swap Request Service
 * Handles swap request creation, management, and status updates
 */

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, addDoc } from '@angular/fire/firestore';
import { SwapRequest, SwapRequestStatus, Session, Swap, Rating } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class SwapService {
  private firestore = inject(Firestore);
  
  /**
   * Create a new swap request
   */
  async createSwapRequest(swapRequest: SwapRequest): Promise<string> {
    try {
      const swapRef = collection(this.firestore, 'swap_requests');
      const docRef = await addDoc(swapRef, swapRequest);
      return docRef.id;
    } catch (error) {
      console.error('Error creating swap request:', error);
      throw error;
    }
  }
  
  /**
   * Get swap request by ID
   */
  async getSwapRequest(swapRequestId: string): Promise<SwapRequest | null> {
    try {
      const swapRef = doc(this.firestore, 'swap_requests', swapRequestId);
      const snapshot = await getDoc(swapRef);
      
      if (snapshot.exists()) {
        const data = snapshot.data();
        return { 
          ...data,
          id: snapshot.id,
          createdAt: data['createdAt']?.toDate?.() || data['createdAt'],
          respondedAt: data['respondedAt']?.toDate?.() || data['respondedAt'],
          completedAt: data['completedAt']?.toDate?.() || data['completedAt']
        } as SwapRequest;
      }
      return null;
    } catch (error) {
      console.error('Error fetching swap request:', error);
      throw error;
    }
  }
  
  /**
   * Get swap requests for a user (sent by or received by)
   */
  async getUserSwapRequests(userId: string): Promise<SwapRequest[]> {
    try {
      const swapRef = collection(this.firestore, 'swap_requests');
      const sentQuery = query(swapRef, where('senderId', '==', userId));
      const receivedQuery = query(swapRef, where('recipientId', '==', userId));
      
      const [sentSnapshot, receivedSnapshot] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery)
      ]);
      
      const mapSwapRequest = (doc: any): SwapRequest => {
        const data = doc.data();
        const mapped = { 
          ...data,
          id: doc.id,
          createdAt: data['createdAt']?.toDate?.() || data['createdAt'],
          respondedAt: data['respondedAt']?.toDate?.() || data['respondedAt'],
          completedAt: data['completedAt']?.toDate?.() || data['completedAt']
        } as SwapRequest;
        console.log('Mapped request in getUserSwapRequests:', { docId: doc.id, mappedId: mapped.id });
        return mapped;
      };
      
      const sentRequests = sentSnapshot.docs.map(mapSwapRequest);
      const receivedRequests = receivedSnapshot.docs.map(mapSwapRequest);
      const allRequests = [...sentRequests, ...receivedRequests];
      console.log('getUserSwapRequests returning:', allRequests);
      return allRequests;
    } catch (error) {
      console.error('Error fetching user swap requests:', error);
      throw error;
    }
  }
  
  /**
   * Get pending swap requests for a user
   */
  async getPendingSwapRequests(userId: string): Promise<SwapRequest[]> {
    try {
      const swapRef = collection(this.firestore, 'swap_requests');
      const q = query(
        swapRef,
        where('recipientId', '==', userId),
        where('status', '==', SwapRequestStatus.PENDING)
      );
      
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => {
        const data = doc.data();
        const mapped = { 
          ...data,
          id: doc.id,
          createdAt: data['createdAt']?.toDate?.() || data['createdAt'],
          respondedAt: data['respondedAt']?.toDate?.() || data['respondedAt'],
          completedAt: data['completedAt']?.toDate?.() || data['completedAt']
        } as SwapRequest;
        console.log('Mapped pending request:', { docId: doc.id, mappedId: mapped.id, fullRequest: mapped });
        return mapped;
      });
      console.log('getPendingSwapRequests returning:', requests);
      return requests;
    } catch (error) {
      console.error('Error fetching pending swap requests:', error);
      throw error;
    }
  }
  
  /**
   * Update swap request status
   */
  async updateSwapRequestStatus(
    swapRequestId: string,
    status: SwapRequestStatus,
    respondedAt?: Date
  ): Promise<void> {
    try {
      if (!swapRequestId || swapRequestId.trim() === '') {
        throw new Error('Invalid swap request ID: ID cannot be empty');
      }
      const swapRef = doc(this.firestore, 'swap_requests', swapRequestId);
      await updateDoc(swapRef, {
        status,
        respondedAt: respondedAt || new Date()
      });
    } catch (error) {
      console.error('Error updating swap request status:', error);
      throw error;
    }
  }
  
  /**
   * Create a session from accepted swap request
   */
  async createSession(session: Session): Promise<string> {
    try {
      const sessionRef = collection(this.firestore, 'sessions');
      const docRef = await addDoc(sessionRef, session);
      return docRef.id;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }
  
  /**
   * Get sessions for a user
   */
  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const sessionRef = collection(this.firestore, 'sessions');
      const q = query(sessionRef, where('participantIds', 'array-contains', userId));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Session);
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  }
  
  /**
   * Create a swap (complete record of entire swap)
   */
  async createSwap(swap: Swap): Promise<string> {
    try {
      const swapRef = collection(this.firestore, 'swaps');
      const docRef = await addDoc(swapRef, swap);
      return docRef.id;
    } catch (error) {
      console.error('Error creating swap:', error);
      throw error;
    }
  }
  
  /**
   * Get completed swaps for a user
   */
  async getCompletedSwaps(userId: string): Promise<Swap[]> {
    try {
      const swapRef = collection(this.firestore, 'swaps');
      const q = query(
        swapRef,
        where('status', '==', 'Completed')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => doc.data() as Swap)
        .filter(swap => swap.teacherId === userId || swap.learnerId === userId);
    } catch (error) {
      console.error('Error fetching completed swaps:', error);
      throw error;
    }
  }
}
