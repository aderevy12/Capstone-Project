const express = require('express');
const router = express.Router();
const distribusiController = require('../controllers/distribusiController');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', upload.single('foto_bukti'), distribusiController.submitDistribusi);

module.exports = router;