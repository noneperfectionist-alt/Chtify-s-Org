import React from "react";
import { Shield, Zap, Lock, Users, Globe, Smartphone, Video, MapPin, Database, Heart } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard, Button } from "../components/UI";
import { Link } from "react-router-dom";

export const Features: React.FC = () => {
  const features = [
    {
      title: "End-to-End Encryption",
      description: "Your messages are encrypted from the moment you send them until they reach the recipient. No one else, not even Nexora, can read them.",
      icon: Shield,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10"
    },
    {
      title: "Real-time Sync",
      description: "Experience lightning-fast message delivery and status updates across all your devices simultaneously.",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Secure Vault",
      description: "Store your most sensitive media and notes in a password-protected, encrypted vault within the app.",
      icon: Lock,
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      title: "Watch Cinema Together",
      description: "Watch movies and videos with your friends in perfectly synchronized rooms with integrated voice chat.",
      icon: Video,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Live Location Sharing",
      description: "Share your real-time location with trusted friends for safety or meeting up, with full control over who sees what.",
      icon: MapPin,
      color: "text-sky-500",
      bg: "bg-sky-500/10"
    },
    {
      title: "Special Atithi Status",
      description: "Unique verification system for high-profile users or community contributors with exclusive badges.",
      icon: Heart,
      color: "text-pink-500",
      bg: "bg-pink-500/10"
    }
  ];

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
            <Link to="/features" className="text-sm font-bold uppercase tracking-widest text-indigo-500">Features</Link>
            <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">About</Link>
            <Link to="/help" className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Help</Link>
            <Link to="/login">
              <Button variant="secondary" className="px-6 rounded-xl text-xs font-black uppercase tracking-widest">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6"
            >
              Engineered for <span className="text-indigo-500">Privacy</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium"
            >
              Explore the cutting-edge features that make Nexora the most secure and engaging communication platform available today.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full p-8 border-white/5 bg-white/5 hover:bg-white/10 transition-colors group">
                  <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <feature.icon size={28} className={feature.color} />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-tight mb-4">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="mt-32 text-center">
            <GlassCard className="p-12 border-indigo-500/20 bg-indigo-500/5 max-w-4xl mx-auto">
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">Ready to experience the future?</h2>
              <p className="text-zinc-400 mb-10 font-medium">Join thousands of users who trust Nexora for their daily communication.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/signup">
                  <Button className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm h-auto">Get Started Now</Button>
                </Link>
                <Link to="/help">
                  <Button variant="secondary" className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm h-auto">Contact Support</Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 px-6 bg-zinc-950">
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
