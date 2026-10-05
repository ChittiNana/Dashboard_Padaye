import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer', 'PE', 'Drawing'];

const BLANK = { classId: '', subject: '', title: '', dueDate: '', description: '' };

export default function HomeworkManagement() {
  const { homework, addHomework, classes } = useData();
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';

  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState(BLANK);
  const [filterClass,  setFilterClass]  = useState('all');
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm(BLANK); setShowForm(false); setSubmitError(''); };

  const classNameFor = (classId) => {
    const cls = classes.find(c => String(c.id) === String(classId));
    return cls ? `${cls.gradeLevel}${cls.section}` : classId;
  };

  const submit = async () => {
    if (!form.title.trim() || !form.classId || !form.subject || !form.dueDate) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await addHomework({
        classId:     Number(form.classId),
        subject:     form.subject,
        title:       form.title,
        description: form.description,
        dueDate:     form.dueDate,
      });
      reset();
    } catch (err) {
      setSubmitError(err.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const displayHW = isTeacher
    ? homework.filter(h => h.createdByStaffId === currentUser?.staffId)
    : homework;

  const filtered = filterClass === 'all' ? displayHW : displayHW.filter(h => String(h.classId) === filterClass);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Assignments / Homework</h1>
          <p>{filtered.length} assignments</p>
        </div>
        <div className="page-header-actions">
          <select className="form-control" style={{ width: 140 }}
            value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {classes.map(c => <option key={c.id} value={String(c.id)}>Class {c.gradeLevel}{c.section}</option>)}
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
            {submitError && <div className="alert alert-danger mb-12">{submitError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Assignment title" />
              </div>
              <div className="form-group">
                <label className="form-label">Class *</label>
                <select className="form-control" value={form.classId} onChange={e => set('classId', e.target.value)}>
                  <option value="">Select class…</option>
                  {classes.map(c => <option key={c.id} value={c.id}>Class {c.gradeLevel}{c.section}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
                  <option value="">Select…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
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
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>{submitting ? 'Assigning…' : 'Assign'}</button>
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
                <th>Subject</th><th>Title</th><th>Class</th><th>Due</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(hw => (
                <tr key={hw.id}>
                  <td>{hw.subject}</td>
                  <td style={{ fontWeight: 500 }}>{hw.title}</td>
                  <td><span className="badge badge-info">{classNameFor(hw.classId)}</span></td>
                  <td style={{ fontSize: 12 }}>{hw.dueDate}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No assignments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
