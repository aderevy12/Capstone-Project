import React, { useState } from 'react';
import { Lock, Mail, Shield, UserCheck, HandPlatter, Truck, ArrowRight, Eye, EyeOff } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('admin'); // Default role
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // Panggil fungsi callback untuk menyimpan sesi user di App.jsx
        onLoginSuccess(data.user);
      } else {
        throw new Error(data.message || 'Email atau password salah.');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-900 via-indigo-700 to-purple-800 p-4 relative overflow-hidden font-sans">
      
      {/* Element Dekorasi Latar Belakang (Glow Effects) */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl pointer-events-none"></div>

      {/* Kartu Container Glassmorphism */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 text-white relative z-10">
        
        {/* Header App */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-white/10 rounded-xl border border-white/20 shadow-inner mb-1">
            <Truck className="w-8 h-8 text-indigo-300" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">SIM Layanan F&B</h1>
          <p className="text-xs text-indigo-200">Sistem Informasi Layanan & Distribusi Konsumsi Rapat</p>
        </div>

        {/* Pilihan Role (Pill Switcher) */}
        <div className="grid grid-cols-3 gap-1 bg-black/20 p-1 rounded-xl mb-6 text-xs font-medium border border-white/10">
          
          <button
            type="button"
            onClick={() => setRole('unit')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-200 ${
              role === 'unit' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-indigo-200 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Unit
          </button>

          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-200 ${
              role === 'admin' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-indigo-200 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Admin
          </button>

          <button
            type="button"
            onClick={() => setRole('vendor')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-200 ${
              role === 'vendor' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-indigo-200 hover:text-white'
            }`}
          >
            <HandPlatter className="w-3.5 h-3.5" /> Vendor
          </button>
          
          <button
            type="button"
            onClick={() => setRole('distribusi')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1 transition-all duration-200 ${
              role === 'distribusi' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-indigo-200 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Distribusi
          </button>
        </div>

        {/* Notifikasi Error */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg text-xs bg-red-500/20 border border-red-500/40 text-red-200 text-center font-medium animate-pulse">
            {errorMsg}
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Input Email */}
          <div>
            <label className="block text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">
              Email Pengguna
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-300">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@univ.ac.id"
                className="w-full pl-10 pr-4 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-black/30 transition"
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-300">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-black/20 border border-white/10 rounded-xl text-sm placeholder-indigo-300/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-black/30 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-indigo-300 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Opsi Ingat Saya & Lupa Password */}
          <div className="flex justify-between items-center text-xs text-indigo-200 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded bg-black/20 border-white/20 text-indigo-600 focus:ring-indigo-400" />
              <span>Ingat Saya</span>
            </label>
            <a href="#" className="hover:underline hover:text-white">Lupa Kata Sandi?</a>
          </div>

          {/* Tombol Submit Login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                Masuk ke Sistem <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-indigo-300/60">
          Universitas Terbuka &copy; 2026 - SIM F&B V1.0
        </div>
      </div>
    </div>
  );
}