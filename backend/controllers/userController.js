const db = require('../config/db');

// 1. Tambah/Register User Baru (Admin / Distribusi)
exports.registerUser = async (req, res) => {
    try {
        const { nama, email, password, role } = req.body;

        if (!nama || !email || !password || !role) {
            return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
        }

        const sql = `INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [nama, email, password, role]);

        res.status(201).json({
            success: true,
            message: `User dengan role '${role}' berhasil dibuat`,
            userId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const sql = `SELECT id, nama, email, role FROM users WHERE email = ? AND password = ?`;
        const [rows] = await db.execute(sql, [email, password]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Email atau password salah.' });
        }

        res.status(200).json({
            success: true,
            message: 'Login berhasil',
            user: rows[0]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get All Users (Khusus Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nama, email, role, created_at FROM users ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};