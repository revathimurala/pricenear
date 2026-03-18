// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcxvJKDULdFcsgFv-TP_9y0absMxaRmKM",
  authDomain: "pricenear2007.firebaseapp.com",
  projectId: "pricenear2007",
  storageBucket: "pricenear2007.firebasestorage.app",
  messagingSenderId: "376341462178",
  appId: "1:376341462178:web:2d2794e00a72ce5509abfb",
  measurementId: "G-BY10CFEH13"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth=getAuth(app);
export const db=getFirestore(app);