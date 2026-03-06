import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Key, Server, Globe, ArrowRight, AlertTriangle, CheckCircle2, X, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';


const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] },
});

const Home = () => (
  <div style={{ background: '#030308' }}>
    <Navbar />


    {/* ══════════════════════════════════════════
        HERO SECTION — Full bleed image
    ══════════════════════════════════════════ */}
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Background image */}
      <div className="hero-bg" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0,229,255,0.06), transparent 70%)',
      }} />
      <div className="absolute inset-x-0 bottom-0 z-10 h-64 pointer-events-none" style={{
        background: 'linear-gradient(to top, #030308 0%, transparent 100%)',
      }} />

      {/* Content */}
      <div className="relative z-20 text-center max-w-5xl mx-auto px-5 pt-28 pb-20">

        {/* Label badge */}
        <motion.div {...fadeUp(0)} className="flex justify-center mb-7">
          <div className="badge-cyan">
            <span className="dot-pulse" />
            NIST FIPS 203 · ML-KEM-768 · Post-Quantum Certified
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1 {...fadeUp(0.08)} className="display-1 text-white mb-6">
          Encrypt Today.
          <br />
          <span className="grad-cyan text-glow-cyan">Safe Forever.</span>
        </motion.h1>

        <motion.p {...fadeUp(0.16)} className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
          style={{ color: 'rgba(255,255,255,0.55)' }}>
          Quantum computers will break RSA and ECC in seconds.
          QuantumVault uses NIST-standard lattice cryptography to make your files
          <strong style={{ color: 'rgba(255,255,255,0.80)' }}> mathematically invisible</strong> — today and tomorrow.
        </motion.p>

        {/* CTA row */}
        <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/register" className="btn-primary" style={{ fontSize: '1.05rem', padding: '1rem 2.2rem' }}>
            <Shield size={20} /> Start Shielding Free
          </Link>
          <Link to="/login" className="btn-ghost" style={{ fontSize: '1.05rem', padding: '1rem 2.2rem' }}>
            Access Vault <ArrowRight size={18} />
          </Link>
        </motion.div>

        {/* Floating stat pills */}
        <motion.div {...fadeUp(0.30)} className="flex flex-wrap justify-center gap-3">
          {[
            { label: '256-bit Quantum Security', color: '#00E5FF' },
            { label: 'AES-256-GCM', color: '#A78BFA' },
            { label: 'ANU QRNG Entropy', color: '#10B981' },
            { label: 'NIST FIPS 203', color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="px-4 py-2 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: s.color, backdropFilter: 'blur(10px)' }}>
              {s.label}
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ color: 'rgba(255,255,255,0.28)' }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </div>
    </section>

    {/* ══════════════════════════════════════════
        TWO-COL — Vault hero image + text
    ══════════════════════════════════════════ */}
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <motion.div {...fadeUp()}>
        <div className="badge-purple mb-5">Why Quantum Encryption Now?</div>
        <h2 className="section-title text-white mb-5">
          The "Store Now,<br />
          <span className="grad-warm">Decrypt Later" Threat</span>
        </h2>
        <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
          State actors are harvesting encrypted traffic today, storing petabytes in data centers.
          When a cryptographically-relevant quantum computer arrives — estimated within 10–15 years —
          they will decrypt everything retroactively.
        </p>
        <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
          QuantumVault encrypts with <strong style={{ color: '#00E5FF' }}>ML-KEM-768 (NIST FIPS 203)</strong> today,
          so your data remains private even in that future.
        </p>

        {/* Alert card */}
        <div className="glass p-5 flex items-start gap-4"
          style={{ borderColor: 'rgba(244,63,94,0.25)', background: 'rgba(244,63,94,0.05)' }}>
          <AlertTriangle size={22} style={{ color: '#F43F5E', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#F43F5E' }}>SNDL Attack Vector Active</p>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
              NSA has confirmed adversaries are collecting encrypted data as of 2024. Your RSA files are already at risk.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeUp(0.1)} className="relative">
        <div className="absolute inset-0 rounded-3xl glow-purple opacity-30 pointer-events-none" />
        <img
          src="/vault-hero.png"
          alt="Quantum Vault holographic lock"
          className="w-full rounded-3xl float-2"
          style={{ border: '1px solid rgba(124,58,237,0.25)', boxShadow: '0 0 60px rgba(124,58,237,0.15)' }}
        />
      </motion.div>
    </section>

    {/* ══════════════════════════════════════════
        FEATURES — 6-card glassmorphism grid
    ══════════════════════════════════════════ */}
    <section className="section-dark py-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp()} className="text-center mb-14">
          <div className="badge-cyan mx-auto mb-5">Built Different</div>
          <h2 className="section-title text-white mb-4">
            Mathematically<br /><span className="grad-cyan">Unbreakable.</span>
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1rem' }}>
            Every layer of QuantumVault was chosen for post-quantum resilience — no shortcuts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.div {...fadeUp(i * 0.06)} key={f.title} className="glass-card p-7">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: `${f.col}14`, border: `1px solid ${f.col}28` }}>
                <f.Icon size={22} style={{ color: f.col }} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ══════════════════════════════════════════
        HOW IT WORKS — Lattice image + steps
    ══════════════════════════════════════════ */}
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <motion.div {...fadeUp(0.1)} className="relative order-2 lg:order-1">
        <div className="absolute inset-0 rounded-3xl glow-cyan opacity-20 pointer-events-none" />
        <img
          src="/lattice.png"
          alt="Quantum lattice cryptography visualization"
          className="w-full rounded-3xl float-1"
          style={{ border: '1px solid rgba(0,229,255,0.18)', boxShadow: '0 0 60px rgba(0,229,255,0.08)' }}
        />
      </motion.div>

      <motion.div {...fadeUp()} className="order-1 lg:order-2">
        <div className="badge-cyan mb-5">Encryption Pipeline</div>
        <h2 className="section-title text-white mb-8">
          How the <span className="grad-cyan">Shield Works</span>
        </h2>
        <div className="space-y-5">
          {HOW_STEPS.map((s, i) => (
            <motion.div {...fadeUp(i * 0.08)} key={s.title}
              className="flex items-start gap-4 p-5 glass-card"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${s.col}, ${s.col2})`, color: '#000' }}>
                {s.step}
              </div>
              <div>
                <p className="font-bold text-white mb-1">{s.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>

    {/* ══════════════════════════════════════════
        COMPARISON TABLE
    ══════════════════════════════════════════ */}
    <section className="section-dark py-24">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <motion.div {...fadeUp()} className="text-center mb-12">
          <h2 className="section-title text-white mb-3">Why <span className="grad-cyan">Switch Now?</span></h2>
          <p style={{ color: 'rgba(255,255,255,0.45)' }}>RSA and ECC are already being harvested. See how we compare.</p>
        </motion.div>

        <motion.div {...fadeUp(0.1)} className="glass overflow-hidden">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <th className="py-4 px-6 text-left font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>Feature</th>
                <th className="py-4 px-6 text-center font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>RSA-4096 / ECC</th>
                <th className="py-4 px-6 text-center font-bold" style={{ color: '#00E5FF', background: 'rgba(0,229,255,0.05)' }}>QuantumVault ✨</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_ROWS.map(([label, legacy, qv]) => (
                <tr key={label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="py-3.5 px-6 font-medium" style={{ color: 'rgba(255,255,255,0.70)' }}>{label}</td>
                  <td className="py-3.5 px-6 text-center">
                    {legacy ? <CheckCircle2 size={18} className="inline-block" style={{ color: '#10B981' }} />
                      : <X size={18} className="inline-block" style={{ color: '#F43F5E' }} />}
                  </td>
                  <td className="py-3.5 px-6 text-center" style={{ background: 'rgba(0,229,255,0.03)' }}>
                    <CheckCircle2 size={18} className="inline-block" style={{ color: '#00E5FF' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>

    {/* ══════════════════════════════════════════
        FINAL CTA
    ══════════════════════════════════════════ */}
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-28 text-center">
      <motion.div {...fadeUp()}>
        <div className="badge-cyan mx-auto mb-7">Free to Get Started</div>
        <h2 className="display-2 text-white mb-5">
          Build for Tomorrow,<br /><span className="grad-cyan">Start Today.</span>
        </h2>
        <p className="max-w-lg mx-auto mb-10 text-lg" style={{ color: 'rgba(255,255,255,0.48)' }}>
          Join the post-quantum era. Your ML-KEM-768 key pair is generated the moment you register.
        </p>
        <Link to="/register" className="btn-primary" style={{ fontSize: '1.1rem', padding: '1.1rem 2.8rem' }}>
          <Shield size={22} /> Initialize My Quantum Vault
        </Link>
        <p className="mt-5 text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
          No credit card · NIST FIPS 203 certified · ML-KEM-768 standard
        </p>
      </motion.div>
    </section>
  </div>
);

/* ─── Data ───────────────────────────────────────── */
const FEATURES = [
  { Icon: Shield, col: '#00E5FF', title: 'Post-Quantum KEM', desc: 'ML-KEM-768 lattice-based key encapsulation resists Shor\'s algorithm. Standardized by NIST in FIPS 203 (2024).' },
  { Icon: Zap, col: '#A78BFA', title: 'Quantum Randomness', desc: 'AES keys derived from Australia National University\'s Quantum Random Number Generator — true photon vacuum entropy.' },
  { Icon: Lock, col: '#10B981', title: 'AES-256-GCM Cipher', desc: 'Authenticated encryption. The GCM auth tag cryptographically detects any tampering before decryption even begins.' },
  { Icon: Key, col: '#F59E0B', title: 'Hybrid Encryption', desc: 'Your AES session key is wrapped in ML-KEM-768 ciphertext. Two layers of protection — classical + quantum.' },
  { Icon: Server, col: '#F43F5E', title: 'Zero Key Exposure', desc: 'The decapsulated AES key exists only in server RAM for milliseconds. It is never written to disk or logged.' },
  { Icon: Globe, col: '#38BDF8', title: 'SNDL Immunity', desc: '"Store Now, Decrypt Later" attacks fail completely because your data is already quantum-resistant today.' },
];

const HOW_STEPS = [
  { step: 'A', col: '#00E5FF', col2: '#38BDF8', title: 'ML-KEM Key Exchange', desc: 'Server generates your ML-KEM-768 key pair during registration. The shared secret is derived from hard lattice math.' },
  { step: 'B', col: '#A78BFA', col2: '#7C3AED', title: 'QRNG Session Key', desc: 'A random 256-bit AES key is seeded from ANU quantum entropy and the ML-KEM shared seed.' },
  { step: 'C', col: '#10B981', col2: '#059669', title: 'AES-256-GCM Encrypt', desc: 'Your file is encrypted with authenticated GCM mode. The auth tag prevents any silent tampering.' },
  { step: 'D', col: '#F59E0B', col2: '#D97706', title: 'Secure Distributed Storage', desc: 'Encrypted blob → Cloudinary. ML-KEM ciphertext + IV + auth tag → MongoDB Atlas. Keys stay separated.' },
];

const TABLE_ROWS = [
  ["Resists Shor's Algorithm", false, true],
  ["NIST Post-Quantum Standard", false, true],
  ["SNDL Attack Immunity", false, true],
  ["Authenticated Encryption", false, true],
  ["True Quantum Entropy (QRNG)", false, true],
  ["Works on Today's Hardware", true, true],
  ["Future-Proof (50+ years)", false, true],
];

export default Home;