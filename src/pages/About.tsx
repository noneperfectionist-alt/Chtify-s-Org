import React from "react";
import { Shield, Users, Heart, Globe, Target, Award, Code, Zap } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard, Button } from "../components/UI";
import { Link } from "react-router-dom";

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] group-hover:scale-110 transition-transform">
              <Shield size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase">Nexora</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Features</Link>
            <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-indigo-500">About</Link>
            <Link to="/help" className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Help</Link>
            <Link to="/login">
              <Button variant="secondary" className="px-6 rounded-xl text-xs font-black uppercase tracking-widest">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-8">
                Our <span className="text-indigo-500">Mission</span>
              </h1>
              <p className="text-zinc-400 text-lg font-medium mb-8 leading-relaxed">
                At Nexora, we believe that privacy is a fundamental human right. Our mission is to provide a secure, transparent, and engaging platform where people can communicate freely without fear of surveillance or data exploitation.
              </p>
              <p className="text-zinc-400 text-lg font-medium mb-8 leading-relaxed">
                Founded in 2024, Nexora was born out of a desire to create a communication tool that puts users first. We don't sell your data, we don't track your every move, and we certainly don't compromise on security. Our end-to-end encryption ensures that your conversations stay between you and your intended recipients.
              </p>
              <div className="flex flex-wrap gap-4 mt-12">
                <Link to="/privacy">
                  <Button variant="glass" className="border-white/10 text-xs font-black uppercase tracking-widest px-8">Privacy Policy</Button>
                </Link>
                <Link to="/terms">
                  <Button variant="glass" className="border-white/10 text-xs font-black uppercase tracking-widest px-8">Terms of Service</Button>
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-indigo-500/20 blur-3xl rounded-full" />
              <GlassCard className="p-12 border-white/10 bg-white/5 relative z-10 text-center">
                <div className="text-6xl font-black text-indigo-500 mb-2">1M+</div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Global Users</div>
                <div className="h-px bg-white/5 my-8" />
                <div className="text-6xl font-black text-emerald-500 mb-2">100%</div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Encrypted Traffic</div>
                <div className="h-px bg-white/5 my-8" />
                <div className="text-6xl font-black text-amber-500 mb-2">24/7</div>
                <div className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">System Uptime</div>
              </GlassCard>
            </motion.div>
          </div>

          {/* Donation Section */}
          <div className="mb-32">
            <GlassCard className="p-12 border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Heart size={120} className="text-indigo-500" />
              </div>
              <div className="max-w-2xl relative z-10">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Donate for <span className="text-indigo-500">Us</span></h2>
                <p className="text-zinc-400 text-lg font-medium mb-8 leading-relaxed">
                  Nexora is a non-profit initiative driven by the community. Your contributions help us maintain our servers, develop new features, and keep the platform free and secure for everyone.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                      <Zap size={20} className="text-indigo-500" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Trial Details</p>
                      <p className="text-sm font-bold text-white">Support our development with a small contribution</p>
                    </div>
                  </div>
                </div>
                <Button className="px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm h-auto">
                  Support Nexora
                </Button>
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
            <GlassCard className="p-8 border-white/5 bg-white/5">
              <Target size={32} className="text-indigo-500 mb-6" />
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Vision</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                To become the global standard for secure communication, bridging the gap between privacy and usability.
              </p>
            </GlassCard>
            <GlassCard className="p-8 border-white/5 bg-white/5">
              <Award size={32} className="text-emerald-500 mb-6" />
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Values</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                Transparency, integrity, and user-centricity are at the core of everything we build and every decision we make.
              </p>
            </GlassCard>
            <GlassCard className="p-8 border-white/5 bg-white/5">
              <Code size={32} className="text-amber-500 mb-6" />
              <h3 className="text-xl font-bold uppercase tracking-tight mb-4">Technology</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                Leveraging state-of-the-art encryption protocols and distributed systems to ensure maximum reliability and speed.
              </p>
            </GlassCard>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-12">Meet the <span className="text-indigo-500">Core Team</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: "Alex Rivers", role: "Founder & CEO", initial: "AR" },
                { name: "Sarah Chen", role: "CTO", initial: "SC" },
                { name: "Marcus Thorne", role: "Head of Security", initial: "MT" },
                { name: "Elena Vance", role: "Lead Designer", initial: "EV" }
              ].map((member) => (
                <div key={member.name} className="group">
                  <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:border-indigo-500/50 transition-colors">
                    <span className="text-2xl font-black text-zinc-500 group-hover:text-indigo-500 transition-colors">{member.initial}</span>
                  </div>
                  <h4 className="font-bold text-white">{member.name}</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 px-6 bg-zinc-950 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Shield size={24} className="text-indigo-500" />
              <span className="text-xl font-black tracking-tighter uppercase">Nexora</span>
            </Link>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              The ultimate secure communication platform for the modern era.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><Link to="/features" className="hover:text-indigo-500 transition-colors">Features</Link></li>
              <li><Link to="/about" className="hover:text-indigo-500 transition-colors">About Us</Link></li>
              <li><Link to="/help" className="hover:text-indigo-500 transition-colors">Help Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><Link to="/privacy" className="hover:text-indigo-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-500 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-6">Connect</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-medium">
              <li><Link to="/contact" className="hover:text-indigo-500 transition-colors">Contact Us</Link></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-indigo-500 transition-colors">GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">© 2026 Nexora Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">v4.0.1 Stable</span>
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">System: Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
