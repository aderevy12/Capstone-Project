import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  Truck, 
  FileText, 
  Search, 
  LogOut, 
  BarChart2, 
  Filter,
  Check,
  X,
  Eye
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function DashboardAdmin({ currentUser, onLogout }) {
  // Navigation active tab: 'rekap', 'approval', 'log-distribusi'
  const [activeMenu, setActiveMenu] = useState('rekap');
  
  // Data States
  const [pemesananList, setPemesananList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('semua');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedDetail, setSelectedDetail] = useState(null);

  // Fetch all orders
  const fetchAllPemesanan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/pemesanan`);
      const data = await res.json();
      if (data.success) {
        setPemesananList(data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPemesanan();
  }, []);

  // Update Status Pemesanan (Approve / Reject / Process)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/pemesanan/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `Status pesanan #${id} berhasil diubah menjadi ${newStatus.toUpperCase()}`, type: 'success' });
        fetchAllPemesanan();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setMessage({ text: 'Gagal memperbarui status: ' + err.message, type: 'error' });
    }
  };

  // Statistic Calculations
  const totalOrders = pemesananList.length;
  const pendingOrders = pemesananList.filter(o => o.status === 'pending').length;
  const completedOrders = pemesananList.filter(o => o.status === 'selesai').length;
  const totalPax = pemesananList.reduce((acc, curr) => acc + (parseInt(curr.jumlah_peserta) || 0), 0);

  // Filtering
  const filteredOrders = pemesananList.filter(item => {
    const matchesSearch = item.nama_acara?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.unit_pengusul?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.ruang_rapat?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'semua' ? true : item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      
      {/* 1. HEADER UNIFORM (Sama Presisi dengan Dashboard Unit) */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="w-full px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Truck className="w-6 h-6" />
            <span>SIM Layanan Konsumsi F&B</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right leading-tight">
              <div className="font-bold text-sm">{currentUser?.nama || 'Admin F&B Pusat'}</div>
              <div className="text-xs text-indigo-200">Role: {currentUser?.role?.toUpperCase() || 'ADMIN'}</div>
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
        
        {/* SIDEBAR NAVIGASI ADMIN */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Dasbor Pengelola F&B
            </div>

            <button
              onClick={() => setActiveMenu('rekap')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'rekap'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <BarChart2 className="w-4 h-4" /> Rekapitulasi & Analitik
            </button>

            <button
              onClick={() => setActiveMenu('approval')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'approval'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4" /> Kelola & Approval Order
            </button>
          </div>

          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs text-indigo-900">
            <p className="font-semibold flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-indigo-600"/> Administrator Mode</p>
            <p className="text-[11px] text-indigo-700/80 mt-1">Akses penuh untuk verifikasi pengajuan & monitoring distribusi.</p>
          </div>
        </aside>

        {/* KONTEN UTAMA */}
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

          {/* MENU 1: REKAPITULASI & STATISTIK ANALITIK */}
          {activeMenu === 'rekap' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border shadow-sm flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Ringkasan Operasional Konsumsi Rapat</h2>
                  <p className="text-xs text-gray-500 mt-1">Pantau total porsi, status pengerjaan, dan efisiensi pengantaran.</p>
                </div>
                <button onClick={fetchAllPemesanan} className="text-xs bg-gray-100 hover:bg-gray-200 border px-3 py-2 rounded-lg font-medium">
                  Refresh Data
                </button>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{totalOrders}</p>
                  <span className="text-[11px] text-gray-400">Seluruh pengajuan unit</span>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Menunggu Persetujuan</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">{pendingOrders}</p>
                  <span className="text-[11px] text-yellow-600 font-medium">Membutuhkan tindakan</span>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Pesanan Selesai</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{completedOrders}</p>
                  <span className="text-[11px] text-green-600 font-medium">Telah diantar ke lokasi</span>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Total Konsumsi (Pax)</p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">{totalPax}</p>
                  <span className="text-[11px] text-indigo-500">Estimasi porsi disiapkan</span>
                </div>
              </div>

              {/* Tabel Ringkasan Cepat */}
              <div className="bg-white rounded-xl border shadow-sm p-5 space-y-4">
                <h3 className="font-bold text-gray-800">Aktivitas Pemesanan Terbaru</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase text-[11px]">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Unit Pengusul</th>
                        <th className="p-3">Nama Acara & Lokasi</th>
                        <th className="p-3">Tanggal & Waktu</th>
                        <th className="p-3">Pax</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pemesananList.slice(0, 5).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="p-3 font-bold text-gray-500">#{item.id}</td>
                          <td className="p-3 font-semibold text-indigo-700">{item.unit_pengusul}</td>
                          <td className="p-3">
                            <div className="font-medium text-gray-800">{item.nama_acara}</div>
                            <div className="text-xs text-gray-400">{item.ruang_rapat}</div>
                          </td>
                          <td className="p-3 text-xs text-gray-600">
                            {item.tanggal_rapat?.substring(0, 10)} | {item.waktu_mulai}
                          </td>
                          <td className="p-3 font-medium">{item.jumlah_peserta} Pax</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              item.status === 'selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MENU 2: KELOLA & APPROVAL ORDER */}
          {activeMenu === 'approval' && (
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Kelola & Approval Pengajuan Konsumsi</h2>
                  <p className="text-xs text-gray-500">Verifikasi pengajuan dari unit sebelum diteruskan ke tim lapangan.</p>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border text-xs rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="semua">Semua Status</option>
                    <option value="pending">PENDING</option>
                    <option value="selesai">SELESAI</option>
                  </select>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari acara / unit / ruang..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>

              {/* Tabel Approval */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-gray-500 uppercase text-[11px]">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Acara & Unit</th>
                      <th className="p-3">Ruang & Waktu</th>
                      <th className="p-3">Request Menu</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-center">Aksi Administrator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredOrders.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-500">#{item.id}</td>
                        <td className="p-3">
                          <div className="font-bold text-gray-800">{item.nama_acara}</div>
                          <div className="text-xs text-indigo-600 font-medium">{item.unit_pengusul} ({item.jumlah_peserta} Pax)</div>
                        </td>
                        <td className="p-3 text-xs">
                          <div className="font-medium text-gray-700">{item.ruang_rapat}</div>
                          <div className="text-gray-400">{item.tanggal_rapat?.substring(0, 10)} | {item.waktu_mulai}</div>
                        </td>
                        <td className="p-3 text-xs text-gray-600">
                          <div>Pagi: {item.snack_pagi || '-'}</div>
                          <div>Siang: {item.makan_siang || '-'}</div>
                          <div>Sore: {item.snack_sore || '-'}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            item.status === 'selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center items-center gap-1.5">
                            {item.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'selesai')}
                                title="Tandai Selesai Manually"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 shadow"
                              >
                                <Check className="w-3.5 h-3.5" /> Selesaikan
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedDetail(item)}
                              className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border"
                            >
                              <Eye className="w-3.5 h-3.5" /> Detail
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-gray-400 text-xs">
                          Tidak ditemukan data pemesanan yang sesuai.
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

      {/* MODAL POPUP DETAIL PENGAJUAN */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedDetail(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Detail Pemesanan #{selectedDetail.id}</h3>

            <div className="space-y-2 text-sm text-gray-600">
              <p><strong className="text-gray-800">Nama Acara:</strong> {selectedDetail.nama_acara}</p>
              <p><strong className="text-gray-800">Unit Pengusul:</strong> {selectedDetail.unit_pengusul}</p>
              <p><strong className="text-gray-800">Ruang & Waktu:</strong> {selectedDetail.ruang_rapat} ({selectedDetail.tanggal_rapat?.substring(0, 10)} - {selectedDetail.waktu_mulai})</p>
              <p><strong className="text-gray-800">Jumlah Peserta:</strong> {selectedDetail.jumlah_peserta} Orang/Pax</p>
              <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1">
                <p className="font-bold text-indigo-700">Rincian Menu Requested:</p>
                <p>• Snack Pagi: {selectedDetail.snack_pagi || 'Tidak ada'}</p>
                <p>• Makan Siang: {selectedDetail.makan_siang || 'Tidak ada'}</p>
                <p>• Snack Sore: {selectedDetail.snack_sore || 'Tidak ada'}</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}