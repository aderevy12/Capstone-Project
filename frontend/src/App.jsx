import React, { useState, useEffect } from 'react';
import { ClipboardList, Truck, ShieldCheck, PlusCircle, LogOut } from 'lucide-react';
import Login from './components/Login';
import DashboardUnit from './components/DashboardUnit';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardLapangan from './components/DashboardLapangan';
import DashboardVendor from './components/DashboardVendor';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('unit');
  const [pemesananList, setPemesananList] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Load user dari localStorage jika pernah login sebelumnya
  useEffect(() => {
    const savedUser = localStorage.getItem('user_fnb');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setActiveTab(user.role);
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem('user_fnb', JSON.stringify(user));
    setActiveTab(user.role); // Set tab sesuai role user
  };

  const handleLogout = () => {
    localStorage.removeItem('user_fnb');
    setCurrentUser(null);
  };

  // 1. Jika belum login, tampilkan Halaman Login
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Jika user ber-role "unit"
  if (currentUser.role === 'unit') {
    return <DashboardUnit currentUser={currentUser} onLogout={handleLogout} />;
  }

  // 3. Jika user ber-role "admin"
  if (currentUser.role === 'admin') {
    return <DashboardAdmin currentUser={currentUser} onLogout={handleLogout} />;
  }

  // 4. Jika user ber-role "distribusi"
  if (currentUser.role === 'distribusi') {
    return <DashboardLapangan currentUser={currentUser} onLogout={handleLogout} />;
  }

  // 5. Jika user ber-role "vendor"
  if (currentUser.role === 'vendor') {
    return <DashboardVendor currentUser={currentUser} onLogout={handleLogout} />;
  }

  // Fallback jika role tidak dikenali
  return (
    <div className="p-8 text-center">
      <h1 className="text-xl font-bold">Role {currentUser.role} tidak dikenali.</h1>
      <button onClick={handleLogout} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Keluar</button>
    </div>
  );

  // // 6. (Untuk Distribusi bisa diarahkan ke dashboard masing-masing nanti)
  // return (
  //   <div className="p-8">
  //     <h1 className="text-xl font-bold">Dasbor {currentUser.role.toUpperCase()}</h1>
  //     <button onClick={handleLogout} className="mt-4 bg-red-600 text-white px-4 py-2 rounded">Logout</button>
  //   </div>
  // );


  // Jika sudah login, tampilkan Aplikasi Utama
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header Utama dengan Profil User & Tombol Logout */}
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-3">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Truck className="w-6 h-6" /> SIM Layanan Konsumsi F&B
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="text-right text-xs">
              <p className="font-bold">{currentUser.nama}</p>
              <p className="text-indigo-200 capitalize">Role: {currentUser.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Selamat Datang, {currentUser.nama}!</h2>
          <p className="text-sm text-gray-600">
            Anda berhasil masuk sebagai <span className="font-semibold uppercase text-indigo-600">{currentUser.role}</span>.
          </p>
        </div>
      </main>
    </div>
  );
}