import { Component, inject } from '@angular/core';
import { LucideAngularModule, House,UserRound,HeartPlus, MessageCircle, Sparkles, UserStar, LogOut, Compass } from 'lucide-angular';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly House = House;
  readonly UserRound=UserRound;
  readonly HeartPlus=HeartPlus;
  readonly MessageCircle=MessageCircle;
  readonly Sparkles=Sparkles;
  readonly UserStar=UserStar;
  readonly LogOut=LogOut;
  readonly Compass=Compass;
  auth=inject(AuthService);
  router=inject(Router);

  async logout(){
    try{
      await this.auth.signOut();
      console.log('Logout successful');
      this.router.navigate(['/']);
    }catch(error){
      console.log(error);
    }
  }
}
