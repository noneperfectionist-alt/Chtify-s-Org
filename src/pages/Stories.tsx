import React, { useState } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Plus, Heart, MessageCircle, Eye, Clock, Trash2, X, Search, Bell, Sparkles, Hash, MoreHorizontal, Send } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../components/UI";

export const Stories: React.FC = () => {
  const [activeStory, setActiveStory] = useState<number | null>(null);

  const stories = [
    { id: 1, user: "Alex Rivera", avatar: "A", color: "bg-indigo-500", time: "2h ago", content: "https://lh3.googleusercontent.com/aida-public/AB6AXuCe9SntZFAMeQfuWC1VIpJGHyATSnbSnD-9mR61yziYiQxxOWn5MY__KekyydSGgbk1cylTdYPYNtiy15IWJQ1g1OlV5LYIOWT6_boT2QNxp7SNZb09K8n7sPJ0HpargOJkkSAuvKI00CqOEnkB0XQJQexRNNDH_psfGi1dVGsZZbSHVmmtSkV9c4OLloGY1NxYF9I6rmeR5P0nXkXawjzlZqvugpWXlgkJAFppem_PYn8vsrFASipbjTcMqGrsywuYziaEORpiNjAZ" },
    { id: 2, user: "Sam Chen", avatar: "S", color: "bg-rose-500", time: "5h ago", content: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCtgLQSG3zPbJjhHiaasB7XwvVXQyioc7pG_E2fdWDgQGkTyBFBaZI3AhYjPker1VmaYJFeQNiXRFQTyg4KAlJL185FAYB2u9RDR_W_pGcvfIiX3HafIFnLlsCVKhHsQJtZomN3a9xIUVw4bAWL8hTpyrh2J5ThoLRDR43tpk70CgisReDhHSpp3iGciz4mdwyyZ_onQqPEtG3qUf_-m7Feskp4RPf1pjHSzCbEyEQ6ntuJ_1S5BMs7513wU0r25svqHV77OZ6QYmI" },
    { id: 3, user: "Jordan Smith", avatar: "J", color: "bg-emerald-500", time: "12h ago", content: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqW4a-XHuGVZDnRvIWYWXG3f_Cwyvr05m-q8OtORu2PtPS5Kd4AVBYRYJdXvkTedazzexocKC4KMwtha7duJjmhmVg26377iogprhcslK5N_1Y07Xx2Qg-z4OC9AybpD-PyaJoPZjZ6Xo9tPlqCknjw1Xnnvh_1Z2OI7vzlhjQb0eGx1YO2VRsBkOQdXaGaxAzjjt5Yso36TjhTvjRIQ0Y0N_OuyqZ6y_CSVeHKBTJq2EEvCSB1Dx9kSskYEkaxkiOfanvm3OTOuPV" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans cosmic-bg flex flex-col pt-24 md:pt-8 overflow-hidden">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Stories Section */}
        <section className="py-8 overflow-hidden px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex items-center justify-between px-2">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                Recent Galactic Stories
              </h2>
              <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Sync All</button>
            </div>

            <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4">
              {/* Add Story */}
              <div className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer">
                <div className="relative size-20 rounded-full p-1 bg-white/5 border border-white/10 group-hover:border-primary/50 transition-all shadow-xl">
                  <div className="w-full h-full rounded-full bg-dark-matter flex items-center justify-center border-2 border-dashed border-zinc-700 group-hover:border-primary/30">
                    <Plus size={24} className="text-primary" />
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300">Your Orbit</span>
              </div>

              {/* Friend Stories */}
              {stories.map((story, index) => (
                <div key={story.id} className="flex flex-col items-center gap-3 shrink-0 group cursor-pointer" onClick={() => setActiveStory(index)}>
                  <div className="size-20 rounded-full p-[3px] bg-gradient-to-tr from-primary to-primary/30 group-hover:scale-105 transition-transform shadow-lg shadow-primary/10">
                    <div className="w-full h-full rounded-full bg-dark-matter overflow-hidden border-2 border-dark-matter">
                      <img className="w-full h-full object-cover" src={story.content} alt="" />
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white">{story.user.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Friends Grid */}
        <section className="px-8 py-8">
           <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                  All Connections
                  <span className="bg-primary/10 text-primary text-[10px] font-black py-1 px-3 rounded-full border border-primary/20 tracking-widest">24 ONLINE</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Friend Cards (Using design ref style) */}
                {stories.concat(stories).map((friend, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -5 }}
                    className="group relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl"
                  >
                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" src={friend.content} alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-matter via-transparent to-transparent opacity-90" />

                    <div className="absolute bottom-4 left-4 right-4 p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 group-hover:border-primary/30 transition-all">
                      <p className="text-white text-base font-bold truncate tracking-tight">{friend.user}</p>
                      <p className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mt-1">
                        <span className="size-1.5 rounded-full bg-primary neon-glow" />
                        Active Now
                      </p>
                    </div>

                    <button className="absolute top-4 right-4 size-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-primary">
                      <MoreHorizontal size={20} />
                    </button>
                  </motion.div>
                ))}
              </div>
           </div>
        </section>
      </main>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {activeStory !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-dark-matter/95 backdrop-blur-2xl flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg aspect-[9/16] bg-black shadow-2xl rounded-[3rem] overflow-hidden border border-white/10">
              <img
                src={stories[activeStory].content}
                className="w-full h-full object-cover opacity-90"
              />
              
              {/* Progress Bar */}
              <div className="absolute top-6 inset-x-8 flex gap-2 z-10">
                {stories.map((_, i) => (
                  <div key={i} className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: i === activeStory ? "100%" : i < activeStory ? "100%" : 0 }}
                      transition={{ duration: i === activeStory ? 5 : 0, ease: "linear" }}
                      onAnimationComplete={() => {
                        if (i === activeStory) {
                          if (activeStory < stories.length - 1) setActiveStory(activeStory + 1);
                          else setActiveStory(null);
                        }
                      }}
                      className="h-full bg-primary neon-glow"
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-12 left-8 right-8 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                  <div className={cn("size-12 rounded-full flex items-center justify-center font-black border-2 border-primary/50 bg-primary/20 text-primary uppercase shadow-lg shadow-primary/20")}>
                    {stories[activeStory].avatar}
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">{stories[activeStory].user}</p>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{stories[activeStory].time}</p>
                  </div>
                </div>
                <button onClick={() => setActiveStory(null)} className="size-10 rounded-full glass flex items-center justify-center text-white hover:bg-rose-500 transition-colors border-white/10">
                  <X size={24} />
                </button>
              </div>

              {/* Footer Controls */}
              <div className="absolute bottom-12 left-8 right-8 flex items-center gap-4 z-10">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Transmit orbital response..."
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary shadow-2xl"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-3">
                     <button className="text-white hover:text-primary transition-colors">
                        <Heart size={20} />
                     </button>
                  </div>
                </div>
                <button className="size-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-110 transition-transform">
                   <Send size={24} fill="currentColor" />
                </button>
              </div>

              {/* Gradient Overlays */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/60" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
