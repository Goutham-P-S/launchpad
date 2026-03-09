import fs from "fs";
import path from "path";

function writeFile(dir: string, file: string, content: string) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), content.trim() + "\n");
}

export function generateBlogFrontend(webPath: string, backendPlan: any, frontendConfig: any) {
  fs.mkdirSync(webPath, { recursive: true });

  const srcPath = path.join(webPath, "src");
  const pagesPath = path.join(srcPath, "pages");
  const componentsPath = path.join(srcPath, "components");
  const apiPath = path.join(srcPath, "api");
  const contextPath = path.join(srcPath, "context");

  const primaryEntity = backendPlan?.entities?.find((e: any) =>
    ['post', 'article', 'blog'].includes(e.name.toLowerCase())
  ) || backendPlan?.entities?.[0] || { name: "Post" };

  const entityName = primaryEntity.name;
  const lowerName = entityName.toLowerCase();
  const endpoint = `/${lowerName.endsWith('s') ? lowerName : lowerName + 's'}`;

  const layoutVariant = Math.floor(Math.random() * 3) + 1;

  const getHeroSection = () => {
    if (layoutVariant === 1) {
      return `
      {/* Hero Section V1 - Centered Minimal */}
      <div className="bg-brand-900 text-white py-24 text-center px-4">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight">${frontendConfig.heroHeadline}</h1>
          <p className="text-xl md:text-2xl text-brand-200 max-w-2xl mx-auto font-light leading-relaxed">${frontendConfig.heroSubheadline}</p>
          <div className="mt-10 flex items-center justify-center gap-3">
             <div className="w-10 h-10 bg-brand-700 rounded-full flex items-center justify-center font-bold text-lg">${frontendConfig.authorName?.charAt(0) || 'A'}</div>
             <span className="text-brand-100 font-medium">Written by ${frontendConfig.authorName}</span>
          </div>
        </div>
      </div>
      `;
    } else if (layoutVariant === 2) {
      return `
      {/* Hero Section V2 - Left Aligned Typography */}
      <div className="bg-brand-50 border-b border-brand-200 py-32 px-4 relative overflow-hidden">
         <div className="absolute -right-20 -top-20 w-96 h-96 bg-brand-200 rounded-full blur-3xl opacity-50"></div>
         <div className="max-w-5xl mx-auto relative z-10 animate-slide-right">
            <span className="text-brand-600 font-bold tracking-widest uppercase mb-4 block text-sm">The Official Blog</span>
            <h1 className="text-6xl md:text-8xl font-black mb-8 text-brand-900 tracking-tighter leading-none">
              ${frontendConfig.heroHeadline}
            </h1>
            <p className="text-2xl text-brand-600 max-w-2xl leading-relaxed mb-10 font-medium tracking-tight">
              ${frontendConfig.heroSubheadline}
            </p>
            <div className="flex items-center gap-4 bg-white p-4 rounded-full shadow-sm border border-brand-100 max-w-fit pr-8">
               <div className="w-14 h-14 bg-brand-200 rounded-full flex items-center justify-center text-brand-700 font-bold text-2xl shadow-inner">
                  ${frontendConfig.authorName?.charAt(0) || 'A'}
               </div>
               <div>
                  <p className="font-bold text-brand-900 leading-none mb-1">${frontendConfig.authorName}</p>
                  <p className="text-sm text-brand-500 leading-none">Editor in Chief</p>
               </div>
            </div>
         </div>
      </div>
      `;
    } else {
      return `
      {/* Hero Section V3 - Gradient Focus */}
      <div className="bg-gradient-to-br from-brand-800 to-brand-900 text-white py-24 lg:py-32 px-4 relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
            <div className="w-full md:w-2/3 animate-slide-up">
              <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-white text-sm font-bold mb-8 border border-white/20">
                 ✨ New Posts Weekly
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight">
                ${frontendConfig.heroHeadline}
              </h1>
              <p className="text-xl text-brand-100 mb-8 max-w-xl leading-relaxed font-light">
                ${frontendConfig.heroSubheadline}
              </p>
            </div>
            <div className="w-full md:w-1/3 flex justify-center md:justify-end animate-fade-in">
               <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl text-center w-full max-w-sm">
                  <div className="w-24 h-24 bg-gradient-to-tr from-brand-400 to-brand-200 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-black text-brand-900 shadow-inner">
                     ${frontendConfig.authorName?.charAt(0) || 'A'}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">${frontendConfig.authorName}</h3>
                  <p className="text-brand-200 mb-8 font-medium">Author & Creator</p>
                  <button className="w-full py-4 bg-white text-brand-900 font-bold rounded-xl hover:bg-brand-50 hover:scale-105 transition-all shadow-lg active:scale-95">
                     Subscribe
                  </button>
               </div>
            </div>
         </div>
      </div>
      `;
    }
  };

  writeFile(webPath, "index.html", `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${frontendConfig?.blogTitle || 'Dev Blog'}</title>
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
  "name": "startup-web-blog",
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
    "lucide-react": "^0.344.0",
    "date-fns": "^3.0.0"
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
import HomePage from "./pages/HomePage";
import PostPage from "./pages/PostPage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/${lowerName}/:id" element={<PostPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
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
    ? `border-2 border-brand-600 text-brand-600 hover:bg-brand-50 ${roundedClass} px-4 py-2 font-medium transition-colors`
    : frontendConfig?.buttonStyle === 'soft'
      ? `bg-brand-100 text-brand-800 hover:bg-brand-200 ${roundedClass} px-4 py-2 font-medium transition-colors`
      : `bg-brand-600 text-white hover:bg-brand-700 ${roundedClass} px-4 py-2 font-medium transition-colors shadow-sm`;

  const containerClasses = frontendConfig?.containerStyle === 'glass'
    ? `bg-white/70 backdrop-blur-md border border-white/20 shadow-xl ${roundedClass}`
    : frontendConfig?.containerStyle === 'bordered'
      ? `bg-white border text-center border-brand-200 shadow-sm ${roundedClass}`
      : frontendConfig?.containerStyle === 'flat'
        ? `bg-brand-50 ${roundedClass}`
        : `bg-white shadow-md ${roundedClass}`;

  // Navbar
  writeFile(componentsPath, "Navbar.tsx", `
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
            <span className="text-xl font-bold tracking-tight text-brand-900">${frontendConfig.blogTitle}</span>
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
`);

  // Footer
  writeFile(componentsPath, "Footer.tsx", `
export default function Footer() {
  return (
    <footer className="bg-white border-t border-brand-100 mt-20 py-12">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-brand-500">&copy; {new Date().getFullYear()} ${frontendConfig.blogTitle}. All rights reserved.</p>
      </div>
    </footer>
  );
}
`);

  // HomePage
  writeFile(pagesPath, "HomePage.tsx", `
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
    api.get("${endpoint}").then(res => {
      setPosts(res.data?.data || []);
      setLoading(false);
    }).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-brand-50 text-brand-900">
      <Navbar />
      
      ${getHeroSection()}

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
              <article key={post.id} className="${containerClasses} p-8 hover:shadow-lg transition-shadow">
                <Link to={\`/${lowerName}/\${post.id}\`}>
                  <h3 className="text-2xl font-bold text-brand-900 mb-2 hover:text-brand-600 transition-colors">
                    {post.title || post.name || "Untitled Post"}
                  </h3>
                </Link>
                <div className="text-sm text-brand-500 mb-4 flex items-center gap-2">
                   <span>{post.createdAt ? format(new Date(post.createdAt), 'MMMM dd, yyyy') : "Recently"}</span>
                   <span>•</span>
                   <span>${frontendConfig.authorName}</span>
                </div>
                <p className="text-brand-700 leading-relaxed mb-6">
                  {(post.content || post.description || "Click to read more...").substring(0, 150)}...
                </p>
                <Link to={\`/${lowerName}/\${post.id}\`} className="text-brand-600 font-medium hover:text-brand-800 transition-colors inline-flex items-center gap-1">
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
`);

  // Post Detail Page
  writeFile(pagesPath, "PostPage.tsx", `
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
    api.get(\`${endpoint}/\${id}\`).then(res => {
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
             <span>By ${frontendConfig.authorName}</span>
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
`);

  // LoginPage
  writeFile(pagesPath, "LoginPage.tsx", `
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
        <form onSubmit={handleLogin} className="${containerClasses} p-8 max-w-md w-full">
          <h2 className="text-2xl text-center font-bold mb-6 text-brand-900">${frontendConfig.authorName}'s Admin</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-brand-700">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full border border-brand-300 ${roundedClass} p-2 focus:ring focus:ring-brand-200 outline-none" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1 text-brand-700">Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} required className="w-full border border-brand-300 ${roundedClass} p-2 focus:ring focus:ring-brand-200 outline-none" />
          </div>
          <button type="submit" className="${buttonClasses} w-full">Sign In to Dashboard</button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
`);

  // AdminPage
  writeFile(pagesPath, "AdminPage.tsx", `
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
    api.get("${endpoint}", { headers: { Authorization: \`Bearer \${token}\` }}).then(res => setItems(res.data?.data || []));
  }, [navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const fieldName1 = "${primaryEntity.fields[1]?.name || 'title'}";
      const fieldName2 = "${primaryEntity.fields[2]?.name || 'content'}";
      await api.post("${endpoint}", { [fieldName1]: title, [fieldName2]: content }, { headers: { Authorization: \`Bearer \${token}\` }});
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to publish post.");
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
      <div className="max-w-5xl mx-auto w-full p-6 py-12">
        <h1 className="text-3xl font-bold mb-8 text-brand-900 border-b pb-4">Author Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <form onSubmit={handleCreate} className="${containerClasses} p-6 sticky top-24">
                  <h2 className="text-xl font-bold mb-4">New Post</h2>
                  <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Title</label>
                      <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border p-2 ${roundedClass}" required />
                  </div>
                  <div className="mb-4">
                      <label className="block text-sm font-medium mb-1">Content</label>
                      <textarea value={content} onChange={e=>setContent(e.target.value)} rows={6} className="w-full border p-2 ${roundedClass}" required />
                  </div>
                  <button type="submit" className="${buttonClasses} w-full">Publish Post</button>
                </form>
            </div>
            
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-xl font-bold mb-4">Manage Posts</h2>
                {items.map(item => (
                    <div key={item.id} className="${containerClasses} p-4 flex justify-between items-center">
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
`);

  console.log("✅ Blog frontend scaffolding complete!");
}
