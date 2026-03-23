import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard, Button, Input } from "../components/UI";
import { LogIn, Loader2, Eye, EyeOff, ShieldCheck, Mail, Lock, Rocket, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", user.uid);
        localStorage.setItem("username", userData.username);
        window.location.href = "/chats";
      } else {
        setError("User profile not found.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setError(null);
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let username = "";

      if (userDoc.exists()) {
        username = userDoc.data().username;
      } else {
        username = user.displayName?.split(" ")[0].toLowerCase() + Math.floor(Math.random() * 1000);
        await setDoc(userDocRef, {
          uid: user.uid,
          username: username,
          email: user.email,
          status: "available",
          profilePhoto: user.photoURL,
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", user.uid);
      localStorage.setItem("username", username);
      window.location.href = "/chats";
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message);
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
        className="w-full max-w-[440px] z-10"
      >
        <GlassCard className="p-10 flex flex-col gap-8 shadow-2xl rounded-[2rem]">
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
              <Rocket size={40} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
            <p className="text-muted-foreground text-center font-medium">Continue your journey across the cosmos.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Input
                label="Cosmic ID"
                type="email"
                placeholder="explorer@nexora.space"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-12"
              />
              <Mail className="absolute left-4 top-[44px] text-zinc-500" size={20} />
            </div>

            <div className="flex flex-col gap-2 relative">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Security Key</label>
                <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
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

            <Button type="submit" disabled={isLoading} variant="glow" size="lg" className="w-full group">
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Initiate Login</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </Button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest text-zinc-600">or</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="glass" onClick={handleGoogleLogin} className="h-12 text-sm font-medium">
              <img className="w-4 h-4 mr-2" alt="Google logo" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" />
              Google
            </Button>
            <Button variant="glass" className="h-12 text-sm font-medium">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Apple
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-2">
            New to the universe?{" "}
            <Link to="/signup" className="text-primary font-semibold hover:underline underline-offset-4 decoration-primary/30">
              Create an account
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
};
