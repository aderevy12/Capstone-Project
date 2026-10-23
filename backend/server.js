const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const pemesananRoutes = require('./routes/pemesananRoutes');
const distribusiRoutes = require('./routes/distribusiRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Folder static untuk akses foto hasil upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/pemesanan', pemesananRoutes);
app.use('/api/distribusi', distribusiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server backend berjalan di http://localhost:${PORT}`);
});