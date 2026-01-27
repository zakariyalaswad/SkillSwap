/**
 * Chat & Messaging Model
 * Represents real-time messaging between users
 */

export interface ChatConversation {
  id: string;
  
  // Participants
  participantIds: string[];
  participantNames: string[];
  
  // Related swap/match
  swapRequestId?: string;
  matchId?: string;
  
  // Chat info
  lastMessage?: Message;
  lastMessageTime?: Date;
  
  // Unread status
  unreadBy: string[]; // User IDs who have unread messages
  
  // Timeline
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  
  // Chat context
  conversationId: string;
  
  // Content
  senderId: string;
  senderName: string;
  content: string;
  
  // Media (optional)
  attachmentUrl?: string;
  attachmentType?: string;
  
  // Status
  isRead: boolean;
  readBy?: string[];
  
  // Timeline
  createdAt: Date;
  editedAt?: Date;
}

export interface Notification {
  id: string;
  
  // Recipient
  userId: string;
  
  // Notification details
  type: NotificationType;
  title: string;
  message: string;
  
  // Related data
  relatedItemId?: string;
  relatedUserId?: string;
  
  // Status
  isRead: boolean;
  
  // Timeline
  createdAt: Date;
  readAt?: Date;
  timestamp?: Date; // Added for template compatibility
}

export enum NotificationType {
  NEW_MATCH = 'New Match',
  SWAP_REQUEST = 'Swap Request',
  REQUEST_ACCEPTED = 'Request Accepted',
  REQUEST_REJECTED = 'Request Rejected',
  NEW_MESSAGE = 'New Message',
  SESSION_REMINDER = 'Session Reminder',
  SESSION_COMPLETED = 'Session Completed',
  PROFILE_VIEWED = 'Profile Viewed',
  SKILL_ENDORSED = 'Skill Endorsed',
  RATING_RECEIVED = 'Rating Received',
  SYSTEM = 'System'
}
