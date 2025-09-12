// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Config do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCoQq4-MFnJoVajwFXL8zVK9EI4FrmkfiU",
  authDomain: "passa-a-bola-4191b.firebaseapp.com",
  projectId: "passa-a-bola-4191b",
  storageBucket: "passa-a-bola-4191b.firebasestorage.app",
  messagingSenderId: "113938136382",
  appId: "1:113938136382:web:949576f1acc61a29a8806f",
  measurementId: "G-XMWMX4RCDB",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta serviços que vamos usar
export const auth = getAuth(app);
export const db = getFirestore(app);
