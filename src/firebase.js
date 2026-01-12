// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAu0ijH0Y2QJLMuFlfBRHVG-ENP5rTJdZ0",
  authDomain: "my-shift-app-c7b10.firebaseapp.com",
  projectId: "my-shift-app-c7b10",
  storageBucket: "my-shift-app-c7b10.firebasestorage.app",
  messagingSenderId: "742216880638",
  appId: "1:742216880638:web:be7bd64842808810e430af",
  measurementId: "G-HW8XK0CHD3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);