// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to usegit rm -r --cached .

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDB-5-_rkX3Zn4t4xoHd16AB1A7Nbhvie0",
  authDomain: "skillswap-3c1f4.firebaseapp.com",
  databaseURL: "https://skillswap-3c1f4-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "skillswap-3c1f4",
  storageBucket: "skillswap-3c1f4.firebasestorage.app",
  messagingSenderId: "688283212818",
  appId: "1:688283212818:web:a6671645a7be3f5d54cccb",
  measurementId: "G-PBY5SSV2JW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);