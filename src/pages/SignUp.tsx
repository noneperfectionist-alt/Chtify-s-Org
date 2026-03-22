import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard, Button, Input } from "../components/UI";
import { UserPlus, Check, X, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

export const SignUp: React.FC = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        const q = query(collection(db, "users"), where("username", "==", username));
        const querySnapshot = await getDocs(q);
        setUsernameStatus(querySnapshot.empty ? "available" : "taken");
      } catch (error) {
        console.error("Error checking username:", error);
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
    
    setIsLoading(true);
    setError(null);
    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: username });

      // 2. Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // 3. Store User in Firestore
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

      // 4. Send Verification Email (OTP)
      await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground tracking-tight mb-2">
            Chatify
          </h1>
          <p className="text-muted-foreground">Join the next-generation social platform.</p>
        </div>

        <GlassCard className="space-y-6">
          <div className="flex p-1 bg-secondary rounded-xl border border-border">
            <button
              onClick={() => setUserType("normal")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                userType === "normal"
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Normal User
            </button>
            <button
              onClick={() => setUserType("special_atithi")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                userType === "special_atithi"
                  ? "bg-primary text-white shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Special Atithi
            </button>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="relative">
              <Input
                label="Username"
                type="text"
                placeholder="unique_username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                className="pr-10"
              />
              <div className="absolute right-3 top-[38px]">
                {isCheckingUsername ? (
                  <Loader2 size={16} className="animate-spin text-muted-foreground" />
                ) : usernameStatus === "available" ? (
                  <Check size={16} className="text-emerald-500" />
                ) : usernameStatus === "taken" ? (
                  <X size={16} className="text-rose-500" />
                ) : null}
              </div>
              {usernameStatus === "taken" && (
                <p className="text-xs text-rose-500 mt-1 ml-1">Username is already taken.</p>
              )}
            </div>

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-500 font-medium ml-1"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              disabled={usernameStatus !== "available" || isLoading}
              className="w-full flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <UserPlus size={18} />
              )}
              {userType === "special_atithi" ? "Request Approval" : "Sign Up"}
            </Button>
          </form>

          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                Login
              </Link>
            </p>

            <div className="pt-4 border-t border-border">
              <Link 
                to="/policies" 
                className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-bold"
              >
                <ShieldCheck size={12} />
                Privacy Policy & Terms
              </Link>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
