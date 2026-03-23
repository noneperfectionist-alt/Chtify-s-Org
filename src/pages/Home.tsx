import React from "react";
import { motion } from "motion/react";
import { Shield, Lock, Zap, MessageSquare, Video, Smartphone, ArrowRight, CheckCircle, Rocket } from "lucide-react";
import { Button, GlassCard } from "../components/UI";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 cosmic-bg">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Top Navigation */}
      <header className="flex items-center justify-between px-8 lg:px-20 py-6 relative z-50">
        <div className="flex items-center gap-3">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Rocket size={20} />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Nexora</h2>
        </div>
        <div className="hidden md:flex items-center gap-10">
          <Link to="/features" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">Features</Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">About</Link>
          <Link to="/help" className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">Support</Link>
          <Link to="/login">
            <Button variant="glass" className="h-10 px-6 rounded-full text-sm font-medium">
              Login
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-10"
            >
              <Shield size={14} />
              Military Grade Encryption
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-[0.9]"
            >
              Connect to the<br />
              <span className="text-primary">Cosmos.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-2xl mx-auto text-muted-foreground text-lg mb-12 font-medium"
            >
              Nexora is a privacy-first communication platform built for the next generation.
              Secure, transparent, and beautiful intergalactic messaging.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6"
            >
              <Link to="/signup">
                <Button variant="glow" className="h-14 px-10 text-lg font-bold uppercase tracking-widest rounded-2xl">
                  Initiate Journey
                  <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/features">
                <Button variant="glass" className="h-14 px-10 text-lg font-bold uppercase tracking-widest rounded-2xl">
                  Explore Tech
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Core Systems</h2>
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Engineered for absolute security</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Vault Locked", desc: "Military-grade encryption for your most sensitive data and media.", icon: Lock },
                { title: "Privacy Node", desc: "No tracking, no ads, no data harvesting. Just pure communication.", icon: Shield },
                { title: "Warp Speed", desc: "Optimized protocols for near-instant message delivery across sectors.", icon: Zap },
                { title: "Sync Cinema", desc: "Watch high-definition content together in perfectly synced rooms.", icon: Video },
                { title: "Safe Haven", desc: "A secure digital space for you and your chosen connections.", icon: Shield },
                { title: "Neural Link", desc: "Seamless cross-device synchronization with end-to-end protection.", icon: MessageSquare },
              ].map((feature, i) => (
                <GlassCard key={i} className="group hover:border-primary/50 transition-all border-white/5 bg-white/5">
                  <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* Security Overlay Background Elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-20">
          <div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[20%] right-[5%] w-80 h-80 bg-primary/10 rounded-full blur-[120px]"></div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-[13px] text-muted-foreground font-medium border-t border-white/5 relative z-10">
        <div className="flex items-center gap-8">
          <span>© 2024 Nexora Galactic Inc.</span>
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-zinc-400">Systems Operational: All sectors green</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
