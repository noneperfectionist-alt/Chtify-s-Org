import React, { useState } from "react";
import { Link } from "react-router-dom";
import { GlassCard, Button, Input } from "../components/UI";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
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
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            {isSent 
              ? "Check your inbox for instructions." 
              : "Enter your email to receive a reset link."}
          </p>
        </div>

        <GlassCard className="space-y-6">
          {!isSent ? (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              
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
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                Send Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Email Sent!</h3>
                <p className="text-sm text-zinc-400">
                  We've sent a password reset link to <span className="text-white font-medium">{email}</span>. 
                  Please check your spam folder if you don't see it.
                </p>
              </div>
              <Button variant="secondary" onClick={() => setIsSent(false)} className="w-full">
                Try another email
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-border">
            <Link 
              to="/login" 
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
