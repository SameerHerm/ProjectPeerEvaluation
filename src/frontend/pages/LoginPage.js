import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Clear fields when switching between login and registration
  useEffect(() => {
    if (isRegistering) {
      setName('');
      setDepartment('');
      setEmail('');
      setPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
  }, [isRegistering]);
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isRegistering
      ? 'http://localhost:5000/api/auth/register'
      : 'http://localhost:5000/api/auth/login';

    const payload = isRegistering
      ? { email, password, name, department }
      : { email, password };

    try {
      const res = await axios.post(endpoint, payload);

      if (isRegistering) {
        alert('Registration successful! You can now log in.');
        setIsRegistering(false);
        setName('');
        setDepartment('');
      } else {
        // Handle login response from backend
        const { access_token, professor } = res.data;
        if (access_token) {
          localStorage.setItem('token', access_token);
        }
        login(professor);
  navigate('/course-management');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Something went wrong');
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
      <h2>{isRegistering ? 'Professor Registration' : 'Professor Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            <input
              type="text"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
          </>
        )}
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="login-email" style={{ display: 'block', marginBottom: '4px' }}>Email:</label>
          <input
            id="login-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="login-password" style={{ display: 'block', marginBottom: '4px' }}>Password:</label>
          <input
            id="login-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button
          type="submit"
          style={{ width: '100%', padding: '10px', display: 'block', maxWidth: '100%' }}
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>
      <button
        onClick={() => setIsRegistering((prev) => !prev)}
        style={{
          marginTop: '15px',
          background: 'none',
          border: 'none',
          color: '#007bff',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        {isRegistering
          ? 'Already have an account? Log in'
          : 'New here? Register'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
}

export default LoginPage;
