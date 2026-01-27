/**
 * Swap & Matching Models
 * Represents skill swaps and matching between users
 */

import { Skill } from './user.model';

export interface SwapRequest {
  id: string;
  
  // Participants
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  
  // Skills being exchanged
  skillOffered: Skill;
  skillRequested: Skill;
  
  // Message and details
  message: string;
  sessionType: SessionType;
  proposedDate?: Date;
  proposedTime?: string;
  
  // Status
  status: SwapRequestStatus;
  
  // Timeline
  createdAt: Date;
  respondedAt?: Date;
  completedAt?: Date;
}

export interface Match {
  id: string;
  
  // Users
  userId1: string;
  userId1Name: string;
  userId2: string;
  userId2Name: string;
  
  // Matching skills
  user1Teaches: Skill;
  user1Wants: Skill;
  user2Teaches: Skill;
  user2Wants: Skill;
  
  // Match status
  status: MatchStatus;
  
  // Timeline
  matchedAt: Date;
  expiredAt?: Date;
}

export interface Swap {
  id: string;
  
  // Participants
  teacherId: string;
  teacherName: string;
  learnerId: string;
  learnerName: string;
  
  // Skills
  skillBeingTaught: Skill;
  skillBeingLearned: Skill;
  
  // Session details
  session: Session;
  
  // Status
  status: SwapStatus;
  
  // Rating information
  teacherRating?: Rating;
  learnerRating?: Rating;
  
  // Timeline
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface Session {
  id: string;
  swapId?: string;
  
  // Participants
  participantIds: string[];
  
  // Details
  skillTopic: string;
  sessionType: SessionType;
  description?: string;
  
  // Schedule
  scheduledAt: Date;
  duration: number; // in minutes
  
  // Meeting info
  meetingLink?: string;
  meetingType: MeetingType;
  
  // Status
  status: SessionStatus;
  completedAt?: Date;
}

export interface Rating {
  id: string;
  
  // Who is rating whom
  ratedById: string;
  ratedByName: string;
  ratedUserId: string;
  ratedUserName: string;
  
  // Rating
  rating: number; // 1-5 stars
  review: string;
  category: RatingCategory;
  
  // Timestamp
  createdAt: Date;
}

export enum SwapRequestStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  CANCELLED = 'Cancelled'
}

export enum MatchStatus {
  ACTIVE = 'Active',
  SWAPPED = 'Swapped',
  EXPIRED = 'Expired',
  DECLINED = 'Declined'
}

export enum SwapStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum SessionStatus {
  SCHEDULED = 'Scheduled',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum SessionType {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  HYBRID = 'Hybrid'
}

export enum MeetingType {
  VIDEO = 'Video Call',
  AUDIO = 'Audio Call',
  IN_PERSON = 'In Person',
  NONE = 'None'
}

export enum RatingCategory {
  KNOWLEDGE = 'Knowledge',
  COMMUNICATION = 'Communication',
  RELIABILITY = 'Reliability',
  OVERALL = 'Overall'
}
