const express = require('express');
const dotenv = require('dotenv');

// Initialize dotenv first
dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const vaultRoutes = require('./routes/vaultRoutes');

// Initialize
connectDB();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vault', vaultRoutes);

// Root route — confirms backend is alive
app.get('/', (req, res) => {
    res.json({
        app: 'QuantumVault API',
        status: '🛡️ Quantum Shield Active',
        version: '1.0.0',
        docs: '/api/status'
    });
});

// Status Route
app.get('/api/status', (req, res) => {
    res.json({ status: "Quantum Shield Active", version: "1.0.0" });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`🚀 Quantum Backend running on port ${PORT}`));

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use.`);
        console.error(`   Run this to free it: Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`);
        process.exit(1);
    } else {
        throw err;
    }
});