/**
 * Onboarding Component
 * Comprehensive setup for new users to define skills and preferences
 */

import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { Skill, SkillCategory, SkillLevel } from '../../models';
import Swal from 'sweetalert2';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css'
})
export class OnboardingComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  
  protected currentStep = signal(1);
  protected totalSteps = 4;
  protected isLoading = signal(false);
  
  // Skill management
  protected teachingSkills = signal<Skill[]>([]);
  protected learningSkills = signal<Skill[]>([]);
  protected newTeachingSkill: Partial<Skill> = {};
  protected newLearningSkill: Partial<Skill> = {};
  
  // Available options
  protected skillCategories = Object.values(SkillCategory);
  protected skillLevels = Object.values(SkillLevel);
  
  // Forms for each step
  protected step1Form = new FormGroup({
    preferOnline: new FormControl(true),
    preferOffline: new FormControl(false)
  });
  
  protected step2Form = new FormGroup({
    newSkillName: new FormControl(''),
    newSkillCategory: new FormControl(''),
    newSkillLevel: new FormControl(''),
    newSkillDescription: new FormControl('')
  });
  
  protected step3Form = new FormGroup({
    newLearningSkillName: new FormControl(''),
    newLearningSkillCategory: new FormControl(''),
    newLearningSkillLevel: new FormControl(''),
    newLearningSkillDescription: new FormControl('')
  });
  
  protected step4Form = new FormGroup({
    location: new FormControl(''),
    bio: new FormControl('')
  });
  
  /**
   * Add teaching skill
   */
  addTeachingSkill() {
    const form = this.step2Form;
    
    if (!form.get('newSkillName')?.value || !form.get('newSkillCategory')?.value || !form.get('newSkillLevel')?.value) {
      Swal.fire('Validation Error', 'Please fill in skill name, category, and level', 'warning');
      return;
    }
    
    const skill: Skill = {
      id: uuidv4(),
      name: form.get('newSkillName')!.value || '',
      category: form.get('newSkillCategory')!.value as SkillCategory,
      level: form.get('newSkillLevel')!.value as SkillLevel,
      description: form.get('newSkillDescription')?.value || '',
      addedAt: new Date()
    };
    
    this.teachingSkills.set([...this.teachingSkills(), skill]);
    
    // Reset form
    form.reset();
    Swal.fire('Success', 'Skill added successfully', 'success');
  }
  
  /**
   * Remove teaching skill
   */
  removeTeachingSkill(skillId: string) {
    const updated = this.teachingSkills().filter(s => s.id !== skillId);
    this.teachingSkills.set(updated);
  }
  
  /**
   * Add learning skill
   */
  addLearningSkill() {
    const form = this.step3Form;
    
    if (!form.get('newLearningSkillName')?.value || !form.get('newLearningSkillCategory')?.value || !form.get('newLearningSkillLevel')?.value) {
      Swal.fire('Validation Error', 'Please fill in skill name, category, and level', 'warning');
      return;
    }
    
    const skill: Skill = {
      id: uuidv4(),
      name: form.get('newLearningSkillName')!.value || '',
      category: form.get('newLearningSkillCategory')!.value as SkillCategory,
      level: form.get('newLearningSkillLevel')!.value as SkillLevel,
      description: form.get('newLearningSkillDescription')?.value || '',
      addedAt: new Date()
    };
    
    this.learningSkills.set([...this.learningSkills(), skill]);
    
    // Reset form
    form.reset();
    Swal.fire('Success', 'Skill added successfully', 'success');
  }
  
  /**
   * Remove learning skill
   */
  removeLearningSkill(skillId: string) {
    const updated = this.learningSkills().filter(s => s.id !== skillId);
    this.learningSkills.set(updated);
  }
  
  /**
   * Move to next step
   */
  nextStep() {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.set(this.currentStep() + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  
  /**
   * Move to previous step
   */
  previousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  
  /**
   * Complete onboarding
   */
  async completeOnboarding() {
    if (this.teachingSkills().length === 0 && this.learningSkills().length === 0) {
      Swal.fire('Validation Error', 'Please add at least one skill to teach or learn', 'warning');
      return;
    }
    
    this.isLoading.set(true);
    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const preferences = {
        preferOnline: this.step1Form.get('preferOnline')?.value === true,
        preferOffline: this.step1Form.get('preferOffline')?.value === true,
        location: this.step4Form.get('location')?.value || ''
      };
      
      await this.userService.completeOnboarding(
        currentUser.id,
        this.teachingSkills(),
        this.learningSkills(),
        preferences
      );
      
      // Update user bio
      await this.userService.updateUserProfile(currentUser.id, {
        bio: this.step4Form.get('bio')?.value || '',
        location: preferences.location
      });
      
      // Refresh the current user in AuthService to ensure isOnboardingComplete is updated
      const updatedUser = await this.userService.getUserProfile(currentUser.id);
      this.authService.setCurrentUser(updatedUser!);
      
      Swal.fire('Success', 'Onboarding completed! Let\'s start matching.', 'success');
      this.router.navigate(['/home/matches']);
    } catch (error: any) {
      Swal.fire('Error', error.message || 'An error occurred during onboarding', 'error');
      console.error('Onboarding error:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
