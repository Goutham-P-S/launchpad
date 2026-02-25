import { Cpu } from "lucide-react";
export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
        <div className="col-span-2">
           <div className="flex items-center gap-2 mb-4">
             <Cpu className="w-6 h-6 text-brand-400" />
             <span className="text-xl font-bold tracking-tight">DataSync</span>
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
        &copy; {new Date().getFullYear()} DataSync. All rights reserved.
      </div>
    </footer>
  );
}
