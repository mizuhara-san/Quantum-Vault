import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ShieldCheck, Loader2, Eye, EyeOff, Home } from 'lucide-react';
import Navbar from '../components/Navbar';


const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already be in use.');
    } finally { setLoading(false); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 pt-10 pb-10 overflow-hidden" style={{ background: '#030308' }}>
      <Navbar />
      {/* Background */}
      <div className="absolute inset-0">
        <img src="/hero-bg.png" alt="" className="w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(3,3,8,0.80) 0%, rgba(7,7,26,0.75) 100%)' }} />
      </div>

      {/* Go to Home Button (Floating) */}
      <Link to="/" className="absolute top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
        <Home size={16} /> Go to Home
      </Link>

      {/* Glow orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,0.09), transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute bottom-1/4 left-1/5 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)', filter: 'blur(40px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass p-8 sm:p-10"
          style={{ background: 'rgba(7,7,26,0.72)', border: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,229,255,0.06) inset' }}>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mb-5 rounded-3xl flex items-center justify-center"
              style={{ width: 72, height: 72, background: 'linear-gradient(135deg, rgba(0,229,255,0.18), rgba(124,58,237,0.22))', border: '1px solid rgba(0,229,255,0.30)' }}
            >
              <ShieldCheck size={32} style={{ color: '#00E5FF' }} />
            </motion.div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Create Identity</h1>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.40)' }}>
              Your ML-KEM-768 key pair will be generated instantly
            </p>
          </div>

          {/* Key generation info strip */}
          <div className="mb-5 px-4 py-3 rounded-2xl flex items-center gap-3"
            style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)' }}>
            <span className="dot-pulse" />
            <p className="text-xs font-medium" style={{ color: '#00E5FF' }}>
              NIST FIPS 203 · ML-KEM-768 key generation active
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 px-4 py-3 rounded-xl text-sm flex gap-2 items-center"
              style={{ background: 'rgba(244,63,94,0.10)', border: '1px solid rgba(244,63,94,0.28)', color: '#FDA4AF' }}>
              ⚠️ {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.30)' }} />
              <input type="text" name="name" placeholder="Full Name" value={form.name}
                onChange={onChange} className="input-glass" required />
            </div>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.30)' }} />
              <input type="email" name="email" placeholder="Email address" value={form.email}
                onChange={onChange} className="input-glass" required />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.30)' }} />
              <input type={showPw ? 'text' : 'password'} name="password" placeholder="Master password" value={form.password}
                onChange={onChange} className="input-glass" style={{ paddingRight: '3rem' }} required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.30)' }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Generating Lattice Keys…</>
                : <><ShieldCheck size={18} /> Initialize Vault</>
              }
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.38)' }}>
            Already have a vault?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#00E5FF' }}>Log in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;