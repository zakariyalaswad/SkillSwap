import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../auth/services/auth-service';
import { LucideAngularModule, LogOut } from 'lucide-angular';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {

  readonly LogOut=LogOut;
  auth=inject(AuthService);
  router=inject(Router);

  async logout(){
    try{
      await this.auth.signout();
      console.log('Logout successful');
      this.router.navigate(['signin'])
    }catch(error){
      console.log(error)
    }
  }

}
