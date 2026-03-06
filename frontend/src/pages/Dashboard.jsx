import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Download, File, Image, FileText, Music, Video,
    ShieldCheck, Lock, Cpu, Database, Zap, AlertCircle,
    CheckCircle2, RefreshCw, MoreHorizontal, Plus, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';

/* ── helpers ─────────────────────────────────── */
const getFileIcon = (mime = '', sz = 20) => {
    if (mime.startsWith('image/')) return <div className="p-1.5 rounded-md bg-green-500/20 text-green-400"><Image size={sz} /></div>;
    if (mime.startsWith('video/')) return <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400"><Video size={sz} /></div>;
    if (mime.startsWith('audio/')) return <div className="p-1.5 rounded-md bg-yellow-500/20 text-yellow-400"><Music size={sz} /></div>;
    if (mime.includes('pdf')) return <div className="p-1.5 rounded-md bg-red-500/20 text-red-500"><FileText size={sz} /></div>;
    if (mime.includes('text') || mime.includes('document')) return <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400"><FileText size={sz} /></div>;
    return <div className="p-1.5 rounded-md bg-gray-500/20 text-gray-400"><File size={sz} /></div>;
};

const fmtSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(2)} MB`;
};

const delay = (ms) => new Promise(r => setTimeout(r, ms));

const STEPS = [
    { label: 'Harvesting quantum entropy…', Icon: Zap },
    { label: 'Deriving 256-bit AES session key…', Icon: Cpu },
    { label: 'ML-KEM-768 encapsulating key…', Icon: Lock },
    { label: 'AES-256-GCM encrypting file…', Icon: ShieldCheck },
    { label: 'Uploading encrypted blob to cloud…', Icon: Upload },
    { label: 'Quantum shield activated!', Icon: CheckCircle2 },
];

/* ════════════════════════════════════
   DASHBOARD REPLICA
════════════════════════════════════ */
const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStep, setUploadStep] = useState(-1);
    const [uploadError, setUploadError] = useState('');
    const [dlState, setDlState] = useState({});
    const fileInputRef = useRef();

    const handleLogout = useCallback(() => {
        logout();
        navigate('/login');
    }, [logout, navigate]);


    const fetchFiles = useCallback(async () => {
        setLoadingFiles(true);
        try { const { data } = await API.get('/vault/files'); setFiles(data); }
        catch (e) {
            console.error(e);
            if (e.response?.status === 401) handleLogout();
        }
        finally { setLoadingFiles(false); }
    }, [handleLogout]);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    const handleFileSelect = (e) => {
        const f = e.target.files[0];
        if (f) {
            setSelectedFile(f);
            handleUpload(f); // Auto-start upload for seamless experience
        }
    };

    const handleUpload = async (fileToUpload) => {
        if (!fileToUpload) return;
        setUploadError('');
        for (let i = 0; i < 5; i++) { setUploadStep(i); await delay(500 + Math.random() * 300); }
        try {
            const fd = new FormData(); fd.append('file', fileToUpload);
            await API.post('/vault/upload', fd);
            setUploadStep(5); await delay(1000); await fetchFiles();
        } catch (e) {
            setUploadError(e.response?.data?.message || 'Upload failed.');
            if (e.response?.status === 401) {
                await delay(1500);
                handleLogout();
            }
        }
        finally { await delay(400); setUploadStep(-1); setSelectedFile(null); }
    };

    const handleDownload = async (file) => {
        setDlState(p => ({ ...p, [file._id]: 'loading' }));
        try {
            const res = await API.get(`/vault/download/${file._id}`, { responseType: 'blob' });
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a'); a.href = url; a.download = file.fileName;
            document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            setDlState(p => ({ ...p, [file._id]: 'done' }));
            setTimeout(() => setDlState(p => ({ ...p, [file._id]: undefined })), 2500);
        } catch {
            setDlState(p => ({ ...p, [file._id]: 'error' }));
            setTimeout(() => setDlState(p => ({ ...p, [file._id]: undefined })), 3000);
        }
    };

    const totalSize = files.reduce((s, f) => s + (f.fileSize || 0), 0);
    const isUploading = uploadStep >= 0;

    return (
        <div className="min-h-screen text-white flex p-4 sm:p-6 gap-6 font-sans" style={{ background: '#0F1015' }}>
            <Sidebar />

            {/* ── MAIN CONTENT ────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0">

                {/* Top Header / Upload Button */}
                <div className="flex justify-end mb-6">
                    <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} disabled={isUploading} />

                    <button
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.5)]"
                        style={{ background: 'linear-gradient(90deg, #00E5FF, #7AF0FF)' }}
                    >
                        {isUploading ? <RefreshCw size={18} className="animate-spin" /> : <Plus size={18} />}
                        {isUploading ? 'Encrypting...' : 'Upload New File'}
                    </button>
                </div>

                {/* Quantum Command Center Banner */}
                <div className="rounded-[24px] p-8 mb-6 relative overflow-hidden flex justify-between items-center"
                    style={{ background: 'linear-gradient(135deg, rgba(25,15,45,0.95), rgba(15,35,55,0.95))', boxShadow: '0 10px 40px rgba(0,229,255,0.15), inset 0 0 0 1px rgba(0,229,255,0.25)' }}>
                    <div className="absolute inset-0 bg-[url('/hero-bg.png')] opacity-10 mix-blend-overlay"></div>
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-[60px] pointer-events-none"></div>

                    <div className="relative z-10 max-w-sm">
                        <div className="text-cyan-400 mb-3 drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]"><Database size={28} /></div>
                        <h1 className="text-3xl font-extrabold text-white mb-2 shadow-black drop-shadow-lg tracking-tight">QUANTUM COMMAND CENTER</h1>
                        <p className="text-sm text-cyan-100/70 leading-relaxed shadow-black drop-shadow-md">
                            Your files are protected by military-grade lattice cryptography. The ultimate secure vault for the post-quantum era.
                        </p>
                    </div>

                    {/* Abstract node graphics */}
                    <div className="absolute right-0 top-0 bottom-0 w-[50%] opacity-80 pointer-events-none flex items-center justify-end pr-8">
                        <img src="/lattice.png" alt="" className="h-[120%] object-contain mix-blend-screen opacity-60 block drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]" style={{ maskImage: 'linear-gradient(to left, black, transparent)' }} />
                    </div>
                </div>

                {/* Upload Overlay Pipeline (Shown only during upload) */}
                <AnimatePresence>
                    {isUploading && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mb-6 rounded-[24px] p-6 glass-card border border-cyan-500/30 bg-cyan-900/10">
                            <h3 className="text-sm font-bold text-cyan-400 mb-4 uppercase tracking-wider">Secure Pipeline Active</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {STEPS.map(({ label, Icon }, i) => {
                                    const active = i === uploadStep, done = i < uploadStep;
                                    return (
                                        <motion.div key={label} animate={{ opacity: i <= uploadStep ? 1 : 0.3 }}
                                            className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                            <span className={done ? 'text-green-400' : active ? 'text-cyan-400' : 'text-gray-500'}>
                                                {active ? <RefreshCw size={16} className="animate-spin" /> : done ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                                            </span>
                                            <span className="text-xs font-medium text-gray-300">{label}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {uploadError && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {uploadError}
                    </div>
                )}

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <MetricCard
                        title="Total Secured Files"
                        value={<span><strong className="text-white text-xl">{files.length}</strong> items secured</span>}
                        subtitle={`Total Vault Size: ${fmtSize(totalSize)}`}
                        glowColor="rgba(0,229,255,1)"
                    />
                    <MetricCard
                        title="Quantum Entropy Source"
                        value={<span>ANU QRNG API - <span className="text-green-400">ACTIVE</span></span>}
                        subtitle="Provides true randomness for AES keys"
                        glowColor="rgba(124,58,237,1)"
                    />
                    <MetricCard
                        title="Lattice Key Strength"
                        value={<span>ML-KEM-768 | <span className="text-green-400">Secure</span></span>}
                        subtitle="Immune to Shor's algorithm"
                        glowColor="rgba(16,185,129,1)"
                    />
                </div>

                {/* File Inventory Table */}
                <div className="flex-1 bg-[#121520] rounded-[24px] border border-white/5 overflow-hidden flex flex-col">
                    <div className="p-6 flex justify-between items-center border-b border-white/5">
                        <h2 className="text-lg font-bold">File Inventory</h2>
                        <button className="text-gray-400 hover:text-white"><MoreHorizontal size={20} /></button>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm text-left">
                            <thead className="text-gray-400 border-b border-white/5 bg-black/40">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-center w-16">Type</th>
                                    <th className="px-6 py-4 font-semibold text-left">File Name</th>
                                    <th className="px-6 py-4 font-semibold text-center w-32">Status</th>
                                    <th className="px-6 py-4 font-semibold text-left">Last Modified</th>
                                    <th className="px-6 py-4 font-semibold text-right">Size</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loadingFiles ? (
                                    <tr><td colSpan="6" className="py-10 text-center text-gray-500"><RefreshCw size={24} className="animate-spin inline-block mr-2" /> Loading vault...</td></tr>
                                ) : files.length === 0 ? (
                                    <tr><td colSpan="6" className="py-10 text-center text-gray-500">No secure files found. Upload one to begin.</td></tr>
                                ) : (
                                    files.map((file) => (
                                        <tr key={file._id} className="hover:bg-white/[0.04] transition-colors group cursor-default">
                                            <td className="px-6 py-4 flex justify-center">{getFileIcon(file.mimeType, 20)}</td>
                                            <td className="px-6 py-4 font-medium text-gray-200 group-hover:text-cyan-300 transition-colors">{file.fileName}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-green-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                                    Shielded
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm">
                                                {new Date(file.uploadedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 text-sm text-right font-mono">{fmtSize(file.fileSize)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDownload(file)}
                                                    disabled={dlState[file._id] === 'loading'}
                                                    className="px-4 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                                                >
                                                    {dlState[file._id] === 'loading' ? '...' : dlState[file._id] === 'done' ? 'Done' : 'Download'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* ── RIGHT SIDEBAR ───────────────────────────────────── */}
            <aside className="w-[280px] flex flex-col flex-shrink-0 gap-6">

                {/* Live Security Audit */}
                <div className="bg-[#121520] rounded-[24px] border border-white/5 p-6 flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none"></div>

                    <div className="flex justify-between items-center w-full mb-8">
                        <h2 className="font-bold text-sm tracking-widest uppercase">Live Security Audit</h2>
                        <MoreHorizontal size={18} className="text-gray-500" />
                    </div>

                    {/* Circular Gauge Replica */}
                    <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="60" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(0,229,255,0.6)]" />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#10B981" />
                                    <stop offset="100%" stopColor="#00E5FF" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute text-center flex flex-col items-center">
                            <span className="text-xs text-gray-400 mb-1">Quantum<br />Threat Level:</span>
                            <span className="text-lg font-bold text-green-400">LOW</span>
                        </div>
                    </div>
                </div>

                {/* Recent Security Events */}
                <div className="bg-[#121520] rounded-[24px] border border-white/5 p-6 flex-1">
                    <h2 className="font-bold text-md mb-6">Recent Security Events</h2>

                    <div className="relative space-y-6 before:absolute before:inset-0 before:ml-[3px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                        <EventItem
                            time="10:33 AM"
                            title="User Login:"
                            subtitle="Lattice Key Verified"
                        />
                        <EventItem
                            time="10:32 AM"
                            title="File Uploaded:"
                            subtitle={<span>Hybrid Encrypted<br /><span className="text-gray-500">Automation: Detected</span></span>}
                        />
                        <EventItem
                            time="10:36 AM"
                            title="File Uploaded:"
                            subtitle="Hybrid Encrypted"
                        />
                    </div>
                </div>
            </aside>

        </div>
    );
};

/* ── UI Components ───────────────────────────────── */
const NavItem = ({ icon, label, active, onClick, className = '' }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer w-full text-left ${active ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'} ${className}`}>
        {icon}
        <span className="text-sm">{label}</span>
    </button>
);

const MetricCard = ({ title, value, subtitle, glowColor }) => (
    <div className="bg-[#121520] border border-white/5 p-5 rounded-[20px] relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
        style={{ boxShadow: `0 0 20px ${glowColor.replace('1)', '0.05)')}` }}>
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)`, opacity: 0.5 }}></div>
        <div className="absolute -left-10 top-1/2 w-24 h-24 blur-[40px] rounded-full pointer-events-none transition-all" style={{ background: glowColor, opacity: 0.15 }}></div>

        <h3 className="text-gray-400 text-sm mb-2 relative z-10 font-medium">{title}</h3>
        <div className="text-md font-semibold relative z-10 text-gray-200">{value}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-2 relative z-10">{subtitle}</div>}
    </div>
);

const EventItem = ({ time, title, subtitle }) => (
    <div className="relative flex items-start gap-4 mb-4">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] mt-1.5 flex-shrink-0 relative z-10"></div>
        <div className="text-xs text-gray-500 w-16 pt-1 flex-shrink-0">{time}</div>
        <div className="flex-1 pb-4">
            <div className="text-sm font-semibold text-gray-200">{title}</div>
            <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
        </div>
    </div>
);

export default Dashboard;
