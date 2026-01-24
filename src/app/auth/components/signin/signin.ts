import { Component, inject, signal } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl,Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule, RouterLink],
  standalone: true,
  templateUrl: './signin.html',
})
export class Signin {
  constructor(private router:Router){}
  auth=inject(AuthService)


  form=new FormGroup({
    email:new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl('',[Validators.required,Validators.minLength(6)])
  })
  async login(){
    try{
      const user=await this.auth.signin(this.form.value.email!,this.form.value.password!);
      console.log(user);

      user.role==='admin'?this.router.navigate(['admin']):this.router.navigate(['home']);
    }catch(error){
      console.log(error)
    
    }
  } 

}
