import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function NotesManagement() {
  const { notes, addNote, deleteNote, classes } = useData();
  const { currentUser } = useAuth();
  const isTeacher   = currentUser?.role === 'teacher';

  const myClasses   = isTeacher ? (currentUser.classesHandled || []) : classes.map(c => c.name);
  const initSubject = isTeacher ? (currentUser.subject || '') : '';
  const blankForm   = { title: '', class: myClasses[0] || '', subject: initSubject, fileType: 'PDF', pages: '' };

  const [showForm,      setShowForm]      = useState(false);
  const [form,          setForm]          = useState(blankForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm(blankForm); setShowForm(false); };

  const today = new Date().toISOString().slice(0, 10);

  const submit = () => {
    if (!form.title.trim() || !form.class) return;
    addNote({
      subject:    form.subject || initSubject,
      title:      form.title,
      uploadedBy: currentUser?.name || '',
      class:      form.class,
      date:       today,
      fileType:   form.fileType,
      pages:      Number(form.pages) || 0,
      downloads:  0,
    });
    reset();
  };

  const displayNotes = isTeacher
    ? notes.filter(n => n.uploadedBy === currentUser?.name)
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Chapter 4: Quadratic Equations" />
              </div>
              <div className="form-group">
                <label className="form-label">Class *</label>
                <select className="form-control" value={form.class} onChange={e => set('class', e.target.value)}>
                  {myClasses.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="form-control" value={form.subject} readOnly style={{ background: 'var(--bg-app)' }} />
              </div>
              <div className="form-group">
                <label className="form-label">File Type</label>
                <select className="form-control" value={form.fileType} onChange={e => set('fileType', e.target.value)}>
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="PPT">PPT</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Pages (optional)</label>
                <input type="number" className="form-control" value={form.pages} onChange={e => set('pages', e.target.value)} placeholder="e.g. 12" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={submit}>Add Material</button>
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
                <th>Subject</th><th>Title</th><th>Class</th><th>Uploaded By</th>
                <th>Date</th><th>Type</th><th>Pages</th><th>Downloads</th>
                {isTeacher && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {displayNotes.map(n => (
                <tr key={n.id}>
                  <td>{n.subject}</td>
                  <td style={{ fontWeight: 500 }}>{n.title}</td>
                  <td><span className="badge badge-info">{n.class}</span></td>
                  <td style={{ fontSize: 12 }}>{n.uploadedBy}</td>
                  <td style={{ fontSize: 12 }}>{n.date}</td>
                  <td><span className="badge badge-gray">{n.fileType}</span></td>
                  <td>{n.pages || '—'}</td>
                  <td>{n.downloads}</td>
                  {isTeacher && (
                    <td>
                      {deleteConfirm === n.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-danger btn-sm" onClick={() => { deleteNote(n.id); setDeleteConfirm(null); }}>Yes</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                        </div>
                      ) : (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(n.id)}>Delete</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {displayNotes.length === 0 && (
                <tr><td colSpan={isTeacher ? 9 : 8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No materials found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
