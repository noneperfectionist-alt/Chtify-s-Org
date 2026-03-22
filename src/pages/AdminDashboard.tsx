import React, { useState, useEffect } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Users, UserCheck, UserX, Trash2, Shield, Activity, Search, Filter, Lock, Mail, Key, Loader2, Eye, EyeOff, LogOut, FileText, AlertCircle, Send, Download, Settings } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc, orderBy, limit, onSnapshot } from "firebase/firestore";
import { cn } from "../utils/cn";

const ADMIN_EMAIL = "chtifyapp@gmail.com";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "stats" | "users" | "requests" | "logs" | "system" | "security" | "reports" | "notifications" | "email" | "storage" | "features" | "api" | "settings"
  >("stats");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<"loading" | "setup" | "login" | "verify">("loading");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  // Real Data State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        setUsersList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      const unsubRequests = onSnapshot(
        query(collection(db, "users"), where("userType", "==", "special_atithi"), where("isApproved", "==", false)),
        (snapshot) => {
          setPendingRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      );

      const unsubLogs = onSnapshot(
        query(collection(db, "logs"), orderBy("createdAt", "desc"), limit(50)),
        (snapshot) => {
          setActivityLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      );

      const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
        setReportsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => {
        unsubUsers();
        unsubRequests();
        unsubLogs();
        unsubReports();
      };
    }
  }, [isAuthenticated]);

  const handleFirestoreError = (error: any, operation: OperationType, path: string) => {
    console.error(`Firestore ${operation} error at ${path}:`, error);
    setError(`Security Protocol Violation: ${error.message || "Access Denied"}`);
  };

  const logAction = async (action: string, details: string, type: "info" | "security" | "warning" | "success" = "info") => {
    try {
      await setDoc(doc(collection(db, "logs")), {
        action,
        details,
        type,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to log action:", err);
    }
  };

  const handleApproveRequest = async (userId: string, username: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        isApproved: true
      });
      await logAction("Atithi Approved", `Approved special status for ${username}`, "success");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleRejectRequest = async (userId: string, username: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        userType: "normal",
        isApproved: false
      });
      await logAction("Atithi Rejected", `Rejected special status for ${username}`, "warning");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleBanUser = async (userId: string, username: string) => {
    if (!window.confirm(`Are you sure you want to suspend ${username}?`)) return;
    try {
      await updateDoc(doc(db, "users", userId), {
        status: "suspended"
      });
      await logAction("User Suspended", `Suspended account of ${username}`, "security");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!window.confirm(`PERMANENT DELETE: Are you sure you want to erase ${username}? This cannot be undone.`)) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      await logAction("User Deleted", `Permanently erased ${username}`, "security");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${userId}`);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const adminDoc = await getDoc(doc(db, "admin_config", "settings"));
      if (adminDoc.exists()) {
        setAdminData(adminDoc.data());
        setAuthStep("login");
      } else {
        setAuthStep("setup");
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setError("Failed to connect to security server. Please check your internet or Firebase rules.");
      setAuthStep("login"); // Fallback to login step so it doesn't hang
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await setDoc(doc(db, "admin_config", "settings"), {
        password: password, // In a real app, this should be hashed
        email: ADMIN_EMAIL,
        createdAt: new Date().toISOString()
      });
      setAuthStep("login");
      setPassword("");
      alert("Admin password set successfully! Please login.");
    } catch (error) {
      setError("Failed to save admin settings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (password === adminData.password) {
        // Generate and send OTP
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        await updateDoc(doc(db, "admin_config", "settings"), {
          currentOtp: generatedOtp,
          otpSentAt: new Date().toISOString()
        });

        const response = await fetch("/api/send-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: ADMIN_EMAIL, code: generatedOtp }),
        });

        if (response.ok) {
          setAuthStep("verify");
        } else {
          setError("Failed to send OTP to admin email.");
        }
      } else {
        setError("Invalid admin password.");
      }
    } catch (error) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const adminDoc = await getDoc(doc(db, "admin_config", "settings"));
      const latestData = adminDoc.data();
      if (otp === latestData?.currentOtp) {
        setIsAuthenticated(true);
      } else {
        setError("Invalid OTP code.");
      }
    } catch (error) {
      setError("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent_50%)]" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md z-10"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 shadow-[0_0_30px_rgba(79,70,229,0.2)]">
              <Shield size={40} className="text-indigo-500" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Admin Portal</h1>
            <p className="text-zinc-500 text-sm mt-2 font-medium tracking-widest uppercase">Chatify Security Gateway</p>
          </div>

          <GlassCard className="border-white/5 bg-white/5 backdrop-blur-2xl">
            {authStep === "loading" ? (
              <div className="flex flex-col items-center py-12 space-y-6">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                  <Shield size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500" />
                </div>
                <div className="text-center">
                  <p className="text-white font-bold tracking-widest uppercase text-xs">Initializing</p>
                  <p className="text-zinc-500 text-[10px] mt-1">Verifying encrypted protocols...</p>
                </div>
              </div>
            ) : authStep === "setup" ? (
              <form onSubmit={handleSetPassword} className="space-y-6">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <p className="text-xs text-amber-500 font-bold uppercase tracking-wider mb-1">First-Time Setup</p>
                  <p className="text-[11px] text-amber-500/80 leading-relaxed">
                    Security protocols not found. Please establish a master password to initialize the control panel.
                  </p>
                </div>
                <div className="relative">
                  <Input
                    label="Master Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-black/40 border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[42px] text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-rose-500 font-bold uppercase tracking-widest text-center">
                    {error}
                  </motion.p>
                )}
                <Button type="submit" disabled={isLoading} className="w-full h-12 font-bold uppercase tracking-[0.2em] text-xs">
                  {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Initialize System"}
                </Button>
              </form>
            ) : authStep === "login" ? (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Admin Identity</label>
                  <div className="flex items-center gap-4 p-4 bg-black/40 border border-white/5 rounded-2xl text-zinc-300">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      <Mail size={16} className="text-indigo-500" />
                    </div>
                    <span className="text-sm font-medium">{ADMIN_EMAIL}</span>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    label="Master Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter credentials"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-black/40 border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-[42px] text-zinc-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-rose-500 font-bold uppercase tracking-widest text-center">
                    {error}
                  </motion.p>
                )}
                <Button type="submit" disabled={isLoading} className="w-full h-12 font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                  Authenticate
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="text-center space-y-3 mb-6">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                    <Key size={28} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">OTP Verification</h3>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    A secure 6-digit code has been dispatched to <span className="text-emerald-500 font-bold">{ADMIN_EMAIL}</span>
                  </p>
                </div>
                <Input
                  label="Verification Code"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="bg-black/40 border-white/10 text-center text-2xl tracking-[0.5em] font-black"
                />
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-rose-500 font-bold uppercase tracking-widest text-center">
                    {error}
                  </motion.p>
                )}
                <Button type="submit" disabled={isLoading} className="w-full h-12 font-bold uppercase tracking-[0.2em] text-xs">
                  {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Verify & Grant Access"}
                </Button>
                <div className="flex flex-col gap-4 pt-2">
                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="text-[10px] text-indigo-500 hover:text-indigo-400 font-black uppercase tracking-[0.2em] transition-colors"
                  >
                    Resend Security Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthStep("login")}
                    className="text-[10px] text-zinc-600 hover:text-zinc-400 font-bold uppercase tracking-[0.2em] transition-colors"
                  >
                    Return to Credentials
                  </button>
                </div>
              </form>
            )}
          </GlassCard>
          
          <p className="text-center mt-8 text-[10px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
            Chatify Administrative Network v4.0
          </p>
        </motion.div>
      </div>
    );
  }

  const menuItems = [
    { id: "stats", label: "Dashboard", icon: Activity },
    { id: "users", label: "User Management", icon: Users },
    { id: "requests", label: "Atithi Requests", icon: UserCheck },
    { id: "logs", label: "Activity Logs", icon: FileText },
    { id: "system", label: "System Monitor", icon: Activity },
    { id: "security", label: "Security Center", icon: Shield },
    { id: "reports", label: "Moderation", icon: AlertCircle },
    { id: "notifications", label: "Notifications", icon: Send },
    { id: "email", label: "Email System", icon: Mail },
    { id: "storage", label: "Vault Monitor", icon: Download },
    { id: "features", label: "Feature Control", icon: Settings },
    { id: "api", label: "API & Integration", icon: Key },
    { id: "settings", label: "Global Settings", icon: Settings },
  ];

  const stats = [
    { label: "Total Users", value: usersList.length, icon: Users, color: "text-indigo-500" },
    { label: "Active Now", value: usersList.filter(u => u.status === "available").length, icon: Activity, color: "text-emerald-500" },
    { label: "Pending Approvals", value: pendingRequests.length, icon: UserCheck, color: "text-amber-500" },
  ];

  const filteredUsers = usersList.filter(u => 
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.uid?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-zinc-900/50 border-r border-white/5 flex flex-col">
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tighter uppercase">Admin</h2>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                activeTab === item.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
              )}
            >
              <item.icon size={18} className={cn(
                "transition-colors",
                activeTab === item.id ? "text-white" : "text-zinc-600 group-hover:text-zinc-400"
              )} />
              <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={() => setIsAuthenticated(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all font-bold uppercase tracking-widest text-xs"
          >
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.05),transparent_40%)]">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
          <header className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h1>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest mt-1">
                System Status: <span className="text-emerald-500 font-black">Operational</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Live Monitoring</span>
              </div>
            </div>
          </header>

          {activeTab === "stats" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                  <GlassCard key={stat.label} className="flex items-center gap-6 p-8 border-white/5 bg-white/5">
                    <div className={cn("p-4 rounded-2xl bg-zinc-950 border border-white/5 shadow-inner", stat.color)}>
                      <stat.icon size={32} />
                    </div>
                    <div>
                      <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">{stat.label}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard className="p-8 border-white/5 bg-white/5">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">User Growth Trend</h3>
                  <div className="h-64 flex items-end gap-2">
                    {[40, 65, 45, 90, 75, 55, 80, 60, 95, 70, 85, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-indigo-600/20 rounded-t-lg relative group transition-all hover:bg-indigo-600/40">
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          className="absolute bottom-0 left-0 right-0 bg-indigo-600 rounded-t-lg shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    <span>Jan</span>
                    <span>Jun</span>
                    <span>Dec</span>
                  </div>
                </GlassCard>

                <GlassCard className="p-8 border-white/5 bg-white/5">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6">Recent Activity Logs</h3>
                  <div className="space-y-4">
                    {activityLogs.slice(0, 5).map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            log.type === "security" ? "bg-rose-500" : 
                            log.type === "warning" ? "bg-amber-500" : 
                            log.type === "success" ? "bg-emerald-500" : "bg-indigo-500"
                          )} />
                          <div>
                            <p className="text-xs font-bold text-white uppercase tracking-widest">{log.action}</p>
                            <p className="text-[10px] text-zinc-500 font-medium">{log.details}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase">
                          {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    {activityLogs.length === 0 && (
                      <p className="text-center text-zinc-600 text-[10px] font-bold uppercase py-4">No recent activity detected</p>
                    )}
                  </div>
                </GlassCard>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Search by username, email or UID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 font-medium"
                  />
                </div>
                <Button variant="secondary" className="px-8 rounded-2xl border border-white/5">
                  <Filter size={18} className="mr-2" />
                  Filter
                </Button>
              </div>

              <GlassCard className="overflow-hidden p-0 border-white/5 bg-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">
                      <tr>
                        <th className="px-8 py-6">User Identity</th>
                        <th className="px-8 py-6">Classification</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6">Activity</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.map((user, i) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-xs font-black text-zinc-500 overflow-hidden">
                                {user.profilePhoto ? (
                                  <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  user.username?.[0].toUpperCase()
                                )}
                              </div>
                              <div>
                                <p className="text-white font-bold text-sm tracking-tight">{user.username}</p>
                                <p className="text-[10px] text-zinc-500 font-medium">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                              user.userType === "special_atithi" ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" : 
                              user.userType === "admin" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                              "bg-zinc-500/10 text-zinc-500 border-white/5"
                            )}>
                              {user.userType?.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]",
                                user.status === "available" ? "bg-emerald-500" : 
                                user.status === "suspended" ? "bg-rose-500" : "bg-zinc-500"
                              )} />
                              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                {user.status || "Offline"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button 
                                size="sm" 
                                variant="glass" 
                                onClick={() => handleBanUser(user.id, user.username)}
                                className="p-2 rounded-xl border-white/10"
                              >
                                <Shield size={16} className="text-indigo-400" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="glass" 
                                onClick={() => handleDeleteUser(user.id, user.username)}
                                className="p-2 rounded-xl border-white/10"
                              >
                                <Trash2 size={16} className="text-rose-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                            No users found matching your criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === "requests" && (
            <GlassCard className="overflow-hidden p-0 border-white/5 bg-white/5">
              <div className="p-8 border-b border-white/5 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">Approval Queue</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Pending Special Atithi Verifications</p>
                </div>
                <span className="px-4 py-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {pendingRequests.length} Pending
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-black/40 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">
                    <tr>
                      <th className="px-8 py-6">Applicant</th>
                      <th className="px-8 py-6">Email Address</th>
                      <th className="px-8 py-6">Request Date</th>
                      <th className="px-8 py-6 text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-xs font-black text-zinc-400 overflow-hidden">
                              {req.profilePhoto ? (
                                <img src={req.profilePhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                req.username?.[0].toUpperCase()
                              )}
                            </div>
                            <span className="text-white font-bold text-sm tracking-tight">{req.username}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-zinc-400 text-xs font-medium">{req.email}</td>
                        <td className="px-8 py-6 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 text-right space-x-3">
                          <Button 
                            size="sm" 
                            variant="glass" 
                            onClick={() => handleApproveRequest(req.id, req.username)}
                            className="px-6 rounded-xl border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="glass" 
                            onClick={() => handleRejectRequest(req.id, req.username)}
                            className="px-6 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10"
                          >
                            Reject
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {pendingRequests.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                          No pending requests found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {activeTab === "logs" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">System Activity Logs</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Real-time audit trail of all administrative actions</p>
                </div>
                <Button variant="glass" size="sm" className="border-white/10">
                  <Download size={16} className="mr-2" />
                  Export Logs
                </Button>
              </div>

              <GlassCard className="overflow-hidden p-0 border-white/5 bg-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">
                      <tr>
                        <th className="px-8 py-6">Timestamp</th>
                        <th className="px-8 py-6">Action</th>
                        <th className="px-8 py-6">Details</th>
                        <th className="px-8 py-6">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-white font-bold text-xs uppercase tracking-widest">{log.action}</span>
                          </td>
                          <td className="px-8 py-6 text-zinc-400 text-xs font-medium">{log.details}</td>
                          <td className="px-8 py-6">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                              log.type === "security" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : 
                              log.type === "warning" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                              log.type === "success" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                              "bg-indigo-500/10 text-indigo-500 border-indigo-500/20"
                            )}>
                              {log.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {activityLogs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-12 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                            No activity logs recorded yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">Moderation Reports</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">User-submitted reports for policy violations</p>
                </div>
              </div>

              <GlassCard className="overflow-hidden p-0 border-white/5 bg-white/5">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-black/40 text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-black">
                      <tr>
                        <th className="px-8 py-6">Reporter</th>
                        <th className="px-8 py-6">Reported User</th>
                        <th className="px-8 py-6">Reason</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reportsList.map((report) => (
                        <tr key={report.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-8 py-6 text-white font-bold text-xs">{report.reporterName || report.reporterId}</td>
                          <td className="px-8 py-6 text-rose-500 font-bold text-xs">{report.reportedUsername || report.reportedUserId}</td>
                          <td className="px-8 py-6 text-zinc-400 text-xs font-medium">{report.reason}</td>
                          <td className="px-8 py-6">
                            <span className={cn(
                              "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                              report.status === "pending" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                              "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            )}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <Button size="sm" variant="glass" className="border-white/10 text-indigo-500">
                              Investigate
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {reportsList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-8 py-12 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                            No active reports to review
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {!["stats", "users", "requests", "logs", "reports"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-32 space-y-6">
              <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl">
                <Settings size={48} className="text-zinc-700 animate-pulse" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Module Under Construction</h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                  Chatify Admin Expansion v4.0.1 - {activeTab.toUpperCase()}
                </p>
              </div>
              <Button variant="secondary" onClick={() => setActiveTab("stats")} className="px-8 rounded-2xl">
                Return to Dashboard
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
