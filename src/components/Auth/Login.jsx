import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getDemoCredentials, schoolInfo } from '../../data/mockData';

const roleColors = {
  Principal:  'role-principal',
  Headmaster: 'role-headmaster',
  Teacher:    'role-teacher',
  Student:    'role-student',
  Parent:     'role-parent',
  Guest:      'role-guest',
};

export default function Login() {
  const { login, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const demos = getDemoCredentials();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    login(username, password);
    setLoading(false);
  };

  const fillDemo = (cred) => {
    setUsername(cred.username);
    setPassword(cred.password);
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
            <div className="login-stat-val">{schoolInfo.totalStudents.toLocaleString()}</div>
            <div className="login-stat-lbl">Students</div>
          </div>
          <div className="login-stat">
            <div className="login-stat-val">{schoolInfo.totalStaff}</div>
            <div className="login-stat-lbl">Staff</div>
          </div>
          <div className="login-stat">
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

          <div className="demo-creds">
            <div className="demo-creds-title">Quick Login — Demo Accounts</div>
            <div className="demo-creds-grid">
              {demos.map(d => (
                <button key={d.role} className="demo-cred-chip" onClick={() => fillDemo(d)}>
                  <span className={`avatar avatar-sm ${roleColors[d.role]}`}>
                    {d.role[0]}
                  </span>
                  <span>
                    <div className="demo-cred-role">{d.role}</div>
                    <div className="demo-cred-user">{d.username}</div>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
