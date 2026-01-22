import { Component } from '@angular/core';
import { LucideAngularModule, House,UserRound,HeartPlus, MessageCircle, Sparkles, UserStar } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly House = House;
  readonly UserRound=UserRound;
  readonly HeartPlus=HeartPlus;
  readonly MessageCircle=MessageCircle;
  readonly Sparkles=Sparkles;
  readonly UserStar=UserStar;

}
