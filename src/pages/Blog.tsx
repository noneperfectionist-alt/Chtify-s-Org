import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { GlassCard } from "../components/UI";
import { Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Blog {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  createdAt: any;
}

export const Blog: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "blogs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const blogData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Blog[];
      setBlogs(blogData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">
            Nexora <span className="text-indigo-500">Blog</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Stay updated with the latest news, security tips, and feature announcements from the Nexora team.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-white/5">
            <p className="text-zinc-500 font-bold uppercase tracking-widest">No blog posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full flex flex-col overflow-hidden group border-white/5 hover:border-indigo-500/30 transition-all">
                  {blog.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {blog.createdAt?.toDate().toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        {blog.author}
                      </div>
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:text-indigo-400 transition-colors">
                      {blog.title}
                    </h2>
                    <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-1">
                      {blog.content}
                    </p>
                    <Link
                      to={`/blog/${blog.id}`}
                      className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors"
                    >
                      Read More
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
