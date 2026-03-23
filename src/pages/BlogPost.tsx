import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, User, Share2 } from "lucide-react";
import { GlassCard } from "../components/UI";

interface Blog {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  createdAt: any;
}

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "blogs", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() } as Blog);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-6">Blog Post Not Found</h1>
        <Link to="/blog" className="text-indigo-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
          <ArrowLeft size={14} /> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <Link to="/blog" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs">
            <ArrowLeft size={14} /> Back to Blog
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-indigo-500 mb-6">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              {blog.createdAt?.toDate().toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <User size={14} />
              {blog.author}
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 leading-[0.9]">
            {blog.title}
          </h1>

          {blog.imageUrl && (
            <div className="relative h-[400px] rounded-3xl overflow-hidden mb-12 border border-white/5">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          <div className="prose prose-invert prose-indigo max-w-none">
            <div className="text-zinc-400 text-lg leading-relaxed whitespace-pre-wrap font-medium">
              {blog.content}
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                <Share2 size={18} />
              </button>
            </div>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
              © 2026 Nexora Newsroom
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
