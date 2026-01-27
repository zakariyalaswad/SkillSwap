import { Component, OnInit, OnDestroy, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    this.loadConversations();
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
    if (!content || !this.selectedConversation()) return;

    const user = this.authService.getCurrentUser();
    if (!user) return;

    try {
      const message: Message = {
        id: '',
        conversationId: this.selectedConversation()!.id,
        senderId: user.id,
        senderName: user.name,
        content,
        isRead: false,
        createdAt: new Date()
      };

      await this.chatService.sendMessage(this.selectedConversation()!.id, message);
      this.newMessage.set('');
      this.scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      Swal.fire('Error', 'Failed to send message', 'error');
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
  formatTime(date: Date): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Format date for conversation list
   */
  formatDate(date?: Date): string {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return this.formatTime(d);
    if (days === 1) return 'Yesterday';
    if (days < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
