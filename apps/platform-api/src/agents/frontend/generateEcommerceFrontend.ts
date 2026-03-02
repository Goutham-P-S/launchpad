import fs from "fs";
import path from "path";

function writeFile(dir: string, file: string, content: string) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), content.trim() + "\n");
}

export function generateEcommerceFrontend(webPath: string, backendPlan: any, frontendConfig: any) {
  fs.mkdirSync(webPath, { recursive: true });

  const srcPath = path.join(webPath, "src");
  const pagesPath = path.join(srcPath, "pages");
  const componentsPath = path.join(srcPath, "components");
  const apiPath = path.join(srcPath, "api");
  const contextPath = path.join(srcPath, "context");

  const primaryEntity = backendPlan?.entities?.find((e: any) =>
    ['product', 'item', 'listing', 'good', 'service', 'craft'].includes(e.name.toLowerCase())
  ) || backendPlan?.entities?.[0] || { name: "Product" };

  const entityName = primaryEntity.name;
  const lowerName = entityName.toLowerCase();
  const endpoint = `/${lowerName.endsWith('s') ? lowerName : lowerName + 's'}`;

  writeFile(webPath, "index.html", `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${frontendConfig?.storeName || 'Modern E-Commerce Store'}</title>
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
  "name": "startup-web-ecommerce",
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
// Auto-generated backend URL from .env passed into Vite
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
export const api = axios.create({ baseURL });

`);

  writeFile(srcPath, "App.tsx", `
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CartPage from "./pages/CartPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminPage from "./pages/AdminPage";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

`);

  writeFile(componentsPath, "Navbar.tsx", `
import { ShoppingBag, Search, Menu, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { items } = useCart();
  const { user, logout } = useAuth();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center gap-2 ml-4 lg:ml-0 group transition-transform hover:scale-105">
              <div className="bg-brand-600 text-white p-1.5 rounded-lg shadow-lg shadow-brand-500/30 group-hover:bg-brand-700 transition-colors">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                ${frontendConfig?.storeName || 'Storefront'}
              </span>
            </Link>
          </div>
          
          <div className="hidden lg:flex flex-1 justify-center px-12">
            <div className="w-full max-w-lg relative group">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full bg-gray-100/50 border-transparent focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200/50 rounded-full py-2.5 pl-4 pr-10 text-sm transition-all shadow-sm"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                  Hi, {user.email?.split('@')[0]}
                </span>
                <Link to="/admin" className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors bg-brand-50 px-3 py-1.5 rounded-full hidden sm:block">
                  Admin Panel
                </Link>
                <button 
                  onClick={() => logout()}
                  className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 focus:outline-none"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-500 hover:text-brand-600 transition-colors p-2 rounded-full hover:bg-brand-50 flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="text-sm font-semibold hidden sm:block">Login</span>
              </Link>
            )}
            
            <Link to="/cart" className="relative text-gray-500 hover:text-brand-600 transition-colors p-2 rounded-full hover:bg-brand-50">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-600 rounded-full shadow-sm shadow-brand-500/50 border-2 border-white animate-scale-in">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

`);

  writeFile(contextPath, "AuthContext.tsx", `
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../api/client";

interface AuthContextType {
  user: any;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      api.defaults.headers.common["Authorization"] = \`Bearer \${token}\`;
    }
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    api.defaults.headers.common["Authorization"] = \`Bearer \${token}\`;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

`);

  writeFile(contextPath, "CartContext.tsx", `
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CartItem {
  id: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  cartTotal: number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        id: product.id,
        title: product.name || product.title || product.titleText || \`Product #\${product.id}\`,
        price: Number(product.price) || 49.99,
        image: product.image || product.imageUrl || \`https://picsum.photos/seed/\${product.name?.length || 5 + (product.id || 0)}/400/500\`,
        quantity: 1
      }];
    });
  };

  const removeFromCart = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, cartTotal, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

`);

  writeFile(srcPath, "index.css", `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body { font-family: 'Inter', sans-serif; }
}

.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

`);

  writeFile(srcPath, "main.tsx", `
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

`);

  writeFile(pagesPath, "CartPage.tsx", `
import { Trash2, ArrowRight, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-fade-in">
        <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">Looks like you haven't added anything to your cart yet. Browse our products and find something you love!</p>
            <Link to="/" className="inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Cart Items */}
            <div className="w-full lg:w-2/3 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hidden lg:block lg:border-t lg:border-l lg:border-r">
              <ul className="divide-y divide-gray-100">
                {items.map(item => (
                  <li key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 animate-fade-in">
                    <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-100 rounded-2xl overflow-hidden border border-gray-50">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover object-center" />
                    </div>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-black text-gray-900 line-clamp-1">{item.title}</h3>
                          <p className="text-brand-600 font-bold mt-1 text-lg">\$\${item.price.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors focus:outline-none"
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-1 shadow-inner">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded-full transition-colors shadow-sm focus:outline-none"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded-full transition-colors shadow-sm focus:outline-none"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-black text-gray-900 text-lg">
                          \$\${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                <button 
                  onClick={clearCart}
                  className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors"
                >
                  Clear Cart
                </button>
                <Link to="/" className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">
                  &larr; Continue Shopping
                </Link>
              </div>
            </div>
            
            {/* Mobile View for Cart Items */}
            <div className="w-full lg:hidden space-y-4">
               {items.map(item => (
                  <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
                     <div className="w-24 h-24 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-50">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover object-center" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 line-clamp-2 text-sm">{item.title}</h3>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                       <div className="flex justify-between items-center gap-2 mt-2">
                          <p className="text-brand-600 font-bold text-sm">\$\${item.price.toFixed(2)}</p>
                          <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
                             <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 px-2 hover:bg-white rounded-l-full border-r border-gray-200 font-bold text-sm"><Minus className="w-3 h-3"/></button>
                             <span className="px-2 text-sm font-bold">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 px-2 hover:bg-white rounded-r-full border-l border-gray-200 font-bold text-sm"><Plus className="w-3 h-3"/></button>
                          </div>
                       </div>
                    </div>
                  </div>
               ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:p-8 sticky top-24">
              <h2 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Order Summary</h2>
              
              <div className="space-y-4 mb-6 font-medium">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-gray-900">\$\${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Shipping estimate</span>
                  <span className="text-gray-900">\$5.00</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Tax estimate</span>
                  <span className="text-gray-900">\$\${(cartTotal * 0.08).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-gray-900">Order Total</span>
                  <span className="text-3xl font-black text-gray-900 tracking-tight">
                    \$\${(cartTotal + 5 + cartTotal * 0.08).toFixed(2)}
                  </span>
                </div>
              </div>

              {user ? (
                <button 
                  className="w-full bg-gray-900 hover:bg-brand-600 focus:bg-brand-600 focus:ring-4 focus:ring-brand-500/30 text-white font-bold py-4 rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center gap-2"
                  onClick={() => alert("Checkout flow coming soon!")}
                >
                  Proceed to Checkout <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="space-y-4">
                  <Link 
                    to="/login"
                    className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-brand-600 text-white font-bold py-4 rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                  >
                    Login to Checkout
                  </Link>
                  <p className="text-center text-xs text-gray-500 font-medium bg-yellow-50 text-yellow-800 p-2 rounded-lg border border-yellow-100">
                    You must be logged in to complete your purchase.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

`);

  writeFile(pagesPath, "HomePage.tsx", `
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ShoppingCart, Star, Shield, Truck, RefreshCw, Check, ShoppingBag } from "lucide-react";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    api.get("${endpoint}")
      .then(res => {
        const data = res.data.data || res.data || [];
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Failed to load products:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (item: any) => {
    addToCart(item);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white border-b border-gray-200 z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10">
          <div className="md:w-2/3 lg:w-1/2 animate-slide-up">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-600 font-bold tracking-wider uppercase text-xs mb-6 border border-brand-100">
              ${frontendConfig?.heroBadge || '✨ New Arrivals'}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]">
              ${frontendConfig?.heroHeading || 'Discover unique finds curated just for you.'}
            </h1>
            <p className="text-lg text-gray-500 mb-8 max-w-xl leading-relaxed">
              ${frontendConfig?.heroSubheading || 'Hand-picked quality products from top creators. Explore our latest collection and elevate your everyday lifestyle.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <button className={\`bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 shadow-brand-500/30 transition-all duration-200 transform hover:-translate-y-0.5 ${frontendConfig?.borderRadius === 'full' ? 'rounded-full' : 'rounded-theme'} ${frontendConfig?.buttonStyle === 'soft' ? 'shadow-lg' : frontendConfig?.buttonStyle === 'outline' ? 'bg-transparent border-2 border-brand-600 text-brand-600 hover:text-white' : 'shadow-sm'}\`}>
                Shop Now
              </button>
              <button className={\`bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 px-8 border border-gray-200 transition-colors ${frontendConfig?.borderRadius === 'full' ? 'rounded-full' : 'rounded-theme'} ${frontendConfig?.buttonStyle === 'soft' ? 'shadow-md' : 'shadow-sm'}\`}>
                Explore Collection
              </button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-gradient-to-br from-brand-100 to-teal-50 rounded-full blur-3xl opacity-50 z-[-1] pointer-events-none hidden lg:block"></div>
        <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-full blur-3xl opacity-50 z-[-1] pointer-events-none hidden lg:block"></div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white border-b border-gray-200 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={\`flex items-center justify-center sm:justify-start gap-4 p-4 hover:bg-gray-50 transition-colors ${frontendConfig?.borderRadius === 'full' ? 'rounded-3xl' : 'rounded-theme'}\`}>
              <div className="bg-green-100 p-3 rounded-xl text-green-600">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm tracking-tight">Secure Checkout</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">100% protected payments</p>
              </div>
            </div>
            <div className={\`flex items-center justify-center sm:justify-start gap-4 p-4 hover:bg-gray-50 transition-colors ${frontendConfig?.borderRadius === 'full' ? 'rounded-3xl' : 'rounded-theme'}\`}>
              <div className="bg-brand-100 p-3 rounded-xl text-brand-600">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm tracking-tight">Fast Shipping</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Free over \$50</p>
              </div>
            </div>
            <div className={\`flex items-center justify-center sm:justify-start gap-4 p-4 hover:bg-gray-50 transition-colors ${frontendConfig?.borderRadius === 'full' ? 'rounded-3xl' : 'rounded-theme'}\`}>
              <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm tracking-tight">Easy Returns</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">30-day money back</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Featured Products</h2>
            <p className="text-gray-500 mt-2 font-medium">Our most popular items this week</p>
          </div>
          <a href="#" className="hidden sm:inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-bold text-sm transition-colors">
            View all collection &rarr;
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-[4/5] rounded-3xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm animate-fade-in">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Database is empty. Add products via the backend or generated APIs to see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item, idx) => {
              const title = item.name || item.title || item.titleText || "Product #" + (item.id || idx);
              const price = item.price ? Number(item.price).toFixed(2) : "49.99";
              const desc = item.description || "A wonderful premium item perfect for your collection.";
              const imageSeed = title.length + (item.id || idx);
              const isAdded = addedItems[item.id];

              return (
                <div key={idx} className="group flex flex-col bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in" style={{ animationDelay: \`\${idx % 8 * 50}ms\` }}>
                  <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                    <img
                      src={item.image || item.imageUrl || \`https://picsum.photos/seed/\${imageSeed}/400/500\`}
                      alt={title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-xs font-black px-3 py-1.5 rounded-full text-brand-600 shadow-sm tracking-wider">
                      NEW
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 opacity-30" />
                      <span className="text-xs text-gray-400 ml-1.5 font-bold">(12)</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 line-clamp-1 mb-1.5 group-hover:text-brand-600 transition-colors">
                      {title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-6 flex-1 font-medium">
                      {desc}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                      <span className="text-2xl font-black text-gray-900 tracking-tight">\$\${price}</span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={\`relative overflow-hidden rounded-full p-3 transition-all duration-300 \${isAdded ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30 scale-105' : 'bg-gray-900 hover:bg-brand-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'}\`}
                      >
                        {isAdded ? (
                          <Check className="w-5 h-5 animate-scale-in" />
                        ) : (
                          <ShoppingCart className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-brand-600 text-white p-1 rounded-md">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <span className="font-black text-gray-900 tracking-tight text-lg">${frontendConfig?.storeName || 'Storefront'}</span>
          </div>
          <p className="text-gray-500 text-sm font-medium">
            &copy; {new Date().getFullYear()} Product Store. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

`);

  writeFile(pagesPath, "LoginPage.tsx", `
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Mail, Lock, ArrowRight } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        const encodedToken = res.data.data.token || "mocked-token";
        login(encodedToken, { email, id: 1 });
        navigate("/");
      } else {
        setError("Invalid credentials");
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
         // Fallback mock login for demo scenarios where API doesn't have auth yet
         if (email === "admin@example.com" && password === "admin123") {
            login("demo-token", { email, id: 1 });
            navigate("/");
            return;
         }
      }
      setError(err.response?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
            <div className="bg-brand-600 text-white p-2.5 rounded-xl shadow-lg shadow-brand-500/40">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              Storefront
            </span>
          </Link>
        </div>
        <h2 className="mt-8 text-center text-3xl font-black text-gray-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Or{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="bg-white py-10 px-6 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-black text-gray-900 pl-1">Email address</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="focus:ring-2 focus:ring-brand-500 focus:border-transparent block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-3 bg-gray-50 font-medium text-gray-900 border transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 pl-1">Password</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-brand-500 focus:border-transparent block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-3 bg-gray-50 font-medium text-gray-900 border transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pl-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-full shadow-lg text-sm font-black text-white bg-gray-900 hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {loading ? "Signing in..." : <>Sign in <ArrowRight className="w-4 h-4"/></>}
              </button>
            </div>
          </form>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400 font-bold uppercase tracking-wider text-xs">Demo Credentials</span>
              </div>
            </div>
            <div className="mt-6 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded-xl py-3 border border-gray-100">
              <span className="font-bold text-gray-900">Email:</span> admin@example.com <br/>
              <span className="font-bold text-gray-900">Password:</span> admin123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

`);

  writeFile(pagesPath, "RegisterPage.tsx", `
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Mail, Lock, User as UserIcon, ArrowRight } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/register", { email, password, name });
      if (res.data?.success) {
        // Mock token for demo
        login("mocked-token-new-user", { email, id: res.data?.data?.id || 2 });
        navigate("/");
      } else {
        setError("Registration failed");
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
          // MOCK logic if real auth endpoint doesn't exist
          login("demo-token-register", { email, id: Math.floor(Math.random() * 100) });
          navigate("/");
          return;
      }
      setError(err.response?.data?.error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-slide-up">
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
            <div className="bg-brand-600 text-white p-2.5 rounded-xl shadow-lg shadow-brand-500/40">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
              Storefront
            </span>
          </Link>
        </div>
        <h2 className="mt-8 text-center text-3xl font-black text-gray-900 tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="bg-white py-10 px-6 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-12 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl border border-red-100 text-center">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-black text-gray-900 pl-1">Full Name</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="focus:ring-2 focus:ring-brand-500 focus:border-transparent block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-3 bg-gray-50 font-medium text-gray-900 border transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 pl-1">Email address</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="focus:ring-2 focus:ring-brand-500 focus:border-transparent block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-3 bg-gray-50 font-medium text-gray-900 border transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 pl-1">Password</label>
              <div className="mt-1 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="focus:ring-2 focus:ring-brand-500 focus:border-transparent block w-full pl-10 sm:text-sm border-gray-200 rounded-xl py-3 bg-gray-50 font-medium text-gray-900 border transition-all"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-full shadow-lg text-sm font-black text-white bg-gray-900 hover:bg-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              >
                {loading ? "Creating account..." : <>Register <ArrowRight className="w-4 h-4"/></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

`);

  writeFile(pagesPath, "AdminPage.tsx", `
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, ArrowLeft, Image as ImageIcon, Plus, Loader2 } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    industry: \`${frontendConfig?.industry || "e-commerce"}\`,
    brandStyle: \`${frontendConfig?.brandStyle || "modern"}\`,
    imageDescription: ""
  });
  
  const [imageUrl, setImageUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateImage = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.imageDescription) {
      setError("Name and Image Description are required to generate an image.");
      return;
    }
    setError("");
    setGenerating(true);
    try {
      const response = await fetch("http://localhost:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startup_name: formData.name,
          industry: formData.industry || "e-commerce",
          target_audience: "general consumers",
          brand_style: formData.brandStyle || "modern",
          image_description: formData.imageDescription
        })
      });
      const data = await response.json();
      if (data.status === "success" && data.image_url) {
        setImageUrl("http://localhost:5000" + data.image_url);
      } else {
        setError(data.message || "Failed to generate image");
      }
    } catch (err: any) {
      setError("Failed to connect to local Image Agent: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !imageUrl) {
      setError("Name, price, and a generated image are required.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await api.post("${endpoint}", {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        image: imageUrl,
        imageUrl: imageUrl
      });
      setSuccess("Product created successfully!");
      setFormData({ name: "", price: "", description: "", industry: "e-commerce", brandStyle: "modern", imageDescription: "" });
      setImageUrl("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1 font-medium">Create a new product with AI generated marketing imagery</p>
          </div>
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
        </div>

        {error && <div className="mb-6 bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-100">{error}</div>}
        {success && <div className="mb-6 bg-green-50 text-green-600 text-sm font-bold p-4 rounded-xl border border-green-100">{success}</div>}

        <div className={\`bg-white ${frontendConfig?.borderRadius === 'full' ? 'rounded-3xl' : 'rounded-theme'} ${frontendConfig?.containerStyle === 'glass' ? 'bg-white/70 backdrop-blur shadow-2xl border-white/50' : frontendConfig?.containerStyle === 'bordered' ? 'border-2 border-gray-200 shadow-none' : 'shadow-xl shadow-gray-200/40 border border-gray-100'} overflow-hidden\`}>
          <div className="flex flex-col md:flex-row">
            
            {/* Form Section */}
            <div className="p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-500" />
                Product Details
              </h2>
              
              <form className="space-y-5" onSubmit={handleSaveProduct}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} className={\`w-full ${frontendConfig?.borderRadius === 'full' ? 'rounded-2xl' : 'rounded-theme'} border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all\`} placeholder="e.g. Minimalist Coffee Mug" required />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price ($) *</label>
                  <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} className={\`w-full ${frontendConfig?.borderRadius === 'full' ? 'rounded-2xl' : 'rounded-theme'} border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all\`} placeholder="24.99" required />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={\`w-full ${frontendConfig?.borderRadius === 'full' ? 'rounded-2xl' : 'rounded-theme'} border-gray-200 bg-gray-50 p-3 text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all\`} placeholder="A beautiful handcrafted..."></textarea>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    AI Image Generation Settings
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Industry</label>
                      <input type="text" name="industry" value={formData.industry} onChange={handleChange} className="w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:ring-brand-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Brand Style</label>
                      <select name="brandStyle" value={formData.brandStyle} onChange={handleChange} className="w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:ring-brand-500 outline-none">
                        <option value="modern">Modern</option>
                        <option value="minimalist">Minimalist</option>
                        <option value="corporate">Corporate</option>
                        <option value="creative">Creative</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Image Prompt Description *</label>
                    <textarea name="imageDescription" value={formData.imageDescription} onChange={handleChange} rows={2} className="w-full rounded-lg border-gray-200 bg-gray-50 p-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. resting on a wooden table with soft morning lighting" required></textarea>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button 
                    type="button" 
                    onClick={generateImage}
                    disabled={generating}
                    className={\`flex-1 bg-purple-100 text-purple-700 hover:bg-purple-200 font-bold py-3 px-4 ${frontendConfig?.borderRadius === 'full' ? 'rounded-2xl' : 'rounded-theme'} transition-colors text-sm flex justify-center items-center gap-2\`}
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />} Generate Image
                  </button>
                  <button 
                    type="submit"
                    disabled={saving || !imageUrl}
                    className={\`flex-1 bg-gray-900 text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 px-4 ${frontendConfig?.borderRadius === 'full' ? 'rounded-2xl' : 'rounded-theme'} ${frontendConfig?.buttonStyle === 'soft' ? 'shadow-xl' : frontendConfig?.buttonStyle === 'outline' ? 'bg-transparent border-2 border-gray-900 text-gray-900 hover:text-white' : 'shadow-md'} transition-all text-sm flex justify-center items-center gap-2\`}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Save Product
                  </button>
                </div>
              </form>
            </div>
            
            {/* Image Preview Section */}
            <div className="p-8 md:w-1/2 bg-gray-50/50 flex flex-col justify-center items-center min-h-[400px]">
              {imageUrl ? (
                <div className={\`w-full max-w-sm ${frontendConfig?.borderRadius === 'full' ? 'rounded-3xl' : 'rounded-theme'} overflow-hidden shadow-2xl shadow-gray-200 border-4 border-white relative group animate-scale-in\`}>
                  <img src={imageUrl} alt="Generated AI image" className="w-full h-auto aspect-square object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <span className="text-white font-bold text-sm bg-white/20 px-4 py-2 rounded-full backdrop-blur-md">Preview Ready</span>
                  </div>
                </div>
              ) : (
                <div className={\`w-full max-w-sm aspect-square ${frontendConfig?.borderRadius === 'full' ? 'rounded-3xl' : 'rounded-theme'} border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center text-gray-400\`}>
                  <ImageIcon className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="font-medium text-sm">Fill out the prompt details and click 'Generate' to see your AI marketing image here.</p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
`);

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
        brand: ${frontendConfig?.brandColors ? JSON.stringify(frontendConfig.brandColors) : `{
          50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
          400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
          800: '#115e59', 900: '#134e4a',
        }`}
      },
      fontFamily: {
        sans: ['"${frontendConfig?.fontFamily || 'Inter'}"', 'sans-serif'],
      },
      borderRadius: {
        'theme': '${frontendConfig?.borderRadius === "none" ? "0px" : frontendConfig?.borderRadius === "sm" ? "0.125rem" : frontendConfig?.borderRadius === "md" ? "0.375rem" : frontendConfig?.borderRadius === "lg" ? "0.5rem" : frontendConfig?.borderRadius === "xl" ? "0.75rem" : frontendConfig?.borderRadius === "2xl" ? "1rem" : frontendConfig?.borderRadius === "3xl" ? "1.5rem" : frontendConfig?.borderRadius === "full" ? "9999px" : "1rem"}',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn: { '0%': { transform: 'scale(0.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } }
      }
    },
  },
  plugins: [],
}

`);

  writeFile(webPath, "tsconfig.json", `
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}

`);

  writeFile(webPath, "vite.config.ts", `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0", port: 3000 }
});

`);

  console.log("👗 Multi-page E-commerce Frontend scaffold generated successfully");
}
