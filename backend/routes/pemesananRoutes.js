const db = require('../config/db');
const express = require('express');
const router = express.Router();
const pemesananController = require('../controllers/pemesananController');

router.post('/', pemesananController.createPemesanan);
router.get('/', pemesananController.getAllPemesanan);
router.get('/unit/:unit_nama', pemesananController.getPemesananByUnit); // <-- Route baru khusus unit

// Contoh jika menggunakan file rute terpisah (misal: routes/pemesanan.js)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await db.query(
      'UPDATE pemesanan SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    res.json({ success: true, message: 'Status berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;