import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Signin } from "./auth/components/signin/signin";
import { Signup } from "./auth/components/signup/signup";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Signin, Signup],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('SkillSwap');
}
