const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateQuantumKeyPair } = require('../utils/pqcService');
const ActivityLog = require('../models/ActivityLog');

// Helper: log an activity
const logActivity = async (userId, action, options = {}) => {
  try {
    await ActivityLog.create({ user: userId, action, ...options });
  } catch (e) { /* non-critical */ }
};

// @desc    Register a new user with Quantum Keys
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("🛠️ Generating ML-KEM-768 Lattice Keys...");
    const { publicKey, privateKey } = generateQuantumKeyPair();

    user = new User({
      name,
      email,
      password: hashedPassword,
      quantumPublicKey: publicKey.toString('hex'),
      quantumPrivateKey: privateKey.toString('hex')
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    await logActivity(user._id, 'LOGIN', { details: 'Account created & first login' });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

    console.log(`✅ User ${name} registered with Quantum Shielding.`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error during registration" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    await logActivity(user._id, 'LOGIN', { details: 'Successful login — Lattice Key Verified' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
};

// @desc    Update user profile (name + optional password)
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (name && name.trim()) {
      user.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new one.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await logActivity(user._id, 'PASSWORD_CHANGE', { details: 'Password updated successfully' });
    }

    await user.save();

    if (name) {
      await logActivity(user._id, 'PROFILE_UPDATE', { details: `Name changed to "${user.name}"` });
    }

    res.json({ message: 'Profile updated.', user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not update profile.' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -quantumPrivateKey');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Could not retrieve profile.' });
  }
};