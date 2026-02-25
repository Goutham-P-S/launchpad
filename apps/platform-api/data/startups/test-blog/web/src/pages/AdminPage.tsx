import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!localStorage.getItem('token')) {
       navigate('/login');
       return;
    }
    const token = localStorage.getItem('token');
    api.get("/posts", { headers: { Authorization: `Bearer ${token}` }}).then(res => setItems(res.data?.data || []));
  }, [navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const fieldName1 = "title";
      const fieldName2 = "body";
      await api.post("/posts", { [fieldName1]: title, [fieldName2]: content }, { headers: { Authorization: `Bearer ${token}` }});
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to publish post.");
    }
  };

  const handleDelete = async (id: number) => {
      const token = localStorage.getItem('token');
      await api.delete(`/posts/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      window.location.reload();
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      <Navbar />
      <div className="max-w-5xl mx-auto w-full p-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-brand-900 border-b pb-4">Author Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <form onSubmit={handleCreate} className="bg-white shadow-md rounded-lg p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-4">New Post</h2>
                  <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border p-2 rounded-lg" required />
                  </div>
                  <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Content</label>
                      <textarea value={content} onChange={e=>setContent(e.target.value)} rows={6} className="w-full border p-2 rounded-lg" required />
                  </div>
                  <button type="submit" className="bg-brand-100 text-brand-800 hover:bg-brand-200 rounded-lg px-4 py-2 font-medium transition-colors w-full">Publish Post</button>
                </form>
            </div>
            
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-xl font-bold mb-4">Manage Posts</h2>
                {items.map(item => (
                    <div key={item.id} className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
                        <div>
                           <h3 className="font-bold">{item.title || item.name || "Untitled"}</h3>
                           <p className="text-sm text-brand-500">ID: {item.id}</p>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-medium px-3 py-1 border border-red-200 rounded hover:bg-red-50">Delete</button>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
