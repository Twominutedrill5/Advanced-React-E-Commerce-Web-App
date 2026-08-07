import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteUser } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useProfile, useUpdateProfile } from '../hooks/useStore';
import { deleteUserDoc } from '../services/users';
import ConfirmDialog from '../components/ConfirmDialog';

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: profile, isPending, isError, error } = useProfile(user?.uid);
  const updateProfile = useUpdateProfile(user?.uid);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', address: '' });
  const [saved, setSaved] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name ?? '', address: profile.address ?? '' });
    }
  }, [profile]);

  const set = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
    setSaved(false);
  };

  async function handleSave(event) {
    event.preventDefault();
    await updateProfile.mutateAsync(form);
    setSaved(true);
  }

  // Deleting an account is two removals: the Firestore document and the Auth
  // record. The document goes first — if the Auth deletion fails, we'd rather
  // have an orphaned login than orphaned personal data.
  async function handleDelete() {
    setDeleteError('');
    try {
      await deleteUserDoc(user.uid);
      await deleteUser(user);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        // Firebase requires a fresh session for destructive account changes.
        setDeleteError(
          'For security, Firebase needs a recent sign-in before deleting an account. ' +
            'Sign out, sign back in, and try again.',
        );
      } else {
        setDeleteError(err.message || 'The account could not be deleted.');
      }
      setConfirmingDelete(false);
    }
  }

  if (isPending) {
    return (
      <div className="state-block">
        <span className="spinner" aria-hidden="true" />
        <p>Loading your profile…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="state-block state-block--error">
        <p className="state-block__headline">Profile didn&apos;t load.</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="form-page form-page--wide">
      <p className="eyebrow">Account</p>
      <h1>Your profile.</h1>

      <form onSubmit={handleSave} className="stack-form">
        <label className="field">
          <span>Email</span>
          <input type="email" value={profile?.email ?? user.email} disabled />
          <small className="field-note">Email is managed by Firebase Authentication.</small>
        </label>

        <label className="field">
          <span>Name</span>
          <input type="text" value={form.name} onChange={set('name')} autoComplete="name" />
        </label>

        <label className="field">
          <span>Address</span>
          <textarea rows={3} value={form.address} onChange={set('address')} autoComplete="street-address" />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn-ink" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </button>
          {saved && <span className="save-note">Saved</span>}
        </div>
      </form>

      <section className="danger-zone">
        <p className="eyebrow eyebrow--muted">Closing your account</p>
        <p className="field-note">
          Deleting removes your profile from Firestore and your login from Firebase
          Authentication. Past orders stay in the orders collection.
        </p>
        {deleteError && <p className="form-error">{deleteError}</p>}
        <div className="form-actions">
          <button type="button" className="btn-quiet" onClick={() => logout().then(() => navigate('/'))}>
            Sign out
          </button>
          <button
            type="button"
            className="btn-quiet btn-quiet--danger"
            onClick={() => setConfirmingDelete(true)}
          >
            Delete account
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={confirmingDelete}
        title="Delete your account?"
        body="Your profile and login will be removed. This can't be undone."
        confirmLabel="Delete account"
        onConfirm={handleDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </div>
  );
}
