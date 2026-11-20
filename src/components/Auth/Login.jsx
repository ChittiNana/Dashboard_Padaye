import { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { listTable } from '../../data/mockStore';
import ProfileAvatar from '../Shared/ProfileAvatar';

export default function Login() {
  const { login, error } = useAuth();
  const { schoolInfo } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  // Pure cosmetic preview, mock-only by design — looked up locally as the
  // person types, before any authentication happens.
  const matchedUser = useMemo(() => {
    const typed = username.trim().toLowerCase();
    if (!typed) return null;
    return listTable('users').find(u => (u.username || '').toLowerCase() === typed) || null;
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(username, password);
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* ── left panel ── */}
      <div className="login-left">
        <div className="login-brand-icon">🏫</div>
        <div className="login-brand-name">{schoolInfo.name}</div>
        <div className="login-brand-sub">
          {schoolInfo.affiliation}<br />
          <em style={{ fontSize: 13, opacity: 0.8 }}>"{schoolInfo.motto}"</em>
        </div>
        <div className="login-stats">
          <div className="login-stat">
            <div className="login-stat-icon">👩‍🎓</div>
            <div className="login-stat-val">{schoolInfo.totalStudents.toLocaleString()}</div>
            <div className="login-stat-lbl">Students</div>
          </div>
          <div className="login-stat">
            <div className="login-stat-icon">👔</div>
            <div className="login-stat-val">{schoolInfo.totalStaff}</div>
            <div className="login-stat-lbl">Staff</div>
          </div>
          <div className="login-stat">
            <div className="login-stat-icon">🏫</div>
            <div className="login-stat-val">{schoolInfo.totalClasses}</div>
            <div className="login-stat-lbl">Classes</div>
          </div>
        </div>
      </div>

      {/* ── right panel ── */}
      <div className="login-right">
        <div className="login-form">
          <div className="login-title">Welcome Back</div>
          <div className="login-sub">Sign in to your {schoolInfo.name} portal</div>

          {error && <div className="login-error">⚠ {error}</div>}

          {matchedUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <ProfileAvatar image={matchedUser.profileImage} gender={matchedUser.gender} role={matchedUser.role} size={44} />
              <div style={{ fontSize: 13, fontWeight: 600 }}>{matchedUser.name}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
