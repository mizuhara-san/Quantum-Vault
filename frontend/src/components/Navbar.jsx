import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LogOut, LayoutDashboard, Home, Menu, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? 'rgba(3,3,8,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,229,255,0.10)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      <nav className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setMenuOpen(false)}>
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center relative overflow-hidden border-glow-anim"
            style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(124,58,237,0.20))', border: '1px solid rgba(0,229,255,0.30)' }}
          >
            <Shield size={20} style={{ color: '#00E5FF' }} />
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,229,255,0.2), transparent 70%)' }} />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="grad-cyan">Quantum</span>
            <span className="text-white">Vault</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          <NavItem to="/" label="Home" active={location.pathname === '/'} icon={<Home size={15} />} />
          {user && <NavItem to="/dashboard" label="Vault" active={location.pathname === '/dashboard'} icon={<LayoutDashboard size={15} />} />}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="badge-cyan">
                <span className="dot-pulse" />
                {user.name}
              </div>
              <button onClick={handleLogout} className="btn-ghost" style={{ padding: '0.5rem 1.2rem', fontSize: '0.875rem' }}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost" style={{ padding: '0.55rem 1.4rem', fontSize: '0.875rem' }}>Login</Link>
              <Link to="/register" className="btn-primary" style={{ padding: '0.55rem 1.4rem', fontSize: '0.875rem' }}>Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: '#fff' }}
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden"
            style={{ background: 'rgba(3,3,8,0.96)', borderTop: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)' }}
          >
            <div className="px-5 py-4 flex flex-col gap-3">
              <Link to="/" onClick={() => setMenuOpen(false)} className="text-sm font-medium py-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Home</Link>
              {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="text-sm font-medium py-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Vault</Link>}
              {user ? (
                <button onClick={handleLogout} className="btn-ghost w-full mt-2" style={{ fontSize: '0.875rem', padding: '0.65rem' }}>
                  <LogOut size={15} /> Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-ghost w-full text-center" style={{ fontSize: '0.875rem', padding: '0.65rem' }}>Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary w-full text-center" style={{ fontSize: '0.875rem', padding: '0.65rem' }}>Get Started</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

const NavItem = ({ to, label, active, icon }) => (
  <Link
    to={to}
    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
    style={{
      color: active ? '#00E5FF' : 'rgba(255,255,255,0.60)',
      background: active ? 'rgba(0,229,255,0.08)' : 'transparent',
      border: active ? '1px solid rgba(0,229,255,0.18)' : '1px solid transparent',
    }}
  >
    {icon}
    {label}
  </Link>
);

export default Navbar;