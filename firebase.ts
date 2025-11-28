import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD49JA4solg0u5ueXRF89pLo9qOjFHyhbI",
  authDomain: "fines-duchy.firebaseapp.com",
  projectId: "fines-duchy",
  storageBucket: "fines-duchy.firebasestorage.app",
  messagingSenderId: "820284452758",
  appId: "1:820284452758:web:2083b75281c1a4bf72f7b7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);