import React from "react";
import { motion } from "motion/react";
import { Shield, Lock, Zap, MessageSquare, Video, Smartphone, ArrowRight, CheckCircle } from "lucide-react";
import { Button, GlassCard } from "../components/UI";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.15),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Shield size={14} />
            Privacy-First Communication
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-8 leading-[0.9]"
          >
            Secure Chat.<br />
            <span className="text-indigo-500">Private Life.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-zinc-400 text-lg mb-12 font-medium"
          >
            Nexora is the next-generation messaging platform built on total privacy.
            End-to-end encryption, zero data harvesting, and a suite of powerful features.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup">
              <Button className="h-14 px-10 text-lg font-black uppercase tracking-widest rounded-2xl">
                Get Started Free
                <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="secondary" className="h-14 px-10 text-lg font-black uppercase tracking-widest rounded-2xl border border-white/5">
                Explore Features
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Why Choose Nexora?</h2>
            <p className="text-zinc-500 font-medium">Engineered for the security-conscious individual.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "E2E Encryption", desc: "Your messages are for your eyes only. Not even we can read them.", icon: Lock },
              { title: "Zero Data Policy", desc: "We don't sell your data because we don't collect it. Period.", icon: Shield },
              { title: "Ultra Fast", desc: "Optimized protocols for lightning-fast message delivery.", icon: Zap },
              { title: "Watch Cinema", desc: "Watch movies together with friends in real-time sync.", icon: Video },
              { title: "Secure Vault", desc: "Store your most sensitive files in an encrypted personal vault.", icon: Shield },
              { title: "Global Reach", desc: "Connect with anyone, anywhere, with crystal clear quality.", icon: MessageSquare },
            ].map((feature, i) => (
              <GlassCard key={i} className="p-8 border-white/5 bg-white/5 hover:bg-white/10 transition-all group">
                <div className="w-14 h-14 bg-indigo-600/20 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <feature.icon size={28} className="text-indigo-500 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-3">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{feature.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-12">Built on Trust</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              "No Ads. Ever.",
              "No Trackers.",
              "Open Source Core.",
              "User-Owned Data.",
              "Verified Security.",
              "Community Driven."
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4 p-6 bg-zinc-900/50 border border-white/5 rounded-2xl">
                <CheckCircle className="text-emerald-500" />
                <span className="font-bold uppercase tracking-widest text-xs text-zinc-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(79,70,229,0.1),transparent_50%)]" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8">Ready to switch?</h2>
          <p className="text-zinc-400 text-lg mb-12">Join thousands of users who have already reclaimed their privacy.</p>
          <Link to="/signup">
            <Button className="h-16 px-12 text-xl font-black uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.3)]">
              Join Nexora Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="text-indigo-500" />
              <span className="text-2xl font-black tracking-tighter uppercase">Nexora</span>
            </div>
            <p className="text-zinc-600 text-sm font-medium">The future of private communication.</p>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Product</h4>
            <ul className="space-y-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/download" className="hover:text-white transition-colors">Download</Link></li>
              <li><Link to="/security" className="hover:text-white transition-colors">Security</Link></li>
              <li><Link to="/status" className="hover:text-white transition-colors">Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Legal</h4>
            <ul className="space-y-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms</Link></li>
              <li><Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Quick FAQ</h4>
            <ul className="space-y-4 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              <li><span className="text-zinc-400">Is it secure?</span> Yes, E2E encrypted.</li>
              <li><span className="text-zinc-400">Is it free?</span> Yes, core features are free.</li>
              <li><span className="text-zinc-400">Can I delete?</span> Yes, anytime in settings.</li>
              <li><Link to="/help" className="text-indigo-400 hover:text-indigo-300 transition-colors">View All FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Support</h4>
            <ul className="space-y-4 text-zinc-500 text-xs font-bold uppercase tracking-widest">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-700 text-[10px] font-bold uppercase tracking-[0.3em]">© 2026 Nexora Network. All rights reserved.</p>
          <div className="flex gap-6">
            <Smartphone size={18} className="text-zinc-700" />
            <Zap size={18} className="text-zinc-700" />
            <Shield size={18} className="text-zinc-700" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
