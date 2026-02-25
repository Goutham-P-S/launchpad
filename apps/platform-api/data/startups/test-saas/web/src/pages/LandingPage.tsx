import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CheckCircle2, ArrowRight, Zap, Target, Shield } from "lucide-react";

export default function LandingPage() {
  const rawFeatures = ["1-Click Integrations","Real-time Sync","Bank-level Security"];
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
            Sync Your Data Automatically.
          </h1>
          <p className="text-xl md:text-2xl text-brand-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Connect all your tools in minutes and never manually export CSVs again.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <Link to="/register" className="bg-brand-600 text-white hover:bg-brand-700 rounded-lg px-6 py-3 font-medium transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-lg">
                Start Free Trial <ArrowRight className="w-5 h-5" />
             </Link>
             <a href="#features" className="bg-white text-brand-700 hover:bg-brand-50 border border-brand-200 rounded-lg px-6 py-3 font-medium transition-colors flex items-center justify-center text-lg hidden sm:flex">
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
              <p className="text-xl text-brand-600 max-w-2xl mx-auto">We built DataSync from the ground up to handle your most demanding workflows.</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              {rawFeatures.map((f, i) => {
                 const Icon = FeatureIcons[i % 3] || Zap;
                 return (
                   <div key={i} className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-8 hover:-translate-y-1 transition-transform duration-300">
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
             <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-8 border border-brand-200">
               <h3 className="text-2xl font-bold text-brand-900 mb-2">Starter</h3>
               <p className="text-brand-600 mb-6">Perfect for small teams.</p>
               <div className="mb-8">
                 <span className="text-5xl font-extrabold text-brand-900">$12</span><span className="text-brand-500 font-medium">/mo</span>
               </div>
               <Link to="/register" className="bg-brand-600 text-white hover:bg-brand-700 rounded-lg px-6 py-3 font-medium transition-colors shadow-md hover:shadow-lg w-full block text-center mb-8">Get Started</Link>
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
             <div className="bg-white/70 backdrop-blur-md border border-white/20 shadow-xl rounded-lg p-8 border-2 border-brand-500 relative transform md:-translate-y-4 shadow-xl">
               <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide">
                  MOST POPULAR
               </div>
               <h3 className="text-2xl font-bold text-brand-900 mb-2">Pro</h3>
               <p className="text-brand-600 mb-6">For scaling businesses.</p>
               <div className="mb-8">
                 <span className="text-5xl font-extrabold text-brand-900">$49</span><span className="text-brand-500 font-medium">/mo</span>
               </div>
               <Link to="/register" className="bg-brand-600 text-white hover:bg-brand-700 rounded-lg px-6 py-3 font-medium transition-colors shadow-md hover:shadow-lg w-full block text-center mb-8">Start Free Trial</Link>
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
