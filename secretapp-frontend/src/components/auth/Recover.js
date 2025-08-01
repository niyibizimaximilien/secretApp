import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Recover() {
  const [step, setStep] = useState(1); // 1 = verify phrase, 2 = reset password
  const [formData, setFormData] = useState({
    username: '',
    recoveryPhrase: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // In your Recover.js component
const handleVerify = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('/api/auth/verify-recovery', {
      username: formData.username,
      recoveryPhrase: formData.recoveryPhrase
    });
    
    if (response.data.success) {
      setStep(2); // Move to password reset step
    } else {
      setError(response.data.error || 'Verification failed');
    }
  } catch (err) {
    setError(err.response?.data?.error || 'Verification failed');
  }
};
  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/auth/reset-password', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Password reset failed');
    }
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Account Recovery</h1>
        
        {error && <div className="mb-4 text-red-500">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleVerify}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Username</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Recovery Phrase</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.recoveryPhrase}
                onChange={(e) => setFormData({...formData, recoveryPhrase: e.target.value})}
                required
                placeholder="Enter the 3-word phrase you received during signup"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Verify Phrase
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}