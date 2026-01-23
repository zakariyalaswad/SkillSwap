import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword,createUserWithEmailAndPassword, signOut} from '@angular/fire/auth';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private auth:Auth,private firestore:Firestore) {}

  //Auth 
  async signin(email:string,password:string):Promise<string>{
    const cred=await signInWithEmailAndPassword(this.auth,email,password);
    return cred.user.uid;
  }
  async signup(email:string,password:string):Promise<string>{
    const cred=await createUserWithEmailAndPassword(this.auth,email,password);
    return cred.user.uid;
  }
  signout(){
    return signOut(this.auth)
  }


  //firestore

  add(data:any){
    const ref=collection(this.firestore,'Users');
    data={...data,createdAt:new Date(),role:'user'}
    return addDoc(ref,data);
  }

  
  
}
