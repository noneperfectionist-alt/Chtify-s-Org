import React, { useState, useEffect } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Users, UserCheck, UserX, Trash2, Shield, Activity, Search, Filter, Lock, Mail, Key, Loader2, Eye, EyeOff, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const ADMIN_EMAIL = "chtifyapp@gmail.com";

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"stats" | "requests" | "users" | "logs">("stats");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<"loading" | "setup" | "login" | "verify">("loading");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

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
      setError("Failed to connect to security server.");
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md z-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
              <Shield size={32} className="text-indigo-500" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Admin Access</h1>
            <p className="text-zinc-500 text-sm mt-2">Secure gateway to Chatify Control Panel</p>
          </div>

          <GlassCard className="space-y-6">
            {authStep === "loading" ? (
              <div className="flex flex-col items-center py-8 space-y-4">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
                <p className="text-zinc-500 text-sm">Initializing security protocols...</p>
              </div>
            ) : authStep === "setup" ? (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-4">
                  <p className="text-xs text-amber-500 font-medium leading-relaxed">
                    First-time setup detected. Please create a master password for the admin panel.
                  </p>
                </div>
                <div className="relative">
                  <Input
                    label="Create Master Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && <p className="text-xs text-rose-500 ml-1">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Initialize Admin Panel"}
                </Button>
              </form>
            ) : authStep === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Admin Email</label>
                  <div className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400">
                    <Mail size={18} />
                    <span className="text-sm">{ADMIN_EMAIL}</span>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    label="Master Password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {error && <p className="text-xs text-rose-500 ml-1">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                  Authenticate
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="text-center space-y-2 mb-4">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Key size={24} className="text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Verify Identity</h3>
                  <p className="text-xs text-zinc-500">A 6-digit code has been sent to {ADMIN_EMAIL}</p>
                </div>
                <Input
                  label="OTP Code"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                {error && <p className="text-xs text-rose-500 ml-1">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 size={18} className="animate-spin mx-auto" /> : "Verify & Enter"}
                </Button>
                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={isLoading}
                    className="text-xs text-indigo-500 hover:text-indigo-400 font-bold uppercase tracking-widest"
                  >
                    Resend OTP Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthStep("login")}
                    className="text-xs text-zinc-500 hover:text-zinc-300 font-medium"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  const stats = [
    { label: "Total Users", value: 1250, icon: Users, color: "text-indigo-500" },
    { label: "Active Now", value: 42, icon: Activity, color: "text-emerald-500" },
    { label: "Pending Approvals", value: 12, icon: UserCheck, color: "text-amber-500" },
  ];

  const pendingRequests = [
    { id: "1", username: "@atithi_01", email: "atithi1@example.com", type: "Special Atithi", date: "2026-03-22" },
    { id: "2", username: "@atithi_02", email: "atithi2@example.com", type: "Special Atithi", date: "2026-03-21" },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Admin Control Panel</h1>
          <p className="text-zinc-400">Manage Chatify users, requests, and system security.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => setIsAuthenticated(false)}>
            <LogOut size={16} className="mr-2" />
            Exit Admin
          </Button>
          <div className="flex p-1 bg-zinc-900/50 rounded-xl border border-zinc-800">
          {(["stats", "requests", "users", "logs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab}
            </button>
          ))}
          </div>
        </div>
      </header>

      {activeTab === "stats" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <GlassCard key={stat.label} variant="neumorph" className="flex items-center gap-6 p-6">
              <div className={`p-4 rounded-2xl bg-zinc-950 border border-zinc-800 ${stat.color}`}>
                <stat.icon size={32} />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {activeTab === "requests" && (
        <GlassCard className="overflow-hidden p-0">
          <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Special Atithi Approval Queue</h2>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-xs font-bold">
              {pendingRequests.length} Pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-900/50 text-zinc-500 text-xs uppercase tracking-widest font-bold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                          {req.username[1].toUpperCase()}
                        </div>
                        <span className="text-zinc-200 font-medium">{req.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">{req.email}</td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">{req.date}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button size="sm" variant="glass" className="text-emerald-500 hover:bg-emerald-500/10">
                        <UserCheck size={16} />
                      </Button>
                      <Button size="sm" variant="glass" className="text-rose-500 hover:bg-rose-500/10">
                        <UserX size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by username or email..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <Button variant="secondary">
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
          </div>

          <GlassCard className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/50 text-zinc-500 text-xs uppercase tracking-widest font-bold">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Remote Deletion</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-800" />
                          <div>
                            <p className="text-zinc-200 font-medium">User_{i}</p>
                            <p className="text-[10px] text-zinc-500">user{i}@example.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          i % 2 === 0 ? "bg-indigo-500/10 text-indigo-500" : "bg-zinc-500/10 text-zinc-500"
                        }`}>
                          {i % 2 === 0 ? "Special Atithi" : "Normal User"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-xs text-zinc-400">Active</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="danger" className="p-2 rounded-lg">
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
