import { useState, useEffect, useRef, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';
import axios from 'axios';

export default function ChatWindow({ currentUser, otherUserId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const socket = useContext(SocketContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axios.get(`/api/messages/${otherUserId}`);
      setMessages(res.data);
    };
    fetchMessages();

    socket?.on('newMessage', (message) => {
      if ([message.sender, message.receiver].includes(otherUserId)) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => {
      socket?.off('newMessage');
    };
  }, [otherUserId, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const message = {
        sender: currentUser,
        receiver: otherUserId,
        content: newMessage
      };

      socket.emit('privateMessage', message);
      setNewMessage('');
    }
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {messages.map(msg => (
          <div 
            key={msg._id} 
            className={`message ${msg.sender === currentUser ? 'sent' : 'received'}`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}