import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { Plus, List, Settings, BarChart } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!localStorage.getItem('token')) {
       navigate('/login');
       return;
    }
    const token = localStorage.getItem('token');
    api.get("/customers", { headers: { Authorization: `Bearer ${token}` }}).then(res => setItems(res.data?.data || []));
  }, [navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const fieldName1 = "companyName";
      const fieldName2 = "contactEmail";
      await api.post("/customers", { [fieldName1]: name, [fieldName2]: description }, { headers: { Authorization: `Bearer ${token}` }});
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to create entity.");
    }
  };

  const handleDelete = async (id: number) => {
      const token = localStorage.getItem('token');
      await api.delete(`/customers/${id}`, { headers: { Authorization: `Bearer ${token}` }});
      window.location.reload();
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      <Navbar />
      
      <div className="flex-grow flex max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-brand-200 p-6 hidden md:block">
           <div className="space-y-1">
             <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 ${activeTab === 'overview' ? 'bg-brand-100 text-brand-700' : 'text-brand-600 hover:bg-brand-50'} ${roundedClass} text-left font-medium`}>
                <BarChart className="w-5 h-5" /> Overview
             </button>
             <button onClick={() => setActiveTab('entities')} className={`w-full flex items-center gap-3 px-4 py-3 ${activeTab === 'entities' ? 'bg-brand-100 text-brand-700' : 'text-brand-600 hover:bg-brand-50'} ${roundedClass} text-left font-medium`}>
                <List className="w-5 h-5" /> Customers
             </button>
             <button className="w-full flex items-center gap-3 px-4 py-3 text-left font-medium text-brand-600 hover:bg-brand-50 rounded-lg">
                <Settings className="w-5 h-5" /> Settings
             </button>
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
          <header className="mb-10 flex justify-between items-end">
             <div>
               <h1 className="text-3xl font-bold text-brand-900 mb-2">Welcome to your Dashboard</h1>
               <p className="text-brand-600">Here's what's happening with your Customers today.</p>
             </div>
             {activeTab === 'entities' && (
                <button onClick={() => document.getElementById('createForm')?.scrollIntoView({behavior: 'smooth'})} className="bg-brand-600 text-white hover:bg-brand-700 rounded-lg px-6 py-3 font-medium transition-colors shadow-md hover:shadow-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Customer
                </button>
             )}
          </header>

          {activeTab === 'overview' && (
             <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-6 border border-brand-100">
                    <h3 className="text-brand-500 font-medium mb-2">Total Customers</h3>
                    <div className="text-4xl font-extrabold text-brand-900">{items.length}</div>
                </div>
                <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-6 border border-brand-100">
                    <h3 className="text-brand-500 font-medium mb-2">Active Users</h3>
                    <div className="text-4xl font-extrabold text-brand-900">1</div>
                </div>
                <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-6 border border-brand-100">
                    <h3 className="text-brand-500 font-medium mb-2">System Status</h3>
                    <div className="text-xl font-bold text-green-600 flex items-center gap-2 mt-2"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div> Operational</div>
                </div>
             </div>
          )}

          {/* Manage Entities */}
          <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg border border-brand-200 overflow-hidden mb-10">
            <div className="px-6 py-4 border-b border-brand-100 bg-white flex justify-between items-center">
               <h3 className="text-lg font-bold text-brand-900">Recent Customers</h3>
            </div>
            {items.length === 0 ? (
               <div className="p-10 text-center text-brand-500 border-t border-brand-100">No customers found. Create one to get started.</div>
            ) : (
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-brand-50 text-brand-600 text-sm border-b border-brand-100">
                     <th className="px-6 py-3 font-medium">ID</th>
                     <th className="px-6 py-3 font-medium">Name</th>
                     <th className="px-6 py-3 font-medium">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                   {items.map(item => (
                     <tr key={item.id} className="border-b border-brand-100 bg-white hover:bg-brand-50 transition-colors">
                       <td className="px-6 py-4 text-brand-500">#{item.id}</td>
                       <td className="px-6 py-4 font-medium text-brand-900">{item.name || item.title || "Untitled"}</td>
                       <td className="px-6 py-4">
                          <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-medium text-sm">Delete</button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            )}
          </div>

          {/* Create Form */}
          <div id="createForm" className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg border border-brand-200 p-8 max-w-2xl">
             <h3 className="text-xl font-bold text-brand-900 mb-6">Create New Customer</h3>
             <form onSubmit={handleCreate} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2 text-brand-700">Display Name / Title</label>
                    <input value={name} onChange={e=>setName(e.target.value)} className="w-full border border-brand-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-brand-700">Description details</label>
                    <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} className="w-full border border-brand-300 p-3 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" />
                </div>
                <button type="submit" className="bg-brand-600 text-white hover:bg-brand-700 rounded-lg px-6 py-3 font-medium transition-colors shadow-md hover:shadow-lg">Create Customer</button>
             </form>
          </div>

        </main>
      </div>
    </div>
  );
}
