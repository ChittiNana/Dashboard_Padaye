import { useState } from 'react';
import { useData } from '../../context/DataContext';

const BLANK = { date: '', name: '', type: 'National', description: '' };
const BADGE_MAP = { National: 'badge-danger', Festival: 'badge-warning', Regional: 'badge-purple' };

export default function HolidayManagement({ canEdit = false }) {
  const { holidays, addHoliday, deleteHoliday } = useData();

  const [showForm,      setShowForm]      = useState(false);
  const [form,          setForm]          = useState(BLANK);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm(BLANK); setShowForm(false); };

  const submit = () => {
    if (!form.date || !form.name.trim()) return;
    addHoliday({ ...form });
    reset();
  };

  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Holiday Calendar 2026-27</h1>
          <p>{holidays.length} holidays this academic year</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ Add Holiday'}
          </button>
        )}
      </div>

      {showForm && canEdit && (
        <div className="card mb-20">
          <div className="card-header">
            <div className="card-title">Add Holiday</div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Cancel</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Holiday Name *</label>
                <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Diwali" />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)}>
                  <option value="National">National</option>
                  <option value="Festival">Festival</option>
                  <option value="Regional">Regional</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-control" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description (optional)" />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={submit}>Add Holiday</button>
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
                <th>#</th><th>Date</th><th>Holiday</th><th>Type</th><th>Description</th>
                {canEdit && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sorted.map((h, i) => (
                <tr key={h.id}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>
                    {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(h.date).toLocaleDateString('en-IN', { weekday: 'long' })}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{h.name}</td>
                  <td><span className={`badge ${BADGE_MAP[h.type] || 'badge-info'}`}>{h.type}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{h.description}</td>
                  {canEdit && (
                    <td>
                      {deleteConfirm === h.id ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-danger btn-sm" onClick={() => { deleteHoliday(h.id); setDeleteConfirm(null); }}>Yes</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                        </div>
                      ) : (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(h.id)}>Delete</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
