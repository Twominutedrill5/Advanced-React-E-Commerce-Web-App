import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form);
      // Send them back to whatever page sent them here, or home.
      navigate(location.state?.from || '/');
    } catch {
      // Firebase deliberately returns the same code for a wrong password and a
      // nonexistent account, so the message stays general on purpose.
      setError('That email and password don\u2019t match an account.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-page">
      <p className="eyebrow">Returning</p>
      <h1>Sign in.</h1>

      <form onSubmit={handleSubmit} className="stack-form">
        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-ink btn-ink--block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="field-note">
        No account yet? <Link to="/register" className="text-link">Register</Link>.
      </p>
    </div>
  );
}
