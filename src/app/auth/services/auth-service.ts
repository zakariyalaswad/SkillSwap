import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword,createUserWithEmailAndPassword, signOut} from '@angular/fire/auth';
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private auth:Auth) {}


  signin(email:string,password:string){
    return signInWithEmailAndPassword(this.auth,email,password)
  }
  signup(email:string,password:string){
    return createUserWithEmailAndPassword(this.auth,email,password)
  }
  signout(){
    return signOut(this.auth)
  }

  
  
}
