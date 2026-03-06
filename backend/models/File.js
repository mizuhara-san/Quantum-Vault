const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },         // Cloudinary URL of encrypted blob
  quantumCiphertext: { type: String, required: true }, // ML-KEM encapsulated shared secret (hex)
  iv: { type: String, required: true },              // AES-256-GCM IV (hex, 12 bytes)
  authTag: { type: String, required: true },         // AES-256-GCM authentication tag (hex)
  mimeType: { type: String, default: 'application/octet-stream' },
  fileSize: { type: Number },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('File', fileSchema);
