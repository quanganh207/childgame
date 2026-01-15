import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDhhRTIn3_oM1dp9n4z79g_G8Z9NErzBls",
  authDomain: "childgame-adab9.firebaseapp.com",
  projectId: "childgame-adab9",
  storageBucket: "childgame-adab9.firebasestorage.app",
  messagingSenderId: "248808936323",
  appId: "1:248808936323:web:ebc95e89e3861b19fcdcb6",
  measurementId: "G-2FYJBVYVMR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
