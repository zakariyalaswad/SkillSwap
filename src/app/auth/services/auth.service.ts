/**
 * Authentication Service
 * Handles user registration, login, and authentication state
 */

import { Injectable, inject } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User as FirebaseUser } from '@angular/fire/auth';
import { Firestore, collection, doc, setDoc, getDoc, DocumentReference } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  constructor() {
    this.initializeAuthState();
  }
  
  /**
   * Initialize authentication state by listening to Firebase auth changes
   */
  private initializeAuthState(): void {
    onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is logged in - fetch their profile data
        const userRef = doc(this.firestore, 'users', firebaseUser.uid);
        const userSnapshot = await getDoc(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data() as User;
          this.currentUserSubject.next(userData);
          this.isAuthenticatedSubject.next(true);
        }
      } else {
        // User is logged out
        this.currentUserSubject.next(null);
        this.isAuthenticatedSubject.next(false);
      }
    });
  }
  
  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, name: string): Promise<{ uid: string; user: User }> {
    try {
      // Create Firebase Auth user
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = result.user;
      
      // Create user profile in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        email,
        name,
        role: 'user',
        preferOnline: true,
        preferOffline: false,
        skillsITeach: [],
        skillsIWantToLearn: [],
        isOnboardingComplete: false,
        isVerified: true, // Auto-verified for now
        averageRating: 0,
        totalReviews: 0,
        trustScore: 50, // Starting trust score
        totalSwapsCompleted: 0,
        totalSkillsTaught: 0,
        totalSkillsLearned: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isBanned: false
      };
      
      await setDoc(doc(this.firestore, 'users', firebaseUser.uid), newUser);
      
      this.currentUserSubject.next(newUser);
      this.isAuthenticatedSubject.next(true);
      
      return { uid: firebaseUser.uid, user: newUser };
    } catch (error: any) {
      throw new Error(`Sign up failed: ${error.message}`);
    }
  }
  
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      const firebaseUser = result.user;
      
      // Fetch user profile
      const userRef = doc(this.firestore, 'users', firebaseUser.uid);
      const userSnapshot = await getDoc(userRef);
      
      if (userSnapshot.exists()) {
        const user = userSnapshot.data() as User;
        
        // Update last login time
        await setDoc(userRef, { lastLoginAt: new Date() }, { merge: true });
        
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        
        return user;
      } else {
        throw new Error('User profile not found');
      }
    } catch (error: any) {
      throw new Error(`Sign in failed: ${error.message}`);
    }
  }
  
  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
    } catch (error: any) {
      throw new Error(`Sign out failed: ${error.message}`);
    }
  }
  
  /**
   * Get current user synchronously
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Set current user (used after onboarding or profile updates)
   */
  setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
  }
  
  /**
   * Get current Firebase user
   */
  getCurrentFirebaseUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }
}
