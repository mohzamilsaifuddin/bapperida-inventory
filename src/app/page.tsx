import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
      
      <div className="relative text-center p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-lg w-full mx-4">
        <h1 className="text-4xl font-bold text-white mb-4">
          Selamat Datang
        </h1>
        <p className="text-blue-200 mb-8 text-lg">
          Sistem Inventaris BAPPERIDA Kota Bandar Lampung
        </p>
        
        <Link 
          href="/login" 
          className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <span>Masuk ke Sistem</span>
          <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}
