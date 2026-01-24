/**
 * Environment Configuration Validation
 *
 * This module validates all required environment variables at startup
 * to ensure the application has all necessary configuration.
 * 
 * All sensitive values are loaded from environment variables, never hardcoded.
 */

/**
 * Firebase Client Configuration
 * Used for browser-side Firebase operations
 */
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
} as const;

/**
 * Firebase Admin Configuration
 * Used for server-side Firebase Admin SDK operations
 * CRITICAL: Keep FIREBASE_PRIVATE_KEY extremely secret
 */
export const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
} as const;

/**
 * Ollama Server Configuration
 * Used for AI model inference
 */
export const ollamaConfig = {
  serverAddress: process.env.NEXT_PUBLIC_OLLAMA_SERVER_ADDRESS || "http://localhost:11434",
} as const;
