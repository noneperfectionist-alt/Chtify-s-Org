import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GlassCard, Button, Input } from "../components/UI";
import { LogIn, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

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
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore, if not redirect to signup or create profile
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", user.uid);
        localStorage.setItem("username", userData.username);
        window.location.href = "/chats";
      } else {
        setError("Please sign up first to create a username.");
        auth.signOut();
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      setError(error.message);
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
          <p className="text-muted-foreground">Welcome back! Please login to your account.</p>
        </div>

        <GlassCard className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
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

            <Button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2">
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
              Login
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="secondary" onClick={handleGoogleLogin} className="w-full">
            Google
          </Button>

          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
                Sign up
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
