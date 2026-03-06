const express = require('express');
const router = express.Router();
const { uploadFile, getFiles, downloadFile, deleteFile, getActivityLog } = require('../controllers/vaultController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// POST /api/vault/upload — Encrypt & store a file
router.post('/upload', protect, upload.single('file'), uploadFile);

// GET /api/vault/files — List user's vault (metadata only)
router.get('/files', protect, getFiles);

// GET /api/vault/download/:id — Decrypt & download a file
router.get('/download/:id', protect, downloadFile);

// DELETE /api/vault/files/:id — Permanently destroy a file
router.delete('/files/:id', protect, deleteFile);

// GET /api/vault/activity — Get user's activity log
router.get('/activity', protect, getActivityLog);

module.exports = router;
