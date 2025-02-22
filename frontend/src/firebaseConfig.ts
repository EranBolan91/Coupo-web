// import { getVertexAI, getGenerativeModel } from "@firebase/vertexai";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// // Initialize the Vertex AI service
// const vertexAI = getVertexAI(app);

// // Initialize the generative model with a model that supports your use case
// export const modelAI = getGenerativeModel(vertexAI, { model: "gemini-2.0-flash" });

export const auth = getAuth(app);

export default app;
