/**
 * Swap Requests Component
 * Display incoming and outgoing swap requests
 */

import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SwapService } from '../../../../shared/services/swap.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { ChatService } from '../../../../shared/services/chat.service';
import { UserService } from '../../../../shared/services/user.service';
import { SwapRequest, SwapRequestStatus } from '../../../../models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './requests.html',
  styleUrls: ['./requests.css']
})
export class Requests implements OnInit {
  private swapService = inject(SwapService);
  private authService = inject(AuthService);
  private chatService = inject(ChatService);
  private userService = inject(UserService);
  private router = inject(Router);

  // State
  protected incomingRequests = signal<SwapRequest[]>([]);
  protected outgoingRequests = signal<SwapRequest[]>([]);
  protected activeTab = signal<'incoming' | 'outgoing'>('incoming');
  protected isLoading = signal(false);
  protected currentUserId = signal<string>('');

  ngOnInit(): void {
    try {
      const user = this.authService.getCurrentUser();
      if (!user?.id) {
        return;
      }

      this.currentUserId.set(user.id);
      this.loadRequests();
    } catch (error) {
      console.error('Error initializing requests:', error);
      Swal.fire('Error', 'Failed to load requests', 'error');
    }
  }

  /**
   * Load swap requests for current user
   */
  async loadRequests(): Promise<void> {
    this.isLoading.set(true);
    try {
      // Get pending requests for current user (incoming)
      const pending = await this.swapService.getPendingSwapRequests(this.currentUserId());
      console.log('Pending requests from service:', pending);
      const incoming = pending.filter(r => r.recipientId === this.currentUserId());
      console.log('Filtered incoming requests:', incoming);
      this.incomingRequests.set(incoming);

      // Get all requests sent by current user (outgoing)
      const allRequests = await this.swapService.getUserSwapRequests(this.currentUserId());
      console.log('All requests from service:', allRequests);
      const outgoing = allRequests.filter(r => r.senderId === this.currentUserId());
      console.log('Filtered outgoing requests:', outgoing);
      this.outgoingRequests.set(outgoing);
    } catch (error) {
      console.error('Error loading requests:', error);
      Swal.fire('Error', 'Failed to load requests', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Accept a swap request
   */
  async acceptRequest(request: SwapRequest): Promise<void> {
    const result = await Swal.fire({
      title: 'Accept Swap Request?',
      html: `<strong>${request.senderName}</strong> wants to swap:<br/>They teach: <strong>${request.skillOffered.name}</strong><br/>They want: <strong>${request.skillRequested.name}</strong>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Accept',
      cancelButtonText: 'Reject'
    });

    if (!result.isConfirmed) {
      if (result.isDismissed && result.dismiss === Swal.DismissReason.cancel) {
        this.rejectRequest(request);
      }
      return;
    }

    try {
      this.isLoading.set(true);
      console.log('Accepting request with ID:', request.id, 'Full request:', request);
      
      // Update swap request status
      await this.swapService.updateSwapRequestStatus(
        request.id,
        SwapRequestStatus.ACCEPTED
      );

      // Get current user info
      const currentUser = this.authService.getCurrentUser();
      if (currentUser?.id) {
        // Create conversation between sender and recipient
        const conversation = await this.chatService.getOrCreateConversation(
          request.senderId,
          request.recipientId,
          {
            name1: request.senderName,
            name2: request.recipientName
          }
        );
        console.log('Conversation created:', conversation.id);
      }
      
      Swal.fire('Success', 'Swap request accepted! You can now schedule a session.', 'success');
      this.loadRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      Swal.fire('Error', 'Failed to accept request', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Reject a swap request
   */
  async rejectRequest(request: SwapRequest): Promise<void> {
    const result = await Swal.fire({
      title: 'Reject Request?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reject'
    });

    if (!result.isConfirmed) return;

    try {
      this.isLoading.set(true);
      await this.swapService.updateSwapRequestStatus(
        request.id,
        SwapRequestStatus.REJECTED
      );
      
      Swal.fire('Success', 'Request rejected.', 'success');
      this.loadRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      Swal.fire('Error', 'Failed to reject request', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cancel outgoing request
   */
  async cancelRequest(request: SwapRequest): Promise<void> {
    const result = await Swal.fire({
      title: 'Cancel Request?',
      text: 'The other user will no longer see your request.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel'
    });

    if (!result.isConfirmed) return;

    try {
      this.isLoading.set(true);
      await this.swapService.updateSwapRequestStatus(
        request.id,
        SwapRequestStatus.CANCELLED
      );
      
      Swal.fire('Success', 'Request cancelled.', 'success');
      this.loadRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      Swal.fire('Error', 'Failed to cancel request', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Get request status color
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      [SwapRequestStatus.PENDING]: 'yellow',
      [SwapRequestStatus.ACCEPTED]: 'green',
      [SwapRequestStatus.REJECTED]: 'red',
      [SwapRequestStatus.CANCELLED]: 'gray'
    };
    return colors[status] || 'gray';
  }

  /**
   * Get request status label
   */
  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get filtered requests based on active tab
   */
  getFilteredRequests(): SwapRequest[] {
    return this.activeTab() === 'incoming' ? this.incomingRequests() : this.outgoingRequests();
  }

  /**
   * Check if request is pending
   */
  isPending(request: SwapRequest): boolean {
    return request.status === SwapRequestStatus.PENDING;
  }

  /**
   * Check if request is accepted
   */
  isAccepted(request: SwapRequest): boolean {
    return request.status === SwapRequestStatus.ACCEPTED;
  }

  /**
   * Schedule a session for accepted request
   */
  async scheduleSession(request: SwapRequest): Promise<void> {
    try {
      this.isLoading.set(true);

      // Get current user
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser?.id) {
        Swal.fire('Error', 'User not authenticated', 'error');
        return;
      }

      // Get the other user's data (sender or recipient depending on which request)
      const otherUserId = currentUser.id === request.senderId ? request.recipientId : request.senderId;
      const otherUserName = currentUser.id === request.senderId ? request.recipientName : request.senderName;
      
      // Create or get conversation between the two users
      const conversation = await this.chatService.getOrCreateConversation(
        currentUser.id,
        otherUserId,
        {
          name1: currentUser.name,
          name2: otherUserName
        }
      );

      Swal.fire('Success', 'Conversation created! You can now chat to schedule a session.', 'success');
      
      // Navigate to chat page with the conversation
      this.router.navigate(['/home/chat'], { 
        queryParams: { conversationId: conversation.id } 
      });
    } catch (error) {
      console.error('Error scheduling session:', error);
      Swal.fire('Error', 'Failed to start conversation', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }
}
