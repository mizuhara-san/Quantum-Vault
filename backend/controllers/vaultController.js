const File = require('../models/File');
const ActivityLog = require('../models/ActivityLog');
const cloudinary = require('cloudinary').v2;
const axios = require('axios');
const crypto = require('node:crypto');
const { encapsulateSecret, decapsulateSecret } = require('../utils/pqcService');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper: log an activity
const logActivity = async (userId, action, options = {}) => {
  try {
    await ActivityLog.create({
      user: userId,
      action,
      fileName: options.fileName || null,
      fileId: options.fileId || null,
      status: options.status || 'SUCCESS',
      details: options.details || ''
    });
  } catch (e) {
    console.error('Activity log error:', e.message);
  }
};

// ============================================================
// UPLOAD — Encrypt with AES-256-GCM + ML-KEM encapsulation
// POST /api/vault/upload
// ============================================================
exports.uploadFile = async (req, res) => {
  try {
    const user = req.user;
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // Step 1 — QUANTUM ENCAPSULATION
    console.log('🔐 ML-KEM Encapsulating shared secret...');
    const { ciphertext, sharedSecret } = encapsulateSecret(user.quantumPublicKey);

    // Step 2 — AES-256-GCM ENCRYPTION
    const iv = crypto.randomBytes(12);
    const aesKey = sharedSecret.slice(0, 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv);

    const encryptedBuffer = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Step 3 — UPLOAD ENCRYPTED BLOB TO CLOUDINARY
    console.log('☁️ Uploading encrypted blob to Cloudinary...');
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'quantum-vault' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(encryptedBuffer);
    });

    // Step 4 — PERSIST METADATA TO MONGODB
    const newFile = new File({
      user: user.id,
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      quantumCiphertext: ciphertext.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      mimeType,
      fileSize: req.file.size,
    });

    await newFile.save();

    await logActivity(user.id, 'UPLOAD', {
      fileName: req.file.originalname,
      fileId: newFile._id,
      details: `${(req.file.size / 1024).toFixed(1)} KB — AES-256-GCM + ML-KEM-768`
    });

    console.log(`✅ File "${req.file.originalname}" quantum-shielded and stored.`);
    res.status(201).json({
      message: 'File Quantum-Shielded and Uploaded!',
      file: {
        id: newFile._id,
        fileName: newFile.fileName,
        fileSize: newFile.fileSize,
        mimeType: newFile.mimeType,
        uploadedAt: newFile.uploadedAt,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Encryption/Upload failed', error: error.message });
  }
};

// ============================================================
// LIST FILES — Return metadata for all files owned by the user
// GET /api/vault/files
// ============================================================
exports.getFiles = async (req, res) => {
  try {
    const files = await File.find({ user: req.user.id })
      .select('-quantumCiphertext -iv -authTag -fileUrl')
      .sort({ uploadedAt: -1 });

    res.json(files);
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ message: 'Could not retrieve vault contents' });
  }
};

// ============================================================
// DOWNLOAD & DECRYPT — Recover, decrypt, and stream the file
// GET /api/vault/download/:id
// ============================================================
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Step 1 — QUANTUM DECAPSULATION
    console.log(`🔓 Decapsulating ML-KEM ciphertext for file "${file.fileName}"...`);
    const sharedSecret = decapsulateSecret(req.user.quantumPrivateKey, file.quantumCiphertext);

    // Step 2 — FETCH ENCRYPTED BLOB FROM CLOUDINARY
    console.log('☁️ Fetching encrypted blob from Cloudinary...');
    const cloudinaryResponse = await axios.get(file.fileUrl, { responseType: 'arraybuffer' });
    const encryptedBuffer = Buffer.from(cloudinaryResponse.data);

    // Step 3 — AES-256-GCM DECRYPTION
    const aesKey = sharedSecret.slice(0, 32);
    const iv = Buffer.from(file.iv, 'hex');
    const authTag = Buffer.from(file.authTag, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    decipher.setAuthTag(authTag);

    const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

    await logActivity(req.user.id, 'DOWNLOAD', {
      fileName: file.fileName,
      fileId: file._id,
      details: `${(file.fileSize / 1024).toFixed(1)} KB`
    });

    // Step 4 — STREAM BACK TO CLIENT
    console.log(`✅ "${file.fileName}" decrypted successfully. Streaming...`);
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.setHeader('Content-Length', decryptedBuffer.length);
    res.send(decryptedBuffer);

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Decryption failed. Data may be corrupted.' });
  }
};

// ============================================================
// DELETE FILE — Remove from Cloudinary + MongoDB
// DELETE /api/vault/files/:id
// ============================================================
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) return res.status(404).json({ message: 'File not found' });
    if (file.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Extract Cloudinary public_id from URL (format: .../quantum-vault/FILENAME)
    const urlParts = file.fileUrl.split('/');
    const publicId = `quantum-vault/${urlParts[urlParts.length - 1]}`;

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
      console.log(`🗑️ Cloudinary blob deleted: ${publicId}`);
    } catch (cloudErr) {
      console.warn('Cloudinary delete warning:', cloudErr.message);
      // Don't fail the whole request — still remove from DB
    }

    await File.findByIdAndDelete(req.params.id);

    await logActivity(req.user.id, 'DELETE', {
      fileName: file.fileName,
      fileId: file._id,
      details: 'File permanently destroyed'
    });

    console.log(`✅ File "${file.fileName}" deleted.`);
    res.json({ message: 'File permanently destroyed from vault.' });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Could not delete file', error: error.message });
  }
};

// ============================================================
// ACTIVITY LOG — Return audit events for the user
// GET /api/vault/activity
// ============================================================
exports.getActivityLog = async (req, res) => {
  try {
    const logs = await ActivityLog.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error('Activity log error:', error);
    res.status(500).json({ message: 'Could not retrieve activity log' });
  }
};