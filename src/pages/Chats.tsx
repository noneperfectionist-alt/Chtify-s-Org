import React, { useState, useEffect, useRef } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Search, Plus, MoreVertical, Send, Mic, Image as ImageIcon, Video, Phone, Shield, CheckCheck, Clock, MessageSquare, X, Settings, UserPlus, Check, UserMinus } from "lucide-react";
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
    <div className="flex h-screen bg-background overflow-hidden pt-16 md:pt-0">
      {/* Friends List Sidebar */}
      <div className={cn(
        "w-full md:w-80 flex flex-col border-r border-border transition-all bg-background/50 backdrop-blur-xl",
        selectedFriend ? "hidden md:flex" : "flex"
      )}>
        <header className="p-4 md:p-6 border-b border-border space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Messages</h1>
            <Button size="sm" variant="glass" className="p-2 rounded-full aspect-square">
              <Plus size={20} />
            </Button>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users or chats..."
              value={searchQuery}
              onChange={(e) => handleSearchUsers(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* Search Results */}
          <AnimatePresence>
            {userSearchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 space-y-1"
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">Global Search</p>
                {userSearchResults.map((user) => (
                  <div key={user.uid} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                        {user.username[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{user.username}</span>
                    </div>
                    <Button size="sm" variant="glass" onClick={() => sendFriendRequest(user.uid)}>
                      <UserPlus size={16} />
                    </Button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pending Requests */}
          {friendRequests.length > 0 && (
            <div className="mb-4 space-y-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">Friend Requests</p>
              {friendRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground">
                      {req.fromUsername?.[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{req.fromUsername}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" className="p-1.5 h-auto bg-emerald-500 hover:bg-emerald-600" onClick={() => handleRequest(req.id, "accepted")}>
                      <Check size={14} />
                    </Button>
                    <Button size="sm" variant="danger" className="p-1.5 h-auto" onClick={() => handleRequest(req.id, "rejected")}>
                      <X size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Friends List */}
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2">Recent Chats</p>
          {friends.map((friend) => (
            <button
              key={friend.uid}
              onClick={() => setSelectedFriend(friend)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                selectedFriend?.uid === friend.uid
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-secondary"
              )}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border">
                  {friend.profilePhoto ? (
                    <img src={friend.profilePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-muted-foreground">{friend.username[0].toUpperCase()}</span>
                  )}
                </div>
                <div className={cn(
                  "absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-background",
                  friend.status === "available" ? "bg-emerald-500" : "bg-zinc-600"
                )} />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="font-semibold text-foreground truncate">{friend.username}</h3>
                  <span className="text-[10px] text-muted-foreground font-medium">Online</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">Click to start chatting</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all",
        !selectedFriend ? "hidden md:flex items-center justify-center bg-background/50" : "flex"
      )}>
        {selectedFriend ? (
          <>
            <header className="h-16 px-4 md:px-6 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-xl z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedFriend(null)} className="md:hidden text-muted-foreground mr-2">
                  <X size={20} />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden border border-border">
                    {selectedFriend.profilePhoto ? (
                      <img src={selectedFriend.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-muted-foreground">{selectedFriend.username[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className={cn(
                    "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background",
                    selectedFriend.status === "available" ? "bg-emerald-500" : "bg-zinc-600"
                  )} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground leading-none text-sm md:text-base">{selectedFriend.username}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                    {selectedFriend.status === "available" ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Button 
                  size="sm" 
                  variant="glass" 
                  className="p-2 rounded-full aspect-square"
                  onClick={() => setActiveCall({ type: "voice", friend: selectedFriend })}
                >
                  <Phone size={18} />
                </Button>
                <Button 
                  size="sm" 
                  variant="glass" 
                  className="p-2 rounded-full aspect-square"
                  onClick={() => setActiveCall({ type: "video", friend: selectedFriend })}
                >
                  <Video size={18} />
                </Button>
                <Button size="sm" variant="glass" className="p-2 rounded-full aspect-square">
                  <MoreVertical size={18} />
                </Button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent">
              <div className="flex justify-center">
                <div className="bg-secondary/50 backdrop-blur-md border border-border px-3 py-1 rounded-full flex items-center gap-2">
                  <Shield size={12} className="text-emerald-500" />
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">End-to-end encrypted</span>
                </div>
              </div>

              {/* Message Bubbles */}
              <div className="flex flex-col gap-4">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "flex flex-col max-w-[85%] md:max-w-[70%]",
                      msg.senderId === userId ? "items-end self-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-2xl border shadow-lg",
                      msg.senderId === userId 
                        ? "bg-primary text-white border-primary/20 rounded-tr-none shadow-primary/20" 
                        : "bg-secondary text-foreground border-border rounded-tl-none"
                    )}>
                      <p className="text-sm">{msg.text}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <span className="text-[10px] text-muted-foreground">
                        {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                      </span>
                      {msg.senderId === userId && <CheckCheck size={12} className="text-primary" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="p-4 bg-background border-t border-border">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-4xl mx-auto">
                <div className="flex gap-1">
                  <Button type="button" size="sm" variant="glass" className="p-2 rounded-full aspect-square">
                    <Plus size={20} />
                  </Button>
                </div>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-secondary border border-border rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                {message.trim() ? (
                  <Button type="submit" size="sm" className="p-2.5 rounded-full aspect-square">
                    <Send size={20} />
                  </Button>
                ) : (
                  <Button type="button" size="sm" variant="glass" className="p-2.5 rounded-full aspect-square">
                    <Mic size={20} />
                  </Button>
                )}
              </form>
            </footer>
          </>
        ) : (
          <div className="text-center space-y-4 p-6">
            <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center mx-auto border border-border">
              <MessageSquare size={40} className="text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Your Messages</h2>
              <p className="text-sm text-muted-foreground">Select a friend to start chatting.</p>
            </div>
          </div>
        )}
      </div>

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
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 md:bottom-6 right-6 z-[110]"
          >
            <GlassCard className="p-6 flex items-center gap-6 border-emerald-500/30 bg-emerald-500/5">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Phone size={24} className="text-emerald-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-foreground font-bold">Incoming {incomingCall.name}</h4>
                <p className="text-xs text-muted-foreground">Voice Call...</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="danger" 
                  size="sm" 
                  className="rounded-full p-2"
                  onClick={() => setIncomingCall(null)}
                >
                  <X size={20} />
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="rounded-full p-2 bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => {
                    const friend = friends.find(f => f.uid === incomingCall.from) || { uid: incomingCall.from, username: incomingCall.name };
                    setActiveCall({ type: "voice", friend: friend as any });
                    socketService.getSocket().emit("answer-call", { to: incomingCall.from, signal: { type: "answer" } });
                    setIncomingCall(null);
                  }}
                >
                  <Phone size={20} />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


