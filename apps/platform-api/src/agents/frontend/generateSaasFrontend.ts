import fs from "fs";
import path from "path";

function writeFile(dir: string, file: string, content: string) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), content.trim() + "\n");
}

export function generateSaasFrontend(webPath: string, backendPlan: any, frontendConfig: any) {
  fs.mkdirSync(webPath, { recursive: true });

  const srcPath = path.join(webPath, "src");
  const pagesPath = path.join(srcPath, "pages");
  const componentsPath = path.join(srcPath, "components");
  const apiPath = path.join(srcPath, "api");
  const contextPath = path.join(srcPath, "context");

  const primaryEntity = backendPlan?.entities?.find((e: any) =>
    ['project', 'campaign', 'team', 'document', 'asset', 'task'].includes(e.name.toLowerCase())
  ) || backendPlan?.entities?.[0] || { name: "Project" };

  const entityName = primaryEntity.name;
  const lowerName = entityName.toLowerCase();
  const endpoint = `/${lowerName.endsWith('s') ? lowerName : lowerName + 's'}`;

  writeFile(webPath, "index.html", `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${frontendConfig?.appName || 'SaaS App'}</title>
    <link href="https://fonts.googleapis.com/css2?family=${(frontendConfig?.fontFamily || 'Inter').replace(/ /g, '+')}:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body class="bg-gray-50 text-gray-900 font-sans antialiased" style="font-family: '${frontendConfig?.fontFamily || 'Inter'}', sans-serif;">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

  writeFile(webPath, "package.json", `
{
  "name": "startup-web-saas",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0 --port 3000",
    "build": "vite build",
    "preview": "vite preview --host --port 3000"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.0",
    "axios": "^1.6.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.35",
    "autoprefixer": "^10.4.17"
  }
}
`);

  writeFile(webPath, "postcss.config.js", `
export default { plugins: { tailwindcss: {}, autoprefixer: {} } }
`);

  writeFile(apiPath, "client.ts", `
import axios from "axios";
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
export const api = axios.create({ baseURL });
`);

  writeFile(srcPath, "App.tsx", `
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
`);

  writeFile(srcPath, "main.tsx", `
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

  writeFile(webPath, "vite.config.ts", `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['web', 'localhost', 'host.docker.internal', '0.0.0.0']
  }
});
`);

  writeFile(srcPath, "index.css", `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-brand-50 text-brand-900;
  }
}
`);

  const tsconfigContent = {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  };

  writeFile(webPath, "tsconfig.json", JSON.stringify(tsconfigContent, null, 2));

  writeFile(webPath, "tsconfig.node.json", JSON.stringify({
    "compilerOptions": {
      "composite": true,
      "skipLibCheck": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true
    },
    "include": ["vite.config.ts"]
  }, null, 2));

  writeFile(webPath, "tailwind.config.js", `
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: ${JSON.stringify(frontendConfig?.brandColors || {})}
      },
      fontFamily: {
        sans: ['"${frontendConfig?.fontFamily || 'Inter'}"', 'sans-serif'],
      },
      borderRadius: {
        'theme': 'var(--radius)',
      }
    },
  },
  plugins: [],
}
`);

  writeFile(contextPath, "AuthContext.tsx", `
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  user: any;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser({ token }); // Simplified
  }, []);

  const login = (token: string, u: any) => {
    localStorage.setItem("token", token);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
`);

  const roundedClass = frontendConfig?.borderRadius === 'full' ? 'rounded-full' :
    frontendConfig?.borderRadius === 'none' ? 'rounded-none' :
      `rounded-${frontendConfig?.borderRadius || 'md'}`;

  const buttonClasses = frontendConfig?.buttonStyle === 'outline'
    ? `border-2 border-brand-600 text-brand-600 hover:bg-brand-50 ${roundedClass} px-6 py-3 font-medium transition-colors`
    : frontendConfig?.buttonStyle === 'soft'
      ? `bg-brand-100 text-brand-800 hover:bg-brand-200 ${roundedClass} px-6 py-3 font-medium transition-colors`
      : `bg-brand-600 text-white hover:bg-brand-700 ${roundedClass} px-6 py-3 font-medium transition-colors shadow-md hover:shadow-lg`;

  const secondaryButtonClasses = `bg-white text-brand-700 hover:bg-brand-50 border border-brand-200 ${roundedClass} px-6 py-3 font-medium transition-colors`;

  const containerClasses = frontendConfig?.containerStyle === 'glass'
    ? `bg-white/70 backdrop-blur-md border border-white/20 shadow-xl ${roundedClass}`
    : frontendConfig?.containerStyle === 'bordered'
      ? `bg-white border border-brand-200 shadow-sm ${roundedClass}`
      : frontendConfig?.containerStyle === 'flat'
        ? `bg-brand-50 ${roundedClass}`
        : `bg-white shadow-lg ${roundedClass}`;

  // Navbar
  writeFile(componentsPath, "Navbar.tsx", `
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
            <span className="text-xl font-bold tracking-tight text-brand-900">${frontendConfig.appName}</span>
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
                <Link to="/register" className="${buttonClasses} !px-4 !py-2 !text-sm ml-2 hidden sm:block">
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
`);

  // Footer
  writeFile(componentsPath, "Footer.tsx", `
import { Cpu } from "lucide-react";
export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div className="col-span-2">
           <div className="flex items-center gap-2 mb-4">
             <Cpu className="w-6 h-6 text-brand-400" />
             <span className="text-xl font-bold tracking-tight">${frontendConfig.appName}</span>
           </div>
           <p className="text-brand-300 max-w-sm">The best software for modern teams focused on hyper-growth and efficiency.</p>
        </div>
        <div>
           <h4 className="font-bold mb-4 border-b border-brand-800 pb-2">Product</h4>
           <ul className="space-y-2 text-brand-300">
             <li><a href="#features" className="hover:text-white transition">Features</a></li>
             <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
             <li><a href="#" className="hover:text-white transition">Integrations</a></li>
           </ul>
        </div>
        <div>
           <h4 className="font-bold mb-4 border-b border-brand-800 pb-2">Company</h4>
           <ul className="space-y-2 text-brand-300">
             <li><a href="#" className="hover:text-white transition">About Us</a></li>
             <li><a href="#" className="hover:text-white transition">Careers</a></li>
             <li><a href="#" className="hover:text-white transition">Contact</a></li>
           </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-brand-800 text-center text-brand-400 text-sm">
        &copy; {new Date().getFullYear()} ${frontendConfig.appName}. All rights reserved.
      </div>
    </footer>
  );
}
`);

  // LandingPage
  writeFile(pagesPath, "LandingPage.tsx", `
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle2, ArrowRight, Zap, Target, Shield } from "lucide-react";

export default function LandingPage() {
  const rawFeatures = ${JSON.stringify(frontendConfig.features || ["Fast Setup", "Secure", "Reliable"])};
  const FeatureIcons = [Zap, Target, Shield];

  return (
    <div className="min-h-screen flex flex-col bg-brand-50 text-brand-900 overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 lg:py-32 px-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 -left-40 w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-brand-600"></span>
            New Features Available
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-brand-900 leading-tight">
            ${frontendConfig.heroHeadline}
          </h1>
          <p className="text-xl md:text-2xl text-brand-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            ${frontendConfig.heroSubheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to="/register" className="${buttonClasses} flex items-center justify-center gap-2 text-lg">
                Start Free Trial <ArrowRight className="w-5 h-5" />
             </Link>
             <a href="#features" className="${secondaryButtonClasses} flex items-center justify-center text-lg hidden sm:flex">
                Take the Tour
             </a>
          </div>
          <p className="mt-6 text-sm text-brand-500">No credit card required • 14-day free trial</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white px-4">
        <div className="max-w-6xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-900 mb-4">Everything you need to succeed</h2>
              <p className="text-xl text-brand-600 max-w-2xl mx-auto">We built ${frontendConfig.appName} from the ground up to handle your most demanding workflows.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              {rawFeatures.map((f, i) => {
                 const Icon = FeatureIcons[i % 3] || Zap;
                 return (
                   <div key={i} className="${containerClasses} p-8 hover:-translate-y-1 transition-transform duration-300">
                      <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600 mb-6">
                         <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-brand-900">{f}</h3>
                      <p className="text-brand-600 leading-relaxed">Experience uncompromised performance and reliability tailored specifically for your use case.</p>
                   </div>
                 );
              })}
           </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-brand-50">
        <div className="max-w-5xl mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-900 mb-4">Simple, transparent pricing</h2>
              <p className="text-xl text-brand-600">No hidden fees. Cancel anytime.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
             {/* Tier 1 */}
             <div className="${containerClasses} p-8 border border-brand-200">
               <h3 className="text-2xl font-bold text-brand-900 mb-2">${frontendConfig.pricing?.tier1?.name || 'Starter'}</h3>
               <p className="text-brand-600 mb-6">${frontendConfig.pricing?.tier1?.description || 'Perfect for small teams.'}</p>
               <div className="mb-8">
                 <span className="text-5xl font-extrabold text-brand-900">${frontendConfig.pricing?.tier1?.price || '$12'}</span><span className="text-brand-500 font-medium">/mo</span>
               </div>
               <Link to="/register" className="${buttonClasses} w-full block text-center mb-8">Get Started</Link>
               <ul className="space-y-4">
                 {[1,2,3].map(i => (
                   <li key={i} className="flex items-center gap-3 text-brand-700">
                     <CheckCircle2 className="w-5 h-5 text-brand-500" />
                     <span>Core feature inclusion #{i}</span>
                   </li>
                 ))}
               </ul>
             </div>

             {/* Tier 2 */}
             <div className="${containerClasses} p-8 border-2 border-brand-500 relative transform md:-translate-y-4 shadow-xl">
               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
                  MOST POPULAR
               </div>
               <h3 className="text-2xl font-bold text-brand-900 mb-2">${frontendConfig.pricing?.tier2?.name || 'Pro'}</h3>
               <p className="text-brand-600 mb-6">${frontendConfig.pricing?.tier2?.description || 'For scaling businesses.'}</p>
               <div className="mb-8">
                 <span className="text-5xl font-extrabold text-brand-900">${frontendConfig.pricing?.tier2?.price || '$49'}</span><span className="text-brand-500 font-medium">/mo</span>
               </div>
               <Link to="/register" className="${buttonClasses} w-full block text-center mb-8">Start Free Trial</Link>
               <ul className="space-y-4">
                 {[1,2,3,4,5].map(i => (
                   <li key={i} className="flex items-center gap-3 text-brand-700">
                     <CheckCircle2 className="w-5 h-5 text-brand-500" />
                     <span>Advanced feature inclusion #{i}</span>
                   </li>
                 ))}
               </ul>
             </div>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
`);

  // LoginPage
  writeFile(pagesPath, "LoginPage.tsx", `
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
            <span className="text-xl font-bold tracking-tight text-brand-900">${frontendConfig.appName}</span>
          </Link>
          
          <h2 className="text-3xl font-extrabold mb-2">Welcome back</h2>
          <p className="text-brand-500 mb-8">Please enter your details to sign in.</p>
          
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1 text-brand-700">Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border border-brand-300 ${roundedClass} p-3 focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" placeholder="name@company.com"/>
            </div>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1">
                 <label className="block text-sm font-medium text-brand-700">Password</label>
                 <a href="#" className="text-sm font-medium text-brand-600 hover:text-brand-800">Forgot password?</a>
              </div>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required className="w-full border border-brand-300 ${roundedClass} p-3 focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" placeholder="••••••••"/>
            </div>
            <button type="submit" className="${buttonClasses} w-full text-center flex justify-center py-3 text-lg">Sign In</button>
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
            <h3 className="text-4xl font-bold mb-6">${frontendConfig.heroHeadline}</h3>
            <p className="text-xl text-brand-300">${frontendConfig.heroSubheadline}</p>
         </div>
      </div>
    </div>
  );
}
`);

  // RegisterPage (Re-used Login Layout)
  writeFile(pagesPath, "RegisterPage.tsx", `
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
            <span className="text-xl font-bold tracking-tight text-brand-900">${frontendConfig.appName}</span>
          </Link>
          
          <h2 className="text-3xl font-extrabold mb-2">Create an account</h2>
          <p className="text-brand-500 mb-8">Start your 14-day free trial today.</p>
          
          <form onSubmit={handleReg}>
            <div className="mb-5">
              <label className="block text-sm font-medium mb-1 text-brand-700">Email address</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border border-brand-300 ${roundedClass} p-3 focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" placeholder="name@company.com"/>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1 text-brand-700">Password</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required className="w-full border border-brand-300 ${roundedClass} p-3 focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" placeholder="Create a secure password"/>
            </div>
            <button type="submit" className="${buttonClasses} w-full py-3 text-lg">Sign Up</button>
          </form>
          
          <p className="mt-8 text-center text-brand-600">
            Already have an account? <Link to="/login" className="font-semibold hover:text-brand-900">Sign in</Link>
          </p>
        </div>
      </div>
      
      <div className="hidden lg:flex w-1/2 bg-brand-50 items-center justify-center p-12 relative overflow-hidden">
         <div className="${containerClasses} p-12 max-w-lg z-10 border border-brand-200">
            <h3 className="text-2xl font-bold mb-4">"The best decision we made for our team's productivity."</h3>
            <p className="text-brand-600 font-medium">— Sarah J., Product Manager</p>
         </div>
      </div>
    </div>
  );
}
`);

  // DashboardPage
  writeFile(pagesPath, "DashboardPage.tsx", `
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
    api.get("${endpoint}", { headers: { Authorization: \`Bearer \${token}\` }}).then(res => setItems(res.data?.data || []));
  }, [navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const fieldName1 = "${primaryEntity.fields[1]?.name || 'name'}";
      const fieldName2 = "${primaryEntity.fields[2]?.name || 'description'}";
      await api.post("${endpoint}", { [fieldName1]: name, [fieldName2]: description }, { headers: { Authorization: \`Bearer \${token}\` }});
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to create entity.");
    }
  };

  const handleDelete = async (id: number) => {
      const token = localStorage.getItem('token');
      await api.delete(\`${endpoint}/\${id}\`, { headers: { Authorization: \`Bearer \${token}\` }});
      window.location.reload();
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-50">
      <Navbar />
      
      <div className="flex-grow flex max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-brand-200 p-6 hidden md:block">
           <div className="space-y-1">
             <button onClick={() => setActiveTab('overview')} className={\`w-full flex items-center gap-3 px-4 py-3 \${activeTab === 'overview' ? 'bg-brand-100 text-brand-700' : 'text-brand-600 hover:bg-brand-50'} \${roundedClass} text-left font-medium\`}>
                <BarChart className="w-5 h-5" /> Overview
             </button>
             <button onClick={() => setActiveTab('entities')} className={\`w-full flex items-center gap-3 px-4 py-3 \${activeTab === 'entities' ? 'bg-brand-100 text-brand-700' : 'text-brand-600 hover:bg-brand-50'} \${roundedClass} text-left font-medium\`}>
                <List className="w-5 h-5" /> ${entityName}s
             </button>
             <button className="w-full flex items-center gap-3 px-4 py-3 text-left font-medium text-brand-600 hover:bg-brand-50 ${roundedClass}">
                <Settings className="w-5 h-5" /> Settings
             </button>
           </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-10">
          <header className="mb-10 flex justify-between items-end">
             <div>
               <h1 className="text-3xl font-bold text-brand-900 mb-2">Welcome to your Dashboard</h1>
               <p className="text-brand-600">Here's what's happening with your ${entityName}s today.</p>
             </div>
             {activeTab === 'entities' && (
                <button onClick={() => document.getElementById('createForm')?.scrollIntoView({behavior: 'smooth'})} className="${buttonClasses} flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New ${entityName}
                </button>
             )}
          </header>

          {activeTab === 'overview' && (
             <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="${containerClasses} p-6 border border-brand-100">
                    <h3 className="text-brand-500 font-medium mb-2">Total ${entityName}s</h3>
                    <div className="text-4xl font-extrabold text-brand-900">{items.length}</div>
                </div>
                <div className="${containerClasses} p-6 border border-brand-100">
                    <h3 className="text-brand-500 font-medium mb-2">Active Users</h3>
                    <div className="text-4xl font-extrabold text-brand-900">1</div>
                </div>
                <div className="${containerClasses} p-6 border border-brand-100">
                    <h3 className="text-brand-500 font-medium mb-2">System Status</h3>
                    <div className="text-xl font-bold text-green-600 flex items-center gap-2 mt-2"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div> Operational</div>
                </div>
             </div>
          )}

          {/* Manage Entities */}
          <div className="${containerClasses} border border-brand-200 overflow-hidden mb-10">
            <div className="px-6 py-4 border-b border-brand-100 bg-white flex justify-between items-center">
               <h3 className="text-lg font-bold text-brand-900">Recent ${entityName}s</h3>
            </div>
            {items.length === 0 ? (
               <div className="p-10 text-center text-brand-500 border-t border-brand-100">No ${lowerName}s found. Create one to get started.</div>
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
          <div id="createForm" className="${containerClasses} border border-brand-200 p-8 max-w-2xl">
             <h3 className="text-xl font-bold text-brand-900 mb-6">Create New ${entityName}</h3>
             <form onSubmit={handleCreate} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-2 text-brand-700">Display Name / Title</label>
                    <input value={name} onChange={e=>setName(e.target.value)} className="w-full border border-brand-300 p-3 ${roundedClass} focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2 text-brand-700">Description details</label>
                    <textarea value={description} onChange={e=>setDescription(e.target.value)} rows={4} className="w-full border border-brand-300 p-3 ${roundedClass} focus:ring-2 focus:ring-brand-500 outline-none transition-shadow" />
                </div>
                <button type="submit" className="${buttonClasses}">Create ${entityName}</button>
             </form>
          </div>

        </main>
      </div>
    </div>
  );
}
`);

  console.log("✅ SaaS frontend scaffolding complete!");
}
