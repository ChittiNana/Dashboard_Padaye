import { useState } from 'react';
import { useData } from '../../context/DataContext';

const BLANK = { name: '', subject: '', class: '', date: '', time: '09:00', duration: '2 hrs', maxMarks: 50, room: '', status: 'upcoming' };
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer', 'PE', 'Drawing'];

export default function ExamManagement() {
  const { exams, classes, addExam, updateExam, deleteExam } = useData();

  const [showForm,      setShowForm]      = useState(false);
  const [editId,        setEditId]        = useState(null);
  const [form,          setForm]          = useState(BLANK);
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm(BLANK); setEditId(null); setShowForm(false); };

  const openEdit = (e) => {
    setForm({ name: e.name, subject: e.subject, class: e.class, date: e.date, time: e.time || '09:00', duration: e.duration, maxMarks: e.maxMarks, room: e.room, status: e.status });
    setEditId(e.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = () => {
    if (!form.name || !form.subject || !form.class || !form.date) return;
    const data = { ...form, maxMarks: Number(form.maxMarks) };
    if (editId) { updateExam(editId, data); } else { addExam(data); }
    reset();
  };

  const filtered = exams.filter(e => filterStatus === 'all' || e.status === filterStatus);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Exam Management</h1>
          <p>{exams.length} exams scheduled this year</p>
        </div>
        <div className="page-header-actions">
          <select className="form-control" style={{ width: 130 }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
          </select>
          <button className="btn btn-primary" onClick={() => { reset(); setShowForm(s => !s); }}>
            {showForm && !editId ? 'Cancel' : '+ Schedule Exam'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-20">
          <div className="card-header">
            <div className="card-title">{editId ? 'Edit Exam' : 'Schedule New Exam'}</div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Cancel</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Exam Name *</label>
                <input className="form-control" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Unit Test 1" />
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
                  <option value="">Select subject…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Class *</label>
                <select className="form-control" value={form.class} onChange={e => set('class', e.target.value)}>
                  <option value="">Select class…</option>
                  {classes.map(c => <option key={c.id} value={c.name}>Class {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input type="time" className="form-control" value={form.time} onChange={e => set('time', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Duration</label>
                <input className="form-control" value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 2 hrs" />
              </div>
              <div className="form-group">
                <label className="form-label">Max Marks</label>
                <input type="number" className="form-control" value={form.maxMarks} onChange={e => set('maxMarks', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Room / Venue</label>
                <input className="form-control" value={form.room} onChange={e => set('room', e.target.value)} placeholder="e.g. Hall A" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={submit}>{editId ? 'Update Exam' : 'Schedule Exam'}</button>
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
                <th>Exam Name</th><th>Subject</th><th>Class</th><th>Date</th>
                <th>Time</th><th>Duration</th><th>Max Marks</th><th>Room</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.name}</td>
                  <td>{e.subject}</td>
                  <td><span className="badge badge-info">{e.class}</span></td>
                  <td>{e.date}</td>
                  <td>{e.time}</td>
                  <td>{e.duration}</td>
                  <td>{e.maxMarks}</td>
                  <td>{e.room}</td>
                  <td>
                    <span className={`badge badge-${e.status === 'upcoming' ? 'warning' : e.status === 'completed' ? 'success' : 'danger'}`}>
                      {e.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(e)}>Edit</button>
                      {deleteConfirm === e.id ? (
                        <>
                          <button className="btn btn-danger btn-sm" onClick={() => { deleteExam(e.id); setDeleteConfirm(null); }}>Yes</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                        </>
                      ) : (
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(e.id)}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
