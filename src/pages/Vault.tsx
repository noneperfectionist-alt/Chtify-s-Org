import React, { useState } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Shield, Lock, Unlock, HelpCircle, Plus, FileText, Image as ImageIcon, Mic } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What was the name of your childhood best friend?",
  "What city were you born in?",
  "What was your first school's name?",
  "Custom question",
];

export const Vault: React.FC = () => {
  const [isSetup, setIsSetup] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [questions, setQuestions] = useState(["", "", ""]);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [step, setStep] = useState(1);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;
    setStep(2);
  };

  const handleSecurityQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to local IndexedDB
    setIsSetup(true);
    setIsLocked(false);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    // Verify password
    setIsLocked(false);
  };

  if (!isSetup) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={32} className="text-indigo-500" />
                </div>
                <h1 className="text-3xl font-bold text-white">Setup Your Vault</h1>
                <p className="text-zinc-400">Protect your sensitive files with a master password.</p>
              </div>

              <GlassCard>
                <form onSubmit={handleSetup} className="space-y-4">
                  <Input
                    label="Vault Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Button type="submit" className="w-full">
                    Next Step
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white">Security Questions</h1>
                <p className="text-zinc-400">These will be used for account recovery.</p>
              </div>

              <GlassCard>
                <form onSubmit={handleSecurityQuestions} className="space-y-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-3">
                      <label className="text-sm font-medium text-zinc-400">Question {i + 1}</label>
                      <select
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                        value={questions[i]}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[i] = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        required
                      >
                        <option value="">Select a question</option>
                        {SECURITY_QUESTIONS.map((q) => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                      <Input
                        placeholder="Your answer"
                        value={answers[i]}
                        onChange={(e) => {
                          const newAnswers = [...answers];
                          newAnswers[i] = e.target.value;
                          setAnswers(newAnswers);
                        }}
                        required
                      />
                    </div>
                  ))}
                  <Button type="submit" className="w-full">
                    Complete Setup
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[80vh] space-y-8">
        <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center shadow-2xl border border-zinc-800">
          <Lock size={40} className="text-indigo-500" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white">Vault Locked</h1>
          <p className="text-zinc-400">Enter your password to access your files.</p>
        </div>
        <GlassCard className="w-full">
          <form onSubmit={handleUnlock} className="space-y-4">
            <Input
              type="password"
              placeholder="Vault Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Unlock Vault
            </Button>
            <button
              type="button"
              className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition-all"
            >
              Forgot Vault Password?
            </button>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Vault</h1>
          <p className="text-zinc-400">Your encrypted file storage.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsLocked(true)}>
            <Lock size={18} className="mr-2" />
            Lock
          </Button>
          <Button>
            <Plus size={18} className="mr-2" />
            Add File
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <GlassCard className="aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all">
          <ImageIcon size={32} className="text-indigo-500" />
          <span className="text-xs font-medium text-zinc-400">photo_01.jpg</span>
        </GlassCard>
        <GlassCard className="aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all">
          <FileText size={32} className="text-emerald-500" />
          <span className="text-xs font-medium text-zinc-400">document.pdf</span>
        </GlassCard>
        <GlassCard className="aspect-square flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all">
          <Mic size={32} className="text-rose-500" />
          <span className="text-xs font-medium text-zinc-400">voice_note.mp3</span>
        </GlassCard>
      </div>
    </div>
  );
};
