const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function
const generateRecoveryPhrase = () => {
  const words = ['apple', 'banana', 'cherry', 'date', 'fig', 'grape'];
  return Array(3).fill().map(() => words[Math.floor(Math.random() * words.length)]).join(' ');
};

// Controller functions
const signup = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const recoveryPhrase = generateRecoveryPhrase();
    const user = new User({ username, password, recoveryPhrase });
    await user.save();

    res.json({ 
      success: true,
      recoveryPhrase,
      message: "Account created successfully!" 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//Add these methods to your authController
const verifyRecovery = async (req, res) => {
  try {
    const { username, recoveryPhrase } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare recovery phrases (plaintext for now - see security note below)
    if (user.recoveryPhrase !== recoveryPhrase) {
      return res.status(401).json({ error: "Invalid recovery phrase" });
    }

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { username, recoveryPhrase, newPassword } = req.body;
    
    const user = await User.findOne({ username });
    if (!user || user.recoveryPhrase !== recoveryPhrase) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export all controllers

module.exports = {
  signup,
  login,
  verifyRecovery,
  resetPassword
};


