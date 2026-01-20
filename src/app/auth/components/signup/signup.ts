import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { first } from 'rxjs';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './signup.html',
})
export class Signup {

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
      await this.auth.signup(this.form.value.email!,this.form.value.password!)
      console.log(this.form.value)
    }catch(error){
      console.log(error)
    
    }
  }

}
