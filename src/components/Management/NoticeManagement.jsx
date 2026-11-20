import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const BLANK = { title: '', audienceRoles: [], body: '' };

const AUDIENCE_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'HEADMASTER', label: 'Headmaster' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'SUPPORT_STAFF', label: 'Support Staff' },
];

// Back-compat: an older/real-backend notice may still carry a single `audienceRole`
// instead of the new `audienceRoles` array — normalize both shapes to an array.
function rolesOf(a) {
  if (Array.isArray(a.audienceRoles)) return a.audienceRoles;
  return a.audienceRole ? [a.audienceRole] : [];
}

function audienceLabel(a) {
  const roles = rolesOf(a);
  if (roles.length === 0) return 'Everyone';
  return roles.map(r => AUDIENCE_OPTIONS.find(o => o.value === r)?.label || r).join(', ');
}

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString() : '—';
}

export default function NoticeManagement({ canPost = false }) {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();
  const { allUsers } = useAuth();

  const [showForm,      setShowForm]      = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [form,          setForm]          = useState(BLANK);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting,    setSubmitting]    = useState(false);
  const [submitError,   setSubmitError]   = useState('');
  const [deleteError,   setDeleteError]   = useState('');

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm(BLANK); setEditId(null); setShowForm(false); setSubmitError(''); };

  const openEdit = (a) => {
    setForm({ title: a.title, audienceRoles: rolesOf(a), body: a.body });
    setEditId(a.id);
    setShowForm(true);
    setSubmitError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleRole = (role) => {
    setForm(f => ({
      ...f,
      audienceRoles: f.audienceRoles.includes(role)
        ? f.audienceRoles.filter(r => r !== role)
        : [...f.audienceRoles, role],
    }));
  };

  const submit = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const data = { title: form.title, body: form.body, audienceRoles: form.audienceRoles };
      if (editId) { await updateAnnouncement(editId, data); } else { await addAnnouncement(data); }
      reset();
    } catch (err) {
      setSubmitError(err.message || 'Failed to save notice.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async (id) => {
    setDeleteError('');
    try {
      await deleteAnnouncement(id);
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete notice.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const postedByName = (a) => allUsers.find(u => u.userId === a.postedByUserId)?.name || 'Admin';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Notices &amp; Announcements</h1>
          <p>{announcements.length} total notices</p>
        </div>
        {canPost && (
          <button className="btn btn-primary" onClick={() => { reset(); setShowForm(s => !s); }}>
            {showForm && !editId ? 'Cancel' : '+ Post Notice'}
          </button>
        )}
      </div>

      {deleteError && <div className="alert alert-danger mb-12">{deleteError}</div>}

      {showForm && canPost && (
        <div className="card mb-20">
          <div className="card-header">
            <div className="card-title">{editId ? 'Edit Notice' : 'New Notice'}</div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Cancel</button>
          </div>
          <div className="card-body">
            {submitError && <div className="alert alert-danger mb-8" style={{ fontSize: 12 }}>{submitError}</div>}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" maxLength={255} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Notice title" />
            </div>
            <div className="form-group">
              <label className="form-label">
                Audience — leave all unchecked to send to everyone, or pick any combination of roles
              </label>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {AUDIENCE_OPTIONS.map(o => (
                  <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.audienceRoles.includes(o.value)} onChange={() => toggleRole(o.value)} />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-control" rows={4} maxLength={20000} value={form.body} onChange={e => set('body', e.target.value)} placeholder="Notice content…" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>
                {submitting ? 'Saving…' : editId ? 'Update Notice' : 'Post Notice'}
              </button>
              <button className="btn btn-outline" onClick={reset}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gap: 12 }}>
        {announcements.map(a => (
          <div key={a.id} className="card">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>📢</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</span>
                    <span className="badge badge-gray">{audienceLabel(a)}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{a.body}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Posted by {postedByName(a)} · {formatDate(a.createdAt)}</div>
                </div>
                {canPost && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>Edit</button>
                    {deleteConfirm === a.id ? (
                      <>
                        <button className="btn btn-danger btn-sm" onClick={() => confirmDelete(a.id)}>Yes</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                      </>
                    ) : (
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(a.id)}>Delete</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
              No notices yet. {canPost && 'Click "+ Post Notice" to create one.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
