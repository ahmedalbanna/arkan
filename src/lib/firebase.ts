// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFB2d0Cx2UtglBPMyuevtCiRUWROb_fmk",
  authDomain: "docudec.firebaseapp.com",
  databaseURL: "https://docudec-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "docudec",
  storageBucket: "docudec.appspot.com",
  messagingSenderId: "201859762958",
  appId: "1:201859762958:web:602e322feffdcb11ed255f",
  measurementId: "G-K42VXYX7NQ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
