import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard, Button, Input } from "../components/UI";
import { Loader2, Mail, ArrowLeft, CheckCircle2, ShieldCheck, Rocket, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "Failed to send reset email. Please check the email address.");
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
        <GlassCard className="p-10 flex flex-col gap-8 shadow-2xl rounded-[2.5rem]">
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
              <Rocket size={40} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white text-center leading-tight">Identity Recovery</h1>
            <p className="text-muted-foreground text-center font-medium">
              {isSent
                ? "Check your inbox for instructions."
                : "Enter your email to receive a secure reset link."}
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleReset} className="flex flex-col gap-6">
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
                    <span>Send Reset Link</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Email Sent!</h3>
                <p className="text-sm text-zinc-400 font-medium">
                  We've sent a secure reset link to <span className="text-white font-bold">{email}</span>.
                  Check your spam folder if it doesn't arrive.
                </p>
              </div>
              <Button variant="glass" onClick={() => setIsSent(false)} className="w-full font-bold uppercase tracking-widest text-xs h-12">
                Try another email
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-white/5">
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 hover:text-primary transition-colors uppercase tracking-[0.2em] font-bold"
            >
              <ArrowLeft size={12} />
              Back to Login Orbit
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
