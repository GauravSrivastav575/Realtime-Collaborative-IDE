import React, { useState } from 'react';
import './AccessControl.css';

const AccessControl = ({ fileId}) => {
    console.log('AccessControl mounted with fileId:', fileId);
    // if(!isCreator) return null;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleShareFile = async () => {
    if (!email || !fileId) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/api/files/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileId,
          email
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to share file');
      }

      setSuccess('File shared successfully!');
      setEmail('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="access-control">
      <div className="access-header">
        <h4>Share File</h4>
      </div>
      <div className="access-input-group">
        <input
          type="email"
          placeholder="Enter collaborator's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <button 
          onClick={handleShareFile}
          disabled={!email || loading}
        >
          {loading ? 'Sharing...' : 'Share'}
        </button>
      </div>
      {error && <div className="access-message error">{error}</div>}
      {success && <div className="access-message success">{success}</div>}
    </div>
  );
};

export default AccessControl;

