import { Component, OnInit, OnDestroy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../../../shared/services/chat.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { ChatConversation, Message } from '../../../../models';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.css']
})
export class Chat implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private activatedRoute = inject(ActivatedRoute);

  // State
  protected conversations = signal<ChatConversation[]>([]);
  protected selectedConversation = signal<ChatConversation | null>(null);
  protected messages = signal<Message[]>([]);
  protected newMessage = signal('');
  protected isLoading = signal(false);
  protected currentUserId = signal('');
  
  private messageSubscription?: Subscription;

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      Swal.fire('Error', 'User not authenticated', 'error');
      return;
    }
    
    this.currentUserId.set(user.id);
    
    // Load conversations first, then check for query params
    this.loadConversations().then(() => {
      // Check if there's a conversation ID in query params
      this.activatedRoute.queryParams.subscribe(params => {
        const conversationId = params['conversationId'];
        console.log('Query param conversationId:', conversationId);
        if (conversationId) {
          // Find and select the conversation with this ID
          const targetConversation = this.conversations().find(c => c.id === conversationId);
          console.log('Target conversation found:', targetConversation);
          if (targetConversation) {
            this.selectConversation(targetConversation);
          } else {
            // If not found in current list, wait a bit and try again
            setTimeout(() => {
              const retryConversation = this.conversations().find(c => c.id === conversationId);
              if (retryConversation) {
                this.selectConversation(retryConversation);
              }
            }, 500);
          }
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.messageSubscription?.unsubscribe();
  }

  /**
   * Load all conversations for current user
   */
  async loadConversations(): Promise<void> {
    try {
      this.isLoading.set(true);
      const convs = await this.chatService.getUserConversations(this.currentUserId());
      this.conversations.set(convs.sort((a, b) => 
        (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)
      ));
    } catch (error) {
      console.error('Error loading conversations:', error);
      Swal.fire('Error', 'Failed to load conversations', 'error');
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Select a conversation and load messages
   */
  async selectConversation(conversation: ChatConversation): Promise<void> {
    try {
      this.selectedConversation.set(conversation);
      
      // Unsubscribe from previous conversation
      this.messageSubscription?.unsubscribe();
      
      // Subscribe to real-time messages
      this.messageSubscription = this.chatService.listenToMessages(conversation.id)
        .subscribe({
          next: (messages) => {
            this.messages.set(messages);
            this.scrollToBottom();
          },
          error: (error) => {
            console.error('Error listening to messages:', error);
          }
        });
    } catch (error) {
      console.error('Error selecting conversation:', error);
      Swal.fire('Error', 'Failed to load messages', 'error');
    }
  }

  /**
   * Send a new message
   */
  async sendMessage(): Promise<void> {
    const content = this.newMessage().trim();
    if (!content) {
      console.warn('Cannot send message: empty content');
      return;
    }

    if (!this.selectedConversation()) {
      console.error('Cannot send message: no conversation selected');
      Swal.fire('Error', 'Please select a conversation first', 'error');
      return;
    }

    if (!this.selectedConversation()?.id) {
      console.error('Cannot send message: conversation has no ID', this.selectedConversation());
      Swal.fire('Error', 'Conversation ID is missing', 'error');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) {
      console.error('Cannot send message: user not authenticated');
      Swal.fire('Error', 'User not authenticated', 'error');
      return;
    }

    try {
      const now = new Date();
      const conversationId = this.selectedConversation()!.id;
      
      const message: Message = {
        id: '',
        conversationId,
        senderId: user.id,
        senderName: user.name,
        content,
        isRead: false,
        createdAt: now
      };

      console.log('Sending message to conversation:', conversationId, 'Message:', message);
      const messageId = await this.chatService.sendMessage(conversationId, message);
      console.log('Message sent successfully with ID:', messageId);
      this.newMessage.set('');
      this.scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      Swal.fire('Error', 'Failed to send message: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error');
    }
  }

  /**
   * Get the other participant's name
   */
  getOtherParticipantName(conversation: ChatConversation): string {
    const currentUserId = this.currentUserId();
    const index = conversation.participantIds.indexOf(currentUserId);
    const otherIndex = index === 0 ? 1 : 0;
    return conversation.participantNames[otherIndex] || 'Unknown';
  }

  /**
   * Check if message is from current user
   */
  isMyMessage(message: Message): boolean {
    return message.senderId === this.currentUserId();
  }

  /**
   * Format timestamp
   */
  formatTime(date: Date | any): string {
    if (!date) return '';
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  }

  /**
   * Format date for conversation list
   */
  formatDate(date?: Date | any): string {
    if (!date) return '';
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '';
      
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days === 0) return this.formatTime(d);
      if (days === 1) return 'Yesterday';
      if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  }

  /**
   * Scroll to bottom of messages
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.messages-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }

  /**
   * Handle Enter key press
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
