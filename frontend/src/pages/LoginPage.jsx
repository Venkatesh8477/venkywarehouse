import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: 'admin@smartinventory.local', password: 'admin123' });

  const handleSubmit = (event) => {
    event.preventDefault();

    setUser({
      id: 1,
      name: 'System Administrator',
      email: form.email,
      role: 'ADMIN',
    });

    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <span className="brand-badge">SI</span>
          <h2>Sign in</h2>
          <p>Access the warehouse control center</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>

          <button className="primary-button" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
