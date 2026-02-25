export default function Footer() {
  return (
    <footer className="bg-white border-t border-brand-100 mt-20 py-12">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-brand-500">&copy; {new Date().getFullYear()} Minimalist Dev Log. All rights reserved.</p>
      </div>
    </footer>
  );
}
