import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Shield, Volume2, Smartphone, Eye, EyeOff } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNotifications } from '../hooks/useNotifications';

const NotificationSettings = () => {
  const { fcmToken } = useNotifications();
  const [settings, setSettings] = useState({
    showPreview: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.notificationSettings) {
            setSettings(data.notificationSettings);
          }
        }
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const toggleSetting = async (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    
    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          notificationSettings: newSettings
        });
      } catch (error) {
        console.error('Error updating settings:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="text-indigo-500" />
            Notification Settings
          </h1>
          <p className="text-zinc-400 mt-2">Manage how you receive alerts and protect your privacy.</p>
        </header>

        <div className="space-y-6">
          {/* Device Status */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" />
              Device Status
            </h2>
            <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl">
              <div>
                <p className="font-medium">Push Token</p>
                <p className="text-xs text-zinc-500 font-mono truncate max-w-[200px]">
                  {fcmToken || 'Not generated'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${fcmToken ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {fcmToken ? 'Active' : 'Missing Permission'}
              </span>
            </div>
          </section>

          {/* Privacy Settings */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              Privacy & Content
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 rounded-lg">
                    {settings.showPreview ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium">Show Previews</p>
                    <p className="text-sm text-zinc-500">Display message content in notifications.</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting('showPreview')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.showPreview ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.showPreview ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* Sound & Vibration */}
          <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-indigo-400" />
              Alerts
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Notification Sound</p>
                <button
                  onClick={() => toggleSetting('soundEnabled')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-medium">Vibration</p>
                <button
                  onClick={() => toggleSetting('vibrationEnabled')}
                  className={`w-12 h-6 rounded-full transition-colors relative ${settings.vibrationEnabled ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.vibrationEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
