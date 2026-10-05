import { useState } from 'react';
import { useData } from '../../context/DataContext';

const BLANK = { classId: '', subject: '', examDate: '', maxMarks: 50 };
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer', 'PE', 'Drawing'];

const today = () => new Date().toISOString().slice(0, 10);

export default function ExamManagement() {
  const { exams, classes, addExam } = useData();

  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState(BLANK);
  const [filterStatus, setFilterStatus] = useState('all');
  const [submitting,   setSubmitting]   = useState(false);
  const [submitError,  setSubmitError]  = useState('');

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const reset = () => { setForm(BLANK); setShowForm(false); setSubmitError(''); };

  const classNameFor = (classId) => {
    const cls = classes.find(c => String(c.id) === String(classId));
    return cls ? `${cls.gradeLevel}${cls.section}` : classId;
  };

  const statusFor = (e) => (e.examDate && e.examDate < today() ? 'completed' : 'upcoming');

  const submit = async () => {
    if (!form.classId || !form.subject || !form.examDate) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await addExam({ classId: Number(form.classId), subject: form.subject, examDate: form.examDate, maxMarks: Number(form.maxMarks) });
      reset();
    } catch (err) {
      setSubmitError(err.message || 'Failed to schedule exam');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = exams.filter(e => filterStatus === 'all' || statusFor(e) === filterStatus);

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
            {showForm ? 'Cancel' : '+ Schedule Exam'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card mb-20">
          <div className="card-header">
            <div className="card-title">Schedule New Exam</div>
            <button className="btn btn-ghost btn-sm" onClick={reset}>Cancel</button>
          </div>
          <div className="card-body">
            {submitError && <div className="alert alert-danger mb-12">{submitError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
                  <option value="">Select subject…</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Class *</label>
                <select className="form-control" value={form.classId} onChange={e => set('classId', e.target.value)}>
                  <option value="">Select class…</option>
                  {classes.map(c => <option key={c.id} value={c.id}>Class {c.gradeLevel}{c.section}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input type="date" className="form-control" value={form.examDate} onChange={e => set('examDate', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Max Marks</label>
                <input type="number" className="form-control" value={form.maxMarks} onChange={e => set('maxMarks', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={submit} disabled={submitting}>{submitting ? 'Scheduling…' : 'Schedule Exam'}</button>
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
                <th>Subject</th><th>Class</th><th>Date</th><th>Max Marks</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.subject}</td>
                  <td><span className="badge badge-info">{classNameFor(e.classId)}</span></td>
                  <td>{e.examDate}</td>
                  <td>{e.maxMarks}</td>
                  <td>
                    <span className={`badge badge-${statusFor(e) === 'upcoming' ? 'warning' : 'success'}`}>
                      {statusFor(e)}
                    </span>
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
