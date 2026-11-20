import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import * as usersApi from '../../api/usersApi';
import { readWithFallback } from '../../api/mockFallback';
import { listTable, toUsersApiShape } from '../../data/mockStore';
import { schoolEmailDomain } from '../../config/schoolConfig';
import { fileToProfileImage } from '../../utils/avatar';
import ProfileAvatar from '../Shared/ProfileAvatar';

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

const EMPTY_FORM = {
  fullName: '', username: '', email: '', password: '', confirmPassword: '', role: '',
  phone: '', address: '', subject: '', gender: '', profileImage: '',
  classId: '', dateOfBirth: '', guardianName: '', guardianPhone: '',
  createParentAccount: false,
  parentFullName: '', parentUsername: '', parentPassword: '', parentEmail: '', parentPhone: '',
  parentGender: '', parentProfileImage: '',
};
const GENDERS = ['Male', 'Female', 'Other'];

// Auto-fill suggestion: username "rajesh.kumar" + domain "greenwood.com" -> "rajesh.kumar@greenwood.com".
function deriveEmail(username, domain) {
  const local = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
  return local ? `${local}@${domain}` : '';
}

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
          <ProfileAvatar image={user.profileImage} gender={user.gender} role={roleKey} size={28} />
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
  const roleKey = (user.role || '').toLowerCase();
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
            <ProfileAvatar image={user.profileImage} gender={user.gender} role={roleKey} size={48} />
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
  const { classes, subjects, schoolInfo } = useData();
  const emailDomain = schoolEmailDomain(schoolInfo.name);
  const [view, setView] = useState('list');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  // Email auto-fills from username (and parentEmail from parentUsername) until
  // the person edits the email field directly — then we stop overwriting it.
  const [emailAuto, setEmailAuto] = useState(true);
  const [parentEmailAuto, setParentEmailAuto] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
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

  const setUsername = (value) => setForm(f => ({
    ...f, username: value,
    email: emailAuto ? deriveEmail(value, emailDomain) : f.email,
  }));
  const setEmail = (value) => { setEmailAuto(false); set('email', value); };

  const setParentUsername = (value) => setForm(f => ({
    ...f, parentUsername: value,
    parentEmail: parentEmailAuto ? deriveEmail(value, emailDomain) : f.parentEmail,
  }));
  const setParentEmail = (value) => { setParentEmailAuto(false); set('parentEmail', value); };

  const handlePhotoChange = async (field, file) => {
    if (!file) { set(field, ''); return; }
    try { set(field, await fileToProfileImage(file)); } catch { /* ignore unreadable file */ }
  };

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
    if (form.role === 'STUDENT' && form.createParentAccount) {
      if (!form.parentFullName.trim()) e.parentFullName = 'Parent full name is required';
      if (!form.parentUsername.trim()) e.parentUsername = 'Parent username is required';
      else if (form.parentUsername.trim().length < 3) e.parentUsername = 'Minimum 3 characters';
      if (!form.parentPassword || form.parentPassword.length < 8) e.parentPassword = 'Minimum 8 characters';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      // Create the parent login first (if requested) so the student record below
      // can be linked to it via parentUserId in the same registration pass.
      let parentUserId;
      if (form.role === 'STUDENT' && form.createParentAccount) {
        const parent = await registerUser({
          username: form.parentUsername.trim(),
          email: form.parentEmail.trim(),
          password: form.parentPassword,
          fullName: form.parentFullName.trim(),
          role: 'PARENT',
          phone: form.parentPhone.trim(),
          gender: form.parentGender,
          profileImage: form.parentProfileImage || null,
        });
        parentUserId = parent.id;
      }

      const created = await registerUser({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        role: form.role,
        phone: form.phone.trim(),
        address: form.address.trim(),
        gender: form.gender,
        profileImage: form.profileImage || null,
        subject: form.role === 'TEACHER' ? form.subject : undefined,
        classId: form.role === 'STUDENT' && form.classId ? Number(form.classId) : undefined,
        dateOfBirth: form.role === 'STUDENT' ? form.dateOfBirth : undefined,
        guardianName: form.role === 'STUDENT' ? (form.guardianName.trim() || form.parentFullName.trim()) : undefined,
        guardianPhone: form.role === 'STUDENT' ? (form.guardianPhone.trim() || form.parentPhone.trim()) : undefined,
        parentUserId,
        relationship: 'Guardian',
      });
      setUsers(p => [...p, created]);
      setSuccessMsg(
        `${form.fullName} registered successfully as ${form.role.toLowerCase().replace('_', ' ')}.`
        + (parentUserId ? ` A parent account (@${form.parentUsername}) was also created and linked.` : '')
      );
      setForm({ ...EMPTY_FORM });
      setEmailAuto(true);
      setParentEmailAuto(true);
      setErrors({});
      setTimeout(() => { setSuccessMsg(''); setView('list'); }, 2000);
    } catch (err) {
      // Real backend rejections (409 duplicate, 400 validation with fieldErrors, 403, 429) stay on the form.
      const fieldErrors = Array.isArray(err?.fieldErrors) ? err.fieldErrors : [];
      const mapped = {};
      fieldErrors.forEach((fe) => {
        const field = fe?.field;
        if (field && Object.prototype.hasOwnProperty.call(EMPTY_FORM, field)) {
          mapped[field] = fe.message || 'Invalid value';
        }
      });
      if (Object.keys(mapped).length) setErrors(mapped);
      const detail = fieldErrors.map(fe => (fe?.field ? `${fe.field}: ${fe.message}` : fe?.message)).filter(Boolean).join('; ');
      setSubmitError((err?.message || 'Registration failed.') + (detail ? ` (${detail})` : ''));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEmailAuto(true);
    setParentEmailAuto(true);
    setErrors({});
    setSuccessMsg('');
    setSubmitError('');
  };

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
            {submitError && <div className="alert alert-danger mb-20">{submitError}</div>}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                  <ProfileAvatar image={form.profileImage} gender={form.gender} role={(form.role || '').toLowerCase()} size={64} />
                  <div>
                    <label className="reg-label" style={{ display: 'block', marginBottom: 6 }}>Profile Photo</label>
                    <input type="file" accept="image/*" onChange={e => handlePhotoChange('profileImage', e.target.files?.[0])} />
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      Optional — without one, a default picture matching the selected gender is used.
                    </div>
                  </div>
                </div>
                <div className="reg-grid-2">
                  <FormGroup label="Full Name" required error={errors.fullName}>
                    <input className={`form-control${errors.fullName ? ' input-error' : ''}`} value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="e.g. Dr. Rajesh Kumar" />
                  </FormGroup>
                  <FormGroup label="Username" required error={errors.username}>
                    <input className={`form-control${errors.username ? ' input-error' : ''}`} value={form.username} onChange={e => setUsername(e.target.value)} placeholder="e.g. rajesh.kumar" />
                  </FormGroup>
                  <FormGroup label="Email Address" required error={errors.email}>
                    <input type="email" className={`form-control${errors.email ? ' input-error' : ''}`} value={form.email} onChange={e => setEmail(e.target.value)} placeholder={`Auto-filled, e.g. name@${emailDomain}`} />
                  </FormGroup>
                  <FormGroup label="Password" required error={errors.password}>
                    <input type="password" className={`form-control${errors.password ? ' input-error' : ''}`} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 8 characters" />
                  </FormGroup>
                  <FormGroup label="Confirm Password" required error={errors.confirmPassword}>
                    <input type="password" className={`form-control${errors.confirmPassword ? ' input-error' : ''}`} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Re-enter password" />
                  </FormGroup>
                  <FormGroup label="Gender">
                    <select className="form-control" value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">Select…</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </FormGroup>
                  <FormGroup label="Phone">
                    <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91-98765-43210" />
                  </FormGroup>
                  <FormGroup label="Address">
                    <input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} placeholder="House/Street, City, PIN" />
                  </FormGroup>
                </div>
              </div>

              {form.role === 'STUDENT' && (
                <div className="reg-section">
                  <div className="reg-section-title">👩‍🎓 Student Details</div>
                  <div className="reg-grid-2">
                    <FormGroup label="Class / Section">
                      <select className="form-control" value={form.classId} onChange={e => set('classId', e.target.value)}>
                        <option value="">Select class…</option>
                        {classes.map(c => <option key={c.id} value={c.id}>Class {c.name}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Date of Birth">
                      <input type="date" className="form-control" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Guardian Name">
                      <input className="form-control" value={form.guardianName} onChange={e => set('guardianName', e.target.value)} placeholder="Defaults to parent account name below" />
                    </FormGroup>
                    <FormGroup label="Guardian Phone">
                      <input className="form-control" value={form.guardianPhone} onChange={e => set('guardianPhone', e.target.value)} placeholder="Defaults to parent account phone below" />
                    </FormGroup>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, margin: '12px 0', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.createParentAccount} onChange={e => set('createParentAccount', e.target.checked)} />
                    Also create a Parent login for this student
                  </label>

                  {form.createParentAccount && (
                    <div style={{ background: 'var(--bg-app)', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                        <ProfileAvatar image={form.parentProfileImage} gender={form.parentGender} role="parent" size={56} />
                        <div>
                          <label className="reg-label" style={{ display: 'block', marginBottom: 6 }}>Parent Profile Photo</label>
                          <input type="file" accept="image/*" onChange={e => handlePhotoChange('parentProfileImage', e.target.files?.[0])} />
                        </div>
                      </div>
                      <div className="reg-grid-2">
                        <FormGroup label="Parent Full Name" required error={errors.parentFullName}>
                          <input className={`form-control${errors.parentFullName ? ' input-error' : ''}`} value={form.parentFullName} onChange={e => set('parentFullName', e.target.value)} />
                        </FormGroup>
                        <FormGroup label="Parent Username" required error={errors.parentUsername}>
                          <input className={`form-control${errors.parentUsername ? ' input-error' : ''}`} value={form.parentUsername} onChange={e => setParentUsername(e.target.value)} />
                        </FormGroup>
                        <FormGroup label="Parent Password" required error={errors.parentPassword}>
                          <input type="password" className={`form-control${errors.parentPassword ? ' input-error' : ''}`} value={form.parentPassword} onChange={e => set('parentPassword', e.target.value)} placeholder="Min 8 characters" />
                        </FormGroup>
                        <FormGroup label="Parent Email">
                          <input type="email" className="form-control" value={form.parentEmail} onChange={e => setParentEmail(e.target.value)} placeholder={`Auto-filled, e.g. name@${emailDomain}`} />
                        </FormGroup>
                        <FormGroup label="Parent Phone">
                          <input className="form-control" value={form.parentPhone} onChange={e => set('parentPhone', e.target.value)} />
                        </FormGroup>
                        <FormGroup label="Parent Gender">
                          <select className="form-control" value={form.parentGender} onChange={e => set('parentGender', e.target.value)}>
                            <option value="">Select…</option>
                            {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </FormGroup>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {form.role === 'TEACHER' && (
                <div className="reg-section">
                  <div className="reg-section-title">📚 Teaching Details</div>
                  <div className="reg-grid-2">
                    <FormGroup label="Subject">
                      <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
                        <option value="">Select subject…</option>
                        {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </FormGroup>
                  </div>
                </div>
              )}

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
