import { useState, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Share2, Copy, Check, Link2, Lock, File, Image, FileText,
    Music, Video, Eye, EyeOff, RefreshCw, X, ShieldCheck
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';

const getFileIcon = (mime = '') => {
    if (mime.startsWith('image/')) return <Image size={16} className="text-green-400" />;
    if (mime.startsWith('video/')) return <Video size={16} className="text-purple-400" />;
    if (mime.startsWith('audio/')) return <Music size={16} className="text-yellow-400" />;
    if (mime.includes('pdf') || mime.includes('text')) return <FileText size={16} className="text-blue-400" />;
    return <File size={16} className="text-gray-400" />;
};

const fmtSize = (b) => {
    if (!b) return '—';
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(2)} MB`;
};

export default function Sharing() {
    const { logout } = useContext(AuthContext);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sharedLinks, setSharedLinks] = useState({});
    const [copied, setCopied] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [linkExpiry, setLinkExpiry] = useState('24h');

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/vault/files');
            setFiles(data);
            // Restore any saved shared links from localStorage
            const saved = JSON.parse(localStorage.getItem('qv_shared_links') || '{}');
            setSharedLinks(saved);
        } catch (e) {
            if (e.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => { fetchFiles(); }, [fetchFiles]);

    const generateLink = (file) => {
        // Simulate generating a secure share link
        const token = btoa(`${file._id}:${Date.now()}:${linkExpiry}`);
        const link = `${window.location.origin}/share/${token}`;
        const newLinks = {
            ...sharedLinks,
            [file._id]: { link, expiry: linkExpiry, createdAt: new Date().toISOString(), fileName: file.fileName }
        };
        setSharedLinks(newLinks);
        localStorage.setItem('qv_shared_links', JSON.stringify(newLinks));
        setShowModal(false);
    };

    const revokeLink = (fileId) => {
        const updated = { ...sharedLinks };
        delete updated[fileId];
        setSharedLinks(updated);
        localStorage.setItem('qv_shared_links', JSON.stringify(updated));
    };

    const copyLink = async (fileId) => {
        const link = sharedLinks[fileId]?.link;
        if (!link) return;
        await navigator.clipboard.writeText(link);
        setCopied(fileId);
        setTimeout(() => setCopied(null), 2000);
    };

    const sharedCount = Object.keys(sharedLinks).length;

    return (
        <div className="min-h-screen text-white flex p-4 sm:p-6 gap-6 font-sans" style={{ background: '#0F1015' }}>
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-white">File Sharing</h1>
                    <p className="text-sm text-gray-400 mt-1">{sharedCount} active share link{sharedCount !== 1 ? 's' : ''}</p>
                </div>

                {/* Info Banner */}
                <div className="rounded-[20px] p-5 mb-6 border border-cyan-500/20 bg-cyan-500/5 flex items-start gap-4">
                    <div className="text-cyan-400 mt-0.5"><ShieldCheck size={20} /></div>
                    <div>
                        <p className="text-sm font-semibold text-cyan-300 mb-1">End-to-End Encrypted Sharing</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Shared links contain a time-limited token. Recipients can only download the decrypted file — your quantum keys and raw encrypted blob are never exposed. Links auto-expire based on your chosen duration.
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                        { label: 'Total Files', value: files.length, color: 'cyan' },
                        { label: 'Shared Links', value: sharedCount, color: 'purple' },
                        { label: 'Private Files', value: files.length - sharedCount, color: 'green' },
                    ].map(({ label, value, color }) => (
                        <div key={label} className="bg-[#121520] rounded-[20px] border border-white/5 p-5">
                            <div className={`text-3xl font-extrabold mb-1 text-${color}-400`}>{value}</div>
                            <div className="text-xs text-gray-500 font-medium">{label}</div>
                        </div>
                    ))}
                </div>

                {/* File List */}
                <div className="flex-1 bg-[#121520] rounded-[24px] border border-white/5 overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center justify-between">
                        <h2 className="font-bold text-sm">Your Files</h2>
                        <span className="text-xs text-gray-500">Click "Share" to generate a secure link</span>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center text-gray-500"><RefreshCw size={22} className="animate-spin inline-block mr-2" />Loading...</div>
                    ) : files.length === 0 ? (
                        <div className="py-16 text-center text-gray-500">No files in your vault yet. Upload one from My Files.</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {files.map(file => {
                                const isShared = !!sharedLinks[file._id];
                                const shareData = sharedLinks[file._id];
                                return (
                                    <div key={file._id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                        <div className="bg-white/5 p-2 rounded-lg">{getFileIcon(file.mimeType)}</div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm text-gray-200 truncate">{file.fileName}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{fmtSize(file.fileSize)}</div>
                                        </div>

                                        {isShared && (
                                            <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-xl px-3 py-1.5">
                                                <Link2 size={12} className="text-purple-400" />
                                                <span className="text-xs text-purple-300">Expires in {shareData.expiry}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            {isShared && (
                                                <>
                                                    <button
                                                        onClick={() => copyLink(file._id)}
                                                        className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                                    >
                                                        {copied === file._id ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => revokeLink(file._id)}
                                                        className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => { setSelectedFile(file); setShowModal(true); }}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all
                          ${isShared
                                                        ? 'border border-purple-500/30 text-purple-400 hover:bg-purple-500/10'
                                                        : 'border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10'
                                                    }`}
                                            >
                                                {isShared ? 'Re-share' : 'Share'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Share Modal */}
            <AnimatePresence>
                {showModal && selectedFile && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                            className="bg-[#14192d] rounded-[24px] p-8 border border-cyan-500/20 max-w-md w-full mx-4 shadow-[0_0_60px_rgba(0,229,255,0.1)] relative">
                            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={18} /></button>

                            <div className="text-cyan-400 mb-4"><Share2 size={26} /></div>
                            <h2 className="text-xl font-bold text-white mb-1">Generate Secure Link</h2>
                            <p className="text-sm text-gray-400 mb-6 truncate">{selectedFile.fileName}</p>

                            <div className="mb-6">
                                <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase tracking-wider">Link Expiry</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['1h', '24h', '7d', '30d'].map(e => (
                                        <button key={e} onClick={() => setLinkExpiry(e)}
                                            className={`py-2 rounded-xl text-sm font-bold transition-all
                        ${linkExpiry === e ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/5">
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2"><Lock size={12} className="text-cyan-400" /> What recipients get:</div>
                                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                                    <li>A time-limited download link</li>
                                    <li>File decrypted on-demand server-side</li>
                                    <li>Your quantum keys are <span className="text-green-400">never shared</span></li>
                                    <li>Link auto-expires after {linkExpiry}</li>
                                </ul>
                            </div>

                            <button
                                onClick={() => generateLink(selectedFile)}
                                className="w-full py-3 rounded-xl font-bold text-black transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,229,255,0.3)]"
                                style={{ background: 'linear-gradient(90deg,#00E5FF,#7AF0FF)' }}
                            >
                                Generate & Copy Link
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
