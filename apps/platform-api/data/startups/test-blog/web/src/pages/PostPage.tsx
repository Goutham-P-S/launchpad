import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/posts/${id}`).then(res => {
      setPost(res.data?.data);
      setLoading(false);
    }).catch(console.error);
  }, [id]);

  if (loading) return <div className="min-h-screen pt-20 text-center">Loading post...</div>;
  if (!post) return <div className="min-h-screen pt-20 text-center">Post not found.</div>;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow max-w-3xl mx-auto px-4 py-16 w-full">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-brand-500 hover:text-brand-800 mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </button>

        <article className="prose prose-brand lg:prose-xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-brand-900 mb-6 leading-tight">
            {post.title || post.name || "Untitled Post"}
          </h1>
          <div className="text-brand-500 mb-10 flex items-center gap-2 border-b border-brand-100 pb-8">
             <span>Published on {post.createdAt ? format(new Date(post.createdAt), 'MMMM dd, yyyy') : "Recently"}</span>
             <span>•</span>
             <span>By John Smith</span>
          </div>
          <div className="text-brand-800 leading-relaxed space-y-6">
            <p>{post.content || post.description || "No content available."}</p>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
