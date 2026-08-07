import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps any route that requires a signed-in user. While Firebase is still
// restoring the session we render a placeholder instead of redirecting —
// otherwise a refresh on a protected page would kick the user out.
export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="state-block">
        <span className="spinner" aria-hidden="true" />
        <p>Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
