import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Camera, 
  CheckCircle, 
  Clock, 
  Search, 
  LogOut, 
  QrCode, 
  FileText,
  AlertCircle,
  Upload
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function DashboardLapangan({ currentUser, onLogout }) {
  // State Navigasi Tab ('tugas', 'upload-bukti', 'riwayat')
  const [activeMenu, setActiveMenu] = useState('tugas');

  // Data States
  const [pemesananList, setPemesananList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  // State Form Konfirmasi & Upload Bukti Lapangan
  const [formLapangan, setFormLapangan] = useState({
    pemesanan_id: '',
    petugas_id: currentUser?.id || 1,
    catatan: '',
    foto_bukti: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  // Fetch semua daftar pesanan
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/pemesanan`);
      const data = await res.json();
      if (data.success) {
        setPemesananList(data.data);
      }
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  // Handle Pilih Pesanan untuk langsung di-konfirmasi
  const handleSelectOrderForDelivery = (order) => {
    setFormLapangan({
      ...formLapangan,
      pemesanan_id: order.id
    });
    setActiveMenu('upload-bukti');
  };

  // Handle Image Selection & Preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormLapangan({ ...formLapangan, foto_bukti: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle Submit Form Lapangan (Upload Multipart Data)
  const handleSubmitBukti = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!formLapangan.pemesanan_id) {
      setMessage({ text: 'Silakan pilih atau masukkan ID Pemesanan terlebih dahulu.', type: 'error' });
      return;
    }

    if (!formLapangan.foto_bukti) {
      setMessage({ text: 'Silakan ambil/pilih foto bukti pengantaran di lokasi.', type: 'error' });
      return;
    }

    const formData = new FormData();
    formData.append('pemesanan_id', formLapangan.pemesanan_id);
    formData.append('petugas_id', formLapangan.petugas_id);
    formData.append('catatan', formLapangan.catatan || 'Konsumsi telah diserahterimakan.');
    formData.append('foto_bukti', formLapangan.foto_bukti);

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/distribusi/upload`, {
        method: 'POST',
        body: formData
      });
      const result = await res.json();

      if (result.success) {
        setMessage({ text: `Sukses! Bukti pengantaran ID #${formLapangan.pemesanan_id} berhasil dikirim. Status berubah menjadi SELESAI.`, type: 'success' });
        setFormLapangan({
          pemesanan_id: '',
          petugas_id: currentUser?.id || 1,
          catatan: '',
          foto_bukti: null
        });
        setPreviewImage(null);
        fetchAllOrders();
        setActiveMenu('riwayat');
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setMessage({ text: 'Gagal mengunggah bukti: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Filter Tugas Pending vs Selesai
  const tugasPending = pemesananList.filter(o => o.status === 'pending');
  const tugasSelesai = pemesananList.filter(o => o.status === 'selesai');

  // Filter Search
  const filteredPending = tugasPending.filter(item =>
    item.nama_acara?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ruang_rapat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.unit_pengusul?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      
      {/* 1. HEADER UNIFORM (Sama Presisi) */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="w-full px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Truck className="w-6 h-6" />
            <span>SIM Layanan Konsumsi F&B</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right leading-tight">
              <div className="font-bold text-sm">{currentUser?.nama || 'Petugas Lapangan'}</div>
              <div className="text-xs text-indigo-200">Role: {currentUser?.role?.toUpperCase() || 'DISTRIBUSI'}</div>
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
        
        {/* SIDEBAR LAPANGAN */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] p-4 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Menu Petugas Lapangan
            </div>

            <button
              onClick={() => setActiveMenu('tugas')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'tugas'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Clock className="w-4 h-4" /> Daftar Antaran (Pending)
            </button>

            <button
              onClick={() => setActiveMenu('upload-bukti')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'upload-bukti'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Camera className="w-4 h-4" /> Form Upload Bukti Foto
            </button>

            <button
              onClick={() => setActiveMenu('riwayat')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeMenu === 'riwayat'
                  ? 'bg-indigo-50 text-indigo-700 font-bold border-l-4 border-indigo-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <CheckCircle className="w-4 h-4" /> Riwayat Terdistribusi
            </button>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-900">
            <p className="font-semibold flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-emerald-600"/> Tim Lapangan Mode</p>
            <p className="text-[11px] text-emerald-700/80 mt-1">Gunakan kamera HP untuk mengunggah bukti penyerahan makanan di ruangan.</p>
          </div>
        </aside>

        {/* KONTEN UTAMA LAPANGAN */}
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

          {/* MENU 1: DAFTAR ANTARAN HARIAN (PENDING) */}
          {activeMenu === 'tugas' && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" /> Daftar Pengantaran Hari Ini
                  </h2>
                  <p className="text-xs text-gray-500">Daftar konsumsi rapat yang perlu disiapkan & diantar ke lokasi.</p>
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari ruang / acara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>

              {/* Grid Kartu Antaran (Mobile-Friendly Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPending.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3 hover:border-indigo-300 transition">
                    <div className="flex justify-between items-start">
                      <span className="bg-yellow-100 text-yellow-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        SIAP DIANTAR
                      </span>
                      <span className="text-xs font-bold text-gray-400">ID #{item.id}</span>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800 text-base">{item.nama_acara}</h3>
                      <p className="text-xs text-indigo-600 font-semibold">{item.unit_pengusul} ({item.jumlah_peserta} Pax)</p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1">
                      <p><strong className="text-gray-700">Ruangan:</strong> <span className="font-bold text-gray-900">{item.ruang_rapat}</span></p>
                      <p><strong className="text-gray-700">Jam Mulai:</strong> {item.waktu_mulai} WIB ({item.tanggal_rapat?.substring(0, 10)})</p>
                      <div className="pt-1 border-t text-[11px] text-gray-500">
                        <span>Menu: </span>
                        <span>{item.snack_pagi ? `[Pagi: ${item.snack_pagi}] ` : ''}</span>
                        <span>{item.makan_siang ? `[Siang: ${item.makan_siang}] ` : ''}</span>
                        <span>{item.snack_sore ? `[Sore: ${item.snack_sore}]` : ''}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSelectOrderForDelivery(item)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow transition"
                    >
                      <Camera className="w-4 h-4" /> Antar & Upload Bukti Foto
                    </button>
                  </div>
                ))}

                {filteredPending.length === 0 && (
                  <div className="col-span-full bg-white p-8 rounded-xl border text-center text-gray-400 text-sm">
                    <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
                    Tidak ada antaran pending saat ini. Semua pesanan telah selesai diantar!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MENU 2: FORM UPLOAD BUKTI FOTO LAPANGAN */}
          {activeMenu === 'upload-bukti' && (
            <div className="bg-white rounded-xl border shadow-sm p-6 max-w-xl mx-auto space-y-4">
              <h2 className="text-lg font-bold text-indigo-700 flex items-center gap-2">
                <Camera className="w-5 h-5" /> Form Konfirmasi Pengantaran Konsumsi
              </h2>
              <p className="text-xs text-gray-500">Ambil/unggah foto bukti makanan telah diserahterimakan di meja rapat.</p>

              <form onSubmit={handleSubmitBukti} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    ID Pemesanan (Atau Pilih dari Daftar Tugas)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 1"
                    value={formLapangan.pemesanan_id}
                    onChange={(e) => setFormLapangan({ ...formLapangan, pemesanan_id: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    Ambil / Unggah Foto Bukti Lokasi
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {previewImage ? (
                      <div className="space-y-2">
                        <img src={previewImage} alt="Preview Bukti" className="max-h-48 mx-auto rounded-lg shadow" />
                        <p className="text-xs text-indigo-600 font-semibold">Klik untuk mengganti foto</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-gray-500">
                        <Upload className="w-8 h-8 mx-auto text-indigo-500" />
                        <p className="text-xs font-medium">Klik di sini untuk membuka kamera / pilih foto</p>
                        <p className="text-[10px] text-gray-400">Format: JPG, PNG (Maks 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">
                    Catatan Lapangan / Penerima (Opsional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Contoh: Diterima oleh Pak Budi di meja utama ruang sidang."
                    value={formLapangan.catatan}
                    onChange={(e) => setFormLapangan({ ...formLapangan, catatan: e.target.value })}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" /> Selesaikan & Simpan Bukti
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* MENU 3: RIWAYAT TERDISTRIBUSI */}
          {activeMenu === 'riwayat' && (
            <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" /> Riwayat Pengantaran Selesai
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b text-gray-500 uppercase text-[11px]">
                    <tr>
                      <th className="p-3">ID</th>
                      <th className="p-3">Nama Acara & Unit</th>
                      <th className="p-3">Lokasi Ruangan</th>
                      <th className="p-3">Tanggal & Jam</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {tugasSelesai.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-500">#{item.id}</td>
                        <td className="p-3">
                          <div className="font-bold text-gray-800">{item.nama_acara}</div>
                          <div className="text-xs text-indigo-600">{item.unit_pengusul}</div>
                        </td>
                        <td className="p-3 font-medium text-gray-700">{item.ruang_rapat}</td>
                        <td className="p-3 text-xs text-gray-500">
                          {item.tanggal_rapat?.substring(0, 10)} | {item.waktu_mulai}
                        </td>
                        <td className="p-3">
                          <span className="bg-green-100 text-green-800 px-2.5 py-1 rounded-full text-[11px] font-bold">
                            SELESAI
                          </span>
                        </td>
                      </tr>
                    ))}
                    {tugasSelesai.length === 0 && (
                      <tr>
                        <td colSpan="5" className="p-6 text-center text-gray-400 text-xs">
                          Belum ada riwayat pengantaran selesai.
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