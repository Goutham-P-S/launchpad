import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Cpu } from "lucide-react";

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
      navigate("/dashboard");
    } catch {
      alert("Invalid credentials. Use admin@example.com / admin123");
    }
  };

  return (
    <div className="min-h-screen flex text-brand-900 bg-white">
      {/* Left side Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <Cpu className="w-8 h-8 text-brand-600" />
            <span className="text-xl font-bold tracking-tight text-brand-900">DataSync</span>
          </Link>
          
          <h2 className="text-3xl font-extrabold mb-2">Welcome back</h2>
          <p className="text-brand-500 mb-8">Please enter your details to sign in.</p>
          
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1 text-brand-700">Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border border-brand-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" placeholder="name@company.com"/>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-medium text-brand-700">Password</label>
                 <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-800">Forgot password?</a>
              </div>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required className="w-full border border-brand-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" placeholder="••••••••"/>
            </div>
            <button type="submit" className="bg-brand-600 text-white hover:bg-brand-700 rounded-lg px-6 py-3 font-medium transition-colors shadow-md hover:shadow-lg w-full text-center flex justify-center py-3 text-lg">Sign In</button>
          </form>
          
          <p className="mt-8 text-center text-brand-600">
            Don't have an account? <Link to="/register" className="font-semibold hover:text-brand-900">Sign up</Link>
          </p>
        </div>
      </div>
      
      {/* Right side Illustration */}
      <div className="hidden lg:flex w-1/2 bg-brand-900 items-center justify-center p-12 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-brand-800 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)', backgroundSize: '40px 40px'}}></div>
         <div className="max-w-lg z-10">
            <h3 className="text-4xl font-bold mb-6">Sync Your Data Automatically.</h3>
            <p className="text-xl text-brand-300">Connect all your tools in minutes and never manually export CSVs again.</p>
         </div>
      </div>
    </div>
  );
}
