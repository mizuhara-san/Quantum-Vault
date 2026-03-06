import { useState, useEffect, useContext, useCallback } from 'react';
import {
    ShieldCheck, Lock, Key, Zap, AlertTriangle, CheckCircle2,
    RefreshCw, Cpu, Database, Activity
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';

const ENCRYPTION_STANDARDS = [
    {
        name: 'ML-KEM-768',
        type: 'Key Encapsulation',
        status: 'ACTIVE',
        level: 'Post-Quantum',
        desc: 'NIST FIPS 203 standard. Lattice-based algorithm immune to Shor\'s algorithm — secure against future quantum computers.',
        color: 'cyan',
    },
    {
        name: 'AES-256-GCM',
        type: 'File Encryption',
        status: 'ACTIVE',
        level: 'Military-Grade',
        desc: 'Authenticated encryption with 256-bit keys. GCM mode guarantees both confidentiality and file integrity via auth tags.',
        color: 'green',
    },
    {
        name: 'bcrypt (Salt×10)',
        type: 'Password Hashing',
        status: 'ACTIVE',
        level: 'Best Practice',
        desc: 'One-way hash — your password is never stored in plaintext. Even a full database dump yields nothing useful.',
        color: 'purple',
    },
    {
        name: 'JWT (HS256)',
        type: 'Session Auth',
        status: 'ACTIVE',
        level: 'Standard',
        desc: 'Signed 7-day tokens. No session state stored on the server — stateless and scalable.',
        color: 'yellow',
    },
];

const RECOMMENDATIONS = [
    { done: true, text: 'Files encrypted with AES-256-GCM before upload' },
    { done: true, text: 'Quantum-resistant ML-KEM-768 key encapsulation active' },
    { done: true, text: 'Password stored as bcrypt hash (never plaintext)' },
    { done: true, text: 'Encrypted blob stored on Cloudinary (not raw files)' },
    { done: true, text: 'JWT tokens expire after 7 days' },
    { done: false, text: 'Consider encrypting your private key with your password (advanced)' },
    { done: false, text: 'Enable 2FA for double-layer vault protection (coming soon)' },
];

export default function SecurityAudit() {
    const { user: authUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [fileCount, setFileCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [meRes, filesRes] = await Promise.all([
                    API.get('/auth/me'),
                    API.get('/vault/files'),
                ]);
                setProfile(meRes.data);
                setFileCount(filesRes.data.length);
            } catch (e) { /* silent */ }
            finally { setLoading(false); }
        };
        fetch();
    }, []);

    const createdDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : '—';

    const score = RECOMMENDATIONS.filter(r => r.done).length;
    const total = RECOMMENDATIONS.length;
    const pct = Math.round((score / total) * 100);
    const circumference = 2 * Math.PI * 40;
    const strokeOffset = circumference - (pct / 100) * circumference;

    return (
        <div className="min-h-screen text-white flex p-4 sm:p-6 gap-6 font-sans" style={{ background: '#0F1015' }}>
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0 gap-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-extrabold text-white">Security Audit</h1>
                    <p className="text-sm text-gray-400 mt-1">Full security posture of your quantum vault</p>
                </div>

                {/* Top Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Score Gauge */}
                    <div className="bg-[#121520] rounded-[24px] border border-white/5 p-6 flex flex-col items-center justify-center">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-5">Security Score</h2>
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                <circle cx="50" cy="50" r="40" fill="none"
                                    stroke={pct >= 70 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'}
                                    strokeWidth="8"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={strokeOffset}
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                                />
                            </svg>
                            <div className="absolute text-center">
                                <span className="text-3xl font-extrabold text-white">{pct}%</span>
                                <div className="text-xs text-gray-500 mt-0.5">{score}/{total} passed</div>
                            </div>
                        </div>
                        <div className="mt-4 text-sm font-semibold text-green-400">
                            {pct >= 70 ? '✅ Strong Security' : pct >= 50 ? '⚠️ Moderate' : '🔴 Needs Attention'}
                        </div>
                    </div>

                    {/* Key Info */}
                    <div className="bg-[#121520] rounded-[24px] border border-white/5 p-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Your Quantum Key</h2>
                        {loading ? (
                            <div className="text-gray-500 text-sm"><RefreshCw size={16} className="animate-spin inline mr-2" />Loading...</div>
                        ) : (
                            <div className="space-y-3">
                                {[
                                    { label: 'Algorithm', value: 'ML-KEM-768', icon: <Zap size={14} className="text-cyan-400" /> },
                                    { label: 'Key Standard', value: 'NIST FIPS 203', icon: <Lock size={14} className="text-purple-400" /> },
                                    { label: 'Created', value: createdDate, icon: <Activity size={14} className="text-green-400" /> },
                                    { label: 'Secured Files', value: `${fileCount} file${fileCount !== 1 ? 's' : ''}`, icon: <Database size={14} className="text-yellow-400" /> },
                                ].map(({ label, value, icon }) => (
                                    <div key={label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">{icon}{label}</div>
                                        <span className="text-sm font-semibold text-gray-200">{value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Threat Level */}
                    <div className="bg-[#121520] rounded-[24px] border border-white/5 p-6 flex flex-col items-center justify-center">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Quantum Threat Level</h2>
                        <div className="text-6xl mb-3">🛡️</div>
                        <div className="text-2xl font-extrabold text-green-400 mb-1">LOW</div>
                        <p className="text-xs text-gray-500 text-center leading-relaxed">
                            No known quantum computer can break ML-KEM-768 today. Your files are future-proof.
                        </p>
                    </div>
                </div>

                {/* Encryption Standards */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Encryption Stack</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {ENCRYPTION_STANDARDS.map(({ name, type, status, level, desc, color }) => (
                            <div key={name} className={`bg-[#121520] rounded-[20px] border border-${color}-500/10 p-5 hover:border-${color}-500/25 transition-all`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className={`text-${color}-400 font-bold text-base`}>{name}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{type}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-500/20">{status}</span>
                                        <span className={`text-${color}-400 text-[10px] font-semibold`}>{level}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Security Checklist</h2>
                    <div className="bg-[#121520] rounded-[24px] border border-white/5 divide-y divide-white/5">
                        {RECOMMENDATIONS.map(({ done, text }, i) => (
                            <div key={i} className="flex items-center gap-4 px-5 py-4">
                                {done
                                    ? <CheckCircle2 size={18} className="text-green-400 flex-shrink-0" />
                                    : <AlertTriangle size={18} className="text-yellow-400/60 flex-shrink-0" />
                                }
                                <span className={`text-sm ${done ? 'text-gray-300' : 'text-gray-500'}`}>{text}</span>
                                {done && <span className="ml-auto text-[10px] text-green-500 font-bold uppercase">Done</span>}
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
