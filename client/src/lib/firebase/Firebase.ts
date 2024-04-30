import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  authDomain: import.meta.env.VITE_GOOGLE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_GOOGLE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_GOOGLE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_GOOGLE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_GOOGLE_APP_ID,
  measurementId: import.meta.env.VITE_GOOGLE_MEASUREMENT_ID,
};

// Initialize Firebase
initializeApp(firebaseConfig);

// Google Auth
const provider = new GoogleAuthProvider();
const auth = getAuth();

export const googleAuth = async () => {
  let user = null;

  try {
    const result = await signInWithPopup(auth, provider);
    user = result.user;
  } catch (error) {
    console.error(`Error - ${error}`);
  }

  return user;
};
