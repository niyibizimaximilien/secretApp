import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ConversationList({ currentUser }) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const res = await axios.get('/api/messages/conversations');
      setConversations(res.data);
    };
    fetchConversations();
  }, [currentUser]);

  return (
    <div className="conversation-list">
      <h2>Conversations</h2>
      {conversations.map(conv => (
        <Link 
          key={conv._id} 
          to={`/chat/${conv.user._id}`}
          className="conversation-item"
        >
          <div className="avatar">{conv.user.username[0]}</div>
          <div className="conversation-details">
            <h3>{conv.user.username}</h3>
            <p>{conv.lastMessage.content.substring(0, 30)}...</p>
          </div>
          {conv.unreadCount > 0 && (
            <span className="unread-count">{conv.unreadCount}</span>
          )}
        </Link>
      ))}
    </div>
  );
}