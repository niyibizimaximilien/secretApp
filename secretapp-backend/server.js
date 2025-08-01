const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const server = http.createServer(app); // wrap express in HTTP server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));


// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB Atlas'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

// --- Dummy Data ---
const users = [
  { id: 'user1', name: 'User One', email: 'user1@example.com' },
  { id: 'user2', name: 'User Two', email: 'user2@example.com' },
  { id: 'user3', name: 'User Three', email: 'user3@example.com' },
];

let chats = [
  {
    id: 'chat1',
    participants: ['user1', 'user2'],
    lastMessage: 'Hello!',
    lastMessageTime: new Date().toISOString(),
    unread: { user1: 0, user2: 1 }
  }
];

let messages = {
  chat1: [
    {
      id: 'msg1',
      senderId: 'user1',
      text: 'Hello!',
      createdAt: new Date().toISOString()
    }
  ]
};

// --- API Routes ---
app.get('/api/users', (req, res) => {
  const search = (req.query.search || '').toLowerCase();
  if (!search) return res.json([]);
  
  const filtered = users.filter(user => user.name.toLowerCase().includes(search));
  res.json(filtered);
});

app.get('/api/chats', (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const userChats = chats
    .filter(chat => chat.participants.includes(userId))
    .map(chat => {
      const otherUserId = chat.participants.find(id => id !== userId);
      const otherUser = users.find(u => u.id === otherUserId);
      return {
        id: chat.id,
        userId: otherUser.id,
        name: otherUser.name,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
        unread: chat.unread[userId] || 0
      };
    });

  res.json(userChats);
});

app.get('/api/chats/:chatId/messages', (req, res) => {
  const chatId = req.params.chatId;
  const chatMessages = messages[chatId] || [];
  res.json(chatMessages);
});

app.post('/api/chats', (req, res) => {
  const { userId1, userId2 } = req.body;
  if (!userId1 || !userId2) return res.status(400).json({ error: 'userId1 and userId2 required' });

  let chat = chats.find(c => {
    return c.participants.includes(userId1) && c.participants.includes(userId2);
  });

  if (chat) {
    return res.json(chat);
  }

  chat = {
    id: uuidv4(),
    participants: [userId1, userId2],
    lastMessage: '',
    lastMessageTime: '',
    unread: { [userId1]: 0, [userId2]: 0 }
  };
  chats.push(chat);
  messages[chat.id] = [];
  res.json(chat);
});

app.post('/api/chats/:chatId/messages', (req, res) => {
  const chatId = req.params.chatId;
  const { senderId, text } = req.body;

  if (!senderId || !text) return res.status(400).json({ error: 'senderId and text required' });

  if (!chats.find(c => c.id === chatId)) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  const message = {
    id: uuidv4(),
    senderId,
    text,
    createdAt: new Date().toISOString()
  };

  messages[chatId] = messages[chatId] || [];
  messages[chatId].push(message);

  const chat = chats.find(c => c.id === chatId);
  chat.lastMessage = text;
  chat.lastMessageTime = message.createdAt;
  chat.participants.forEach(pid => {
    if (pid !== senderId) {
      chat.unread[pid] = (chat.unread[pid] || 0) + 1;
    }
  });

  // Emit message via Socket.IO
  io.to(chatId).emit('newMessage', message);

  res.json(message);
});

// --- Socket.IO Events ---
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`✅ User joined chat room: ${chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// --- Start server ---
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
