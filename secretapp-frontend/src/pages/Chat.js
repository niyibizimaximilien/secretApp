import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { io } from 'socket.io-client';

const ChatPage = () => {
  const { chatId } = useParams();
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_API_URL, {
      auth: { token: localStorage.getItem('token') }
    });
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  // Load chat data
  useEffect(() => {
    if (!chatId || !currentUser) return;

    const loadChatData = async () => {
      try {
        // Get chat and recipient info
        const chatRes = await axios.get(`/api/chats/${chatId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        const recipientId = chatRes.data.participants.find(id => id !== currentUser._id);
        const userRes = await axios.get(`/api/users/${recipientId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        setRecipient(userRes.data);

        // Load messages
        const messagesRes = await axios.get(`/api/chats/${chatId}/messages`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMessages(messagesRes.data);

        // Join chat room
        if (socket) {
          socket.emit('join-chat', chatId);
        }
      } catch (err) {
        console.error('Failed to load chat:', err);
      }
    };

    loadChatData();
  }, [chatId, currentUser, socket]);

  // Handle real-time messages
  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('new-message');
    };
  }, [socket]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await axios.post(
        `/api/chats/${chatId}/messages`,
        { text: newMessage },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      )
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Chat header */}
      {recipient && (
        <div className="bg-white p-4 border-b flex items-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
            {recipient.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold">{recipient.name}</h2>
            <p className="text-xs text-gray-500">Online</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex mb-4 ${message.sender === currentUser._id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === currentUser._id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border'
                }`}
              >
                <p>{message.text}</p>
                <p className={`text-xs mt-1 text-right ${
                  message.sender === currentUser._id ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="bg-white p-4 border-t">
        <div className="flex">
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 border rounded-l-lg py-2 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;