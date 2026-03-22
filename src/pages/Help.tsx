import React from "react";
import { Shield, Search, MessageCircle, Lock, Smartphone, Video, MapPin, HelpCircle, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard, Button, Input } from "../components/UI";
import { Link } from "react-router-dom";

export const Help: React.FC = () => {
  const categories = [
    { title: "Getting Started", icon: Shield, count: 12 },
    { title: "Account & Security", icon: Lock, count: 8 },
    { title: "Messaging & Media", icon: MessageCircle, count: 15 },
    { title: "Cinema & Sync", icon: Video, count: 6 },
    { title: "Location Services", icon: MapPin, count: 5 },
    { title: "Troubleshooting", icon: HelpCircle, count: 10 }
  ];

  const faqs = [
    { q: "How secure is Chatify?", a: "Chatify uses end-to-end encryption for all messages and media. This means only you and the person you're communicating with can read what is sent." },
    { q: "What is Special Atithi status?", a: "Special Atithi is a verified status for recognized community members, creators, and public figures. It comes with a unique badge and exclusive features." },
    { q: "How do I use the Vault?", a: "The Vault is located in your profile settings. You can set a separate master password to store sensitive notes and media securely." },
    { q: "Is Chatify free to use?", a: "Yes, Chatify is free to use for all basic communication features. We may offer premium features in the future to support development." }
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
            <span className="text-2xl font-black tracking-tighter uppercase">Chatify</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link to="/features" className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Features</Link>
            <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">About</Link>
            <Link to="/help" className="text-sm font-bold uppercase tracking-widest text-indigo-500">Help</Link>
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
              className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-8"
            >
              How can we <span className="text-indigo-500">Help?</span>
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto relative"
            >
              <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search for articles, guides, or FAQs..."
                className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 pl-16 pr-8 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium placeholder:text-zinc-600"
              />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
            {categories.map((cat, index) => (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard className="p-8 border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                      <cat.icon size={24} className="text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{cat.count} Articles</span>
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight mb-2">{cat.title}</h3>
                  <div className="flex items-center text-indigo-500 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                    Browse Category <ChevronRight size={14} className="ml-1" />
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 text-center">Frequently Asked <span className="text-indigo-500">Questions</span></h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <GlassCard key={index} className="p-8 border-white/5 bg-white/5">
                  <h4 className="text-lg font-bold uppercase tracking-tight mb-4">{faq.q}</h4>
                  <p className="text-zinc-400 text-sm font-medium leading-relaxed">{faq.a}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          <div className="mt-32 text-center">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-6">Still need assistance?</p>
            <Link to="/contact">
              <Button className="px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm h-auto">Contact Our Team</Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-20 px-6 bg-zinc-950 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Shield size={24} className="text-indigo-500" />
              <span className="text-xl font-black tracking-tighter uppercase">Chatify</span>
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
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">© 2026 Chatify Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">v4.0.1 Stable</span>
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">System: Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
