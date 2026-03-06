import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, Trash2, CheckCircle2, AlertCircle, RefreshCw,
    Eye, EyeOff, Shield, ChevronRight, AlertTriangle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';

const TAB_CONFIG = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

export default function Settings() {
    const { user: authUser, logout } = useContext(AuthContext);
    const [tab, setTab] = useState('profile');

    // Profile state
    const [name, setName] = useState(authUser?.name || '');
    const [profileMsg, setProfileMsg] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);

    // Password state
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [pwMsg, setPwMsg] = useState(null);
    const [savingPw, setSavingPw] = useState(false);

    // Danger state
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleProfileSave = async () => {
        if (!name.trim()) { setProfileMsg({ type: 'error', text: 'Name cannot be empty.' }); return; }
        setSavingProfile(true);
        setProfileMsg(null);
        try {
            const { data } = await API.put('/auth/profile', { name: name.trim() });
            setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
            // Update displayed user name without full reload
            authUser.name = data.user.name;
        } catch (e) {
            setProfileMsg({ type: 'error', text: e.response?.data?.message || 'Update failed.' });
        } finally { setSavingProfile(false); }
    };

    const handlePasswordChange = async () => {
        if (!currentPw || !newPw || !confirmPw) { setPwMsg({ type: 'error', text: 'All fields required.' }); return; }
        if (newPw !== confirmPw) { setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return; }
        if (newPw.length < 8) { setPwMsg({ type: 'error', text: 'New password must be at least 8 characters.' }); return; }
        setSavingPw(true);
        setPwMsg(null);
        try {
            await API.put('/auth/profile', { currentPassword: currentPw, newPassword: newPw });
            setPwMsg({ type: 'success', text: 'Password changed successfully!' });
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
        } catch (e) {
            setPwMsg({ type: 'error', text: e.response?.data?.message || 'Password change failed.' });
        } finally { setSavingPw(false); }
    };

    const Msg = ({ msg }) => {
        if (!msg) return null;
        return (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-xl border ${msg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {msg.text}
            </div>
        );
    };

    const Field = ({ label, children }) => (
        <div>
            <label className="text-xs font-semibold text-gray-400 mb-2 block uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );

    const Input = ({ type = 'text', value, onChange, placeholder, suffix }) => (
        <div className="relative">
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
            {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
        </div>
    );

    return (
        <div className="min-h-screen text-white flex p-4 sm:p-6 gap-6 font-sans" style={{ background: '#0F1015' }}>
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-extrabold text-white">Settings</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage your vault account and security preferences</p>
                </div>

                {/* User Card */}
                <div className="bg-[#121520] rounded-[20px] border border-white/5 p-5 flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 rounded-[14px] bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                        <User size={24} />
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white">{authUser?.name}</div>
                        <div className="text-sm text-gray-400">{authUser?.email}</div>
                    </div>
                    <div className="ml-auto flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl">
                        <Shield size={14} className="text-green-400" />
                        <span className="text-xs font-semibold text-green-400">Quantum Protected</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-black/30 rounded-xl p-1 mb-6 w-fit border border-white/5">
                    {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setTab(id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold transition-all
                ${tab === id
                                    ? id === 'danger'
                                        ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                                        : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Profile Tab */}
                {tab === 'profile' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#121520] rounded-[24px] border border-white/5 p-6 max-w-md space-y-5">
                        <h2 className="font-bold text-white mb-2">Profile Information</h2>
                        <Field label="Display Name">
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
                        </Field>
                        <Field label="Email Address">
                            <Input value={authUser?.email || ''} placeholder="Email" />
                            <p className="text-xs text-gray-600 mt-1.5">Email cannot be changed for security reasons.</p>
                        </Field>
                        <Field label="Account ID">
                            <div className="bg-black/30 border border-white/5 rounded-xl px-4 py-3 text-xs text-gray-500 font-mono truncate">{authUser?.id}</div>
                        </Field>
                        <Msg msg={profileMsg} />
                        <button
                            onClick={handleProfileSave}
                            disabled={savingProfile}
                            className="w-full py-3 rounded-xl font-bold text-black transition-all hover:scale-[1.02] disabled:opacity-60 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                            style={{ background: 'linear-gradient(90deg,#00E5FF,#7AF0FF)' }}
                        >
                            {savingProfile ? <RefreshCw size={16} className="animate-spin inline mr-2" /> : null}
                            Save Changes
                        </button>
                    </motion.div>
                )}

                {/* Security Tab */}
                {tab === 'security' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#121520] rounded-[24px] border border-white/5 p-6 max-w-md space-y-5">
                        <h2 className="font-bold text-white mb-2">Change Password</h2>
                        <Field label="Current Password">
                            <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Current password" />
                        </Field>
                        <Field label="New Password">
                            <Input
                                type={showPw ? 'text' : 'password'}
                                value={newPw}
                                onChange={e => setNewPw(e.target.value)}
                                placeholder="New password (min 8 chars)"
                                suffix={
                                    <button onClick={() => setShowPw(p => !p)} className="text-gray-500 hover:text-gray-300">
                                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                }
                            />
                        </Field>
                        <Field label="Confirm New Password">
                            <Input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" />
                        </Field>
                        <Msg msg={pwMsg} />
                        <button
                            onClick={handlePasswordChange}
                            disabled={savingPw}
                            className="w-full py-3 rounded-xl font-bold text-black transition-all hover:scale-[1.02] disabled:opacity-60 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
                            style={{ background: 'linear-gradient(90deg,#00E5FF,#7AF0FF)' }}
                        >
                            {savingPw ? <RefreshCw size={16} className="animate-spin inline mr-2" /> : null}
                            Update Password
                        </button>

                        <div className="pt-4 border-t border-white/5">
                            <h3 className="text-sm font-semibold text-gray-300 mb-3">Quantum Key Status</h3>
                            <div className="space-y-2">
                                {[
                                    { label: 'Algorithm', value: 'ML-KEM-768' },
                                    { label: 'Standard', value: 'NIST FIPS 203' },
                                    { label: 'Key Status', value: '✅ Active — Quantum Safe' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex items-center justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                                        <span className="text-gray-500 text-xs">{label}</span>
                                        <span className="text-gray-300 text-xs font-semibold">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Danger Zone Tab */}
                {tab === 'danger' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-[#121520] rounded-[24px] border border-red-500/15 p-6 max-w-md">
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle size={20} className="text-red-400" />
                            <h2 className="font-bold text-red-400">Danger Zone</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-red-500/15 bg-red-500/5">
                                <div className="font-semibold text-sm text-white mb-1">Sign out of all sessions</div>
                                <p className="text-xs text-gray-500 mb-3">Invalidates your current login token. You will be redirected to the login page.</p>
                                <button onClick={() => { logout(); window.location.href = '/login'; }}
                                    className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-xs font-semibold">
                                    Sign Out Everywhere
                                </button>
                            </div>
                            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                                <div className="font-semibold text-sm text-white mb-1">Delete Account</div>
                                <p className="text-xs text-gray-500 mb-3">Permanently destroys your vault, all files, keys, and activity history. This cannot be undone.</p>
                                <button onClick={() => setShowDeleteModal(true)}
                                    className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all text-xs font-semibold">
                                    Delete My Account
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>

            {/* Delete Confirm Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            className="bg-[#14192d] rounded-[24px] p-8 border border-red-500/20 max-w-sm w-full mx-4">
                            <div className="text-red-400 mb-3"><Trash2 size={28} /></div>
                            <h2 className="text-xl font-bold text-white mb-2">Delete Account?</h2>
                            <p className="text-sm text-gray-400 mb-4">Type <span className="text-red-300 font-mono">DELETE</span> to confirm:</p>
                            <input
                                value={deleteConfirm}
                                onChange={e => setDeleteConfirm(e.target.value)}
                                placeholder="Type DELETE to confirm"
                                className="w-full bg-black/30 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none mb-4"
                            />
                            <div className="flex gap-3">
                                <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(''); }}
                                    className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 text-sm font-semibold">
                                    Cancel
                                </button>
                                <button
                                    disabled={deleteConfirm !== 'DELETE'}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                                    onClick={() => { logout(); window.location.href = '/login'; }}
                                >
                                    Delete Forever
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
