// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "cotiza-listo",
  "appId": "1:33670288831:web:7ad7d5814757f0cdaa7d0a",
  "storageBucket": "cotiza-listo.firebasestorage.app",
  "apiKey": "AIzaSyBSZJHbgIymXGR-griEf9SGdmr_F3g-DAE",
  "authDomain": "cotiza-listo.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "33670288831"
};

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
