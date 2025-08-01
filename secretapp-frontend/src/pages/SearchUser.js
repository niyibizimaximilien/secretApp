import React, { useState } from 'react';
import axios from 'axios';

function SearchUser() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`http://localhost:3001/api/users/search?term=${searchTerm}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, // Auth if needed
      });
      setSearchResults(response.data);
      setError('');
    } catch (err) {
      setError('User not found or error fetching data.');
      setSearchResults([]);
    }
  };

  return (
    <div>
      <h1>Search Users</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter username or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          required
        />
        <button type="submit">Search</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        {searchResults.map((user) => (
          <div key={user._id} style={{ margin: '10px', padding: '10px', border: '1px solid #ccc' }}>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            {/* Add more user details or a "View Profile" button */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchUser;