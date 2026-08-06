import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { classes } from '../../data/mockData';

const ROLES = [
  { value: 'teacher',       label: 'Teacher',           category: 'Academic',       icon: '📚' },
  { value: 'headmaster',    label: 'Headmaster',         category: 'Administration', icon: '🎓' },
  { value: 'accountant',    label: 'Accountant',         category: 'Administration', icon: '💼' },
  { value: 'student',       label: 'Student',            category: 'Students',       icon: '👩‍🎓' },
  { value: 'parent',        label: 'Parent / Guardian',  category: 'Parents',        icon: '👨‍👩‍👦' },
  { value: 'support_staff', label: 'Support Staff',      category: 'Support',        icon: '🔧' },
  { value: 'guest',         label: 'Guest',              category: 'Visitor',        icon: '👤' },
];

const SUPPORT_SUBTYPES = ['Gate Keeper', 'Watchman', 'Cleaner', 'Maintainer', 'Security', 'Other'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Geography', 'Computer', 'PE', 'Drawing', 'Physics', 'Chemistry', 'Biology'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const SHIFTS = ['Morning (6AM-2PM)', 'Afternoon (2PM-10PM)', 'Night (10PM-6AM)'];
const CLASS_NAMES = classes.map(c => c.name);

const EMPTY_FORM = {
  role: '', name: '', username: '', email: '', password: '', confirmPassword: '',
  phone: '', gender: '', dob: '', address: '',
  employeeId: '', qualification: '', yearsOfExperience: '', joinDate: '',
  subjects: [], classesAssigned: [],
  rollNo: '', studentClass: '', admissionYear: new Date().getFullYear().toString(), bloodGroup: '', parentId: '',
  occupation: '', childrenIds: [],
  subRole: '', shift: '',
};

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

function CheckboxGroup({ items, selected, onChange }) {
  const toggle = (val) => {
    const next = selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val];
    onChange(next);
  };
  return (
    <div className="reg-checkbox-group">
      {items.map(item => (
        <span
          key={item}
          className={`reg-chip${selected.includes(item) ? ' selected' : ''}`}
          onClick={() => toggle(item)}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function UserRow({ user, onView }) {
  const roleBadge = {
    principal: 'badge-purple', headmaster: 'badge-info', teacher: 'badge-success',
    student: 'badge-warning', parent: 'badge-teal', accountant: 'badge-orange',
    support_staff: 'badge-gray', guest: 'badge-gray',
  };
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`avatar avatar-sm role-${user.role === 'support_staff' || user.role === 'accountant' ? 'teacher' : user.role}`}>
            {user.avatar?.slice(0, 2) || user.name?.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>@{user.username}</div>
          </div>
        </div>
      </td>
      <td>
        <span className={`badge ${roleBadge[user.role] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>
          {user.role === 'support_staff' ? (user.subRole || 'Support Staff') : user.role}
        </span>
      </td>
      <td style={{ fontSize: 12 }}>{user.email || '—'}</td>
      <td style={{ fontSize: 12 }}>{user.phone || '—'}</td>
      <td style={{ fontSize: 12 }}>{user.joinDate || user.admissionYear || '—'}</td>
      <td>
        <button className="btn btn-ghost btn-sm" onClick={() => onView(user)}>View</button>
      </td>
    </tr>
  );
}

function UserDetail({ user, onClose }) {
  const fields = [
    ['Full Name', user.name], ['Username', `@${user.username}`], ['Role', user.role],
    ['Email', user.email], ['Phone', user.phone], ['Gender', user.gender],
    ['Date of Birth', user.dob], ['Address', user.address],
    user.employeeId && ['Employee ID', user.employeeId],
    user.qualification && ['Qualification', user.qualification],
    user.joinDate && ['Join Date', user.joinDate],
    user.admissionYear && ['Admission Year', user.admissionYear],
    user.class && ['Class', user.class], user.rollNo && ['Roll No', user.rollNo],
    user.bloodGroup && ['Blood Group', user.bloodGroup],
    user.subjects?.length && ['Subjects', user.subjects.join(', ')],
    user.classesHandled?.length && ['Classes Handled', user.classesHandled.join(', ')],
    user.subRole && ['Sub-role', user.subRole], user.shift && ['Shift', user.shift],
    user.occupation && ['Occupation', user.occupation],
  ].filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className={`avatar avatar-lg role-${['support_staff','accountant'].includes(user.role) ? 'teacher' : user.role}`}>
              {user.avatar?.slice(0, 2) || user.name?.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user.role === 'support_staff' ? (user.subRole || 'Support Staff') : user.role}
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
  const { allUsers, registerUser, currentUser } = useAuth();
  const [view, setView] = useState('list');
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  const canRegister = ['principal', 'headmaster'].includes(currentUser?.role);

  const students = allUsers.filter(u => u.role === 'student');
  const parents  = allUsers.filter(u => u.role === 'parent');

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name     = 'Full name is required';
    if (!form.username.trim()) e.username = 'Username is required';
    else if (allUsers.some(u => u.username === form.username)) e.username = 'Username already taken';
    if (!form.email.trim())    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)        e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.gender)          e.gender   = 'Gender is required';
    if (!form.phone.trim())    e.phone    = 'Phone is required';
    if (!form.role)            e.role     = 'Please select a role';

    if (['teacher', 'accountant', 'principal', 'headmaster'].includes(form.role)) {
      if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required';
      if (!form.joinDate)          e.joinDate   = 'Join date is required';
    }
    if (form.role === 'teacher' && !form.subjects.length) e.subjects = 'Select at least one subject';
    if (form.role === 'student') {
      if (!form.rollNo.trim())    e.rollNo    = 'Roll number is required';
      if (!form.studentClass)     e.studentClass = 'Class is required';
      if (!form.admissionYear)    e.admissionYear = 'Admission year is required';
    }
    if (form.role === 'support_staff') {
      if (!form.subRole)           e.subRole    = 'Sub-role is required';
      if (!form.shift)             e.shift      = 'Shift is required';
      if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required';
      if (!form.joinDate)          e.joinDate   = 'Join date is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const initials = form.name.trim().split(/\s+/).map(n => n[0]).join('').slice(0, 3).toUpperCase();
    const base = {
      username: form.username.trim(),
      password: form.password,
      role: form.role,
      name: form.name.trim(),
      avatar: initials,
      phone: form.phone.trim(),
      email: form.email.trim(),
      gender: form.gender,
      dob: form.dob,
      address: form.address.trim(),
    };

    if (['principal', 'headmaster', 'teacher', 'accountant'].includes(form.role)) {
      base.employeeId   = form.employeeId.trim();
      base.qualification = form.qualification.trim();
      base.joinDate      = form.joinDate;
    }
    if (['principal', 'headmaster'].includes(form.role)) {
      base.yearsOfExperience = form.yearsOfExperience;
    }
    if (form.role === 'teacher') {
      base.subjects      = form.subjects;
      base.subject       = form.subjects[0] || '';
      base.classesHandled = form.classesAssigned;
    }
    if (form.role === 'student') {
      base.rollNo        = form.rollNo.trim();
      base.class         = form.studentClass;
      base.admissionYear = parseInt(form.admissionYear);
      base.bloodGroup    = form.bloodGroup;
      if (form.parentId) base.parentId = parseInt(form.parentId);
    }
    if (form.role === 'parent') {
      base.occupation  = form.occupation.trim();
      base.childrenIds = form.childrenIds.map(Number);
    }
    if (form.role === 'support_staff') {
      base.subRole     = form.subRole;
      base.shift       = form.shift;
      base.employeeId  = form.employeeId.trim();
      base.joinDate    = form.joinDate;
    }

    registerUser(base);
    setSuccessMsg(`${form.name} registered successfully as ${form.role === 'support_staff' ? form.subRole : form.role}.`);
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setTimeout(() => { setSuccessMsg(''); setView('list'); }, 2000);
  };

  const resetForm = () => { setForm({ ...EMPTY_FORM }); setErrors({}); setSuccessMsg(''); };

  const filtered = allUsers.filter(u => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase());
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
          {/* Summary stats */}
          <div className="stat-grid mb-20" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {[
              { label: 'Total Users',    value: allUsers.length,                               icon: '👥', color: 'bg-blue' },
              { label: 'Teachers',       value: allUsers.filter(u=>u.role==='teacher').length,  icon: '📚', color: 'bg-green' },
              { label: 'Students',       value: allUsers.filter(u=>u.role==='student').length,  icon: '👩‍🎓', color: 'bg-purple' },
              { label: 'Parents',        value: allUsers.filter(u=>u.role==='parent').length,   icon: '👨‍👩‍👦', color: 'bg-teal' },
              { label: 'Support Staff',  value: allUsers.filter(u=>['support_staff','accountant'].includes(u.role)).length, icon: '🔧', color: 'bg-orange' },
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

          {/* Filters */}
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
                <option value="principal">Principal</option>
                <option value="headmaster">Headmaster</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="accountant">Accountant</option>
                <option value="support_staff">Support Staff</option>
                <option value="guest">Guest</option>
              </select>
              <span style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>

          {/* Users table */}
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>User</th><th>Role</th><th>Email</th><th>Phone</th><th>Joined / Admitted</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
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
        <div className="card" style={{ maxWidth: 860, margin: '0 auto' }}>
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
              {/* Role Selection */}
              <div className="reg-section">
                <div className="reg-section-title">👤 Select Role *</div>
                <div className="reg-role-grid">
                  {ROLES.map(r => (
                    <div
                      key={r.value}
                      className={`reg-role-card${form.role === r.value ? ' selected' : ''}`}
                      onClick={() => set('role', r.value)}
                    >
                      <div className="reg-role-icon">{r.icon}</div>
                      <div className="reg-role-label">{r.label}</div>
                      <div className="reg-role-cat">{r.category}</div>
                    </div>
                  ))}
                </div>
                <FieldError msg={errors.role} />
              </div>

              {/* Basic Information */}
              <div className="reg-section">
                <div className="reg-section-title">📋 Basic Information</div>
                <div className="reg-grid-2">
                  <FormGroup label="Full Name" required error={errors.name}>
                    <input className={`form-control${errors.name ? ' input-error' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dr. Rajesh Kumar" />
                  </FormGroup>
                  <FormGroup label="Username" required error={errors.username}>
                    <input className={`form-control${errors.username ? ' input-error' : ''}`} value={form.username} onChange={e => set('username', e.target.value)} placeholder="e.g. rajesh.kumar" />
                  </FormGroup>
                  <FormGroup label="Email Address" required error={errors.email}>
                    <input type="email" className={`form-control${errors.email ? ' input-error' : ''}`} value={form.email} onChange={e => set('email', e.target.value)} placeholder="e.g. email@greenwood.edu" />
                  </FormGroup>
                  <FormGroup label="Phone Number" required error={errors.phone}>
                    <input className={`form-control${errors.phone ? ' input-error' : ''}`} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91-XXXXX-XXXXX" />
                  </FormGroup>
                  <FormGroup label="Password" required error={errors.password}>
                    <input type="password" className={`form-control${errors.password ? ' input-error' : ''}`} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" />
                  </FormGroup>
                  <FormGroup label="Confirm Password" required error={errors.confirmPassword}>
                    <input type="password" className={`form-control${errors.confirmPassword ? ' input-error' : ''}`} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Re-enter password" />
                  </FormGroup>
                </div>
              </div>

              {/* Personal Details */}
              <div className="reg-section">
                <div className="reg-section-title">🪪 Personal Details</div>
                <div className="reg-grid-3">
                  <FormGroup label="Gender" required error={errors.gender}>
                    <select className={`form-control${errors.gender ? ' input-error' : ''}`} value={form.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">Select gender</option>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </FormGroup>
                  <FormGroup label="Date of Birth" error={errors.dob}>
                    <input type="date" className="form-control" value={form.dob} onChange={e => set('dob', e.target.value)} />
                  </FormGroup>
                  <FormGroup label="Address" error={errors.address}>
                    <input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, City" />
                  </FormGroup>
                </div>
              </div>

              {/* Role-specific: Admin roles */}
              {['principal', 'headmaster', 'teacher', 'accountant'].includes(form.role) && (
                <div className="reg-section">
                  <div className="reg-section-title">🏢 Employment Details</div>
                  <div className="reg-grid-3">
                    <FormGroup label="Employee ID" required error={errors.employeeId}>
                      <input className={`form-control${errors.employeeId ? ' input-error' : ''}`} value={form.employeeId} onChange={e => set('employeeId', e.target.value)} placeholder="e.g. EMP018" />
                    </FormGroup>
                    <FormGroup label="Qualification" error={errors.qualification}>
                      <input className="form-control" value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="e.g. M.Sc. Mathematics" />
                    </FormGroup>
                    <FormGroup label="Join Date" required error={errors.joinDate}>
                      <input type="date" className={`form-control${errors.joinDate ? ' input-error' : ''}`} value={form.joinDate} onChange={e => set('joinDate', e.target.value)} />
                    </FormGroup>
                    {['principal', 'headmaster'].includes(form.role) && (
                      <FormGroup label="Years of Experience" error={errors.yearsOfExperience}>
                        <input type="number" className="form-control" value={form.yearsOfExperience} onChange={e => set('yearsOfExperience', e.target.value)} placeholder="e.g. 15" min="0" />
                      </FormGroup>
                    )}
                  </div>
                </div>
              )}

              {/* Role-specific: Teacher */}
              {form.role === 'teacher' && (
                <div className="reg-section">
                  <div className="reg-section-title">📚 Teaching Details</div>
                  <FormGroup label="Subjects to Teach" required error={errors.subjects}>
                    <CheckboxGroup items={SUBJECTS} selected={form.subjects} onChange={v => set('subjects', v)} />
                  </FormGroup>
                  <div style={{ marginTop: 16 }}>
                    <FormGroup label="Classes Assigned" error={errors.classesAssigned}>
                      <CheckboxGroup items={CLASS_NAMES} selected={form.classesAssigned} onChange={v => set('classesAssigned', v)} />
                    </FormGroup>
                  </div>
                </div>
              )}

              {/* Role-specific: Student */}
              {form.role === 'student' && (
                <div className="reg-section">
                  <div className="reg-section-title">🎒 Student Details</div>
                  <div className="reg-grid-3">
                    <FormGroup label="Roll Number" required error={errors.rollNo}>
                      <input className={`form-control${errors.rollNo ? ' input-error' : ''}`} value={form.rollNo} onChange={e => set('rollNo', e.target.value)} placeholder="e.g. 043" />
                    </FormGroup>
                    <FormGroup label="Class" required error={errors.studentClass}>
                      <select className={`form-control${errors.studentClass ? ' input-error' : ''}`} value={form.studentClass} onChange={e => set('studentClass', e.target.value)}>
                        <option value="">Select class</option>
                        {CLASS_NAMES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Admission Year" required error={errors.admissionYear}>
                      <input type="number" className={`form-control${errors.admissionYear ? ' input-error' : ''}`} value={form.admissionYear} onChange={e => set('admissionYear', e.target.value)} min="2000" max="2030" />
                    </FormGroup>
                    <FormGroup label="Blood Group" error={errors.bloodGroup}>
                      <select className="form-control" value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)}>
                        <option value="">Select blood group</option>
                        {BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Parent / Guardian" error={errors.parentId}>
                      <select className="form-control" value={form.parentId} onChange={e => set('parentId', e.target.value)}>
                        <option value="">Select parent (optional)</option>
                        {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </FormGroup>
                  </div>
                </div>
              )}

              {/* Role-specific: Parent */}
              {form.role === 'parent' && (
                <div className="reg-section">
                  <div className="reg-section-title">👨‍👩‍👦 Parent Details</div>
                  <div className="reg-grid-2">
                    <FormGroup label="Occupation" error={errors.occupation}>
                      <input className="form-control" value={form.occupation} onChange={e => set('occupation', e.target.value)} placeholder="e.g. Engineer, Doctor, Business" />
                    </FormGroup>
                    <FormGroup label="Link Children" error={errors.childrenIds}>
                      <select className="form-control" multiple value={form.childrenIds.map(String)} onChange={e => set('childrenIds', [...e.target.selectedOptions].map(o => o.value))} style={{ height: 80 }}>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} – Class {s.class}</option>)}
                      </select>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Hold Ctrl/Cmd to select multiple</span>
                    </FormGroup>
                  </div>
                </div>
              )}

              {/* Role-specific: Support Staff */}
              {form.role === 'support_staff' && (
                <div className="reg-section">
                  <div className="reg-section-title">🔧 Staff Details</div>
                  <div className="reg-grid-3">
                    <FormGroup label="Job Title" required error={errors.subRole}>
                      <select className={`form-control${errors.subRole ? ' input-error' : ''}`} value={form.subRole} onChange={e => set('subRole', e.target.value)}>
                        <option value="">Select job title</option>
                        {SUPPORT_SUBTYPES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Shift" required error={errors.shift}>
                      <select className={`form-control${errors.shift ? ' input-error' : ''}`} value={form.shift} onChange={e => set('shift', e.target.value)}>
                        <option value="">Select shift</option>
                        {SHIFTS.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </FormGroup>
                    <FormGroup label="Employee ID" required error={errors.employeeId}>
                      <input className={`form-control${errors.employeeId ? ' input-error' : ''}`} value={form.employeeId} onChange={e => set('employeeId', e.target.value)} placeholder="e.g. EMP020" />
                    </FormGroup>
                    <FormGroup label="Join Date" required error={errors.joinDate}>
                      <input type="date" className={`form-control${errors.joinDate ? ' input-error' : ''}`} value={form.joinDate} onChange={e => set('joinDate', e.target.value)} />
                    </FormGroup>
                    <FormGroup label="Qualification" error={errors.qualification}>
                      <input className="form-control" value={form.qualification} onChange={e => set('qualification', e.target.value)} placeholder="e.g. 10th Pass, ITI" />
                    </FormGroup>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setView('list')}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register User →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedUser && <UserDetail user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}
