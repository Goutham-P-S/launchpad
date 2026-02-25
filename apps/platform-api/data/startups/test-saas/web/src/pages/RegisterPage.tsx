import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { Cpu } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleReg = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { email, password: pass });
      navigate("/login");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex text-brand-900 bg-white">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <Link to="/" className="flex items-center gap-2 mb-12">
            <Cpu className="w-8 h-8 text-brand-600" />
            <span className="text-xl font-bold tracking-tight text-brand-900">DataSync</span>
          </Link>
          
          <h2 className="text-3xl font-extrabold mb-2">Create an account</h2>
          <p className="text-brand-500 mb-8">Start your 14-day free trial today.</p>
          
          <form onSubmit={handleReg}>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1 text-brand-700">Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border border-brand-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" placeholder="name@company.com"/>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1 text-brand-700">Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required className="w-full border border-brand-300 rounded-lg p-3 focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" placeholder="Create a secure password"/>
            </div>
            <button type="submit" className="bg-brand-600 text-white hover:bg-brand-700 rounded-lg px-6 py-3 font-medium transition-colors shadow-md hover:shadow-lg w-full py-3 text-lg">Sign Up</button>
          </form>
          
          <p className="mt-8 text-center text-brand-600">
            Already have an account? <Link to="/login" className="font-semibold hover:text-brand-900">Sign in</Link>
          </p>
        </div>
      </div>
      
      <div className="hidden lg:flex w-1/2 bg-brand-50 items-center justify-center p-12 relative overflow-hidden">
         <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-12 max-w-lg z-10 border border-brand-200">
            <h3 className="text-2xl font-bold mb-4">"The best decision we made for our team's productivity."</h3>
            <p className="text-brand-600 font-medium">— Sarah J., Product Manager</p>
         </div>
      </div>
    </div>
  );
}
