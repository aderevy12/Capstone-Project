import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  ClipboardList, 
  Home, 
  Clock, 
  CheckCircle, 
  LogOut, 
  Truck, 
  FileText,
  Search
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function DashboardUnit({ currentUser, onLogout }) {
  // State untuk Tab Sidebar ('overview', 'buat-pengajuan', 'riwayat')
  const [activeMenu, setActiveMenu] = useState('overview');
  
  // State Data Pemesanan
  const [pemesananList, setPemesananList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // State Form Pengajuan Pemesanan
  const [formData, setFormData] = useState({
    nama_acara: '',
    unit_pengusul: currentUser?.nama || '',
    ruang_rapat: '',
    tanggal_rapat: '',
    waktu_mulai: '',
    jumlah_peserta: '',
    snack_pagi: '',
    makan_siang: '',
    snack_sore: ''
  });

  // Ambil Data Pemesanan khusus Unit saat ini
  const fetchUnitPemesanan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/pemesanan`);
      const data = await res.json();
      if (data.success) {
        // Filter pemesanan yang milik unit pengusul aktif
        const unitData = data.data.filter(
          item => item.unit_pengusul?.toLowerCase() === currentUser?.nama?.toLowerCase() || item.unit_pengusul?.includes('Unit')
        );
        setPemesananList(unitData.length > 0 ? unitData : data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitPemesanan();
  }, []);

  // Handle Submit Form Pengajuan
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch(`${API_URL}/pemesanan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (result.success) {
        setMessage({ text: 'Pengajuan konsumsi rapat berhasil dikirim!', type: 'success' });
        setFormData({
          nama_acara: '',
          unit_pengusul: currentUser?.nama || '',
          ruang_rapat: '',
          tanggal_rapat: '',
          waktu_mulai: '',
          jumlah_peserta: '',
          snack_pagi: '',
          makan_siang: '',
          snack_sore: ''
        });
        fetchUnitPemesanan();
        setActiveMenu('riwayat'); // Pindah ke tab riwayat setelah berhasil
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setMessage({ text: 'Gagal mengajukan: ' + err.message, type: 'error' });
    }
  };

  //Kalkulasi Ringkasan Statistik Status
  const totalPengajuan = pemesananList.length;
  const totalPending = pemesananList.filter(item => item.status === 'pending').length;
  const totalSelesai = pemesananList.filter(item => item.status === 'selesai').length;

  const renderStatusBadge = (status) => {
  switch (status) {
    case 'pending':
      return <span className="bg-yellow-100 text-yellow-800 px-2.5 py-1 rounded-full text-[11px] font-bold">PENDING</span>;
    case 'proses_vendor':
      return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-[11px] font-bold">SEDANG DALAM PROSES PENGEMASAN</span>;
    case 'siap_diantar':
      return <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-[11px] font-bold">SEDANG DI ANTAR</span>;
    case 'selesai':
      return <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-[11px] font-bold">SELESAI</span>;
    default:
      return <span className="bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full text-[11px] font-bold">{status?.toUpperCase()}</span>;
  }
};


  // Filter Search
  const filteredList = pemesananList.filter(item => 
    item.nama_acara?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ruang_rapat?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      
      {/* 1. HEADER UTAMA (Presisi Sesuai Gambar Unggahan) */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="w-full px-6 py-3 flex justify-between items-center">
          
          {/* Sisi Kiri: Brand Name & Logo */}
          <div className="flex items-center gap-2 font-bold text-lg">
            <Truck className="w-6 h-6" />
            <span>SIM Layanan Konsumsi F&B</span>
          </div>

          {/* Sisi Kanan: Profile User & Tombol Keluar Merah */}
          <div className="flex items-center gap-4">
            <div className="text-right leading-tight">
              <div className="font-bold text-sm">{currentUser?.nama || 'Siska - Unit Feb'}</div>
              <div className="text-xs text-indigo-200">Role: {currentUser?.role?.toUpperCase() || 'Unit'}</div>
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
        
        {/* A. SIDEBAR NAVIGASI */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Menu Navigasi Unit
            </div>

            <button
              onClick={() => setActiveMenu('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'overview'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" /> Dashboard
            </button>

            <button
              onClick={() => setActiveMenu('buat-pengajuan')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'buat-pengajuan'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" /> Buat Pengajuan Rapat
            </button>

            <button
              onClick={() => setActiveMenu('riwayat')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'riwayat'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Riwayat Status Pengajuan
            </button>
          </div>

          {/* Footer Info Sidebar */}
          <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 border">
            <p className="font-semibold text-gray-700">Drafter Unit Mode</p>
            <p className="text-[11px] mt-0.5">Kelola pengajuan & jadwal konsumsi rapat internal unit Anda.</p>
          </div>
        </aside>

        {/* B. KONTEN UTAMA */}
        <main className="flex-1 p-6 space-y-6">

          {/* Notifikasi Pesan global */}
          {message.text && (
            <div className={`p-4 rounded-xl text-sm font-medium border ${
              message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* MENU 1: OVERVIEW / DASHBOARD */}
          {activeMenu === 'overview' && (
            <div className="space-y-6">
              {/* Card Banner Menyapa User Sesuai Gambar Original */}
              <div className="bg-white rounded-xl shadow-sm border p-6 text-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Selamat Datang, {currentUser?.nama || 'Siska - Unit Feb'}!
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Anda berhasil masuk sebagai <span className="font-bold text-indigo-600">UNIT</span> pengusul konsumsi rapat.
                </p>
              </div>

              {/* Grid 3 Card Ringkasan Statistik */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Total Pengajuan</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{totalPengajuan}</p>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Menunggu Proses</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">{totalPending}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Telah Terdistribusi</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{totalSelesai}</p>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Tabel Singkat Pengajuan Terakhir */}

              

              <div className="bg-white rounded-xl border shadow-sm p-5">



                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Pengajuan Terbaru Unit Anda</h3>
                  <button onClick={() => setActiveMenu('riwayat')} className="text-xs font-semibold text-indigo-600 hover:underline">
                    Lihat Semua
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b text-gray-500 uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Nama Acara</th>
                        <th className="p-3">Ruangan & Waktu</th>
                        <th className="p-3">Peserta</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pemesananList.slice(0, 3).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="p-3 font-semibold text-gray-800">{item.nama_acara}</td>
                          <td className="p-3 text-xs text-gray-600">
                            {item.ruang_rapat} <br />
                            <span className="text-gray-400">{item.tanggal_rapat?.substring(0, 10)} ({item.waktu_mulai})</span>
                          </td>
                          <td className="p-3">{item.jumlah_peserta} Pax</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              item.status === 'selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status?.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {pemesananList.length === 0 && (
                        <tr>
                          <td colSpan="4" className="p-4 text-center text-gray-400 text-xs">Belum ada data pengajuan rapat.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MENU 2: BUAT PENGAJUAN BARU */}
          {activeMenu === 'buat-pengajuan' && (
            <div className="bg-white rounded-xl border shadow-sm p-6 max-w-3xl mx-auto">
              <h2 className="text-lg font-bold text-indigo-700 mb-1 flex items-center gap-2">
                <PlusCircle className="w-5 h-5" /> Formulir Pengajuan Konsumsi Rapat Baru
              </h2>
              <p className="text-xs text-gray-500 mb-6">Lengkapi rincian acara rapat dan menu makanan/minuman yang dibutuhkan.</p>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Nama Agenda Rapat</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Rapat Koordinasi Kurikulum"
                      value={formData.nama_acara}
                      onChange={e => setFormData({...formData, nama_acara: e.target.value})}
                      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Unit Pengusul</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.unit_pengusul}
                      className="w-full border rounded-lg p-2.5 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Ruang Rapat</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: R. Sidang Lt. 3"
                      value={formData.ruang_rapat}
                      onChange={e => setFormData({...formData, ruang_rapat: e.target.value})}
                      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Tanggal</label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal_rapat}
                      onChange={e => setFormData({...formData, tanggal_rapat: e.target.value})}
                      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Waktu Mulai</label>
                    <input
                      type="time"
                      required
                      value={formData.waktu_mulai}
                      onChange={e => setFormData({...formData, waktu_mulai: e.target.value})}
                      className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Jumlah Peserta (Pax)</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={formData.jumlah_peserta}
                    onChange={e => setFormData({...formData, jumlah_peserta: e.target.value})}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                </div>

                <div className="border-t pt-4 space-y-3">
                  <span className="block text-xs font-bold uppercase text-indigo-700">Detail Request Menu (Opsional)</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Snack Pagi</label>
                      <input
                        type="text"
                        placeholder="Roti & Kopi/Teh"
                        value={formData.snack_pagi}
                        onChange={e => setFormData({...formData, snack_pagi: e.target.value})}
                        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Makan Siang</label>
                      <input
                        type="text"
                        placeholder="Nasi Box Ayam Bakar"
                        value={formData.makan_siang}
                        onChange={e => setFormData({...formData, makan_siang: e.target.value})}
                        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600">Snack Sore</label>
                      <input
                        type="text"
                        placeholder="Kue Pastry & Teh"
                        value={formData.snack_sore}
                        onChange={e => setFormData({...formData, snack_sore: e.target.value})}
                        className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition duration-200 mt-4"
                >
                  Kirimkan Pengajuan Konsumsi
                </button>
              </form>
            </div>
          )}

          {/* MENU 3: RIWAYAT PENGAJUAN */}
          {activeMenu === 'riwayat' && (
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Daftar Status Pengajuan Rapat</h2>
                  <p className="text-xs text-gray-500">Pantau proses approval dan status pengantaran tim lapangan.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari acara / ruangan..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-gray-500 uppercase text-[11px]">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Nama Acara</th>
                      <th className="p-3">Ruang & Waktu</th>
                      <th className="p-3">Peserta</th>
                      <th className="p-3">Menu Request</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredList.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-500">#{item.id}</td>
                        <td className="p-3 font-semibold text-gray-800">{item.nama_acara}</td>
                        <td className="p-3 text-xs">
                          <div className="font-medium text-gray-700">{item.ruang_rapat}</div>
                          <div className="text-gray-400">{item.tanggal_rapat?.substring(0, 10)} | {item.waktu_mulai}</div>
                        </td>
                        <td className="p-3">{item.jumlah_peserta} Pax</td>
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
                      </tr>
                    ))}
                    {filteredList.length === 0 && (
                      <tr>
                        <td colSpan="6" className="p-6 text-center text-gray-400 text-xs">
                          Tidak ditemukan data pengajuan rapat.
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