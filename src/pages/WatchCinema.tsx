import React, { useState, useRef, useEffect } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Play, Pause, SkipForward, Volume2, Maximize, Youtube, Link as LinkIcon, FileVideo, Users, MessageSquare, Video, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { socketService } from "../utils/socket";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, getDoc, doc, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { cn } from "../components/UI";

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  status: string;
  profilePhoto?: string;
}

interface CinemaMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
}

export const WatchCinema: React.FC = () => {
  const [videoSource, setVideoSource] = useState<"youtube" | "url" | "local" | null>(null);
  const [url, setUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [cinemaMessages, setCinemaMessages] = useState<CinemaMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const isRemoteAction = useRef(false);
  const userId = auth.currentUser?.uid;
  const username = auth.currentUser?.displayName || "User";

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

    return () => {
      unsub1();
      unsub2();
    };
  }, [userId]);

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

  useEffect(() => {
    if (roomId) {
      socketService.joinCinema(roomId);

      const unsubSync = socketService.onCinemaSync((data) => {
        if (data.userId === userId) return;
        
        isRemoteAction.current = true;
        if (videoRef.current) {
          if (data.action === 'play') {
            videoRef.current.play();
            setIsPlaying(true);
          } else if (data.action === 'pause') {
            videoRef.current.pause();
            setIsPlaying(false);
          } else if (data.action === 'seek') {
            videoRef.current.currentTime = data.time;
            setCurrentTime(data.time);
          }
        }
        setTimeout(() => { isRemoteAction.current = false; }, 100);
      });

      // Cinema Chat
      const q = query(
        collection(db, "cinema_chats"),
        where("roomId", "==", roomId),
        orderBy("timestamp", "asc")
      );
      const unsubChat = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CinemaMessage));
        setCinemaMessages(msgs);
      });

      return () => {
        socketService.getSocket()?.off('cinema_sync');
        unsubChat();
      };
    }
  }, [roomId, userId]);

  const startCinema = (friend: UserProfile) => {
    setSelectedFriend(friend);
    const id = [userId, friend.uid].sort().join("_cinema_");
    setRoomId(id);
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      const newIsPlaying = !isPlaying;
      if (newIsPlaying) videoRef.current.play();
      else videoRef.current.pause();
      
      setIsPlaying(newIsPlaying);

      if (!isRemoteAction.current) {
        socketService.sendCinemaControl(roomId, newIsPlaying ? 'play' : 'pause', videoRef.current.currentTime);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);

      if (!isRemoteAction.current) {
        socketService.sendCinemaControl(roomId, 'seek', time);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUrl(url);
      setVideoSource("local");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !roomId || !userId) return;

    try {
      await addDoc(collection(db, "cinema_chats"), {
        roomId,
        senderId: userId,
        senderName: username,
        text: newMessage,
        timestamp: serverTimestamp()
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending cinema message:", error);
    }
  };

  if (!selectedFriend) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8 pt-24 md:pt-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Watch Cinema Together</h1>
          <p className="text-muted-foreground">Select a friend to start a synchronized session.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <GlassCard
              key={friend.uid}
              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-primary/5 transition-all border-border"
              onClick={() => startCinema(friend)}
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground overflow-hidden">
                {friend.profilePhoto ? (
                  <img src={friend.profilePhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  friend.username[0].toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{friend.username}</h3>
                <p className="text-xs text-muted-foreground">Click to start cinema</p>
              </div>
              <Play size={20} className="text-primary" />
            </GlassCard>
          ))}
          {friends.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No friends found. Add friends to watch together!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!videoSource) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-8 pt-24 md:pt-8">
        <div className="flex items-center gap-4">
          <Button variant="glass" onClick={() => setSelectedFriend(null)}>
            <X size={20} />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Cinema with {selectedFriend.username}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard
            className="flex flex-col items-center justify-center gap-4 p-8 cursor-pointer hover:bg-primary/5 transition-all group"
            onClick={() => setVideoSource("youtube")}
          >
            <div className="w-16 h-16 bg-rose-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Youtube size={32} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">YouTube Link</h3>
            <p className="text-xs text-muted-foreground text-center">Paste a YouTube URL to start watching.</p>
          </GlassCard>

          <GlassCard
            className="flex flex-col items-center justify-center gap-4 p-8 cursor-pointer hover:bg-primary/5 transition-all group"
            onClick={() => setVideoSource("url")}
          >
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <LinkIcon size={32} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">External URL</h3>
            <p className="text-xs text-muted-foreground text-center">Support for direct video links.</p>
          </GlassCard>

          <GlassCard
            className="flex flex-col items-center justify-center gap-4 p-8 cursor-pointer hover:bg-primary/5 transition-all group relative"
          >
            <input
              type="file"
              accept="video/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 bg-emerald-600/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileVideo size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Local File</h3>
            <p className="text-xs text-muted-foreground text-center">Upload from your device.</p>
          </GlassCard>
        </div>

        {(videoSource === "youtube" || videoSource === "url") && (
          <GlassCard className="max-w-xl mx-auto space-y-4">
            <Input
              label={videoSource === "youtube" ? "YouTube URL" : "Video URL"}
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button className="w-full" onClick={() => setVideoSource(videoSource)}>
              Start Watching
            </Button>
          </GlassCard>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden pt-16 md:pt-0">
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Main Video Area */}
        <div className="flex-1 flex flex-col bg-zinc-950 relative">
          <div className="flex-1 relative group">
            {videoSource === "youtube" ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${url.split("v=")[1] || url.split("/").pop()}?autoplay=1&controls=0`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={url}
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
              />
            )}

            {/* Video Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="space-y-4">
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={handlePlayPause} className="text-white hover:text-primary transition-colors">
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button className="text-white hover:text-primary transition-colors hidden sm:block">
                      <SkipForward size={20} />
                    </button>
                    <div className="hidden sm:flex items-center gap-2">
                      <Volume2 size={20} className="text-zinc-400" />
                      <input type="range" className="w-20 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary" />
                    </div>
                    <span className="text-[10px] md:text-xs text-zinc-400 font-mono">
                      {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, "0")} / 
                      {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      className="bg-transparent text-[10px] md:text-xs text-zinc-400 focus:outline-none"
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    >
                      <option value="0.5">0.5x</option>
                      <option value="1">1x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>
                    <button className="text-white hover:text-primary transition-colors">
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Friend's Camera Feed */}
            {isVideoCallOpen && (
              <div className="absolute top-4 right-4 w-32 md:w-48 aspect-video bg-zinc-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                  <Users size={24} className="text-zinc-600" />
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-md rounded-md text-[8px] md:text-[10px] text-white">
                  {selectedFriend.username}'s Camera
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Chat Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: window.innerWidth < 768 ? "100%" : 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className={cn(
                "bg-zinc-950 border-l border-zinc-800 flex flex-col z-20",
                window.innerWidth < 768 && "absolute inset-0"
              )}
            >
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-semibold text-white">Cinema Chat</h3>
                <button onClick={() => setIsChatOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {cinemaMessages.map((msg, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      msg.senderId === userId ? "text-primary text-right" : "text-zinc-500"
                    )}>
                      {msg.senderName}
                    </p>
                    <p className={cn(
                      "text-sm p-2 rounded-lg",
                      msg.senderId === userId ? "bg-primary/20 text-white text-right ml-8" : "bg-zinc-900 text-zinc-300 mr-8"
                    )}>
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-zinc-800">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Send a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Button type="submit" size="sm" className="p-2">
                    <Send size={16} />
                  </Button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Bar */}
      <div className="h-16 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between px-4 md:px-6 pb-20 md:pb-0">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="secondary" size="sm" onClick={() => setVideoSource(null)} className="text-[10px] md:text-sm px-2 md:px-4">
            Exit
          </Button>
          <div className="h-4 w-px bg-zinc-800" />
          <p className="text-[10px] md:text-sm text-zinc-400 truncate max-w-[100px] md:max-w-none">
            With <span className="text-white font-medium">{selectedFriend.username}</span>
          </p>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button
            variant={isVideoCallOpen ? "primary" : "secondary"}
            size="sm"
            className="p-2 md:px-4"
            onClick={() => setIsVideoCallOpen(!isVideoCallOpen)}
          >
            <Video size={16} className="md:mr-2" />
            <span className="hidden md:inline">Camera</span>
          </Button>
          <Button
            variant={isChatOpen ? "primary" : "secondary"}
            size="sm"
            className="p-2 md:px-4"
            onClick={() => setIsChatOpen(!isChatOpen)}
          >
            <MessageSquare size={16} className="md:mr-2" />
            <span className="hidden md:inline">Chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
