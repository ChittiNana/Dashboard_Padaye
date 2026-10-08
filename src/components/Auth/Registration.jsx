import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as usersApi from '../../api/usersApi';
import { readWithFallback } from '../../api/mockFallback';
import { listTable, toUsersApiShape } from '../../data/mockStore';

const ROLES = [
  { value: 'PRINCIPAL',     label: 'Principal',      icon: '🎓' },
  { value: 'HEADMASTER',    label: 'Headmaster',      icon: '🎓' },
  { value: 'TEACHER',       label: 'Teacher',         icon: '📚' },
  { value: 'ACCOUNTANT',    label: 'Accountant',      icon: '💼' },
  { value: 'STUDENT',       label: 'Student',         icon: '👩‍🎓' },
  { value: 'PARENT',        label: 'Parent / Guardian', icon: '👨‍👩‍👦' },
  { value: 'SUPPORT_STAFF', label: 'Support Staff',   icon: '🔧' },
  { value: 'GUEST',         label: 'Guest',           icon: '👤' },
];

const ROLE_BADGE = {
  principal: 'badge-purple', headmaster: 'badge-info', teacher: 'badge-success',
  student: 'badge-warning', parent: 'badge-teal', accountant: 'badge-orange',
  support_staff: 'badge-gray', guest: 'badge-gray', it_manager: 'badge-purple',
};

const EMPTY_FORM = { fullName: '', username: '', email: '', password: '', confirmPassword: '', role: '' };

function FieldError({ msg }) {
  return msg ? <span className="reg-field-error">{msg}</span> : null;
}

function FormGroup({ label, required, error, children }) {
  return (
    <div className="reg-form-group">
      <label className={`reg-label${required ? ' required' : ''}`}>{label}</label>
      {children}
      <FieldError msg={error} />
    </div>
  );
}

function UserRow({ user, onView }) {
  const roleKey = (user.role || '').toLowerCase();
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="avatar avatar-sm role-teacher">
            {user.fullName?.slice(0, 2).toUpperCase() || user.username?.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{user.fullName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{user.username}</div>
          </div>
        </div>
      </td>
      <td>
        <span className={`badge ${ROLE_BADGE[roleKey] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
          {roleKey.replace('_', ' ')}
        </span>
      </td>
      <td style={{ fontSize: 12 }}>{user.email || '—'}</td>
      <td>
        <span className={`badge ${user.active ? 'badge-success' : 'badge-gray'}`}>
          {user.active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td style={{ fontSize: 12 }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
      <td>
        <button className="btn btn-ghost btn-sm" onClick={() => onView(user)}>View</button>
      </td>
    </tr>
  );
}

function UserDetail({ user, onClose }) {
  const fields = [
    ['Full Name', user.fullName], ['Username', `@${user.username}`],
    ['Role', (user.role || '').toLowerCase().replace('_', ' ')],
    ['Email', user.email],
    ['Status', user.active ? 'Active' : 'Inactive'],
    ['Created', user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'],
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="avatar avatar-lg role-teacher">
              {user.fullName?.slice(0, 2).toUpperCase() || user.username?.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{user.fullName}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {(user.role || '').toLowerCase().replace('_', ' ')}
              </div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="reg-detail-grid">
            {fields.map(([k, v]) => (
              <div key={k} className="reg-detail-item">
                <div className="reg-detail-label">{k}</div>
                <div className="reg-detail-value">{v || '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Registration() {
  const { registerUser, currentUser } = useAuth();
  const [view, setView] = useState('list');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const canRegister = ['principal', 'headmaster', 'it_manager'].includes(currentUser?.role);
  const isItManager = currentUser?.role === 'it_manager';
  const availableRoles = isItManager ? ROLES : ROLES.filter(r => r.value !== 'PRINCIPAL');

  const loadUsers = useCallback(() => {
    setListLoading(true);
    readWithFallback(
      () => usersApi.listUsers(),
      () => listTable('users').map(toUsersApiShape),
      { label: 'listUsers' },
    )
      .then(setUsers)
      .finally(() => setListLoading(false));
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.trim().length < 3) e.username = 'Minimum 3 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Minimum 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.role) e.role = 'Please select a role';
    else if (form.role === 'PRINCIPAL' && !isItManager) e.role = 'Only an IT Manager can register a Principal';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const created = registerUser({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      role: form.role,
    });
    setUsers(p => [...p, toUsersApiShape(created)]);
    setSuccessMsg(`${form.fullName} registered successfully as ${form.role.toLowerCase().replace('_', ' ')}.`);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setSubmitting(false);
    setTimeout(() => { setSuccessMsg(''); setView('list'); }, 2000);
  };

  const resetForm = () => { setForm({ ...EMPTY_FORM }); setErrors({}); setSuccessMsg(''); };

  const filtered = users.filter(u => {
    const roleKey = (u.role || '').toLowerCase();
    const matchRole = filterRole === 'all' || roleKey === filterRole;
    const matchSearch = !search
      || u.fullName?.toLowerCase().includes(search.toLowerCase())
      || u.username?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>User Management</h1>
          <p>Register and manage all users of the school portal</p>
        </div>
        {canRegister && view === 'list' && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setView('form'); }}>
            + Register New User
          </button>
        )}
        {view === 'form' && (
          <button className="btn btn-ghost" onClick={() => setView('list')}>← Back to List</button>
        )}
      </div>

      {view === 'list' && (
        <>
          <div className="stat-grid mb-20" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {[
              { label: 'Total Users', value: users.length, icon: '👥', color: 'bg-blue' },
              { label: 'Teachers',    value: users.filter(u => (u.role || '').toUpperCase() === 'TEACHER').length, icon: '📚', color: 'bg-green' },
              { label: 'Students',    value: users.filter(u => (u.role || '').toUpperCase() === 'STUDENT').length, icon: '👩‍🎓', color: 'bg-purple' },
              { label: 'Parents',     value: users.filter(u => (u.role || '').toUpperCase() === 'PARENT').length, icon: '👨‍👩‍👦', color: 'bg-teal' },
              { label: 'Support Staff', value: users.filter(u => ['SUPPORT_STAFF', 'ACCOUNTANT'].includes((u.role || '').toUpperCase())).length, icon: '🔧', color: 'bg-orange' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-info">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card mb-20">
            <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                className="form-control"
                style={{ maxWidth: 240 }}
                placeholder="Search by name or username…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select className="form-control" style={{ maxWidth: 180 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                <option value="all">All Roles</option>
                {ROLES.map(r => <option key={r.value} value={r.value.toLowerCase()}>{r.label}</option>)}
              </select>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {listLoading ? 'Loading…' : `${filtered.length} user${filtered.length !== 1 ? 's' : ''} found`}
              </span>
            </div>
          </div>

          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>User</th><th>Role</th><th>Email</th><th>Status</th><th>Created</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Loading users…</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No users found</td></tr>
                  ) : (
                    filtered.map(u => (
                      <UserRow key={u.id} user={u} onView={setSelectedUser} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'form' && (
        <div className="card" style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Register New User</div>
              <div className="card-subtitle">All fields marked with * are mandatory</div>
            </div>
          </div>
          <div className="card-body">
            {successMsg && (
              <div className="alert-success mb-20">
                <span>✅</span> {successMsg}
              </div>
            )}
            <form onSubmit={handleSubmit} noValidate>
              <div className="reg-section">
                <div className="reg-section-title">👤 Select Role *</div>
                <div className="reg-role-grid">
                  {availableRoles.map(r => (
                    <div
                      key={r.value}
                      className={`reg-role-card${form.role === r.value ? ' selected' : ''}`}
                      onClick={() => set('role', r.value)}
                    >
                      <div className="reg-role-icon">{r.icon}</div>
                      <div className="reg-role-label">{r.label}</div>
                    </div>
                  ))}
                </div>
                <FieldError msg={errors.role} />
              </div>

              <div className="reg-section">
                <div className="reg-section-title">📋 Basic Information</div>
                <div className="reg-grid-2">
                  <FormGroup label="Full Name" required error={errors.fullName}>
                    <input className={`form-control${errors.fullName ? ' input-error' : ''}`} value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="e.g. Dr. Rajesh Kumar" />
                  </FormGroup>
                  <FormGroup label="Username" required error={errors.username}>
                    <input className={`form-control${errors.username ? ' input-error' : ''}`} value={form.username} onChange={e => set('username', e.target.value)} placeholder="e.g. rajesh.kumar" />
                  </FormGroup>
                  <FormGroup label="Email Address" required error={errors.email}>
                    <input type="email" className={`form-control${errors.email ? ' input-error' : ''}`} value={form.email} onChange={e => set('email', e.target.value)} placeholder="e.g. email@greenwood.edu" />
                  </FormGroup>
                  <FormGroup label="Password" required error={errors.password}>
                    <input type="password" className={`form-control${errors.password ? ' input-error' : ''}`} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" />
                  </FormGroup>
                  <FormGroup label="Confirm Password" required error={errors.confirmPassword}>
                    <input type="password" className={`form-control${errors.confirmPassword ? ' input-error' : ''}`} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Re-enter password" />
                  </FormGroup>
                </div>
              </div>

              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                Extended profile fields (subjects, class, roll number, etc.) will be added once the people directory is wired up.
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setView('list')}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering…' : 'Register User →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUser && <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}
