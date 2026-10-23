import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Clock, 
  CheckCircle, 
  Search, 
  LogOut, 
  Printer, 
  FileText, 
  ChefHat,
  PackageCheck
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function DashboardVendor({ currentUser, onLogout }) {
  // State Navigasi Tab ('pesanan-masuk', 'siap-diantar', 'rekap-porsi')
  const [activeMenu, setActiveMenu] = useState('pesanan-masuk');

  // Data States
  const [pemesananList, setPemesananList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch daftar pesanan
  const fetchVendorOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/pemesanan`);
      const data = await res.json();
      if (data.success) {
        setPemesananList(data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data pesanan vendor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorOrders();
  }, []);

  // Update Status Persiapan Vendor
  const handleUpdateStatusVendor = async (id, proses_vendor) => {
    try {
      const res = await fetch(`${API_URL}/pemesanan/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: proses_vendor })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ 
          text: `Pesanan #${id} berhasil diperbarui menjadi ${proses_vendor.toUpperCase()}`, 
          type: 'success' 
        });
        fetchVendorOrders();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setMessage({ text: 'Gagal memperbarui status: ' + err.message, type: 'error' });
    }
  };

  // Perhitungan Ringkasan Dapur Vendor
  const totalPesanan = pemesananList.length;
  const pesananPending = pemesananList.filter(o => o.status === 'proses_vendor');
  const pesananSelesai = pemesananList.filter(o => o.status === 'selesai');
  const totalPaxPagi = pemesananList.filter(o => o.snack_pagi).reduce((acc, curr) => acc + (parseInt(curr.jumlah_peserta) || 0), 0);
  const totalPaxSiang = pemesananList.filter(o => o.makan_siang).reduce((acc, curr) => acc + (parseInt(curr.jumlah_peserta) || 0), 0);
  const totalPaxSore = pemesananList.filter(o => o.snack_sore).reduce((acc, curr) => acc + (parseInt(curr.jumlah_peserta) || 0), 0);

  // Filter Search
  const filteredOrders = pesananPending.filter(item =>
    item.nama_acara?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ruang_rapat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit_pengusul?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      
      {/* 1. HEADER UNIFORM (Sama Presisi dengan Dashboard Lain) */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="w-full px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Utensils className="w-6 h-6" />
            <span>SIM Layanan Konsumsi F&B</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right leading-tight">
              <div className="font-bold text-sm">{currentUser?.nama || 'Dapur Catering Utama'}</div>
              <div className="text-xs text-indigo-200">Role: {currentUser?.role?.toUpperCase() || 'VENDOR'}</div>
            </div>
            
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shadow"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      {/* 2. LAYOUT UTAMA (SIDEBAR + KONTEN) */}
      <div className="flex flex-1">
        
        {/* SIDEBAR VENDOR */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Menu Penyedia / Vendor
            </div>

            <button
              onClick={() => setActiveMenu('pesanan-masuk')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'pesanan-masuk'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ChefHat className="w-4 h-4" /> Pesanan & Dapur (Pending)
            </button>

            <button
              onClick={() => setActiveMenu('rekap-porsi')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'rekap-porsi'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4" /> Rekapitulasi Porsi Harian
            </button>

            <button
              onClick={() => setActiveMenu('siap-diantar')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'siap-diantar'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle className="w-4 h-4" /> Riwayat Selesai
            </button>
          </div>

          <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg text-xs text-orange-900">
            <p className="font-semibold flex items-center gap-1"><ChefHat className="w-3.5 h-3.5 text-orange-600"/> Catering Vendor Mode</p>
            <p className="text-[11px] text-orange-700/80 mt-1">Siapkan porsi menu sesuai rincian jam rapat yang tertera.</p>
          </div>
        </aside>

        {/* KONTEN UTAMA VENDOR */}
        <main className="flex-1 p-6 space-y-6">

          {/* Alert Message */}
          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-medium border ${
              message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.text}
              <button onClick={() => setMessage({ text: '', type: '' })} className="float-right font-bold">&times;</button>
            </div>
          )}

          {/* MENU 1: PESANAN & PRODUKSI DAPUR */}
          {activeMenu === 'pesanan-masuk' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-indigo-600" /> Daftar Pesanan Menu Rapat
                  </h2>
                  <p className="text-xs text-gray-500">Daftar pesanan konsumsi yang perlu diproduksi dan disiapkan dapur catering.</p>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari acara / ruang..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Grid Kartu Pesanan Vendor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                    <div className="flex justify-between items-start border-b pb-3">
                      <div>
                        <span className="text-xs font-bold text-gray-400">Order #{item.id}</span>
                        <h3 className="font-bold text-gray-800 text-base">{item.nama_acara}</h3>
                        <p className="text-xs text-indigo-600 font-medium">{item.unit_pengusul}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-[11px] font-bold px-2.5 py-1 rounded-full">
                        {item.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <p><strong>Lokasi / Ruang:</strong> {item.ruang_rapat}</p>
                      <p><strong>Tanggal & Waktu:</strong> {item.tanggal_rapat?.substring(0, 10)} ({item.waktu_mulai} WIB)</p>
                      <p><strong>Jumlah Porsi:</strong> <span className="font-bold text-indigo-700 text-sm">{item.jumlah_peserta} Pax</span></p>
                    </div>

                    {/* Rincian Menu Request */}
                    <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1">
                      <p className="font-bold text-gray-700">Rincian Paket Menu:</p>
                      {item.snack_pagi && <p>• <strong>Snack Pagi:</strong> {item.snack_pagi}</p>}
                      {item.makan_siang && <p>• <strong>Makan Siang:</strong> {item.makan_siang}</p>}
                      {item.snack_sore && <p>• <strong>Snack Sore:</strong> {item.snack_sore}</p>}
                    </div>

                    <button
                      onClick={() => handleUpdateStatusVendor(item.id, 'siap_diantar')}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow transition"
                    >
                      <PackageCheck className="w-4 h-4" /> Tandai Makanan Siap Dipickup / Diantar
                    </button>
                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="col-span-full bg-white p-8 rounded-xl border text-center text-gray-400 text-sm">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    Tidak ada antrian produksi pesanan di dapur catering saat ini.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MENU 2: REKAPITULASI PORSI HARIAN */}
          {activeMenu === 'rekap-porsi' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Rekapitulasi Kebutuhan Porsi Dapur</h2>
                  <p className="text-xs text-gray-500">Gunakan angka akumulasi ini untuk menyiapkan bahan masakan harian.</p>
                </div>

                <button 
                  onClick={() => window.print()} 
                  className="bg-gray-100 hover:bg-gray-200 border text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" /> Cetak Rekap
                </button>
              </div>

              {/* Stat Ringkasan Porsi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border shadow-sm border-l-4 border-l-amber-500">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Snack Pagi</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{totalPaxPagi} Pax</p>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm border-l-4 border-l-orange-500">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Makan Siang</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{totalPaxSiang} Pax</p>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm border-l-4 border-l-indigo-500">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Snack Sore</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{totalPaxSore} Pax</p>
                </div>
              </div>

              {/* Tabel Detail Porsi Per Acara */}
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Rincian Per Pemesanan</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase text-[11px]">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Unit & Acara</th>
                        <th className="p-3">Waktu</th>
                        <th className="p-3">Pax</th>
                        <th className="p-3">Snack Pagi</th>
                        <th className="p-3">Makan Siang</th>
                        <th className="p-3">Snack Sore</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pemesananList.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="p-3 font-bold text-gray-500">#{item.id}</td>
                          <td className="p-3">
                            <div className="font-bold text-gray-800">{item.nama_acara}</div>
                            <div className="text-xs text-indigo-600">{item.unit_pengusul}</div>
                          </td>
                          <td className="p-3 text-xs text-gray-500">{item.waktu_mulai}</td>
                          <td className="p-3 font-bold">{item.jumlah_peserta}</td>
                          <td className="p-3 text-xs">{item.snack_pagi || '-'}</td>
                          <td className="p-3 text-xs">{item.makan_siang || '-'}</td>
                          <td className="p-3 text-xs">{item.snack_sore || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MENU 3: RIWAYAT PESANAN SELESAI */}
          {activeMenu === 'siap-diantar' && (
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" /> Riwayat Pesanan Siap / Selesai
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-gray-500 uppercase text-[11px]">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Nama Acara & Unit</th>
                      <th className="p-3">Lokasi</th>
                      <th className="p-3">Total Pax</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pesananSelesai.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-500">#{item.id}</td>
                        <td className="p-3">
                          <div className="font-bold text-gray-800">{item.nama_acara}</div>
                          <div className="text-xs text-indigo-600">{item.unit_pengusul}</div>
                        </td>
                        <td className="p-3 text-xs text-gray-600">{item.ruang_rapat}</td>
                        <td className="p-3 font-bold">{item.jumlah_peserta} Pax</td>
                        <td className="p-3">
                          <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            SELESAI
                          </span>
                        </td>
                      </tr>
                    ))}
                    {pesananSelesai.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-gray-400 text-xs">
                          Belum ada riwayat pesanan selesai.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}