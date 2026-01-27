/**
 * Admin Models
 * For admin panel and moderation features
 */

export interface Report {
  id: string;
  
  // Who reported
  reportedById: string;
  reportedByName: string;
  
  // What was reported
  reportedUserId: string;
  reportedUserName: string;
  
  // Details
  reason: ReportReason;
  description: string;
  evidenceUrls?: string[];
  
  // Status
  status: ReportStatus;
  resolvedBy?: string;
  resolutionNotes?: string;
  
  // Timeline
  createdAt: Date;
  resolvedAt?: Date;
}

export interface UserWarning {
  id: string;
  
  // User
  userId: string;
  userName: string;
  
  // Details
  reason: string;
  issuedBy: string;
  
  // Timeline
  issuedAt: Date;
  expiresAt?: Date;
}

export interface PlatformStatistics {
  totalUsers: number;
  activeUsers: number;
  totalSwapsCompleted: number;
  totalSkillsExchanged: number;
  averageRating: number;
  
  // Time-based stats
  newUsersThisMonth: number;
  swapsThisMonth: number;
  activeConversations: number;
  
  // Engagement
  averageSessionsPerUser: number;
  averageRatingPerSession: number;
}

export enum ReportReason {
  INAPPROPRIATE_BEHAVIOR = 'Inappropriate Behavior',
  HARASSMENT = 'Harassment',
  FAKE_PROFILE = 'Fake Profile',
  SCAM = 'Scam/Fraud',
  INAPPROPRIATE_CONTENT = 'Inappropriate Content',
  NO_SHOW = 'No-show for Session',
  POOR_QUALITY = 'Poor Quality Teaching/Learning',
  OTHER = 'Other'
}

export enum ReportStatus {
  OPEN = 'Open',
  UNDER_REVIEW = 'Under Review',
  RESOLVED = 'Resolved',
  DISMISSED = 'Dismissed'
}
