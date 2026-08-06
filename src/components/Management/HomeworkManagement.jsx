import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer', 'PE', 'Drawing'];

export default function HomeworkManagement() {
  const { homework, addHomework, deleteHomework, classes } = useData();
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';

  const myClasses    = isTeacher ? (currentUser.classesHandled || []) : classes.map(c => c.name);
  const initSubject  = isTeacher ? (currentUser.subject || '') : '';
  const blankForm    = { title: '', class: myClasses[0] || '', subject: initSubject, dueDate: '', description: '' };

  const [showForm,      setShowForm]      = useState(false);
  const [form,          setForm]          = useState(blankForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterClass,   setFilterClass]   = useState('all');

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm(blankForm); setShowForm(false); };

  const today = new Date().toISOString().slice(0, 10);

  const submit = () => {
    if (!form.title.trim() || !form.class || !form.dueDate) return;
    addHomework({
      subject:      form.subject || initSubject,
      title:        form.title,
      class:        form.class,
      assignedBy:   currentUser?.name || '',
      assignedDate: today,
      dueDate:      form.dueDate,
      description:  form.description,
      status:       'pending',
      grade:        null,
    });
    reset();
  };

  const displayHW = isTeacher
    ? homework.filter(h => h.assignedBy === currentUser?.name)
    : homework;

  const filtered = filterClass === 'all' ? displayHW : displayHW.filter(h => h.class === filterClass);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Assignments / Homework</h1>
          <p>{filtered.length} assignments</p>
        </div>
        <div className="page-header-actions">
          <select className="form-control" style={{ width: 120 }}
            value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {myClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          {isTeacher && (
            <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
              {showForm ? 'Cancel' : '+ New Assignment'}
            </button>
          )}
        </div>
      </div>

      {showForm && isTeacher && (
        <div className="card mb-20">
          <div className="card-header">
            <div className="card-title">Create Assignment</div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Cancel</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Assignment title" />
              </div>
              <div className="form-group">
                <label className="form-label">Class *</label>
                <select className="form-control" value={form.class} onChange={e => set('class', e.target.value)}>
                  {myClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                {isTeacher ? (
                  <input className="form-control" value={form.subject} readOnly style={{ background: 'var(--bg-app)' }} />
                ) : (
                  <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
                    <option value="">Select…</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input type="date" className="form-control" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Instructions for students…" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={submit}>Assign</button>
              <button className="btn btn-outline" onClick={reset}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Subject</th><th>Title</th><th>Class</th><th>Assigned By</th>
                <th>Assigned</th><th>Due</th><th>Status</th>
                {isTeacher && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(hw => (
                <tr key={hw.id}>
                  <td>{hw.subject}</td>
                  <td style={{ fontWeight: 500 }}>{hw.title}</td>
                  <td><span className="badge badge-info">{hw.class}</span></td>
                  <td style={{ fontSize: 12 }}>{hw.assignedBy}</td>
                  <td style={{ fontSize: 12 }}>{hw.assignedDate}</td>
                  <td style={{ fontSize: 12 }}>{hw.dueDate}</td>
                  <td>
                    <span className={`badge badge-${hw.status === 'graded' ? 'success' : hw.status === 'submitted' ? 'info' : 'warning'}`}>
                      {hw.status}
                    </span>
                  </td>
                  {isTeacher && (
                    <td>
                      {deleteConfirm === hw.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-danger btn-sm" onClick={() => { deleteHomework(hw.id); setDeleteConfirm(null); }}>Yes</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                        </div>
                      ) : (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(hw.id)}>Delete</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={isTeacher ? 8 : 7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No assignments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
