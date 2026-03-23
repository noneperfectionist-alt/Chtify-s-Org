import React, { useState } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Calendar as CalendarIcon, Plus, Search, Image as ImageIcon, MapPin, Clock, ChevronLeft, ChevronRight, LayoutGrid, Heart, Sparkles, Filter, Video, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "../components/UI";

export const Memories: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const memories = [
    {
      date: new Date(),
      title: "Mountain Cabin Weekend",
      content: "Waking up to this view was everything. The lighting was absolutely insane up there.",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMOzZreEJNrTZkmg_xVkVG7PluoykZy3CpjrHYMKdzo3GAYfTUmVYMOizLzwTHwjUYPjXKUQQYJLnD7k2sRYCvplAxafEmC0CBQAHmVSHh7brBLpXWiz1Lj4f6s92xVRug3n8z_P1aXYu5a-9In2g2JFWi5_-r7FkJ8V_xxJdETKB2DaK55GZhoWmKCkzk-TAIW4Vz2Ys01R1jz2dEyE7u3IpYJp0S3AkmPDMxtQKaiw8j8LmHHimNAZQ8ZDTKHHwES6mD9IEMwPvA",
      type: "photos",
      items: 12
    },
    {
      date: subMonths(new Date(), 1),
      title: "Late night celebration",
      content: "Shared via WhatsApp. Let's do this again next year for sure!",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_38kWhk89KFjfzMygYPJBoFnGeRdMSVzni25mUYZ56_Ga5GVP4sG0J9QSqlCOvOZELRtboGj2Q-1vyx37OkTkuHSrwllrmMyDeSPFneiboF1LiF4cEMi2W6GQoVJwkBH8p2z3Ad6spqMgW-G7i0Lhw-cWKpQ53uY8Dsl4gkj-NuAdl7oDNHZusKFzMt7kyO3jUFVj6X2n9NGCUkns_soCd-RHMrcOrZ3DmI7_cu4FvHPTEt7GRdTLSEiJWLCh0wPLVQoFg7an7U4f",
      type: "video",
      items: 1
    },
  ];

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans cosmic-bg pt-24 md:pt-8 flex flex-col items-center">
      <main className="w-full max-w-7xl px-8 flex gap-8">
        {/* Left Sidebar - Filters & Contacts */}
        <aside className="w-72 hidden xl:flex flex-col gap-8">
          <div className="glass-panel rounded-[2rem] p-8 flex flex-col gap-8 border-white/5">
             <div>
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 px-1">Global Filters</h3>
               <div className="flex flex-col gap-3">
                  <button className="flex items-center gap-4 px-4 py-3 rounded-xl bg-primary/20 text-primary font-bold transition-all border border-primary/20">
                    <LayoutGrid size={18} />
                    <span className="text-sm">All Media</span>
                  </button>
                  <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-all">
                    <ImageIcon size={18} />
                    <span className="text-sm">Quantum Photos</span>
                  </button>
                  <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-all">
                    <Video size={18} />
                    <span className="text-sm">Orbital Videos</span>
                  </button>
                  <button className="flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-all">
                    <Heart size={18} />
                    <span className="text-sm">Core Favorites</span>
                  </button>
               </div>
             </div>

             <div className="pt-8 border-t border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 px-1">Top Collaborators</h3>
                <div className="flex flex-col gap-6">
                   <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="size-10 rounded-full bg-zinc-800 border-2 border-primary/20 p-0.5 group-hover:scale-110 transition-transform">
                         <div className="size-full rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase">S</div>
                      </div>
                      <span className="text-sm font-bold group-hover:text-primary transition-colors">Sarah Jenkins</span>
                   </div>
                   <div className="flex items-center gap-4 group cursor-pointer">
                      <div className="size-10 rounded-full bg-zinc-800 border-2 border-emerald-500/20 p-0.5 group-hover:scale-110 transition-transform">
                         <div className="size-full rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-xs uppercase">M</div>
                      </div>
                      <span className="text-sm font-bold group-hover:text-emerald-500 transition-colors">Michael Chen</span>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-8">
             <h4 className="text-primary font-black uppercase tracking-tight mb-2">Memory Boost</h4>
             <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-medium">You have 12 unarchived photos from last year. Want to relive them?</p>
             <button className="w-full bg-primary text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
               View Recap
             </button>
          </div>
        </aside>

        {/* Main Content - Calendar & Memory Grid */}
        <section className="flex-1 flex flex-col gap-8 pb-20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white uppercase">{format(currentDate, "MMMM yyyy")}</h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1.5 flex items-center gap-2">
                <Sparkles size={14} className="text-primary" />
                42 memories captured this month
              </p>
            </div>
            <div className="flex items-center gap-3 glass p-1.5 rounded-2xl border-white/5">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}
                className="px-6 py-2.5 bg-white/5 rounded-xl text-xs font-black uppercase tracking-widest"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-4">
             {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
               <div key={d} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 py-2">{d}</div>
             ))}
             {days.map((day, i) => {
               const dayMemories = memories.filter(m => isSameDay(m.date, day));
               const hasMemories = dayMemories.length > 0;
               const isSelected = isSameDay(day, selectedDate);

               return (
                 <motion.button
                   key={day.toString()}
                   onClick={() => setSelectedDate(day)}
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: i * 0.01 }}
                   className={cn(
                     "aspect-square glass-panel rounded-[1.5rem] flex flex-col p-4 relative overflow-hidden transition-all group border-white/5",
                     !isSameDay(day, currentDate) && day.getMonth() !== currentDate.getMonth() && "opacity-20 cursor-default grayscale",
                     isSelected && "border-primary/50 neon-glow ring-2 ring-primary/20",
                     hasMemories && !isSelected && "hover:border-primary/30"
                   )}
                 >
                   {hasMemories && (
                     <>
                        <div className="absolute inset-0 z-0 opacity-40 group-hover:scale-110 transition-transform duration-500">
                          <img src={dayMemories[0].image} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-matter/90 via-transparent to-transparent z-10" />
                     </>
                   )}
                   <span className={cn(
                     "text-sm font-bold relative z-20",
                     hasMemories ? "text-white" : "text-zinc-500",
                     isSelected && "text-primary"
                   )}>
                     {format(day, "d")}
                   </span>
                   {hasMemories && (
                     <div className="mt-auto relative z-20 flex justify-between items-center w-full">
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">
                          {dayMemories[0].items} {dayMemories[0].type.toUpperCase()}
                        </span>
                        {dayMemories[0].type === "photos" && <Heart size={10} className="text-primary fill-primary" />}
                        {dayMemories[0].type === "video" && <Play size={10} className="text-primary fill-primary" />}
                     </div>
                   )}
                 </motion.button>
               );
             })}
          </div>

          {/* Selected Memory Detailed View (Emulated) */}
          <AnimatePresence mode="wait">
             {memories.some(m => isSameDay(m.date, selectedDate)) ? (
                <motion.div
                  key="detail"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 space-y-6"
                >
                   <div className="flex items-center justify-between px-2">
                      <h2 className="text-xl font-black uppercase tracking-tight text-white">Quantum Reveal</h2>
                      <div className="flex gap-2">
                         <Button size="sm" variant="glass" className="rounded-xl border-white/5"><Filter size={16} /></Button>
                         <Button size="sm" variant="glass" className="rounded-xl border-white/5"><Search size={16} /></Button>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {memories.filter(m => isSameDay(m.date, selectedDate)).map((memory, i) => (
                        <GlassCard key={i} variant="glass-dark" className="p-0 overflow-hidden group border-white/5 rounded-[2.5rem] shadow-2xl">
                           <div className="aspect-[4/3] relative overflow-hidden">
                              <img src={memory.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-dark-matter/80 via-transparent to-transparent" />
                              <div className="absolute top-6 left-6 bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                                {format(memory.date, "MMMM d, yyyy")}
                              </div>
                              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                                 <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-primary">
                                       <MapPin size={14} />
                                       <span className="text-[10px] font-black uppercase tracking-widest">Sector: Earth Prime</span>
                                    </div>
                                    <h4 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{memory.title}</h4>
                                 </div>
                                 <button className="size-12 rounded-full glass border-white/20 flex items-center justify-center text-white hover:bg-primary transition-all">
                                    <Sparkles size={20} />
                                 </button>
                              </div>
                           </div>
                           <div className="p-8 space-y-4">
                              <p className="text-sm text-zinc-400 font-medium leading-relaxed">{memory.content}</p>
                              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                 <div className="flex -space-x-3">
                                    {[1, 2].map(u => (
                                      <div key={u} className="size-8 rounded-full border-2 border-dark-matter bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 uppercase">U</div>
                                    ))}
                                    <div className="size-8 rounded-full border-2 border-dark-matter bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary uppercase">+3</div>
                                 </div>
                                 <Button variant="glow" size="sm" className="px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">Open Archive</Button>
                              </div>
                           </div>
                        </GlassCard>
                      ))}
                   </div>
                </motion.div>
             ) : (
                <div className="mt-12 py-20 flex flex-col items-center justify-center text-center space-y-6 glass-panel rounded-[3rem] border-white/5">
                   <div className="size-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-zinc-700">
                      <CalendarIcon size={40} />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Void Detected</h3>
                      <p className="text-sm text-zinc-500 font-medium max-w-xs mx-auto">No orbital memories synchronized for this solar day.</p>
                   </div>
                   <Button variant="glass" className="px-8 font-black uppercase tracking-widest text-[10px] h-12 border-white/10">
                      Initiate New Memory
                   </Button>
                </div>
             )}
          </AnimatePresence>
        </section>
      </main>

      {/* Security Overlay Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
      </div>
    </div>
  );
};

const Play = ({ size, className, fill }: { size: number, className?: string, fill?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);
