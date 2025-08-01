const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET all messages (temporary: for development only)
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error('❌ Failed to fetch messages:', err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

module.exports = router;
