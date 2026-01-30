import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../auth/services/auth.service';
import { UserService } from '../../../../shared/services/user.service';
import { SwapService } from '../../../../shared/services/swap.service';
import { ChatService } from '../../../../shared/services/chat.service';
import { User, Skill, SwapRequest, SwapRequestStatus, SessionType } from '../../../../models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profil.html',
})
export class Profil implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private swapService = inject(SwapService);
  private chatService = inject(ChatService);

  protected isLoading = signal(false);
  protected profileUser = signal<User | null>(null);
  protected currentUser = signal<User | null>(null);

  async ngOnInit(): Promise<void> {
    this.isLoading.set(true);
    try {
      const me = this.authService.getCurrentUser();
      if (!me) throw new Error('Not authenticated');
      this.currentUser.set(me);

      const userId = this.route.snapshot.paramMap.get('id');
      if (!userId) throw new Error('No user id in route');

      const other = await this.userService.getUserProfile(userId);
      if (!other) throw new Error('User not found');
      this.profileUser.set(other);
    } catch (err) {
      console.error('Error loading profile:', err);
      Swal.fire('Error', 'Failed to load profile', 'error');
      this.router.navigate(['/home']);
    } finally {
      this.isLoading.set(false);
    }
  }

  protected matchingSkillsTheyTeach(): Skill[] {
    const me = this.currentUser();
    const other = this.profileUser();
    if (!me || !other) return [];
    const want = (me.skillsIWantToLearn || []).map(s => s.name.toLowerCase());
    return (other.skillsITeach || []).filter(s => want.includes(s.name.toLowerCase()));
  }

  protected pickOfferedSkill(): Skill | null {
    const me = this.currentUser();
    if (!me || !me.skillsITeach || me.skillsITeach.length === 0) return null;
    return me.skillsITeach[0];
  }

  protected matchingTeachNames(): string {
    return this.matchingSkillsTheyTeach().map(s => s.name).join(', ');
  }

  async sendSwapRequest(): Promise<void> {
    const me = this.currentUser();
    const other = this.profileUser();
    if (!me || !other) return;

    const requested = this.matchingSkillsTheyTeach()[0];
    const offered = this.pickOfferedSkill();

    if (!requested) {
      Swal.fire('Info', 'No matching skill to request from this user.', 'info');
      return;
    }
    if (!offered) {
      Swal.fire('Info', 'Add at least one skill you can teach before sending a request.', 'info');
      return;
    }

    try {
      const swapRequest: SwapRequest = {
        id: '',
        senderId: me.id,
        senderName: me.name,
        recipientId: other.id,
        recipientName: other.name,
        skillOffered: offered,
        skillRequested: requested,
        message: `Hi ${other.name}, I'd love to learn ${requested.name}! I can teach ${offered.name}.`,
        sessionType: (me.preferOnline ? 'Online' : (me.preferOffline ? 'Offline' : 'Hybrid')) as SessionType,
        status: SwapRequestStatus.PENDING,
        createdAt: new Date()
      };
      await this.swapService.createSwapRequest(swapRequest);
      Swal.fire('Success', 'Swap request sent!', 'success');
    } catch (error) {
      console.error('Error sending swap request:', error);
      Swal.fire('Error', 'Failed to send swap request', 'error');
    }
  }

  async sendMessage(): Promise<void> {
    const me = this.currentUser();
    const other = this.profileUser();
    if (!me || !other) return;
    try {
      const conv = await this.chatService.getOrCreateConversation(me.id, other.id, { name1: me.name, name2: other.name });
      await this.router.navigate(['/home/chat'], { queryParams: { conversationId: conv.id } });
    } catch (error) {
      console.error('Error starting chat:', error);
      Swal.fire('Error', 'Failed to start chat', 'error');
    }
  }
}
