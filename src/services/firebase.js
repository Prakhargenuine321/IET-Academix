import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBUaSMxKOLbd-9XxUBrk9EhbE0xJSe6_JI",
  authDomain: "ietacademix-8332c.firebaseapp.com",
  projectId: "ietacademix-8332c",
  storageBucket: "ietacademix-8332c.firebasestorage.app",
  messagingSenderId: "59686846263",
  appId: "1:59686846263:web:81bb39af970cac58f324b2",
  measurementId: "G-WL8D54SC3Q"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
