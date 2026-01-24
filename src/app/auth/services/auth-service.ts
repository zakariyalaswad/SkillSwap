import { Injectable, signal } from '@angular/core';
import { Auth, signInWithEmailAndPassword,createUserWithEmailAndPassword, signOut} from '@angular/fire/auth';
import { addDoc, collection, doc, Firestore, getDoc, setDoc } from '@angular/fire/firestore';
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(private auth:Auth,private firestore:Firestore) {}

  //Auth 
  async signin(email:string,password:string):Promise<{uid: string; role: string}>{
    const cred=await signInWithEmailAndPassword(this.auth,email,password);
    const userDoc = await this.getUserRole(cred.user.uid);
    return {
      uid: cred.user.uid,
      role: userDoc.role
    };
  }

  private async getUserRole(uid: string): Promise<any> {
    const docRef = doc(this.firestore, 'Users', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.log('User not found');
    }
    return docSnap.data() || { role: 'user' };
  }
  async signup(email:string,password:string):Promise<string>{
    const cred=await createUserWithEmailAndPassword(this.auth,email,password);
    return cred.user.uid;
  }
  signout(){
    return signOut(this.auth)
  }


  //firestore

add(data: any) {
  const ref = doc(this.firestore, 'Users', data.uid);

  const userData = {
    ...data,
    uid: data.uid,
    role: 'user',
    createdAt: new Date(),
  };

  return setDoc(ref, userData);
}

  
  
}
