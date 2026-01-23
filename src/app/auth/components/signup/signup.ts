import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route, Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  standalone: true,
  templateUrl: './signup.html',
})
export class Signup {
  constructor(private router:Router){}

  auth=inject(AuthService)

  form=new FormGroup({
    firstname:new FormControl('',[Validators.required]),
    lastname:new FormControl('',[Validators.required]),
    phone:new FormControl('',[Validators.required]),
    gender:new FormControl('',[Validators.required]),
    address:new FormControl('',[Validators.required]),
    dob:new FormControl('',[Validators.required]),
    email:new FormControl('',[Validators.required,Validators.email]),
    password:new FormControl('',[Validators.required,Validators.minLength(6)]),
    terms:new FormControl(false,[Validators.requiredTrue])
  })
  async register(){
    try{
      const uid=await this.auth.signup(this.form.value.email!,this.form.value.password!)
      console.log("signup successfully");
      const { password, ...formData } = this.form.value;
      await this.auth.add({ ...formData, uid });
      console.log('user added successfully');
      this.router.navigate(['home',uid])
    }catch(error){
      console.log(error)
    
    }
  }

}
