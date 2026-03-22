import React, { useState } from "react";
import { GlassCard, Button, Input } from "../components/UI";
import { Calendar as CalendarIcon, Plus, Search, Image as ImageIcon, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

export const Memories: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const memories = [
    { date: new Date(), title: "Beach Day", content: "Amazing sunset at the beach.", image: "https://picsum.photos/seed/beach/400/400" },
    { date: subMonths(new Date(), 1), title: "Birthday Party", content: "Best party ever!", image: "https://picsum.photos/seed/party/400/400" },
  ];

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Memories</h1>
          <p className="text-zinc-400">Encrypted notes and photos from your past.</p>
        </div>
        <Button>
          <Plus size={18} className="mr-2" />
          Add Memory
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Sidebar */}
        <GlassCard className="lg:col-span-1 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">{format(currentDate, "MMMM yyyy")}</h3>
            <div className="flex gap-1">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 text-zinc-500 hover:text-white">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 text-zinc-500 hover:text-white">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <span key={d} className="text-[10px] font-bold text-zinc-600 uppercase">{d}</span>
            ))}
            {days.map((day) => (
              <button
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                  isSameDay(day, selectedDate)
                    ? "bg-indigo-600 text-white shadow-lg"
                    : memories.some(m => isSameDay(m.date, day))
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    : "text-zinc-500 hover:bg-zinc-900"
                }`}
              >
                {format(day, "d")}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Memories Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="glass">
                <Search size={16} />
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {memories.filter(m => isSameDay(m.date, selectedDate)).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memories.filter(m => isSameDay(m.date, selectedDate)).map((memory, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <GlassCard className="p-0 overflow-hidden group">
                      <div className="aspect-video relative">
                        <img src={memory.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <h4 className="font-bold text-white">{memory.title}</h4>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <p className="text-sm text-zinc-400 line-clamp-2">{memory.content}</p>
                        <div className="flex items-center gap-3 pt-2">
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Clock size={12} />
                            {format(memory.date, "h:mm a")}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <MapPin size={12} />
                            Hawkins, IN
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                  <CalendarIcon size={32} className="text-zinc-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No memories yet</h3>
                  <p className="text-sm text-zinc-500">Capture a moment from this day.</p>
                </div>
                <Button variant="secondary" size="sm">
                  Create First Memory
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
