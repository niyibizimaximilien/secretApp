import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Recover from './components/auth/Recover';
import Chat from './pages/Chat';
import SearchPage from './pages/SearchPage';
import HomePage from './pages/HomePage'; // ✅ Fix path
import ChatWindow from './components/ChatWindow'; // ✅ Fix path if needed
import { SocketProvider } from './context/SocketContext';

const currentUserId = "someUserId"; // Replace with real user ID from state/context

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/recover" element={<Recover />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/chat-window" element={
          <SocketProvider>
            <ChatWindow currentUser={currentUserId} />
          </SocketProvider>
        } />
        {/* Optional: fallback route */}
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
