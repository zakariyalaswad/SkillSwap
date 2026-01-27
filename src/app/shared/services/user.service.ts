 /**
 * User Service
 * Handles user profile operations and management
 */

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, query, where, getDocs, updateDoc } from '@angular/fire/firestore';
import { User, Skill } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(Firestore);
  
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      
      if (userSnapshot.exists()) {
        return userSnapshot.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
  
  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
  
  /**
   * Complete onboarding
   */
  async completeOnboarding(
    userId: string,
    skillsToTeach: Skill[],
    skillsToLearn: Skill[],
    preferences: {
      preferOnline: boolean;
      preferOffline: boolean;
      location?: string;
    }
  ): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await updateDoc(userRef, {
        skillsITeach: skillsToTeach,
        skillsIWantToLearn: skillsToLearn,
        preferOnline: preferences.preferOnline,
        preferOffline: preferences.preferOffline,
        location: preferences.location || '',
        isOnboardingComplete: true,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }
  
  /**
   * Add a skill to user's teaching list
   */
  async addTeachingSkill(userId: string, skill: Skill): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      
      if (userSnapshot.exists()) {
        const user = userSnapshot.data() as User;
        const updatedSkills = [...(user.skillsITeach || []), skill];
        
        await updateDoc(userRef, {
          skillsITeach: updatedSkills,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error adding teaching skill:', error);
      throw error;
    }
  }
  
  /**
   * Remove a skill from user's teaching list
   */
  async removeTeachingSkill(userId: string, skillId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      
      if (userSnapshot.exists()) {
        const user = userSnapshot.data() as User;
        const updatedSkills = user.skillsITeach.filter(s => s.id !== skillId);
        
        await updateDoc(userRef, {
          skillsITeach: updatedSkills,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error removing teaching skill:', error);
      throw error;
    }
  }
  
  /**
   * Add a skill to user's learning list
   */
  async addLearningSkill(userId: string, skill: Skill): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      
      if (userSnapshot.exists()) {
        const user = userSnapshot.data() as User;
        const updatedSkills = [...(user.skillsIWantToLearn || []), skill];
        
        await updateDoc(userRef, {
          skillsIWantToLearn: updatedSkills,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error adding learning skill:', error);
      throw error;
    }
  }
  
  /**
   * Remove a skill from user's learning list
   */
  async removeLearningSkill(userId: string, skillId: string): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      
      if (userSnapshot.exists()) {
        const user = userSnapshot.data() as User;
        const updatedSkills = user.skillsIWantToLearn.filter(s => s.id !== skillId);
        
        await updateDoc(userRef, {
          skillsIWantToLearn: updatedSkills,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error removing learning skill:', error);
      throw error;
    }
  }
  
  /**
   * Search users by skills they teach or want to learn
   */
  async searchUsers(skillName: string): Promise<User[]> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('isActive', '==', true), where('isBanned', '==', false));
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs
        .map(doc => doc.data() as User)
        .filter(user => 
          user.skillsITeach.some(s => s.name.toLowerCase().includes(skillName.toLowerCase())) ||
          user.skillsIWantToLearn.some(s => s.name.toLowerCase().includes(skillName.toLowerCase()))
        );
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
  
  /**
   * Get all active users (for matching)
   */
  async getAllActiveUsers(): Promise<User[]> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('isActive', '==', true), where('isBanned', '==', false));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }
  }
  
  /**
   * Update user statistics
   */
  async updateUserStatistics(userId: string, updates: {
    totalSwapsCompleted?: number;
    totalSkillsTaught?: number;
    totalSkillsLearned?: number;
    averageRating?: number;
    totalReviews?: number;
    trustScore?: number;
  }): Promise<void> {
    try {
      const userRef = doc(this.firestore, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user statistics:', error);
      throw error;
    }
  }
}
