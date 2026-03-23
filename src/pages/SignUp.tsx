import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard, Button, Input } from "../components/UI";
import { UserPlus, Check, X, Loader2, Eye, EyeOff, ShieldCheck, Mail, Lock, User, ArrowRight, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userType, setUserType] = useState<"normal" | "special_atithi">("normal");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<"available" | "taken" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (username.length < 3) {
      setUsernameStatus(null);
      return;
    }

    const checkUsername = async () => {
      setIsCheckingUsername(true);
      try {
        const response = await fetch(`/api/check-username/${encodeURIComponent(username)}`);
        if (!response.ok) throw new Error("Failed to check username");
        const data = await response.json();
        setUsernameStatus(data.available ? "available" : "taken");
      } catch (error) {
        console.error("Error checking username:", error);
        setUsernameStatus(null);
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timer = setTimeout(checkUsername, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameStatus !== "available" || isLoading) return;
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username,
        email,
        userType,
        isApproved: userType === "normal",
        emailVerified: false,
        status: "available",
        otp,
        otpCreatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      try {
        await fetch("/api/send-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: otp }),
        });
      } catch (e) {
        console.error("Email API error:", e);
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", user.uid);
      localStorage.setItem("username", username);

      navigate("/chats");
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "An error occurred during sign up.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 cosmic-bg relative overflow-hidden">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[480px] z-10"
      >
        <GlassCard className="p-10 flex flex-col gap-6 shadow-2xl rounded-[2.5rem]">
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
              <Rocket size={40} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white text-center leading-tight">Create your account</h1>
            <p className="text-muted-foreground text-center font-medium">Join the next-generation communication platform.</p>
          </div>

          <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 mt-4">
            <button
              onClick={() => setUserType("normal")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                userType === "normal"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Explorer
            </button>
            <button
              onClick={() => setUserType("special_atithi")}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                userType === "special_atithi"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Atithi
            </button>
          </div>

          <form onSubmit={handleSignUp} className="flex flex-col gap-5 mt-2">
            <div className="flex flex-col gap-2 relative">
              <Input
                label="Cosmic ID (Username)"
                type="text"
                placeholder="unique_username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                className="pl-12"
              />
              <User className="absolute left-4 top-[44px] text-zinc-500" size={20} />
              <div className="absolute right-4 top-[44px]">
                {isCheckingUsername ? (
                  <Loader2 size={18} className="animate-spin text-zinc-500" />
                ) : usernameStatus === "available" ? (
                  <Check size={18} className="text-emerald-500" />
                ) : usernameStatus === "taken" ? (
                  <X size={18} className="text-rose-500" />
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2 relative">
              <Input
                label="Orbital Email"
                type="email"
                placeholder="name@nexora.space"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12"
              />
              <Mail className="absolute left-4 top-[44px] text-zinc-500" size={20} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2 relative">
                <Input
                  label="Key"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12"
                />
                <Lock className="absolute left-4 top-[44px] text-zinc-500" size={18} />
              </div>
              <div className="flex flex-col gap-2 relative">
                <Input
                  label="Verify"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-12"
                />
                <ShieldCheck className="absolute left-4 top-[44px] text-zinc-500" size={18} />
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-500 font-bold uppercase tracking-widest text-center"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={usernameStatus !== "available" || isLoading}
              variant="glow"
              size="lg"
              className="w-full group mt-2"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>{userType === "special_atithi" ? "Request Approval" : "Initiate Account"}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="flex flex-col gap-4">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4 decoration-primary/30">
                Login
              </Link>
            </p>

            <div className="pt-4 border-t border-white/5">
              <Link 
                to="/policies" 
                className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 hover:text-primary transition-colors uppercase tracking-[0.2em] font-bold"
              >
                <ShieldCheck size={12} />
                Governance & Privacy
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
