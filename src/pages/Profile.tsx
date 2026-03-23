import React, { useState, useEffect } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { User, Mail, Shield, CheckCircle, AlertCircle, Users, Send, Download, Moon, Sun, Settings, LogOut, Key, Trash2, ChevronRight, Info, FileText, ExternalLink, Rocket, Sparkles, Share2, Edit2, Image as ImageIcon, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useTheme } from "../context/ThemeContext";
import { cn } from "../components/UI";
import { deleteUser } from "firebase/auth";

export const Profile: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSendOtp = async () => {
    if (!userData?.email) return;
    setIsVerifying(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      await updateDoc(doc(db, "users", userData.uid), {
        otp,
        otpCreatedAt: new Date().toISOString()
      });

      const response = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email, code: otp }),
      });
      
      if (response.ok) {
        setShowOtpInput(true);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to send verification email.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("An error occurred while sending verification email.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpInput === userData?.otp) {
      try {
        await updateDoc(doc(db, "users", userData.uid), {
          emailVerified: true,
          otp: null,
          otpCreatedAt: null
        });
        
        await fetch("/api/send-welcome", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userData.email, username: userData.username }),
        });

        setUserData({ ...userData, emailVerified: true });
        setShowOtpInput(false);
        alert("Email verified successfully!");
      } catch (error) {
        console.error("Error updating verification status:", error);
        alert("Failed to verify OTP.");
      }
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleDeleteProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/signup";
    } catch (error: any) {
      console.error("Delete profile error:", error);
      if (error.code === 'auth/requires-recent-login') {
        alert("Please log in again to delete your account for security reasons.");
      } else {
        alert("Failed to delete account. Please try again later.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Rocket className="text-primary animate-bounce" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans cosmic-bg flex overflow-hidden pt-16 md:pt-0">
      <main className="flex-1 flex overflow-hidden">
        {/* Center Panel: Profile Glass Card */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto flex flex-col items-center custom-scrollbar">
           <div className="w-full max-w-2xl space-y-8 pb-20">
              <GlassCard variant="glass-dark" className="p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden rounded-[2.5rem] border-white/5 shadow-2xl">
                 {/* Decorative background glow */}
                 <div className="absolute -top-24 -right-24 size-64 bg-primary/20 blur-[100px] rounded-full" />
                 <div className="absolute -bottom-24 -left-24 size-64 bg-primary/10 blur-[100px] rounded-full" />

                 <div className="relative group mb-8">
                    <div className="size-32 md:size-40 rounded-full p-1 bg-gradient-to-tr from-primary via-primary/50 to-transparent">
                       <div className="w-full h-full rounded-full border-4 border-dark-matter bg-zinc-800 flex items-center justify-center overflow-hidden">
                          {userData?.profilePhoto ? (
                            <img src={userData.profilePhoto} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                          ) : (
                            <span className="text-5xl font-black text-zinc-500 uppercase">{userData?.username[0]}</span>
                          )}
                       </div>
                    </div>
                    <button className="absolute bottom-2 right-2 size-10 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center border-4 border-dark-matter shadow-primary/20">
                       <Edit2 size={18} />
                    </button>
                 </div>

                 <div className="space-y-2">
                    <h2 className="text-4xl font-black tracking-tight text-white uppercase">{userData?.username}</h2>
                    <div className="flex items-center justify-center gap-3">
                       <p className="text-primary font-bold text-sm tracking-widest uppercase">@{userData?.username}_orbital</p>
                       <div className="size-1.5 rounded-full bg-emerald-500 neon-glow" />
                    </div>
                 </div>

                 <p className="mt-6 text-zinc-400 max-w-md leading-relaxed font-medium">
                    Cosmic Explorer & Quantum Communicator. Navigating the Nexora universe one message at a time. Sector: Earth Prime. 🚀
                 </p>

                 <div className="grid grid-cols-3 gap-8 mt-12 w-full max-w-md border-t border-white/5 pt-8">
                    <div className="flex flex-col items-center">
                       <span className="text-2xl font-black text-white">2.4k</span>
                       <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Connections</span>
                    </div>
                    <div className="flex flex-col items-center border-x border-white/5">
                       <span className="text-2xl font-black text-white">850</span>
                       <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Signals</span>
                    </div>
                    <div className="flex flex-col items-center">
                       <span className="text-2xl font-black text-white">124</span>
                       <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">Archives</span>
                    </div>
                 </div>

                 <div className="flex gap-4 mt-12 w-full">
                    <Button variant="glow" size="lg" className="flex-1 font-black uppercase tracking-widest text-xs h-14 rounded-2xl">
                       Edit Profile
                    </Button>
                    <button className="px-6 glass-panel hover:bg-white/10 text-white rounded-2xl transition-all border-white/10 flex items-center justify-center">
                       <Share2 size={24} />
                    </button>
                 </div>
              </GlassCard>

              {/* Recent Activity Section */}
              <div className="space-y-6 px-2">
                 <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                    <Sparkles size={24} className="text-primary" />
                    Orbital Activity
                 </h3>
                 <div className="space-y-4">
                    {[
                      { title: "Uploaded new design set", time: "2 hours ago", icon: ImageIcon, color: "text-primary" },
                      { title: "Joined \"UI Trends 2024\" group", time: "Yesterday at 4:20 PM", icon: MessageSquare, color: "text-emerald-500" }
                    ].map((act, i) => (
                      <GlassCard key={i} variant="glass-dark" className="p-5 flex items-center gap-5 group cursor-pointer hover:bg-white/5 transition-all border-white/5 rounded-2xl">
                         <div className={cn("size-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform", act.color)}>
                            <act.icon size={24} />
                         </div>
                         <div className="flex-1">
                            <p className="font-bold text-white">{act.title}</p>
                            <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">{act.time}</p>
                         </div>
                         <ChevronRight size={20} className="text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </GlassCard>
                    ))}
                 </div>
              </div>
           </div>
        </section>

        {/* Right Panel: Categorized Settings */}
        <aside className="w-80 lg:w-96 border-l border-white/5 p-8 overflow-y-auto glass-panel rounded-none border-y-0 hidden xl:flex flex-col custom-scrollbar">
           <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3 text-white">
              <Settings size={24} className="text-primary" />
              Quick Config
           </h3>

           {/* Security Category */}
           <div className="mb-10">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 px-2">Security Protocols</p>
              <div className="space-y-3">
                 <GlassCard className="p-4 flex items-center gap-4 border-primary/20 bg-primary/5 neon-glow cursor-pointer transition-all rounded-xl">
                    <Shield size={18} className="text-primary" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest flex-1">Two-Factor Link</span>
                    <div className="w-8 h-4 bg-primary/20 rounded-full relative">
                       <div className="absolute right-0 top-0 size-4 bg-primary rounded-full shadow-lg" />
                    </div>
                 </GlassCard>
                 <GlassCard className="p-4 flex items-center gap-4 border-white/5 bg-white/5 cursor-pointer transition-all rounded-xl group hover:border-white/20">
                    <Mail size={18} className="text-zinc-500 group-hover:text-white" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex-1 group-hover:text-white">Email Sync</span>
                    <div className="w-8 h-4 bg-zinc-800 rounded-full relative">
                       <div className="absolute left-0 top-0 size-4 bg-zinc-600 rounded-full" />
                    </div>
                 </GlassCard>
              </div>
           </div>

           {/* Appearance Category */}
           <div className="mb-10">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 px-2">Visual Modules</p>
              <div className="space-y-3">
                 <div
                   onClick={toggleTheme}
                   className={cn(
                    "glass-panel p-4 flex items-center gap-4 cursor-pointer transition-all rounded-xl border-white/5 hover:border-primary/30",
                    theme === 'dark' && "border-primary/40 bg-primary/5"
                   )}
                 >
                    {theme === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
                    <span className="text-xs font-bold uppercase tracking-widest flex-1 text-white">Dark Matter UI</span>
                    {theme === 'dark' && <CheckCircle size={16} className="text-primary" />}
                 </div>
                 <div className="glass-panel p-4 flex items-center gap-4 border-white/5 cursor-pointer transition-all rounded-xl hover:border-white/20 group">
                    <Sparkles size={18} className="text-zinc-500 group-hover:text-white" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex-1 group-hover:text-white">Neon Intensity</span>
                    <span className="text-[10px] font-black text-primary">75%</span>
                 </div>
              </div>
           </div>

           {/* Account Management */}
           <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 px-2">Account Sector</p>
              <div className="space-y-3">
                 <div className="glass-panel p-4 flex items-center gap-4 border-white/5 cursor-pointer transition-all rounded-xl hover:bg-white/5 group">
                    <FileText size={18} className="text-zinc-500 group-hover:text-white" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex-1 group-hover:text-white">Legal Directives</span>
                    <ChevronRight size={16} className="text-zinc-700" />
                 </div>

                 <div
                   onClick={handleLogout}
                   className="p-4 flex items-center gap-4 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer transition-all rounded-xl group mt-6"
                 >
                    <LogOut size={18} className="text-rose-500" />
                    <span className="text-xs font-black text-rose-500 uppercase tracking-widest flex-1">Sever Link (Logout)</span>
                 </div>
              </div>
           </div>

           <div className="mt-auto text-center pt-12">
              <p className="text-[10px] text-zinc-700 font-black uppercase tracking-[0.3em]">Nexora Core v4.8.2-STABLE</p>
           </div>
        </aside>
      </main>

      {/* Delete Confirmation Overlay (Emulated as before) */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-dark-matter/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassCard variant="glass-dark" className="p-10 space-y-8 border-rose-500/30 rounded-[2.5rem]">
                <div className="text-center space-y-4">
                  <div className="size-20 bg-rose-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto border border-rose-500/20">
                    <Trash2 size={40} className="text-rose-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Initiate Wipe?</h3>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                    This action is permanent and cannot be reversed. All orbital archives, quantum logs, and connections will be permanently severed.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button variant="danger" size="lg" onClick={handleDeleteProfile} className="h-14 font-black uppercase tracking-widest text-xs">
                    Authorize Total Wipe
                  </Button>
                  <Button variant="glass" size="lg" onClick={() => setShowDeleteConfirm(false)} className="h-14 font-black uppercase tracking-widest text-xs border-white/10">
                    Abort Sequence
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
