import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const BLANK = { title: '', priority: 'medium', audience: 'all', body: '' };

export default function NoticeManagement({ canPost = false }) {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();
  const { currentUser } = useAuth();

  const [showForm,      setShowForm]      = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [form,          setForm]          = useState(BLANK);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm(BLANK); setEditId(null); setShowForm(false); };

  const openEdit = (a) => {
    setForm({ title: a.title, priority: a.priority, audience: a.audience, body: a.body });
    setEditId(a.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = () => {
    if (!form.title.trim() || !form.body.trim()) return;
    const today = new Date().toISOString().slice(0, 10);
    const data  = { ...form, date: today, postedBy: currentUser?.name || 'Admin' };
    if (editId) { updateAnnouncement(editId, data); } else { addAnnouncement(data); }
    reset();
  };

  const priorityColor = (p) => p === 'high' ? 'badge-danger' : p === 'medium' ? 'badge-warning' : 'badge-info';

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

      {showForm && canPost && (
        <div className="card mb-20">
          <div className="card-header">
            <div className="card-title">{editId ? 'Edit Notice' : 'New Notice'}</div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Cancel</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-control" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Notice title" />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-control" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Audience</label>
                <select className="form-control" value={form.audience} onChange={e => set('audience', e.target.value)}>
                  <option value="all">All</option>
                  <option value="students">Students</option>
                  <option value="parents">Parents</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Message *</label>
              <textarea className="form-control" rows={4} value={form.body} onChange={e => set('body', e.target.value)} placeholder="Notice content…" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={submit}>{editId ? 'Update Notice' : 'Post Notice'}</button>
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
                    <span className={`badge ${priorityColor(a.priority)}`}>{a.priority}</span>
                    <span className="badge badge-gray">{a.audience === 'all' ? 'All' : a.audience}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{a.body}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Posted by {a.postedBy} · {a.date}</div>
                </div>
                {canPost && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(a)}>Edit</button>
                    {deleteConfirm === a.id ? (
                      <>
                        <button className="btn btn-danger btn-sm" onClick={() => { deleteAnnouncement(a.id); setDeleteConfirm(null); }}>Yes</button>
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
