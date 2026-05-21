import { useState } from 'react';
import { supabase } from './supabase';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">L</div>
        <h1 className="login-title">Look Admin</h1>
        <p className="login-subtitle">Prijavite se da pristupite panelu</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Email adresa</label>
            <input
              type="email"
              placeholder="vas@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="login-field">
            <label>Lozinka</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Prijavljivanje...' : 'Prijava'}
          </button>
        </form>
      </div>
    </div>
  );
}
