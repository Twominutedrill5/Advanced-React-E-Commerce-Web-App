import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Firebase returns machine-readable error codes. Translating them keeps the
// form honest about what went wrong instead of leaking SDK internals.
const MESSAGES = {
  'auth/email-already-in-use': 'That email already has an account. Sign in instead.',
  'auth/invalid-email': 'That email address isn\u2019t valid.',
  'auth/weak-password': 'Passwords need to be at least 6 characters.',
};

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(MESSAGES[err.code] || 'Registration failed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-page">
      <p className="eyebrow">New account</p>
      <h1>Open an account.</h1>

      <form onSubmit={handleSubmit} className="stack-form">
        <label className="field">
          <span>Name</span>
          <input type="text" value={form.name} onChange={set('name')} autoComplete="name" />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={set('email')}
            required
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn-ink btn-ink--block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="field-note">
        Already have one? <Link to="/login" className="text-link">Sign in</Link>.
      </p>
    </div>
  );
}
