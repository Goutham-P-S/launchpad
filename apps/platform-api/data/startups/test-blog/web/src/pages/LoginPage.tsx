import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password: pass });
      login(res.data.data.token, res.data.data.user);
      navigate("/admin");
    } catch {
      alert("Invalid credentials. Use admin@example.com / admin123");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl text-center font-bold mb-6 text-brand-900">John Smith's Admin</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-brand-700">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border border-brand-300 rounded-lg p-2 focus:ring focus:ring-brand-200 outline-none" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-brand-700">Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required className="w-full border border-brand-300 rounded-lg p-2 focus:ring focus:ring-brand-200 outline-none" />
          </div>
          <button type="submit" className="bg-brand-100 text-brand-800 hover:bg-brand-200 rounded-lg px-4 py-2 font-medium transition-colors w-full">Sign In to Dashboard</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
