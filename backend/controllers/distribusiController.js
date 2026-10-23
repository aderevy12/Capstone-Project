const db = require('../config/db');

// Unggah Foto Bukti Pengantaran (Tim Distribusi Lapangan)
exports.submitDistribusi = async (req, res) => {
    try {
        const { pemesanan_id, petugas_id, catatan } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Foto bukti pengantaran wajib diunggah.' });
        }

        const foto_bukti = req.file.filename;

        // Simpan log pengantaran
        const sqlLog = `INSERT INTO log_distribusi (pemesanan_id, petugas_id, foto_bukti, status_pengantaran, catatan) VALUES (?, ?, ?, 'terkirim', ?)`;
        await db.execute(sqlLog, [pemesanan_id, petugas_id, foto_bukti, catatan || '']);

        // Update status pemesanan menjadi selesai
        const sqlUpdate = `UPDATE pemesanan SET status = 'selesai' WHERE id = ?`;
        await db.execute(sqlUpdate, [pemesanan_id]);

        res.status(200).json({
            success: true,
            message: 'Bukti pengantaran berhasil diunggah dan status diperbarui.',
            filename: foto_bukti
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};