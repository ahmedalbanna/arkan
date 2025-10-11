/**
 * Mock للـ Firebase للاختبارات
 */

// Mock Firebase Auth
export const getAuth = jest.fn(() => ({
    currentUser: null,
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn()
}));

// Mock Firebase Firestore
export const getFirestore = jest.fn(() => ({
    collection: jest.fn(() => ({
        doc: jest.fn(() => ({
            get: jest.fn(),
            set: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        })),
        add: jest.fn(),
        where: jest.fn()
    }))
}));

// Mock Firebase Realtime Database
export const getDatabase = jest.fn(() => ({
    ref: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        remove: jest.fn()
    }))
}));

// Mock Firebase App
export const initializeApp = jest.fn(() => ({}));
export const getApp = jest.fn(() => ({}));
export const getApps = jest.fn(() => []);

// Mock Firebase Config
export const firebaseConfig = {
    apiKey: "test-api-key",
    authDomain: "test.firebaseapp.com",
    projectId: "test-project",
    storageBucket: "test.appspot.com",
    messagingSenderId: "123456789",
    appId: "test-app-id"
};

// Mock Firebase App instance
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const RealtimeDatabase = getDatabase(app);

export { RealtimeDatabase, app, auth, db };

