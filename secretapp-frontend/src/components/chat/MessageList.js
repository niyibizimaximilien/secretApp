import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../context/SocketContext';

const MessageList = ({ currentUser, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const socket = useContext(SocketContext);

  useEffect(() => {
    // Load message history
    const fetchMessages = async () => {
      const res = await axios.get(`/api/messages?sender=${currentUser}&receiver=${otherUser}`);
      setMessages(res.data);
    };
    fetchMessages();

    // Listen for new messages
    socket?.on('newMessage', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket?.off('newMessage');
    };
  }, [currentUser, otherUser, socket]);

  return (
    <div className="message-container">
      {messages.map(msg => (
        <div key={msg._id} className={`message ${msg.sender === currentUser ? 'sent' : 'received'}`}>
          {msg.content}
        </div>
      ))}
    </div>
  );
};