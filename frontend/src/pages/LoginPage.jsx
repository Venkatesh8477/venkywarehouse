import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login';
      const response = await api.post(endpoint, form);
      api.defaults.headers.common.Authorization = `Bearer ${response.data.data.token}`;
      setUser({ ...response.data.data.user, token: response.data.data.token });
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || (mode === 'signup'
        ? 'Could not create the account. Check the details and try again.'
        : 'Login failed. Check your username and password, then try again.'));
    } finally {
      setSubmitting(false);
    }

  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-badge">SI</span>
          <h2>{mode === 'signup' ? 'Create account' : 'Sign in'}</h2>
          <p>{mode === 'signup' ? 'Create a staff account' : 'Access the warehouse control center'}</p>
        </div>

        <div className="auth-mode-switch" role="group" aria-label="Account access mode">
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
          <button className={mode === 'signup' ? 'active' : ''} type="button" onClick={() => { setMode('signup'); setError(''); }}>Sign up</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input
              autoComplete="username"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
          </label>

          {mode === 'signup' && (
            <label>
              Email
              <input
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>
          )}

          <label>
            Password
            <input
              required
              type="password"
              minLength={mode === 'signup' ? 8 : undefined}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>

          {error && <p role="alert">{error}</p>}

          <button className="primary-button" type="submit">
            {submitting ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
