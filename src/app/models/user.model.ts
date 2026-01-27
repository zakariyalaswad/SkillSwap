/**
 * User Model
 * Represents a user in the SkillSwap platform
 */

import { Swap } from "./swap.model";

export interface User {
  id: string;
  email: string;
  name: string;
  photoUrl?: string;
  bio?: string;
  
  // User roles
  role: 'user' | 'admin';
  
  // User preferences
  preferOnline: boolean;
  preferOffline: boolean;
  location?: string;
  
  // Skills & Teaching/Learning preferences
  skillsITeach: Skill[];
  skillsIWantToLearn: Skill[];
  
  // Account status
  isOnboardingComplete: boolean;
  isVerified: boolean;
  
  // Trust & Rating
  averageRating: number;
  totalReviews: number;
  trustScore: number;
  
  // Statistics
  totalSwapsCompleted: number;
  totalSkillsTaught: number;
  totalSkillsLearned: number;
  
  // Account management
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  isBanned: boolean;
  bannedReason?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  yearsOfExperience?: number;
  description?: string;
  addedAt: Date;
}

export enum SkillCategory {
  LANGUAGE = 'Language',
  MUSIC = 'Music',
  SPORTS = 'Sports',
  ARTS = 'Arts & Design',
  TECH = 'Technology',
  COOKING = 'Cooking',
  FITNESS = 'Fitness',
  BUSINESS = 'Business',
  PERSONAL_DEV = 'Personal Development',
  ACADEMIC = 'Academic',
  OTHER = 'Other'
}

export enum SkillLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface UserProfile extends User {
  // Extended profile information
  badges: Badge[];
  recentReviews: Review[];
  completedSwaps: Swap[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface Review {
  id: string;
  ratedById: string;
  ratedByName: string;
  ratedUserId: string;
  rating: number;
  review: string;
  createdAt: Date;
}
