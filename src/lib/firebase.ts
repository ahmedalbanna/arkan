// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAS53fE8gVGVRPfvQwdcn6cUErGTnuzRe8",
  authDomain: "arkan-docudec.firebaseapp.com",
  projectId: "arkan-docudec",
  storageBucket: "arkan-docudec.firebasestorage.app",
  messagingSenderId: "469447445154",
  appId: "1:469447445154:web:97814194d896c245fea5fb",
  measurementId: "G-TY2YT3VZ2Q"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
