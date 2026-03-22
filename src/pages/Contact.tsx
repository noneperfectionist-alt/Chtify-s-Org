import React from "react";
import { Shield, Mail, Phone, MapPin, MessageSquare, Globe, Clock, Send } from "lucide-react";
import { motion } from "motion/react";
import { GlassCard, Button, Input } from "../components/UI";
import { Link } from "react-router-dom";

export const Contact: React.FC = () => {
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
            <Link to="/help" className="text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">Help</Link>
            <Link to="/login">
              <Button variant="secondary" className="px-6 rounded-xl text-xs font-black uppercase tracking-widest">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-8">
                Get in <span className="text-indigo-500">Touch</span>
              </h1>
              <p className="text-zinc-400 text-lg font-medium mb-12 leading-relaxed">
                Have questions about Chatify? Our team is here to help you with any inquiries regarding security, features, or partnership opportunities.
              </p>

              <div className="space-y-8">
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <Mail size={24} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Email Us</p>
                    <p className="text-lg font-bold">support@chatify.io</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <MessageSquare size={24} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Live Chat</p>
                    <p className="text-lg font-bold">Available 24/7 in-app</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <Globe size={24} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Global HQ</p>
                    <p className="text-lg font-bold">San Francisco, CA</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassCard className="p-10 border-white/5 bg-white/5">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" placeholder="John Doe" className="bg-black/40 border-white/10" />
                    <Input label="Email Address" placeholder="john@example.com" type="email" className="bg-black/40 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Subject</label>
                    <select className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium appearance-none">
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Security Report</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Message</label>
                    <textarea 
                      placeholder="How can we help you?"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium min-h-[150px] resize-none"
                    />
                  </div>
                  <Button className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3">
                    <Send size={18} />
                    Send Message
                  </Button>
                </form>
              </GlassCard>
            </motion.div>
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
