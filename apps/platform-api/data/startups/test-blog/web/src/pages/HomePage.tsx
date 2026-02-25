import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { format } from "date-fns";

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/posts").then(res => {
      setPosts(res.data?.data || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brand-50 text-brand-900">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-brand-900 text-white py-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Elegant Solutions in React & Node.js</h1>
          <p className="text-xl md:text-2xl text-brand-200 max-w-2xl mx-auto">Explore the simplicity of modern web development with React and Node.js.</p>
          <div className="mt-8">
             <span className="text-brand-300">Written by John Smith</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 py-16 w-full">
        <h2 className="text-3xl font-bold mb-10 border-b border-brand-200 pb-4">Latest Writings</h2>
        
        {loading ? (
          <div className="animate-pulse space-y-8">
             {[1,2,3].map(i => (
               <div key={i} className="h-48 bg-brand-200 rounded-lg"></div>
             ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-brand-500 italic">No posts published yet.</div>
        ) : (
          <div className="space-y-12">
            {posts.map(post => (
              <article key={post.id} className="bg-white shadow-md rounded-lg p-8 hover:shadow-lg transition-shadow">
                <Link to={`/post/${post.id}`}>
                  <h3 className="text-2xl font-bold text-brand-900 mb-2 hover:text-brand-600 transition-colors">
                    {post.title || post.name || "Untitled Post"}
                  </h3>
                </Link>
                <div className="text-sm text-brand-500 mb-4 flex items-center gap-2">
                   <span>{post.createdAt ? format(new Date(post.createdAt), 'MMMM dd, yyyy') : "Recently"}</span>
                   <span>•</span>
                   <span>John Smith</span>
                </div>
                <p className="text-brand-700 leading-relaxed mb-6">
                  {(post.content || post.description || "Click to read more...").substring(0, 150)}...
                </p>
                <Link to={`/post/${post.id}`} className="text-brand-600 font-medium hover:text-brand-800 transition-colors inline-flex items-center gap-1">
                  Read more &rarr;
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
