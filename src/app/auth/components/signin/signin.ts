import { Component, inject } from '@angular/core';
import { FormGroup, ReactiveFormsModule, FormControl,Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-signin',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './signin.html',
})
export class Signin {
  auth=inject(AuthService)

  form=new FormGroup({
    email:new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl('',[Validators.required,Validators.minLength(6)])
  })
  async login(){
    try{
      await this.auth.signin(this.form.value.email!,this.form.value.password!)
      console.log(this.form.value)
    }catch(error){
      console.log(error)
    
    }
  } 

}
