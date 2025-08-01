import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Search users with debounce
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`/api/users/search?q=${searchTerm}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setResults(res.data.filter(user => user._id !== currentUser._id));
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, currentUser]);

  // Start or open chat
const handleUserClick = async (userId) => {
  try {
    const res = await axios.post(
      '/api/chats',
      { recipientId: userId },
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    navigate(`/chat/${res.data._id}`);
  } catch (err) {
    console.error('Failed to start chat:', err);
  }
};
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Search Header */}
      <div className="p-4 bg-white border-b">
        <h1 className="text-xl font-semibold">Search Users</h1>
        <div className="relative mt-3">
          <input
            type="text"
            placeholder="Search by name or email"
            className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Search Results */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : results.length > 0 ? (
          results.map(user => (
            <div
              key={user._id}
              className="flex items-center p-4 border-b hover:bg-gray-100 cursor-pointer"
              onClick={() => handleUserClick(user._id)}
            >
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          ))
        ) : searchTerm ? (
          <p className="p-4 text-gray-500">No users found</p>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">secretChat</h3>
            <p className="text-gray-500 max-w-md">
              Select a chat to start messaging or search for users to begin a new conversation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;