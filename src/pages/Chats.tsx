import React, { useState, useEffect, useRef } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Search, Plus, MoreVertical, Send, Mic, Image as ImageIcon, Video, Phone, Shield, CheckCheck, Clock, MessageSquare, X, Settings, UserPlus, Check, UserMinus, Hash, Star, LayoutGrid, Ghost, Rocket } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/UI";
import { socketService } from "../utils/socket";
import { CallUI } from "../components/CallUI";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, getDocs, addDoc, orderBy, serverTimestamp, doc, getDoc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";

interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: any;
}

interface UserProfile {
  uid: string;
  username: string;
  email: string;
  status: string;
  profilePhoto?: string;
}

interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: "pending" | "accepted" | "rejected";
  fromUsername?: string;
}

export const Chats: React.FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UserProfile[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [activeCall, setActiveCall] = useState<{ type: "voice" | "video"; friend: UserProfile } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ from: string; name: string; signal: any } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
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

    // Fetch pending requests
    const qRequests = query(
      collection(db, "friendRequests"),
      where("toUid", "==", userId),
      where("status", "==", "pending")
    );
    const unsubRequests = onSnapshot(qRequests, async (snapshot) => {
      const requests = await Promise.all(snapshot.docs.map(async (d) => {
        const data = d.data();
        const userDoc = await getDoc(doc(db, "users", data.fromUid));
        return { id: d.id, ...data, fromUsername: userDoc.data()?.username } as FriendRequest;
      }));
      setFriendRequests(requests);
    });

    socketService.getSocket().on("incoming-call", (data: any) => {
      setIncomingCall(data);
    });

    return () => {
      unsub1();
      unsub2();
      unsubRequests();
      socketService.getSocket().off("incoming-call");
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
    if (selectedFriend && userId) {
      const chatId = [userId, selectedFriend.uid].sort().join("_");
      socketService.joinChat(chatId);

      const q = query(
        collection(db, "messages"),
        where("chatId", "==", chatId),
        orderBy("timestamp", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
        setMessages(msgs);
      });

      return () => unsubscribe();
    }
  }, [selectedFriend, userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSearchUsers = async (queryStr: string) => {
    setSearchQuery(queryStr);
    if (queryStr.length < 3) {
      setUserSearchResults([]);
      return;
    }

    setIsSearchingUsers(true);
    try {
      const q = query(
        collection(db, "users"),
        where("username", ">=", queryStr),
        where("username", "<=", queryStr + "\uf8ff")
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs
        .map(doc => doc.data() as UserProfile)
        .filter(u => u.uid !== userId);
      setUserSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const sendFriendRequest = async (toUid: string) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, "friendRequests"), {
        fromUid: userId,
        toUid,
        status: "pending",
        createdAt: serverTimestamp()
      });
      const fromName = localStorage.getItem("username") || "Someone";
      socketService.getSocket().emit("friend-request", { fromId: userId, toId: toUid, fromName });
      alert("Friend request sent!");
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const handleRequest = async (requestId: string, status: "accepted" | "rejected") => {
    try {
      await updateDoc(doc(db, "friendRequests", requestId), { status });
    } catch (error) {
      console.error("Error handling request:", error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !selectedFriend || !userId) return;

    const chatId = [userId, selectedFriend.uid].sort().join("_");
    const msgData = {
      chatId,
      senderId: userId,
      text: message,
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "messages"), msgData);
      const senderName = localStorage.getItem("username") || "Someone";
      socketService.sendChatMessage(chatId, message, selectedFriend.uid, senderName);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden pt-16 md:pt-0 cosmic-bg">
      {/* Sidebar Navigation (Small) */}
      <aside className="w-20 glass-panel flex flex-col items-center py-8 gap-8 shrink-0 hidden lg:flex border-r-0 rounded-none">
        <div className="size-12 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Rocket size={28} />
        </div>
        <nav className="flex flex-col gap-6 flex-1">
          <button className="p-3 rounded-xl bg-primary/20 text-primary transition-all">
            <MessageSquare size={24} />
          </button>
          <button className="p-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all">
            <LayoutGrid size={24} />
          </button>
          <button className="p-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all">
            <Star size={24} />
          </button>
          <button className="p-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all">
            <Clock size={24} />
          </button>
        </nav>
        <div className="flex flex-col gap-6">
          <button className="p-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all">
            <Settings size={24} />
          </button>
          <div className="size-10 rounded-full border-2 border-primary/50 overflow-hidden">
             <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary font-bold">
               {localStorage.getItem("username")?.[0].toUpperCase() || "U"}
             </div>
          </div>
        </div>
      </aside>

      {/* Friends List Sidebar */}
      <div className={cn(
        "w-full md:w-80 flex flex-col glass-panel transition-all border-y-0 rounded-none",
        selectedFriend ? "hidden md:flex" : "flex"
      )}>
        <header className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black tracking-tight">Messages</h1>
            <button className="size-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <Plus size={20} className="text-zinc-400" />
            </button>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => handleSearchUsers(e.target.value)}
              className="w-full bg-white/5 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold whitespace-nowrap uppercase tracking-widest">All</button>
            <button className="px-4 py-1.5 rounded-full bg-white/5 text-zinc-400 text-xs font-bold whitespace-nowrap hover:bg-white/10 uppercase tracking-widest">Unread</button>
            <button className="px-4 py-1.5 rounded-full bg-white/5 text-zinc-400 text-xs font-bold whitespace-nowrap hover:bg-white/10 uppercase tracking-widest">Groups</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
          {/* Search Results */}
          <AnimatePresence>
            {userSearchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 space-y-2"
              >
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-3">Global Search</p>
                {userSearchResults.map((user) => (
                  <div key={user.uid} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-bold">{user.username}</span>
                    </div>
                    <Button size="sm" variant="glass" className="rounded-lg p-2" onClick={() => sendFriendRequest(user.uid)}>
                      <UserPlus size={16} />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pending Requests */}
          {friendRequests.length > 0 && (
            <div className="mb-6 space-y-2">
              <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] px-3">Friend Requests</p>
              {friendRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-500">
                      {req.fromUsername?.[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-bold">{req.fromUsername}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="p-2 h-auto bg-emerald-500 hover:bg-emerald-600 rounded-lg" onClick={() => handleRequest(req.id, "accepted")}>
                      <Check size={14} />
                    </Button>
                    <Button size="sm" variant="danger" className="p-2 h-auto rounded-lg" onClick={() => handleRequest(req.id, "rejected")}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends List */}
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-3 mb-2">Recent Chats</p>
          {friends.map((friend) => (
            <button
              key={friend.uid}
              onClick={() => setSelectedFriend(friend)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group border border-transparent",
                selectedFriend?.uid === friend.uid
                  ? "bg-primary/5 border-primary/20"
                  : "hover:bg-white/5"
              )}
            >
              <div className="relative">
                <div className="size-12 rounded-2xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5 group-hover:scale-105 transition-transform">
                  {friend.profilePhoto ? (
                    <img src={friend.profilePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-black text-zinc-500">{friend.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 size-4 rounded-full border-4 border-dark-matter",
                  friend.status === "available" ? "bg-emerald-500" : "bg-zinc-600"
                )} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-bold text-sm truncate">{friend.username}</h3>
                  <span className="text-[10px] text-zinc-500 font-bold">12:45 PM</span>
                </div>
                <p className={cn(
                  "text-xs truncate",
                  selectedFriend?.uid === friend.uid ? "text-primary font-medium" : "text-zinc-500"
                )}>
                  {selectedFriend?.uid === friend.uid ? "Active Now" : "Click to view message"}
                </p>
              </div>
            </button>
          ))}
          {friends.length === 0 && !isSearchingUsers && searchQuery.length === 0 && (
            <div className="py-12 text-center">
              <Ghost className="mx-auto text-zinc-800 mb-4" size={48} />
              <p className="text-sm text-zinc-600 font-bold uppercase tracking-widest">No connections yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <main className={cn(
        "flex-1 flex flex-col transition-all min-w-0",
        !selectedFriend ? "hidden md:flex items-center justify-center" : "flex"
      )}>
        {selectedFriend ? (
          <>
            <header className="h-20 px-6 glass-panel flex items-center justify-between z-10 border-x-0 border-t-0 rounded-none">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedFriend(null)} className="md:hidden text-zinc-400 mr-2">
                  <X size={20} />
                </button>
                <div className="relative">
                  <div className="size-10 rounded-xl bg-zinc-800 flex items-center justify-center overflow-hidden border border-white/5">
                    {selectedFriend.profilePhoto ? (
                      <img src={selectedFriend.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-black text-zinc-500">{selectedFriend.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-dark-matter",
                    selectedFriend.status === "available" ? "bg-emerald-500" : "bg-zinc-600"
                  )} />
                </div>
                <div>
                  <h3 className="font-bold leading-tight text-base">{selectedFriend.username}</h3>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">
                    {selectedFriend.status === "available" ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="size-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
                  onClick={() => setActiveCall({ type: "voice", friend: selectedFriend })}
                >
                  <Phone size={18} />
                </button>
                <button
                  className="size-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors"
                  onClick={() => setActiveCall({ type: "video", friend: selectedFriend })}
                >
                  <Video size={18} />
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button className="size-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="flex justify-center">
                <div className="glass px-3 py-1 rounded-full flex items-center gap-2 border border-white/5">
                  <Shield size={12} className="text-primary" />
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Quantum Encrypted</span>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex flex-col max-w-[80%] md:max-w-[70%]",
                      msg.senderId === userId ? "items-end self-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-2xl shadow-xl transition-all",
                      msg.senderId === userId 
                        ? "bg-primary/20 text-white border border-primary/30 rounded-tr-none shadow-primary/10 neon-glow border-none"
                        : "bg-white/5 text-foreground border border-white/10 rounded-tl-none"
                    )}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">
                        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."}
                      </span>
                      {msg.senderId === userId && <CheckCheck size={14} className="text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="p-6 bg-transparent">
              <form onSubmit={handleSendMessage} className="flex items-center gap-4 max-w-5xl mx-auto glass p-2 px-4 rounded-[1.5rem]">
                <button type="button" className="size-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                  <Plus size={24} />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type an orbital message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-transparent border-none text-sm focus:ring-0 placeholder:text-zinc-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                   <button type="button" className="size-10 flex items-center justify-center rounded-xl text-zinc-400 hover:text-primary transition-all">
                    <Mic size={20} />
                  </button>
                  <Button type="submit" size="sm" variant="glow" className="size-10 rounded-xl p-0 flex items-center justify-center">
                    <Send size={18} />
                  </Button>
                </div>
              </form>
            </footer>
          </>
        ) : (
          <div className="text-center space-y-6 p-12">
            <div className="size-24 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto border border-primary/20 shadow-2xl shadow-primary/10">
              <Rocket size={48} className="text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight">Nexora Universe</h2>
              <p className="text-muted-foreground font-medium max-w-xs mx-auto">Select a connection to begin secure intergalactic communication.</p>
            </div>
            <Button variant="glass" className="px-8 font-bold uppercase tracking-widest text-xs h-12">
              Explore New Connections
            </Button>
          </div>
        )}
      </main>

      {activeCall && (
        <CallUI
          type={activeCall.type}
          friendName={activeCall.friend.username}
          friendId={activeCall.friend.uid}
          onClose={() => setActiveCall(null)}
        />
      )}

      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 z-[110]"
          >
            <GlassCard variant="glass-dark" glow className="p-6 flex items-center gap-6 border-primary/30">
              <div className="size-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Phone size={28} className="text-primary animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-white leading-tight">{incomingCall.name}</h4>
                <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Incoming Orbital Call</p>
              </div>
              <div className="flex gap-2">
                <button
                  className="size-10 flex items-center justify-center rounded-xl bg-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                  onClick={() => setIncomingCall(null)}
                >
                  <X size={20} />
                </button>
                <button
                  className="size-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/40 hover:scale-110 transition-transform"
                  onClick={() => {
                    const friend = friends.find(f => f.uid === incomingCall.from) || { uid: incomingCall.from, username: incomingCall.name };
                    setActiveCall({ type: "voice", friend: friend as any });
                    socketService.getSocket().emit("answer-call", { to: incomingCall.from, signal: { type: "answer" } });
                    setIncomingCall(null);
                  }}
                >
                  <Phone size={20} />
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
