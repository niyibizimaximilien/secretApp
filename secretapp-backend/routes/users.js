// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');  // Make sure to import your User model

// GET /api/users?search=query
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }).select('-password -__v').limit(5);

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;  // Export the router