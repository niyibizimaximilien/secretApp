const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/verify-recovery', authController.verifyRecovery);
router.post('/reset-password', authController.resetPassword);

// Test Route
router.get('/test', (req, res) => {
  res.send('Auth route is working!');
});

// ✅ Export after all routes are defined
module.exports = router;
