import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { errorText } from '../../utils/apiError';

export default function SubjectManagement() {
  const { subjects, addSubject, deleteSubject } = useData();

  const [name,          setName]          = useState('');
  const [error,         setError]         = useState('');
  const [submitting,    setSubmitting]    = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (subjects.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('This subject already exists.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await addSubject(trimmed);
      setName('');
    } catch (err) {
      setError(errorText(err, 'Failed to add subject'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Subjects</h1>
          <p>{subjects.length} subjects configured — used across Homework, Notes, Exams, and Question Papers</p>
        </div>
      </div>

      <div className="card mb-20">
        <div className="card-body">
          {error && <div className="alert alert-danger mb-8" style={{ fontSize: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-control" style={{ maxWidth: 280 }}
              value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Economics"
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <button className="btn btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? 'Adding…' : '+ Add Subject'}
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Subject</th><th>Actions</th></tr></thead>
            <tbody>
              {subjects.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td>
                    {deleteConfirm === s.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-danger btn-sm" onClick={async () => { setDeleteConfirm(null); setError(''); try { await deleteSubject(s.id); } catch (err) { setError(errorText(err, 'Failed to delete subject')); } }}>Confirm</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => setDeleteConfirm(s.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No subjects configured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
