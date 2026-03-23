import React, { useState } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Shield, Lock, Unlock, HelpCircle, Plus, FileText, Image as ImageIcon, Mic, Fingerprint, Delete, Trash, ShieldCheck, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/UI";

const SECURITY_QUESTIONS = [
  "What was the name of your first planetary pet?",
  "In which cosmic sector were you born?",
  "What was the name of your first starship?",
  "What was your childhood guardian's middle name?",
  "What is your secret cosmic designation?",
  "Custom security protocol",
];

export const Vault: React.FC = () => {
  const [isSetup, setIsSetup] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [questions, setQuestions] = useState(["", "", ""]);
  const [answers, setAnswers] = useState(["", "", ""]);
  const [step, setStep] = useState(1);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== confirmPin || pin.length !== 6) return;
    setStep(2);
  };

  const handleSecurityQuestions = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSetup(true);
    setIsLocked(false);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length === 6) {
      setIsLocked(false);
    }
  };

  if (!isSetup) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-2xl space-y-12"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="relative group">
                   <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                   <div className="relative size-32 rounded-full glass-panel border-primary/30 flex items-center justify-center neon-glow">
                    <Shield size={64} className="text-primary" />
                   </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl font-black tracking-tight text-white uppercase">Initialize Vault</h1>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Establish your military-grade encryption credentials.</p>
                </div>
              </div>

              <GlassCard variant="glass-dark" className="p-10 rounded-[2rem]">
                <form onSubmit={handleSetup} className="space-y-8">
                  <div className="space-y-6">
                    <Input
                      label="6-Digit Master PIN"
                      type="password"
                      maxLength={6}
                      placeholder="••••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                      required
                      className="text-center text-2xl tracking-[0.5em] h-14"
                    />
                    <Input
                      label="Confirm Master PIN"
                      type="password"
                      maxLength={6}
                      placeholder="••••••"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                      required
                      className="text-center text-2xl tracking-[0.5em] h-14"
                    />
                  </div>
                  <Button type="submit" variant="glow" size="lg" className="w-full group">
                    Next Phase
                    <Unlock size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
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
              className="w-full max-w-2xl space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-white uppercase tracking-tight">Security Protocols</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">These questions will be used for biometric recovery.</p>
              </div>

              <GlassCard variant="glass-dark" className="p-10 rounded-[2rem]">
                <form onSubmit={handleSecurityQuestions} className="space-y-8">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="space-y-4">
                      <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">Protocol Layer {i + 1}</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        value={questions[i]}
                        onChange={(e) => {
                          const newQuestions = [...questions];
                          newQuestions[i] = e.target.value;
                          setQuestions(newQuestions);
                        }}
                        required
                      >
                        <option value="" className="bg-dark-matter">Select standard question</option>
                        {SECURITY_QUESTIONS.map((q) => (
                          <option key={q} value={q} className="bg-dark-matter">{q}</option>
                        ))}
                      </select>
                      <Input
                        placeholder="Encrypted answer"
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
                  <Button type="submit" variant="glow" size="lg" className="w-full">
                    Activate Vault
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
      <div className="min-h-screen cosmic-bg flex flex-col justify-between overflow-hidden">
        {/* Top Navigation */}
        <div className="flex items-center p-6 justify-between relative z-20">
          <div className="size-12 rounded-full glass-panel flex items-center justify-center text-primary border-primary/20">
            <Shield size={24} />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-white text-lg font-black tracking-widest uppercase">Nexora Vault</h2>
            <span className="text-[10px] text-primary font-black tracking-[0.2em] uppercase">AES-256 SECURED</span>
          </div>
          <div className="size-12 rounded-full glass-panel flex items-center justify-center text-zinc-500 border-white/5">
            <Info size={24} />
          </div>
        </div>

        <div className="flex flex-col items-center px-6 flex-1 justify-center relative z-20 gap-12">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative size-32 rounded-full glass-panel border-primary/30 flex items-center justify-center neon-glow shadow-primary/20">
              <Lock size={64} className="text-primary fill-primary/20" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Vault Locked</h1>
            <p className="text-zinc-500 text-sm font-medium max-w-[240px] mx-auto">Enter your 6-digit military-grade encryption PIN to access.</p>
          </div>

          <div className="flex gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={cn(
                "size-3 rounded-full transition-all duration-300",
                pin.length > i ? "bg-primary neon-glow scale-125" : "bg-zinc-800"
              )} />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6 w-full max-w-[320px]">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                onClick={() => pin.length < 6 && setPin(pin + num)}
                className="size-20 rounded-full glass-panel border-white/10 flex items-center justify-center text-2xl font-light text-white hover:bg-primary/20 hover:border-primary/40 active:scale-95 transition-all"
              >
                {num}
              </button>
            ))}
            <button className="size-20 flex items-center justify-center text-zinc-500 hover:text-primary transition-colors">
              <Fingerprint size={32} />
            </button>
            <button
              onClick={() => pin.length < 6 && setPin(pin + "0")}
              className="size-20 rounded-full glass-panel border-white/10 flex items-center justify-center text-2xl font-light text-white hover:bg-primary/20 hover:border-primary/40 active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={() => setPin(pin.slice(0, -1))}
              className="size-20 flex items-center justify-center text-zinc-500 hover:text-rose-500 transition-colors"
            >
              <Delete size={32} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button onClick={handleUnlock} className={cn(
              "text-primary text-sm font-black tracking-widest uppercase transition-all",
              pin.length === 6 ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              Authorize Access
            </button>
            <button className="text-zinc-600 text-[10px] font-black tracking-[0.2em] uppercase hover:text-primary transition-colors">
              Emergency Wipe Protocol
            </button>
          </div>
        </div>

        {/* Footer Stats */}
        <footer className="p-8 flex items-center justify-between border-t border-white/5 glass-panel rounded-none border-x-0 relative z-20">
          <div className="flex gap-10">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">System Status</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="size-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Node Online</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-600 font-black">Encrypted</span>
              <span className="text-sm font-bold text-zinc-400 mt-1 uppercase tracking-widest">Quantum Core</span>
            </div>
          </div>
          <div className="flex items-center gap-3 glass px-4 py-2 rounded-xl border border-white/5">
            <ShieldCheck size={18} className="text-primary" />
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">E2EE Active</span>
          </div>
        </footer>

        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none -z-10 opacity-30">
          <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground space-y-8 p-8 cosmic-bg pt-24 md:pt-8">
      <header className="flex justify-between items-end gap-6 max-w-7xl mx-auto">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-4xl font-black uppercase tracking-tight">Nexora <span className="text-primary">Vault</span></h1>
          </div>
          <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Zero-Knowledge Encrypted Storage Architecture</p>
        </div>
        <div className="flex gap-4">
          <Button variant="glass" onClick={() => setIsLocked(true)} className="rounded-xl h-12 font-bold uppercase tracking-widest text-xs border-white/10">
            <Lock size={16} className="mr-2" />
            Lock Sector
          </Button>
          <Button variant="glow" className="rounded-xl h-12 font-bold uppercase tracking-widest text-xs px-6">
            <Plus size={18} className="mr-2" />
            Upload Asset
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {[
          { name: "orbital_schematics.png", icon: ImageIcon, color: "text-primary" },
          { name: "quantum_keys.dat", icon: Lock, color: "text-emerald-500" },
          { name: "mission_briefing.pdf", icon: FileText, color: "text-rose-500" },
          { name: "neural_logs.voc", icon: Mic, color: "text-amber-500" },
        ].map((file, i) => (
          <GlassCard key={i} className="aspect-square flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden border-white/5">
             <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
               <button className="text-zinc-600 hover:text-rose-500 transition-colors">
                 <Trash size={16} />
               </button>
             </div>
             <div className="size-20 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
               <file.icon size={48} className={file.color} />
             </div>
             <div className="text-center">
               <p className="text-sm font-bold text-white truncate max-w-[140px]">{file.name}</p>
               <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-1">2.4 MB • SECURE</p>
             </div>
          </GlassCard>
        ))}

        <button className="aspect-square flex flex-col items-center justify-center gap-4 rounded-[2rem] border-2 border-dashed border-white/5 hover:border-primary/30 transition-all text-zinc-700 hover:text-primary group">
          <div className="size-16 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
            <Plus size={32} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">New Protocol</span>
        </button>
      </main>
    </div>
  );
};
