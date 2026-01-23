import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
})
export class Header {


  constructor(private router:Router) { }

  login() {
    this.router.navigate(['/signin']);
  }
  register() {
    this.router.navigate(['/signup']);
  }


}
