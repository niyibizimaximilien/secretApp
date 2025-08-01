import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ChatSearchPage() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [userId, setUserId] = useState('user1'); // Replace with actual logged-in user ID
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!search.trim()) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/users?search=${search}`);
      const filtered = res.data.filter((u) => u.id !== userId);
      setResults(filtered);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleStartChat = async (otherUserId) => {
    try {
      const res = await axios.post('http://localhost:5000/api/chats', {
        userId1: userId,
        userId2: otherUserId,
      });
      navigate(`/chat/${res.data.id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  useEffect(() => {
    if (search.length > 1) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [search]);

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-4 py-2 rounded w-full mb-4"
      />
      <ul className="space-y-2">
        {results.map((user) => (
          <li
            key={user.id}
            onClick={() => handleStartChat(user.id)}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
          >
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
