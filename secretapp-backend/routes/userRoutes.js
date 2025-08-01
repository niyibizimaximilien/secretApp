const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({ 
      username: { $regex: query, $options: 'i' } 
    }).limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;