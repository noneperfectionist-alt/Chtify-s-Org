importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// This will be replaced by the build process or can be hardcoded if it's static
// For AI Studio, we can fetch it from the config if we were in a build step, 
// but here we'll just use the values from firebase-applet-config.json
// Note: In a real app, you'd inject these values.

firebase.initializeApp({
  apiKey: "AIzaSyBAD8MiMDGZy-q5eG6ybdSm8Wku-OYA6bQ",
  authDomain: "chatify-672e7.firebaseapp.com",
  projectId: "chatify-672e7",
  storageBucket: "chatify-672e7.firebasestorage.app",
  messagingSenderId: "821710476930",
  appId: "1:821710476930:web:8dd47829123871f856c69b"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png', // Replace with your app icon
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
