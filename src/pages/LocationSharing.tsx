import React, { useState, useEffect } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { MapPin, Navigation, Send, Clock, Shield, Users, Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { socketService } from "../utils/socket";
import { cn } from "../components/UI";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, getDoc, doc } from "firebase/firestore";

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  status: string;
  profilePhoto?: string;
}

export const LocationSharing: React.FC = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [friendLocations, setFriendLocations] = useState<Record<string, any>>({});
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const socket = socketService.getSocket();
    socket.emit("register-user", userId);
    
    // Fetch accepted friends
    const qAccepted = query(
      collection(db, "friendRequests"),
      where("status", "==", "accepted"),
      where("fromUid", "==", userId)
    );
    const qAccepted2 = query(
      collection(db, "friendRequests"),
      where("status", "==", "accepted"),
      where("toUid", "==", userId)
    );

    const unsub1 = onSnapshot(qAccepted, async (snapshot) => {
      const friendIds = snapshot.docs.map(doc => doc.data().toUid);
      fetchFriends(friendIds);
    });

    const unsub2 = onSnapshot(qAccepted2, async (snapshot) => {
      const friendIds = snapshot.docs.map(doc => doc.data().fromUid);
      fetchFriends(friendIds);
    });

    socketService.onFriendLocationUpdate((data) => {
      setFriendLocations((prev) => ({
        ...prev,
        [data.userId]: data
      }));
    });

    let watchId: number;
    if (isSharing && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          socketService.updateLocation(latitude, longitude);
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      unsub1();
      unsub2();
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSharing, userId]);

  const fetchFriends = async (ids: string[]) => {
    if (ids.length === 0) {
      setFriends([]);
      return;
    }
    const friendsList: UserProfile[] = [];
    for (const id of ids) {
      const userDoc = await getDoc(doc(db, "users", id));
      if (userDoc.exists()) {
        friendsList.push(userDoc.data() as UserProfile);
      }
    }
    setFriends(friendsList);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden pt-16 md:pt-0">
      {/* Map Area (Placeholder for Google Maps) */}
      <div className="flex-1 relative bg-secondary overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto border border-border shadow-2xl">
              <MapPin size={40} className="text-primary animate-bounce" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Live Location Map</h2>
              <p className="text-sm text-muted-foreground">Real-time encrypted location sharing.</p>
            </div>
          </div>
        </div>

        {/* Floating Controls */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
          <div className="pointer-events-auto">
            <GlassCard className="p-2 flex items-center gap-2">
              <Search size={18} className="text-muted-foreground ml-2" />
              <input
                type="text"
                placeholder="Search location..."
                className="bg-transparent border-none focus:outline-none text-sm text-foreground w-48"
              />
            </GlassCard>
          </div>
          <div className="pointer-events-auto space-y-2">
            <Button variant="glass" className="p-3 rounded-full shadow-2xl">
              <Navigation size={24} />
            </Button>
            <Button variant="glass" className="p-3 rounded-full shadow-2xl">
              <Filter size={24} />
            </Button>
          </div>
        </div>

        {/* Sharing Status Overlay */}
        <AnimatePresence>
          {isSharing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-6 right-6 pointer-events-none"
            >
              <GlassCard className="max-w-md mx-auto pointer-events-auto flex items-center justify-between p-4 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <MapPin size={20} className="text-emerald-500" />
                    </div>
                    <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-20" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Sharing Live Location</h4>
                    <p className="text-[10px] text-emerald-500 font-medium uppercase tracking-wider">Visible to {selectedFriend?.username || "Friends"}</p>
                  </div>
                </div>
                <Button size="sm" variant="danger" onClick={() => setIsSharing(false)}>
                  Stop
                </Button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Friends List Panel */}
      <div className="h-64 md:h-80 bg-background border-t border-border flex flex-col pb-20 md:pb-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Friends Nearby
          </h3>
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{friends.length} Active</span>
        </div>
        <div className="flex-1 overflow-x-auto flex items-center gap-4 p-4 scrollbar-hide">
          {friends.length === 0 ? (
            <div className="w-full text-center py-8">
              <p className="text-sm text-muted-foreground">No friends found. Add friends to share location.</p>
            </div>
          ) : (
            friends.map((friend) => (
              <GlassCard
                key={friend.uid}
                className={cn(
                  "min-w-[200px] flex flex-col gap-4 p-4 cursor-pointer hover:bg-primary/5 transition-all",
                  selectedFriend?.uid === friend.uid && "border-primary/50 bg-primary/5"
                )}
                onClick={() => setSelectedFriend(friend)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                    {friend.profilePhoto ? (
                      <img src={friend.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      friend.username[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{friend.username}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {friendLocations[friend.uid] ? "Active Now" : "Nearby"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock size={12} />
                    {friendLocations[friend.uid] ? "Live" : "Offline"}
                  </div>
                  <Button
                    size="sm"
                    variant={isSharing && selectedFriend?.uid === friend.uid ? "danger" : "primary"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFriend(friend);
                      setIsSharing(!isSharing);
                    }}
                  >
                    {isSharing && selectedFriend?.uid === friend.uid ? "Stop" : "Share"}
                  </Button>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  );
};


