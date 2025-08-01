import { useState } from 'react';
import axios from 'axios';

export default function UserSearch({ onSelectUser }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const res = await axios.get(`/api/users/search?query=${query}`);
    setResults(res.data);
  };

  return (
    <div className="user-search">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
      />
      <button onClick={handleSearch}>Search</button>
      
      <div className="search-results">
        {results.map(user => (
          <div key={user._id} onClick={() => onSelectUser(user)}>
            {user.username}
          </div>
        ))}
      </div>
    </div>
  );
}