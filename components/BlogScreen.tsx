
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, Calendar, ChevronRight, Share2, 
  Bookmark, User, Tag, Search, ArrowUpRight, ArrowRight
} from 'lucide-react';
import { BLOG_POSTS, BlogPost } from '../data/BlogPosts';

interface BlogScreenProps {
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const BlogScreen: React.FC<BlogScreenProps> = ({ onBack, onNavigate }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [selectedPost]);

  const filteredPosts = BLOG_POSTS.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const heroPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <div className="min-h-screen bg-[#F7F8FA] pt-24 pb-20 font-sans" ref={scrollRef}>
      
      {/* NAVBAR OVERLAY */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => selectedPost ? setSelectedPost(null) : onBack()}
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-[#0E1A2B] hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          {selectedPost && (
             <motion.span 
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="text-sm font-bold text-[#0E1A2B] hidden md:block"
             >
               Back to Articles
             </motion.span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
           {!selectedPost && (
             <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#0E1A2B] placeholder:text-slate-400 focus:outline-none focus:border-teal-500 w-64 transition-all"
                />
             </div>
           )}
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">HairVis Knowledge</span>
           </div>
        </div>
      </nav>

      <AnimatePresence mode="wait">
        {selectedPost ? (
          <BlogPostView post={selectedPost} key="post" />
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-6"
          >
            {/* HERO SECTION */}
            {!searchQuery && heroPost && (
              <div 
                onClick={() => setSelectedPost(heroPost)}
                className="group relative w-full aspect-[4/3] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden cursor-pointer mb-12 shadow-2xl shadow-teal-900/10"
              >
                <img 
                  src={heroPost.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  alt={heroPost.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1A2B] via-[#0E1A2B]/40 to-transparent opacity-90" />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 flex flex-col items-start gap-4 md:gap-6">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                      {heroPost.category}
                   </div>
                   <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.1] max-w-4xl group-hover:text-teal-50 transition-colors">
                      {heroPost.title}
                   </h1>
                   <p className="text-slate-300 text-sm md:text-lg max-w-2xl line-clamp-2 md:line-clamp-3 font-light leading-relaxed">
                      {heroPost.excerpt}
                   </p>
                   
                   <div className="flex items-center gap-6 mt-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                            <User size={16} />
                         </div>
                         <div className="text-white">
                            <div className="text-xs font-bold">{heroPost.author}</div>
                            <div className="text-[10px] text-teal-400 font-medium uppercase tracking-wider">{heroPost.role}</div>
                         </div>
                      </div>
                      <div className="h-8 w-px bg-white/20" />
                      <div className="flex items-center gap-2 text-slate-300 text-xs font-medium">
                         <Clock size={14} /> {heroPost.readTime}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* GRID SECTION */}
            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#0E1A2B] tracking-tight">Latest Articles</h2>
                <div className="flex gap-2">
                   {['All', 'Medical', 'Tech', 'Guide'].map(tag => (
                      <button key={tag} className="px-4 py-1.5 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-[#0E1A2B] hover:text-white hover:border-[#0E1A2B] transition-all">
                         {tag}
                      </button>
                   ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {gridPosts.map((post) => (
                  <motion.div 
                    key={post.id}
                    layoutId={`card-${post.id}`}
                    onClick={() => setSelectedPost(post)}
                    className="group bg-white rounded-[2rem] border border-slate-100 overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-teal-900/5 transition-all flex flex-col h-full"
                  >
                     <div className="aspect-[4/3] overflow-hidden relative">
                        <img 
                           src={post.image} 
                           alt={post.title} 
                           className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute top-4 left-4">
                           <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-[#0E1A2B] shadow-sm">
                              {post.category}
                           </span>
                        </div>
                     </div>
                     <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                           <Calendar size={12} /> {post.date}
                        </div>
                        <h3 className="text-xl font-black text-[#0E1A2B] leading-tight mb-3 group-hover:text-teal-600 transition-colors">
                           {post.title}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3 mb-6">
                           {post.excerpt}
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                           <div className="flex items-center gap-2 text-xs font-bold text-[#0E1A2B]">
                              <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                 <User size={12} />
                              </span>
                              {post.author}
                           </div>
                           <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              {post.readTime} <ArrowRight size={12} />
                           </div>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BlogPostView = ({ post }: { post: BlogPost }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="max-w-4xl mx-auto px-6"
    >
       <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-100">
             {post.category}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#0E1A2B] tracking-tight leading-[1.1]">
             {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                   <User size={32} className="mt-2 text-slate-400" />
                </div>
                <div className="text-left">
                   <div className="font-bold text-[#0E1A2B] leading-none">{post.author}</div>
                   <div className="text-[10px] font-bold uppercase tracking-wider text-teal-600">{post.role}</div>
                </div>
             </div>
             <span className="w-1 h-1 bg-slate-300 rounded-full" />
             <div>{post.date}</div>
             <span className="w-1 h-1 bg-slate-300 rounded-full" />
             <div className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</div>
          </div>
       </div>

       <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-12 shadow-2xl relative">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
       </div>

       <div className="max-w-2xl mx-auto">
          {/* CONTENT BODY */}
          <div 
            className="prose prose-lg prose-slate prose-headings:font-black prose-headings:text-[#0E1A2B] prose-p:text-slate-600 prose-p:font-light prose-p:leading-loose prose-a:text-teal-600 prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* TAGS & SHARE */}
          <div className="mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
             <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                   <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1">
                      <Tag size={12} /> {tag}
                   </span>
                ))}
             </div>
             <div className="flex gap-2">
                <button className="p-3 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[#0E1A2B] hover:border-[#0E1A2B] transition-colors">
                   <Bookmark size={18} />
                </button>
                <button className="p-3 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-[#0E1A2B] hover:border-[#0E1A2B] transition-colors">
                   <Share2 size={18} />
                </button>
             </div>
          </div>
          
          {/* CTA */}
          <div className="mt-16 bg-[#0E1A2B] rounded-[2rem] p-8 md:p-12 text-center text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]" />
             <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-black">Curious about your own case?</h3>
                <p className="text-slate-400 font-light max-w-md mx-auto">
                   Get a free AI analysis and personalized estimate based on the medical standards discussed in this article.
                </p>
                <button className="px-8 py-4 bg-white text-[#0E1A2B] rounded-xl font-black uppercase tracking-widest text-xs hover:bg-teal-500 hover:text-white transition-all">
                   Start Free Analysis
                </button>
             </div>
          </div>
       </div>
    </motion.div>
  );
};

export default BlogScreen;
