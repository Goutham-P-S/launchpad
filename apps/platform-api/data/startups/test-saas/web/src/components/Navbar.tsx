import { Cpu, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="bg-white/90 backdrop-blur border-b border-brand-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <Cpu className="w-8 h-8 text-brand-600" />
            <span className="text-xl font-bold tracking-tight text-brand-900">DataSync</span>
          </Link>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-brand-600 font-medium hover:text-brand-900 hidden sm:block">Features</a>
            <a href="#pricing" className="text-brand-600 font-medium hover:text-brand-900 hidden sm:block">Pricing</a>
            {user ? (
              <>
                <Link to="/dashboard" className="text-brand-600 font-medium hover:text-brand-800 transition">Dashboard</Link>
                <button onClick={logout} className="text-brand-500 hover:text-brand-700">Logout</button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-brand-600 font-medium hover:text-brand-800 transition flex items-center gap-1">
                   <LogIn className="w-4 h-4" /> Log In
                </Link>
                <Link to="/register" className="bg-brand-600 text-white hover:bg-brand-700 rounded-lg px-6 py-3 font-medium transition-colors shadow-md hover:shadow-lg !px-4 !py-2 !text-sm ml-2 hidden sm:block">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
