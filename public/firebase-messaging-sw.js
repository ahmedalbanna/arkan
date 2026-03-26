
// Scripts for firebase and firebase messaging
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
const firebaseConfig = {
  apiKey: "AIzaSyDFB2d0Cx2UtglBPMyuevtCiRUWROb_fmk",
  authDomain: "docudec.firebaseapp.com",
  databaseURL: "https://docudec-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "docudec",
  storageBucket: "docudec.appspot.com",
  messagingSenderId: "201859762958",
  appId: "1:201859762958:web:602e322feffdcb11ed255f",
  measurementId: "G-K42VXYX7NQ"
};


firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon-192x192.png", // Make sure you have this icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
