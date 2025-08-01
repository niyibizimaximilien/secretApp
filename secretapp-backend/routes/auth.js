const express = require('express');
const router = express.Router();

// Dummy login route
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // For now, return test response
  res.json({
    message: 'Login successful!',
    user: { username }
  });
});

module.exports = router;
