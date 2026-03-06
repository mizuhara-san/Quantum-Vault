import { useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutDashboard, Database, Share2, Activity, ShieldCheck,
    Settings, LogOut, Home, Lock
} from 'lucide-react';

const NAV_ITEMS = [
    { icon: Home, label: 'Home Page', path: '/', external: true },
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Database, label: 'My Files', path: '/files' },
    { icon: Share2, label: 'Sharing', path: '/sharing' },
    { icon: Activity, label: 'Activity Log', path: '/activity' },
    { icon: ShieldCheck, label: 'Security Audit', path: '/security' },
    { icon: Settings, label: 'Settings', path: '/settings' },
];

const Sidebar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = useCallback(() => {
        logout();
        navigate('/login');
    }, [logout, navigate]);

    return (
        <aside
            className="w-[240px] flex flex-col flex-shrink-0 rounded-[24px] p-5 relative overflow-hidden"
            style={{
                background: 'linear-gradient(180deg, rgba(20,25,45,0.6) 0%, rgba(15,18,30,0.8) 100%)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)'
            }}
        >
            {/* Glow blobs */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute top-1/2 -right-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* User profile */}
            <div className="flex items-center gap-3 mb-10 relative z-10">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                    <Lock size={18} />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-sm text-white truncate">{user?.name || 'User'}</span>
                    <span className="text-[10px] text-cyan-400/70 truncate">{user?.email || ''}</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 relative z-10 flex-1">
                {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
                    const active = location.pathname === path;
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer w-full text-left text-sm
                ${active
                                    ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/20'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                }`}
                        >
                            <Icon size={17} className={active ? 'text-cyan-400' : ''} />
                            {label}
                        </button>
                    );
                })}

                <div className="mt-auto pt-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    >
                        <LogOut size={17} />
                        Disconnect Vault
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default Sidebar;
