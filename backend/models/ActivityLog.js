const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
        type: String,
        enum: ['UPLOAD', 'DOWNLOAD', 'DELETE', 'LOGIN', 'PROFILE_UPDATE', 'PASSWORD_CHANGE'],
        required: true
    },
    fileName: { type: String, default: null },
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'File', default: null },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
    details: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
