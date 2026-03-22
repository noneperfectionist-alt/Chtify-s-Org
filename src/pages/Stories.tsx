import React, { useState } from "react";
import { GlassCard, Button } from "../components/UI";
import { Plus, Heart, MessageCircle, Eye, Clock, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const Stories: React.FC = () => {
  const [activeStory, setActiveStory] = useState<number | null>(null);

  const stories = [
    { id: 1, user: "Alice", avatar: "A", color: "bg-indigo-500", time: "2h ago", content: "https://picsum.photos/seed/story1/1080/1920" },
    { id: 2, user: "Bob", avatar: "B", color: "bg-rose-500", time: "5h ago", content: "https://picsum.photos/seed/story2/1080/1920" },
    { id: 3, user: "Charlie", avatar: "C", color: "bg-emerald-500", time: "12h ago", content: "https://picsum.photos/seed/story3/1080/1920" },
  ];

  return (
    <div className="p-6 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Stories</h1>
          <p className="text-zinc-400">Temporary moments from your friends.</p>
        </div>
        <Button className="rounded-full aspect-square p-3">
          <Plus size={24} />
        </Button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* My Story */}
        <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-indigo-500/50 transition-all">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-indigo-500 transition-colors">
            <Plus size={24} />
          </div>
          <span className="text-xs font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">Add Story</span>
        </div>

        {/* Friend Stories */}
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveStory(index)}
            className="relative aspect-[9/16] rounded-2xl overflow-hidden cursor-pointer group shadow-xl"
          >
            <img
              src={story.content}
              alt={story.user}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
            
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full ${story.color} flex items-center justify-center text-xs font-bold border-2 border-white/20`}>
                {story.avatar}
              </div>
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-white leading-none">{story.user}</p>
                <p className="text-[8px] text-zinc-300 leading-none">{story.time}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Story Viewer Overlay */}
      <AnimatePresence>
        {activeStory !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          >
            <div className="relative w-full max-w-lg aspect-[9/16] bg-zinc-900 shadow-2xl overflow-hidden">
              <img
                src={stories[activeStory].content}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              
              {/* Progress Bar */}
              <div className="absolute top-4 inset-x-4 flex gap-1 z-10">
                {stories.map((_, i) => (
                  <div key={i} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
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
                      className="h-full bg-white"
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${stories[activeStory].color} flex items-center justify-center font-bold border-2 border-white/20`}>
                    {stories[activeStory].avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{stories[activeStory].user}</p>
                    <p className="text-[10px] text-zinc-300">{stories[activeStory].time}</p>
                  </div>
                </div>
                <button onClick={() => setActiveStory(null)} className="text-white hover:text-zinc-300 p-2">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              {/* Footer Controls */}
              <div className="absolute bottom-8 left-4 right-4 flex items-center gap-4 z-10">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Reply to story..."
                    className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
                <button className="text-white p-2">
                  <Heart size={24} />
                </button>
                <button className="text-white p-2">
                  <MessageCircle size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
