import { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Download, Trash2, File, Image, FileText, Music, Video,
    Search, Filter, RefreshCw, CheckCircle2, AlertCircle, X, Plus, Lock, Zap, Cpu, ShieldCheck
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';

const getFileIcon = (mime = '', sz = 20) => {
    if (mime.startsWith('image/')) return <div className="p-2 rounded-lg bg-green-500/15 text-green-400"><Image size={sz} /></div>;
    if (mime.startsWith('video/')) return <div className="p-2 rounded-lg bg-purple-500/15 text-purple-400"><Video size={sz} /></div>;
    if (mime.startsWith('audio/')) return <div className="p-2 rounded-lg bg-yellow-500/15 text-yellow-400"><Music size={sz} /></div>;
    if (mime.includes('pdf')) return <div className="p-2 rounded-lg bg-red-500/15 text-red-400"><FileText size={sz} /></div>;
    if (mime.includes('text')) return <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400"><FileText size={sz} /></div>;
    return <div className="p-2 rounded-lg bg-gray-500/15 text-gray-400"><File size={sz} /></div>;
};

const fmtSize = (b) => {
    if (!b) return '—';
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(2)} MB`;
};

const STEPS = [
    { label: 'Quantum entropy harvest', Icon: Zap },
    { label: 'AES session key derived', Icon: Cpu },
    { label: 'ML-KEM-768 encapsulating', Icon: Lock },
    { label: 'AES-256-GCM encrypting', Icon: ShieldCheck },
    { label: 'Uploading to cloud vault', Icon: Upload },
    { label: 'Quantum shield activated!', Icon: CheckCircle2 },
];

const delay = (ms) => new Promise(r => setTimeout(r, ms));

export default function MyFiles() {
    const { logout } = useContext(AuthContext);
    const navigate = window.history;
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [dlState, setDlState] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [uploadStep, setUploadStep] = useState(-1);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef();

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/vault/files');
            setFiles(data);
        } catch (e) {
            if (e.response?.status === 401) { logout(); }
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    const handleUpload = async (fileToUpload) => {
        if (!fileToUpload) return;
        setUploadError('');
        for (let i = 0; i < 5; i++) { setUploadStep(i); await delay(500 + Math.random() * 300); }
        try {
            const fd = new FormData();
            fd.append('file', fileToUpload);
            await API.post('/vault/upload', fd);
            setUploadStep(5); await delay(1000); await fetchFiles();
        } catch (e) {
            setUploadError(e.response?.data?.message || 'Upload failed.');
        } finally {
            await delay(400); setUploadStep(-1);
        }
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
        }
    };

    const handleDelete = async (fileId) => {
        setDeleting(fileId);
        try {
            await API.delete(`/vault/files/${fileId}`);
            setFiles(prev => prev.filter(f => f._id !== fileId));
        } catch (e) {
            alert(e.response?.data?.message || 'Delete failed.');
        } finally {
            setDeleting(null);
            setDeleteConfirm(null);
        }
    };

    const TYPE_FILTERS = ['all', 'image', 'video', 'audio', 'document', 'other'];
    const filtered = files.filter(f => {
        const matchSearch = f.fileName.toLowerCase().includes(search.toLowerCase());
        const matchFilter = filter === 'all' ||
            (filter === 'image' && f.mimeType?.startsWith('image/')) ||
            (filter === 'video' && f.mimeType?.startsWith('video/')) ||
            (filter === 'audio' && f.mimeType?.startsWith('audio/')) ||
            (filter === 'document' && (f.mimeType?.includes('pdf') || f.mimeType?.includes('text') || f.mimeType?.includes('document'))) ||
            (filter === 'other' && !['image/', 'video/', 'audio/'].some(t => f.mimeType?.startsWith(t)) && !f.mimeType?.includes('pdf'));
        return matchSearch && matchFilter;
    });

    const isUploading = uploadStep >= 0;

    return (
        <div className="min-h-screen text-white flex p-4 sm:p-6 gap-6 font-sans" style={{ background: '#0F1015' }}>
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">My Files</h1>
                        <p className="text-sm text-gray-400 mt-1">{files.length} quantum-shielded file{files.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex gap-3">
                        <input ref={fileInputRef} type="file" hidden onChange={e => { const f = e.target.files[0]; if (f) handleUpload(f); }} disabled={isUploading} />
                        <button
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.4)] disabled:opacity-60"
                            style={{ background: 'linear-gradient(90deg,#00E5FF,#7AF0FF)' }}
                        >
                            {isUploading ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                            {isUploading ? 'Encrypting...' : 'Upload File'}
                        </button>
                    </div>
                </div>

                {/* Upload Pipeline */}
                <AnimatePresence>
                    {isUploading && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mb-6 rounded-[20px] p-5 border border-cyan-500/30 bg-cyan-900/10">
                            <p className="text-xs font-bold text-cyan-400 mb-3 uppercase tracking-widest">Secure Pipeline Active</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {STEPS.map(({ label, Icon }, i) => {
                                    const active = i === uploadStep, done = i < uploadStep;
                                    return (
                                        <div key={label} className="flex items-center gap-2 bg-black/20 p-2.5 rounded-xl border border-white/5">
                                            <span className={done ? 'text-green-400' : active ? 'text-cyan-400' : 'text-gray-600'}>
                                                {active ? <RefreshCw size={14} className="animate-spin" /> : done ? <CheckCircle2 size={14} /> : <Icon size={14} />}
                                            </span>
                                            <span className="text-xs text-gray-300">{label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {uploadError && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
                        <AlertCircle size={16} /> {uploadError}
                    </div>
                )}

                {/* Search + Filter */}
                <div className="flex gap-3 mb-5">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search files..."
                            className="w-full bg-[#121520] border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Filter size={16} className="self-center text-gray-500" />
                        {TYPE_FILTERS.map(t => (
                            <button key={t} onClick={() => setFilter(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                  ${filter === t ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* File Table */}
                <div className="flex-1 bg-[#121520] rounded-[24px] border border-white/5 overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="text-gray-400 border-b border-white/5 bg-black/40">
                            <tr>
                                <th className="px-5 py-4 font-semibold w-14 text-center">Type</th>
                                <th className="px-5 py-4 font-semibold">File Name</th>
                                <th className="px-5 py-4 font-semibold text-center">Status</th>
                                <th className="px-5 py-4 font-semibold">Uploaded</th>
                                <th className="px-5 py-4 font-semibold text-right">Size</th>
                                <th className="px-5 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan="6" className="py-16 text-center text-gray-500"><RefreshCw size={22} className="animate-spin inline-block mr-2" />Loading vault...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="py-16 text-center text-gray-500">No files found.</td></tr>
                            ) : filtered.map(file => (
                                <tr key={file._id} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-5 py-4 text-center">{getFileIcon(file.mimeType)}</td>
                                    <td className="px-5 py-4 font-medium text-gray-200 group-hover:text-cyan-300 transition-colors max-w-[200px] truncate">{file.fileName}</td>
                                    <td className="px-5 py-4 text-center">
                                        <span className="bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border border-green-500/20">Shielded</span>
                                    </td>
                                    <td className="px-5 py-4 text-gray-400 text-xs">
                                        {new Date(file.uploadedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                    </td>
                                    <td className="px-5 py-4 text-right text-gray-400 font-mono text-xs">{fmtSize(file.fileSize)}</td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleDownload(file)}
                                                disabled={dlState[file._id] === 'loading'}
                                                className="px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-colors text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                                            >
                                                {dlState[file._id] === 'loading' ? '...' : dlState[file._id] === 'done' ? '✓' : <Download size={13} />}
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(file)}
                                                disabled={deleting === file._id}
                                                className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors text-xs disabled:opacity-50"
                                            >
                                                {deleting === file._id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Delete Confirm Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                            className="bg-[#14192d] rounded-[24px] p-8 border border-red-500/20 max-w-sm w-full mx-4 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                            <div className="text-red-400 mb-4"><Trash2 size={28} /></div>
                            <h2 className="text-xl font-bold text-white mb-2">Destroy File?</h2>
                            <p className="text-gray-400 text-sm mb-1">You are about to permanently destroy:</p>
                            <p className="text-cyan-300 font-semibold text-sm mb-6 bg-cyan-500/10 px-3 py-2 rounded-lg truncate">{deleteConfirm.fileName}</p>
                            <p className="text-xs text-gray-500 mb-6">This action is irreversible. The encrypted blob will be wiped from Cloudinary and all metadata removed from the vault.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all text-sm font-semibold">Cancel</button>
                                <button onClick={() => handleDelete(deleteConfirm._id)} className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-sm font-semibold">
                                    {deleting === deleteConfirm._id ? <RefreshCw size={14} className="animate-spin inline" /> : 'Destroy Forever'}
                                </button>
                            </div>
                            <button onClick={() => setDeleteConfirm(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={18} /></button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
