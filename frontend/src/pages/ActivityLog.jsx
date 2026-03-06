import { useState, useEffect, useContext, useCallback } from 'react';
import {
    Upload, Download, Trash2, LogIn, User, Key,
    RefreshCw, Activity, AlertCircle, CheckCircle2, Clock
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import Sidebar from '../components/Sidebar';

const ACTION_CONFIG = {
    UPLOAD: { icon: Upload, color: 'cyan', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', label: 'File Uploaded' },
    DOWNLOAD: { icon: Download, color: 'green', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'File Downloaded' },
    DELETE: { icon: Trash2, color: 'red', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'File Destroyed' },
    LOGIN: { icon: LogIn, color: 'purple', bg: 'bg-purple-500/10', border: 'border-purple-500/20', label: 'Vault Accessed' },
    PROFILE_UPDATE: { icon: User, color: 'yellow', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', label: 'Profile Updated' },
    PASSWORD_CHANGE: { icon: Key, color: 'orange', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Password Changed' },
};

const groupByDate = (logs) => {
    const groups = {};
    logs.forEach(log => {
        const date = new Date(log.timestamp).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        if (!groups[date]) groups[date] = [];
        groups[date].push(log);
    });
    return groups;
};

export default function ActivityLog() {
    const { logout } = useContext(AuthContext);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/vault/activity');
            setLogs(data);
        } catch (e) {
            if (e.response?.status === 401) logout();
        } finally {
            setLoading(false);
        }
    }, [logout]);

    useEffect(() => { fetchLogs(); }, [fetchLogs]);

    const ACTION_TYPES = ['ALL', 'UPLOAD', 'DOWNLOAD', 'DELETE', 'LOGIN', 'PROFILE_UPDATE', 'PASSWORD_CHANGE'];
    const filtered = filter === 'ALL' ? logs : logs.filter(l => l.action === filter);
    const grouped = groupByDate(filtered);

    const stats = {
        uploads: logs.filter(l => l.action === 'UPLOAD').length,
        downloads: logs.filter(l => l.action === 'DOWNLOAD').length,
        logins: logs.filter(l => l.action === 'LOGIN').length,
    };

    return (
        <div className="min-h-screen text-white flex p-4 sm:p-6 gap-6 font-sans" style={{ background: '#0F1015' }}>
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white">Activity Log</h1>
                        <p className="text-sm text-gray-400 mt-1">Full audit trail of your vault actions</p>
                    </div>
                    <button onClick={fetchLogs} className="p-2 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                        <RefreshCw size={16} />
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-[#121520] rounded-[20px] border border-white/5 p-5">
                        <div className="text-3xl font-extrabold text-cyan-400 mb-1">{stats.uploads}</div>
                        <div className="text-xs text-gray-500">Uploads</div>
                    </div>
                    <div className="bg-[#121520] rounded-[20px] border border-white/5 p-5">
                        <div className="text-3xl font-extrabold text-green-400 mb-1">{stats.downloads}</div>
                        <div className="text-xs text-gray-500">Downloads</div>
                    </div>
                    <div className="bg-[#121520] rounded-[20px] border border-white/5 p-5">
                        <div className="text-3xl font-extrabold text-purple-400 mb-1">{stats.logins}</div>
                        <div className="text-xs text-gray-500">Vault Accesses</div>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex gap-2 mb-5 flex-wrap">
                    {ACTION_TYPES.map(t => (
                        <button key={t} onClick={() => setFilter(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all
                ${filter === t ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                            {t === 'ALL' ? 'All Events' : ACTION_CONFIG[t]?.label || t}
                        </button>
                    ))}
                </div>

                {/* Timeline */}
                <div className="flex-1 space-y-8">
                    {loading ? (
                        <div className="py-16 text-center text-gray-500">
                            <RefreshCw size={22} className="animate-spin inline-block mr-2" />Loading audit log...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-gray-500">
                            <Activity size={28} className="mx-auto mb-3 text-gray-600" />
                            No activity events found.
                        </div>
                    ) : (
                        Object.entries(grouped).map(([date, events]) => (
                            <div key={date}>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{date}</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                    <span className="text-xs text-gray-600">{events.length} events</span>
                                </div>

                                <div className="space-y-3">
                                    {events.map((log) => {
                                        const cfg = ACTION_CONFIG[log.action] || ACTION_CONFIG.LOGIN;
                                        const Icon = cfg.icon;
                                        return (
                                            <div key={log._id} className={`flex items-start gap-4 p-4 rounded-[16px] border ${cfg.bg} ${cfg.border} transition-all hover:brightness-110`}>
                                                <div className={`p-2 rounded-lg bg-${cfg.color}-500/20 flex-shrink-0 mt-0.5`}>
                                                    <Icon size={16} className={`text-${cfg.color}-400`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-sm font-semibold text-white">{cfg.label}</span>
                                                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                                            <Clock size={11} />
                                                            {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    {log.fileName && (
                                                        <div className="text-xs text-gray-400 mt-1 truncate">
                                                            📁 {log.fileName}
                                                        </div>
                                                    )}
                                                    {log.details && (
                                                        <div className="text-xs text-gray-500 mt-1">{log.details}</div>
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0">
                                                    {log.status === 'SUCCESS'
                                                        ? <CheckCircle2 size={14} className="text-green-500/60" />
                                                        : <AlertCircle size={14} className="text-red-500/60" />
                                                    }
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
