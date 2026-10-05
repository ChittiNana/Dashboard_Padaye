import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer', 'PE', 'Drawing'];

const BLANK = { classId: '', subject: '', title: '', fileUrl: '' };

export default function NotesManagement() {
  const { notes, addNote, classes } = useData();
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';

  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState(BLANK);
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm(BLANK); setShowForm(false); setSubmitError(''); };

  const classNameFor = (classId) => {
    const cls = classes.find(c => String(c.id) === String(classId));
    return cls ? `${cls.gradeLevel}${cls.section}` : classId;
  };

  const submit = async () => {
    if (!form.title.trim() || !form.classId || !form.subject) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await addNote({
        classId: Number(form.classId),
        subject: form.subject,
        title:   form.title,
        fileUrl: form.fileUrl,
      });
      reset();
    } catch (err) {
      setSubmitError(err.message || 'Failed to upload material');
    } finally {
      setSubmitting(false);
    }
  };

  const displayNotes = isTeacher
    ? notes.filter(n => n.uploadedByStaffId === currentUser?.staffId)
    : notes;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Study Materials</h1>
          <p>{displayNotes.length} materials{isTeacher ? ' uploaded by you' : ''}</p>
        </div>
        {isTeacher && (
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ Upload Notes'}
          </button>
        )}
      </div>

      {showForm && isTeacher && (
        <div className="card mb-20">
          <div className="card-header">
            <div className="card-title">Upload New Material</div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Cancel</button>
          </div>
          <div className="card-body">
            {submitError && <div className="alert alert-danger mb-12">{submitError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Chapter 4: Quadratic Equations" />
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
                <label className="form-label">File URL</label>
                <input className="form-control" value={form.fileUrl} onChange={e => set('fileUrl', e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>{submitting ? 'Uploading…' : 'Add Material'}</button>
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
                <th>Subject</th><th>Title</th><th>Class</th><th>File</th>
              </tr>
            </thead>
            <tbody>
              {displayNotes.map(n => (
                <tr key={n.id}>
                  <td>{n.subject}</td>
                  <td style={{ fontWeight: 500 }}>{n.title}</td>
                  <td><span className="badge badge-info">{classNameFor(n.classId)}</span></td>
                  <td>
                    {n.fileUrl ? <a href={n.fileUrl} target="_blank" rel="noreferrer">Open</a> : '—'}
                  </td>
                </tr>
              ))}
              {displayNotes.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No materials found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
