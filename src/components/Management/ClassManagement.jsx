import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const BLANK = { grade: '', section: 'A', room: '', classTeacherId: '', strength: '' };

export default function ClassManagement() {
  const { classes, addClass, updateClass, deleteClass } = useData();
  const { allUsers } = useAuth();
  const teachers = allUsers.filter(u => u.role === 'teacher');

  const [showForm,      setShowForm]      = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [form,          setForm]          = useState(BLANK);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm(BLANK); setEditId(null); setShowForm(false); };

  const openEdit = (cls) => {
    setForm({ grade: cls.grade, section: cls.section, room: cls.room, classTeacherId: cls.classTeacherId, strength: cls.strength });
    setEditId(cls.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = () => {
    if (!form.grade || !form.room || !form.classTeacherId || !form.strength) return;
    const data = {
      grade: Number(form.grade),
      section: form.section,
      name: `${form.grade}${form.section}`,
      room: form.room,
      classTeacherId: Number(form.classTeacherId),
      strength: Number(form.strength),
      studentIds: editId ? (classes.find(c => c.id === editId)?.studentIds || []) : [],
    };
    if (editId) { updateClass(editId, data); } else { addClass(data); }
    reset();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Class Management</h1>
          <p>{classes.length} classes configured</p>
        </div>
        <button className="btn btn-primary" onClick={() => { reset(); setShowForm(s => !s); }}>
          {showForm && !editId ? 'Cancel' : '+ Add Class'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-20">
          <div className="card-header">
            <div className="card-title">{editId ? 'Edit Class' : 'Add New Class'}</div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Cancel</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Grade (1–12) *</label>
                <input type="number" className="form-control" min="1" max="12"
                  value={form.grade} onChange={e => set('grade', e.target.value)} placeholder="e.g. 10" />
              </div>
              <div className="form-group">
                <label className="form-label">Section *</label>
                <select className="form-control" value={form.section} onChange={e => set('section', e.target.value)}>
                  {['A','B','C','D','E','F'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Room *</label>
                <input className="form-control" value={form.room} onChange={e => set('room', e.target.value)} placeholder="e.g. Room 101" />
              </div>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Class Teacher *</label>
                <select className="form-control" value={form.classTeacherId} onChange={e => set('classTeacherId', e.target.value)}>
                  <option value="">Select teacher…</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.subject})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Strength *</label>
                <input type="number" className="form-control" min="1"
                  value={form.strength} onChange={e => set('strength', e.target.value)} placeholder="e.g. 42" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={submit}>{editId ? 'Update Class' : 'Add Class'}</button>
              <button className="btn btn-outline" onClick={reset}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid grid-3">
        {classes.map(cls => {
          const ct = allUsers.find(u => u.id === cls.classTeacherId);
          return (
            <div key={cls.id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 22 }}>Class {cls.name}</div>
                  <span className="badge badge-info">Grade {cls.grade}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ background: 'var(--bg-app)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 20 }}>{cls.strength}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Students</div>
                  </div>
                  <div style={{ background: 'var(--bg-app)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{cls.room}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Room</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: '1px solid var(--border)', marginBottom: 12 }}>
                  <span className="avatar avatar-sm role-teacher">{ct?.avatar}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{ct?.name || 'Unassigned'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Class Teacher</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(cls)}>Edit</button>
                  {deleteConfirm === cls.id ? (
                    <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                      <button className="btn btn-danger btn-sm" style={{ flex: 1 }}
                        onClick={() => { deleteClass(cls.id); setDeleteConfirm(null); }}>Confirm</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                    </div>
                  ) : (
                    <button className="btn btn-danger btn-sm" style={{ flex: 1 }}
                      onClick={() => setDeleteConfirm(cls.id)}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
