// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDnAnSW0Ois9V77ISY0z8bgLdb11eh2DJc",
  authDomain: "jamapp-53cf1.firebaseapp.com",
  projectId: "jamapp-53cf1",
  storageBucket: "jamapp-53cf1.firebasestorage.app",
  messagingSenderId: "170629595828",
  appId: "1:170629595828:web:801e7dad99b475eaa20de1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);