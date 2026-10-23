const db = require('../config/db');

// 1. Tambah Pemesanan Baru (Bisa dilakukan oleh Admin atau Unit Pengusul)
exports.createPemesanan = async (req, res) => {
    try {
        const { 
            nama_acara, 
            unit_pengusul, 
            ruang_rapat, 
            tanggal_rapat, 
            waktu_mulai, 
            jumlah_peserta, 
            snack_pagi, 
            makan_siang, 
            snack_sore 
        } = req.body;
        
        const sql = `INSERT INTO pemesanan 
            (nama_acara, unit_pengusul, ruang_rapat, tanggal_rapat, waktu_mulai, jumlah_peserta, snack_pagi, makan_siang, snack_sore) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
        const [result] = await db.execute(sql, [
            nama_acara, 
            unit_pengusul, 
            ruang_rapat, 
            tanggal_rapat, 
            waktu_mulai, 
            jumlah_peserta, 
            snack_pagi, 
            makan_siang, 
            snack_sore
        ]);
        
        res.status(201).json({ 
            success: true, 
            message: 'Pengajuan pemesanan ruang rapat dan konsumsi berhasil dibuat.', 
            dataId: result.insertId 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Ambil Semua Data Pemesanan (Untuk Admin / Umum)
exports.getAllPemesanan = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM pemesanan ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Ambil Pemesanan Berdasarkan Unit Pengusul (Khusus Drafter/Unit)
exports.getPemesananByUnit = async (req, res) => {
    try {
        const { unit_nama } = req.params;
        const sql = `SELECT * FROM pemesanan WHERE unit_pengusul = ? ORDER BY created_at DESC`;
        const [rows] = await db.execute(sql, [unit_nama]);

        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};