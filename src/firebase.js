// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyACZCjQo2vbK1ZMi0qnT1HuDN_vcrYIkdU",
  authDomain: "react-portfolio-talha.firebaseapp.com",
  projectId: "react-portfolio-talha",
  storageBucket: "react-portfolio-talha.appspot.com",
  messagingSenderId: "458846084976",
  appId: "1:458846084976:web:95e8f2f7e9c5cbc28f39b5",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
