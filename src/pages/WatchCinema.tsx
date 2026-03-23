import React, { useState, useRef, useEffect } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Play, Pause, SkipForward, Volume2, Maximize, Youtube, Link as LinkIcon, FileVideo, Users, MessageSquare, Video, X, Send, Trash2, Upload, Theater, Mic, Info, Settings, MoreVertical, Smile, Paperclip, Plus, Image as ImageIcon, Radio } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { socketService } from "../utils/socket";
import { auth, db, storage } from "../firebase";
import { collection, query, where, onSnapshot, getDoc, doc, addDoc, serverTimestamp, orderBy, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import ReactPlayer from "react-player";
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
  const [videoSource, setVideoSource] = useState<"youtube" | "url" | "upload" | null>(null);
  const [url, setUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [cinemaMessages, setCinemaMessages] = useState<CinemaMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadedFilePath, setUploadedFilePath] = useState<string | null>(null);
  
  const playerRef = useRef<any>(null);
  const isRemoteAction = useRef(false);
  const userId = auth.currentUser?.uid;
  const username = auth.currentUser?.displayName || "User";

  useEffect(() => {
    if (!userId) return;

    const socket = socketService.getSocket();
    socket.emit("register-user", userId);
    
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
        if (data.action === 'play') {
          setIsPlaying(true);
        } else if (data.action === 'pause') {
          setIsPlaying(false);
        } else if (data.action === 'seek') {
          playerRef.current?.seekTo(data.time, 'seconds');
          setCurrentTime(data.time);
        } else if (data.action === 'source') {
          setVideoSource(data.sourceType);
          setUrl(data.url);
        }
        setTimeout(() => { isRemoteAction.current = false; }, 100);
      });

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
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);

    if (!isRemoteAction.current) {
      socketService.sendCinemaControl(roomId, newIsPlaying ? 'play' : 'pause', playerRef.current?.getCurrentTime() || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    playerRef.current?.seekTo(time, 'seconds');
    setCurrentTime(time);

    if (!isRemoteAction.current) {
      socketService.sendCinemaControl(roomId, 'seek', time);
    }
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (dur: number) => {
    setDuration(dur);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;

    const storageRef = ref(storage, `cinema/${roomId}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Upload error:", error);
        setUploadProgress(null);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setUploadedFilePath(uploadTask.snapshot.ref.fullPath);
        setUrl(downloadURL);
        setVideoSource("upload");
        setUploadProgress(null);
        socketService.sendCinemaControl(roomId, 'source', 0, "upload", downloadURL);
      }
    );
  };

  const removeUploadedVideo = async () => {
    if (uploadedFilePath) {
      try {
        const fileRef = ref(storage, uploadedFilePath);
        await deleteObject(fileRef);
        setUploadedFilePath(null);
        setUrl("");
        setVideoSource(null);
        socketService.sendCinemaControl(roomId, 'source', 0, null, "");
      } catch (error) {
        console.error("Error deleting video:", error);
      }
    }
  };

  const startWithUrl = () => {
    if (!url.trim()) return;
    setVideoSource(url.includes("youtube.com") || url.includes("youtu.be") ? "youtube" : "url");
    socketService.sendCinemaControl(roomId, 'source', 0, url.includes("youtube.com") || url.includes("youtu.be") ? "youtube" : "url", url);
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
      <div className="min-h-screen cosmic-bg p-8 flex flex-col items-center justify-center pt-24 md:pt-8">
        <div className="text-center space-y-6 mb-12">
          <div className="size-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto border border-primary/30 shadow-2xl shadow-primary/10">
            <Theater size={40} className="text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black uppercase tracking-tight text-white">Watch <span className="text-primary">Together</span></h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Synchronized high-definition orbital streaming.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {friends.map((friend) => (
            <GlassCard
              key={friend.uid}
              variant="glass-dark"
              className="p-6 flex items-center gap-6 cursor-pointer hover:border-primary/50 transition-all group"
              onClick={() => startCinema(friend)}
            >
              <div className="size-16 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5 group-hover:scale-105 transition-transform">
                {friend.profilePhoto ? (
                  <img src={friend.profilePhoto} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-black text-zinc-500">{friend.username[0].toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg leading-tight">{friend.username}</h3>
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Available for Sync</p>
              </div>
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <Play size={20} fill="currentColor" />
              </div>
            </GlassCard>
          ))}
          {friends.length === 0 && (
            <div className="col-span-full text-center py-20 glass-panel rounded-[2rem]">
               <Users className="mx-auto text-zinc-800 mb-4" size={64} />
               <p className="text-zinc-600 font-black uppercase tracking-widest">No orbital connections found</p>
               <Button variant="glass" className="mt-6 font-bold uppercase tracking-widest text-xs">Establish Link</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!videoSource && !uploadProgress) {
    return (
      <div className="min-h-screen cosmic-bg p-8 pt-24 md:pt-8 flex flex-col items-center">
        <header className="flex items-center justify-between w-full max-w-6xl mb-12">
          <div className="flex items-center gap-4">
             <button onClick={() => setSelectedFriend(null)} className="size-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400">
               <X size={20} />
             </button>
             <div>
               <h1 className="text-2xl font-black uppercase text-white leading-tight">Cinema Protocol</h1>
               <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">With {selectedFriend.username}</p>
             </div>
          </div>
          <div className="size-10 rounded-full border-2 border-primary/50 p-0.5 overflow-hidden">
             <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
               {username[0]}
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-12">
          <GlassCard
            variant="glass-dark"
            className="flex flex-col items-center justify-center gap-6 p-10 cursor-pointer hover:border-primary/50 transition-all group"
            onClick={() => setVideoSource("youtube")}
          >
            <div className="size-20 bg-rose-500/10 rounded-[1.5rem] flex items-center justify-center text-rose-500 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-xl shadow-rose-500/5">
              <Youtube size={40} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">YouTube Link</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Paste a public orbital signal</p>
            </div>
          </GlassCard>

          <GlassCard
            variant="glass-dark"
            className="flex flex-col items-center justify-center gap-6 p-10 cursor-pointer hover:border-primary/50 transition-all group"
            onClick={() => setVideoSource("url")}
          >
            <div className="size-20 bg-indigo-500/10 rounded-[1.5rem] flex items-center justify-center text-indigo-500 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-xl shadow-indigo-500/5">
              <LinkIcon size={40} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">External Stream</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Direct secure video links</p>
            </div>
          </GlassCard>

          <GlassCard
            variant="glass-dark"
            className="flex flex-col items-center justify-center gap-6 p-10 cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden"
          >
            <input
              type="file"
              accept="video/*"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={handleFileUpload}
            />
            <div className="size-20 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-xl shadow-emerald-500/5">
              <Upload size={40} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Upload Core</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Transmit local archives</p>
            </div>
          </GlassCard>
        </div>

        <GlassCard variant="glass-dark" className="w-full max-w-xl p-10 rounded-[2rem] border-primary/20">
          <form onSubmit={(e) => { e.preventDefault(); startWithUrl(); }} className="space-y-8">
            <Input
              label="Signal Source URL"
              placeholder="https://nebula-stream.nexora/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-14 text-sm"
            />
            <Button variant="glow" size="lg" className="w-full h-14 font-black uppercase tracking-widest">
              Initiate Sync Sequence
            </Button>
          </form>
        </GlassCard>
      </div>
    );
  }

  const Player = ReactPlayer as any;

  if (uploadProgress !== null) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-matter text-white p-6 cosmic-bg">
        <Upload size={64} className="text-primary animate-bounce mb-8 shadow-2xl shadow-primary/20" />
        <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Transmitting Data...</h2>
        <div className="w-full max-w-md bg-white/5 h-3 rounded-full overflow-hidden border border-white/10 shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress}%` }}
            className="bg-primary h-full neon-glow transition-all duration-300 relative"
          >
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </motion.div>
        </div>
        <p className="mt-4 text-primary font-black uppercase tracking-[0.2em]">{Math.round(uploadProgress)}% COMPLETED</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden pt-16 md:pt-0">
      <header className="h-16 px-8 flex items-center justify-between glass-panel sticky top-0 z-50 rounded-none border-x-0 border-t-0">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 text-primary">
            <div className="size-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30">
              <Theater size={20} />
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Nexora <span className="text-primary/60 font-medium">Watch</span></h2>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
            <span className="size-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sync Active • Direct Link Room</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 text-zinc-500 font-bold text-xs uppercase tracking-widest">
             <Users size={16} className="text-primary" />
             <span>2 Watching</span>
           </div>
           <div className="flex gap-3 border-l border-white/10 pl-6">
              <button className="size-9 flex items-center justify-center rounded-xl glass-panel hover:bg-primary/20 transition-all text-white border-white/5">
                <Radio size={18} />
              </button>
              <button className="size-9 flex items-center justify-center rounded-xl glass-panel hover:bg-primary/20 transition-all text-white border-white/5">
                <Settings size={18} />
              </button>
              <div className="size-9 rounded-full border-2 border-primary p-0.5">
                 <div className="size-full rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black uppercase text-primary">
                   {username[0]}
                 </div>
              </div>
           </div>
        </div>
      </header>

      <main className="flex flex-1 gap-6 p-6 h-[calc(100vh-64px)] overflow-hidden bg-dark-matter relative">
        <div className="flex-1 flex flex-col gap-6 relative min-w-0">
          <div className="relative flex-1 rounded-[2rem] overflow-hidden group shadow-2xl bg-black border border-white/5">
            <div className="absolute inset-0 z-0">
              <Player
                ref={playerRef}
                url={url}
                width="100%"
                height="100%"
                playing={isPlaying}
                onProgress={(state: any) => handleProgress(state)}
                onDuration={handleDuration}
                playbackRate={playbackSpeed}
                controls={false}
                style={{ position: 'absolute', top: 0, left: 0, opacity: 0.9 }}
              />
            </div>

            {/* Video Controls Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-8 space-y-6 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-mono text-zinc-400 font-bold">
                      {Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, "0")}
                   </span>
                   <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer group/progress shadow-inner">
                      <input
                        type="range"
                        min={0}
                        max={duration}
                        step="any"
                        value={currentTime}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full neon-glow"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      >
                         <div className="absolute right-0 top-1/2 -translate-y-1/2 size-4 bg-primary rounded-full border-2 border-white scale-0 group-hover/progress:scale-100 transition-transform shadow-xl" />
                      </div>
                   </div>
                   <span className="text-[10px] font-mono text-zinc-400 font-bold">
                      {Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, "0")}
                   </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button onClick={handlePlayPause} className="text-white hover:text-primary transition-all transform hover:scale-110 active:scale-95">
                      {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                    </button>
                    <button className="text-white hover:text-primary transition-colors">
                      <SkipForward size={24} fill="currentColor" />
                    </button>
                    <div className="flex items-center gap-4 group/vol">
                      <Volume2 size={24} className="text-white group-hover/vol:text-primary" />
                      <div className="w-0 group-hover/vol:w-24 transition-all overflow-hidden h-1 bg-white/20 rounded-full">
                        <div className="h-full w-3/4 bg-primary neon-glow" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    {uploadedFilePath && (
                      <button onClick={removeUploadedVideo} className="text-rose-500 hover:text-rose-400 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                        <Trash2 size={16} />
                        Discard Archive
                      </button>
                    )}
                    <select
                      className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 focus:outline-none border-none cursor-pointer"
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    >
                      <option value="0.5" className="bg-dark-matter">0.5x WARP</option>
                      <option value="1" className="bg-dark-matter">1x NORMAL</option>
                      <option value="1.5" className="bg-dark-matter">1.5x LIGHT</option>
                      <option value="2" className="bg-dark-matter">2x HYPER</option>
                    </select>
                    <button className="text-white hover:text-primary transition-colors">
                      <Maximize size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Play Button Overlay (Large) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="size-24 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/30 shadow-[0_0_50px_rgba(5,172,209,0.3)]">
                  <Play size={40} className="text-primary ml-1" fill="currentColor" />
               </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 py-2">
             <div className="flex -space-x-4">
                <div className="size-14 rounded-full border-4 border-dark-matter glass-panel p-0.5 relative group cursor-pointer hover:z-10 hover:scale-110 transition-all">
                  <div className="w-full h-full rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-black uppercase text-sm border border-emerald-500/30">
                    {selectedFriend.username[0]}
                  </div>
                  <div className="absolute -top-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-dark-matter" />
                </div>
                <div className="size-14 rounded-full border-4 border-dark-matter glass-panel p-0.5 relative group cursor-pointer hover:z-10 hover:scale-110 transition-all">
                   <div className="w-full h-full rounded-full bg-primary/20 flex items-center justify-center text-primary font-black uppercase text-sm border border-primary/30">
                    {username[0]}
                  </div>
                  <div className="absolute -top-1 -right-1 size-4 bg-primary rounded-full border-2 border-dark-matter flex items-center justify-center">
                    <Mic size={10} className="text-white font-bold" />
                  </div>
                </div>
             </div>
             <button className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary px-8 py-3 rounded-full font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3">
               <Plus size={16} />
               Establish New Link
             </button>
          </div>
        </div>

        {/* Side Chat Panel */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="glass-panel flex flex-col rounded-[2rem] overflow-hidden shadow-2xl border-white/10"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black uppercase tracking-widest text-sm flex items-center gap-3 text-white">
                  <MessageSquare size={18} className="text-primary" />
                  Live Stream Chat
                </h3>
                <button onClick={() => setIsChatOpen(false)} className="text-zinc-600 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
                {cinemaMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <Radio size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Broadcast Frequency Open</p>
                  </div>
                )}
                {cinemaMessages.map((msg, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <div className="size-8 rounded-full bg-white/5 flex items-center justify-center font-bold text-zinc-500 text-[10px] uppercase shrink-0 border border-white/10">
                      {msg.senderName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={cn(
                          "text-xs font-black uppercase tracking-widest",
                          msg.senderId === userId ? "text-primary" : "text-zinc-400"
                        )}>{msg.senderName}</span>
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">12:45 PM</span>
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed p-3 rounded-2xl rounded-tl-none border",
                        msg.senderId === userId
                          ? "bg-primary/5 border-primary/20 text-white"
                          : "bg-white/5 border-white/5 text-zinc-300"
                      )}>
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-white/5">
                <div className="relative">
                  <form onSubmit={handleSendMessage}>
                    <input
                      type="text"
                      placeholder="Type a broadcast message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-zinc-600 text-white"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 size-10 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-primary/80 transition-all shadow-lg shadow-primary/20">
                      <Send size={18} fill="currentColor" />
                    </button>
                  </form>
                </div>
                <div className="flex items-center gap-6 mt-4 px-2">
                  <button className="text-zinc-600 hover:text-primary transition-colors"><Smile size={20} /></button>
                  <button className="text-zinc-600 hover:text-primary transition-colors"><ImageIcon size={20} /></button>
                  <button className="text-zinc-600 hover:text-primary transition-colors"><Paperclip size={20} /></button>
                  <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                     <Radio size={12} className="text-emerald-500" />
                     <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Quantum Stream</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Background Particles Emulation */}
        <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20">
           <div className="absolute top-[20%] right-[10%] size-[500px] bg-primary/10 rounded-full blur-[120px]" />
           <div className="absolute bottom-[20%] left-[10%] size-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
        </div>
      </main>

      {/* Persistent UI Call Toggle */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed right-8 bottom-24 size-14 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-transform z-50 border-4 border-dark-matter"
        >
          <MessageSquare size={24} fill="currentColor" />
        </button>
      )}
    </div>
  );
};
