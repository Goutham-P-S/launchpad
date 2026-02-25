import { BookOpen, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="bg-white border-b border-brand-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-brand-600" />
            <span className="text-xl font-bold tracking-tight text-brand-900">Minimalist Dev Log</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/admin" className="text-brand-600 font-medium hover:text-brand-800 transition">Write Post</Link>
                <button onClick={logout} className="text-brand-500 hover:text-brand-700">Logout</button>
              </>
            ) : (
              <Link to="/login" className="flex items-center gap-1 text-brand-600 font-medium hover:text-brand-800 transition">
                <User className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
