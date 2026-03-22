import { useEffect, useState } from 'react';
import { messaging, db, auth } from '../firebase';
import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const msg = await messaging();
          if (msg) {
            const token = await getToken(msg, {
              vapidKey: 'REPLACE_WITH_VAPID_KEY' // You'll need to generate this in Firebase Console
            });
            
            if (token) {
              setFcmToken(token);
              // Save token to user profile
              if (auth.currentUser) {
                await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                  fcmTokens: arrayUnion(token)
                });
              }
            }
          }
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };

    requestPermission();

    // Handle foreground messages
    const setupOnMessage = async () => {
      const msg = await messaging();
      if (msg) {
        onMessage(msg, (payload) => {
          console.log('Foreground message received:', payload);
          // Show in-app notification or browser notification if tab is not focused
          if (document.visibilityState !== 'visible') {
             new Notification(payload.notification?.title || 'New Message', {
               body: payload.notification?.body,
               icon: '/logo.png'
             });
          }
        });
      }
    };

    setupOnMessage();
  }, []);

  return { fcmToken };
};
