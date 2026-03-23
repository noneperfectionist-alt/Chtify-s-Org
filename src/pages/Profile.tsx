import React, { useState, useEffect } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { User, Mail, Shield, CheckCircle, AlertCircle, Users, Send, Download, Moon, Sun, Settings, LogOut, Key, Trash2, ChevronRight, Info, FileText, ExternalLink } from "lucide-react";
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
      // 1. Delete from Firestore
      await deleteDoc(doc(db, "users", user.uid));
      
      // 2. Delete from Auth
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats = [
    { label: "Friends", value: 24, icon: Users, color: "text-indigo-500" },
    { label: "Requests", value: 5, icon: Send, color: "text-zinc-500" },
    { label: "Received", value: 3, icon: Download, color: "text-zinc-500" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <GlassCard variant="neumorph" className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-secondary border-4 border-primary/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                {userData?.profilePhoto ? (
                  <img src={userData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-muted-foreground" />
                )}
              </div>
              <div className={cn(
                "absolute bottom-1 right-1 w-6 h-6 border-4 border-background rounded-full",
                userData?.status === "available" ? "bg-emerald-500" : "bg-zinc-500"
              )} />
            </div>

            <div className="text-center md:text-left space-y-3 flex-1">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{userData?.username || "User"}</h1>
                <p className="text-muted-foreground font-mono text-sm">{userData?.email}</p>
              </div>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {userData?.emailVerified ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-xs font-medium">
                    <CheckCircle size={14} />
                    Verified
                  </div>
                ) : (
                  <button 
                    onClick={handleSendOtp}
                    className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full text-xs font-medium hover:bg-rose-500/20 transition-all"
                  >
                    <AlertCircle size={14} />
                    Verify Now
                  </button>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium">
                  <Shield size={14} />
                  {userData?.userType === "special_atithi" ? "Special Atithi" : "Normal User"}
                </div>
              </div>
            </div>

            <div className="flex md:flex-col gap-2 w-full md:w-auto">
              <Button variant="glass" className="flex-1 md:w-32" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span className="ml-2">{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </Button>
              <Button variant="danger" className="flex-1 md:w-32" onClick={handleLogout}>
                <LogOut size={18} />
                <span className="ml-2">Logout</span>
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {stats.map((stat) => (
            <GlassCard key={stat.label} variant="neumorph" className="flex flex-col md:flex-row items-center gap-2 md:gap-4 p-3 md:p-4 text-center md:text-left">
              <div className={cn("p-2 md:p-3 rounded-xl bg-secondary hidden md:block", stat.color)}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-lg md:text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Settings Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <GlassCard className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Settings size={20} className="text-primary" />
                Account Settings
              </h2>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {showOtpInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/10"
                    >
                      <p className="text-xs text-primary font-medium">OTP sent to {userData?.email}</p>
                      <Input
                        label="Enter 6-digit OTP"
                        placeholder="123456"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={handleVerifyOtp}>Verify</Button>
                        <Button variant="secondary" onClick={() => setShowOtpInput(false)}>Cancel</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <User size={20} className="text-muted-foreground" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Edit Profile</p>
                        <p className="text-[10px] text-muted-foreground">Name, username, bio</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <Mail size={20} className="text-muted-foreground" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Email Notifications</p>
                        <p className="text-[10px] text-muted-foreground">Manage your alerts</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Info size={20} className="text-primary" />
                About Nexora
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/50 rounded-xl border border-border">
                  <p className="text-sm text-foreground leading-relaxed">
                    Nexora is a privacy-first communication platform designed to protect user data and ensure secure interactions. We believe in minimal data collection and maximum user control.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Link to="/policies" className="w-full flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-muted-foreground" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Privacy Policy</p>
                        <p className="text-[10px] text-muted-foreground">How we protect your data</p>
                      </div>
                    </div>
                    <ExternalLink size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link to="/policies" className="w-full flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <Shield size={20} className="text-muted-foreground" />
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">Terms & Conditions</p>
                        <p className="text-[10px] text-muted-foreground">Rules of the platform</p>
                      </div>
                    </div>
                    <ExternalLink size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">About the Creator</h3>
                  <p className="text-xs text-muted-foreground italic">
                    "I built Nexora to give people a secure space to connect without worrying about their data being sold or monitored. Your privacy is my priority."
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield size={20} className="text-primary" />
                Privacy & Security
              </h2>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary rounded-xl transition-all group">
                  <div className="flex items-center gap-3">
                    <Key size={20} className="text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">Change Password</p>
                      <p className="text-[10px] text-muted-foreground">Update your security</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </button>

                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-between p-4 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-all group border border-rose-500/10"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 size={20} className="text-rose-500" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-rose-500">Delete Account</p>
                      <p className="text-[10px] text-rose-500/70">Permanently remove data</p>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-rose-500 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <GlassCard className="p-6 space-y-6 border-rose-500/20">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Trash2 size={32} className="text-rose-500" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Delete Profile?</h3>
                  <p className="text-sm text-muted-foreground">
                    This action is permanent and cannot be undone. All your chats, memories, and data will be lost.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button variant="danger" onClick={handleDeleteProfile}>
                    Yes, Delete Permanently
                  </Button>
                  <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
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
