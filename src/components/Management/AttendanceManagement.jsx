import { useState, useCallback, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import * as attendanceApi from '../../api/attendanceApi';

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

/* ── Teacher: mark attendance ──────────────────────────────────────────── */
function MarkAttendance() {
  const { classes } = useData();
  const { currentUser, allStudents } = useAuth();
  const myClasses = classes.filter(c => c.classTeacherStaffId === currentUser.staffId && c.active !== false);

  const [selectedClass, setSelectedClass] = useState(myClasses[0]?.id ?? '');
  const [date,           setDate]          = useState(today());
  const [attState,       setAttState]      = useState({});
  const [loading,        setLoading]       = useState(false);
  const [loadError,      setLoadError]     = useState('');
  const [saving,         setSaving]        = useState(false);
  const [saveError,      setSaveError]     = useState('');
  const [saved,          setSaved]         = useState(false);

  const classStudents = allStudents.filter(s => s.classId === Number(selectedClass));

  const loadExisting = useCallback(async () => {
    if (!selectedClass || !date) return;
    setLoading(true);
    setLoadError('');
    try {
      const res = await attendanceApi.getClassAttendance(selectedClass, date);
      const init = {};
      (res.records || []).forEach(r => { init[r.studentId] = r.status; });
      setAttState(init);
    } catch (err) {
      setLoadError(err.message || 'Failed to load existing attendance.');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, date]);

  useEffect(() => { loadExisting(); setSaved(false); }, [loadExisting]);

  const toggle = (id, val) => { setAttState(prev => ({ ...prev, [id]: val })); setSaved(false); };

  const setAll = (status) => {
    const n = {};
    classStudents.forEach(s => { n[s.id] = status; });
    setAttState(n);
    setSaved(false);
  };

  const save = async () => {
    if (!selectedClass || !date) return;
    setSaving(true);
    setSaveError('');
    try {
      const entries = classStudents.map(s => ({ studentId: s.id, status: attState[s.id] || 'PRESENT' }));
      await attendanceApi.markAttendance(Number(selectedClass), date, entries);
      setSaved(true);
    } catch (err) {
      setSaveError(err.message || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Mark Attendance</h1></div>
        <div className="page-header-actions">
          <select className="form-control" style={{ width: 140 }}
            value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            {myClasses.map(c => <option key={c.id} value={c.id}>Class {c.name}</option>)}
          </select>
          <input type="date" className="form-control" style={{ width: 160 }}
            value={date} onChange={e => setDate(e.target.value)} />
          <button
            className={`btn btn-${saved ? 'success' : 'primary'}`}
            onClick={save}
            disabled={saving || !selectedClass}
          >
            {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {saveError && <div className="alert alert-danger mb-20">{saveError}</div>}

      {myClasses.length === 0 ? (
        <div className="card"><div className="card-body" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>You are not assigned as class teacher for any class.</div></div>
      ) : (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Class {myClasses.find(c => c.id === Number(selectedClass))?.name} — {date}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-success btn-sm" onClick={() => setAll('PRESENT')}>All Present</button>
              <button className="btn btn-danger btn-sm"  onClick={() => setAll('ABSENT')}>All Absent</button>
            </div>
          </div>
          {loadError && <div className="alert alert-danger" style={{ margin: 16 }}>{loadError}</div>}
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Student Name</th><th>Admission No</th>{STATUSES.map(s => <th key={s}>{s}</th>)}</tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2 + STATUSES.length} style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>
                ) : classStudents.length === 0 ? (
                  <tr><td colSpan={2 + STATUSES.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No students found for this class.</td></tr>
                ) : classStudents.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="avatar avatar-sm role-student">{s.avatar}</span>
                        {s.name}
                      </div>
                    </td>
                    <td>{s.admissionNumber}</td>
                    {STATUSES.map(status => (
                      <td key={status}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <input
                            type="radio"
                            name={`att-${s.id}`}
                            checked={(attState[s.id] || 'PRESENT') === status}
                            onChange={() => toggle(s.id, status)}
                          />
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Principal / Headmaster: today's overview ──────────────────────────── */
function AttendanceOverview() {
  const { classes } = useData();
  const activeClasses = classes.filter(c => c.active !== false);

  const [summary,     setSummary]     = useState(null);
  const [classRows,   setClassRows]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [loadError,   setLoadError]   = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [summaryRes, classResults] = await Promise.all([
        attendanceApi.getSchoolSummary(),
        Promise.all(activeClasses.map(c =>
          attendanceApi.getClassAttendance(c.id).then(res => ({ cls: c, res }))
        )),
      ]);
      setSummary(summaryRes);
      setClassRows(classResults.map(({ cls, res }) => {
        const records = res.records || [];
        const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, EXCUSED: 0 };
        records.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
        return { cls, total: records.length, ...counts };
      }));
    } catch (err) {
      setLoadError(err.message || 'Failed to load attendance overview.');
    } finally {
      setLoading(false);
    }
  }, [classes]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Attendance Overview</h1>
          <p>Today's attendance across all classes</p>
        </div>
      </div>

      {loadError && <div className="alert alert-danger mb-20">{loadError}</div>}

      <div className="stat-grid mb-20">
        <div className="stat-card"><div className="stat-icon bg-blue">📋</div><div className="stat-info"><div className="stat-value">{summary?.totalRecordsToday ?? '—'}</div><div className="stat-label">Marked Today</div></div></div>
        <div className="stat-card"><div className="stat-icon bg-green">✅</div><div className="stat-info"><div className="stat-value">{summary?.presentToday ?? '—'}</div><div className="stat-label">Present Today</div></div></div>
        <div className="stat-card"><div className="stat-icon bg-orange">⚠</div><div className="stat-info"><div className="stat-value">{summary?.absentToday ?? '—'}</div><div className="stat-label">Absent Today</div></div></div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Per-Class Breakdown — {today()}</div></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Class</th><th>Marked</th>{STATUSES.map(s => <th key={s}>{s}</th>)}</tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={2 + STATUSES.length} style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>
              ) : classRows.length === 0 ? (
                <tr><td colSpan={2 + STATUSES.length} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No classes found.</td></tr>
              ) : classRows.map(({ cls, total, PRESENT, ABSENT, LATE, EXCUSED }) => (
                <tr key={cls.id}>
                  <td><span className="badge badge-info">Class {cls.name}</span></td>
                  <td>{total}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>{PRESENT}</td>
                  <td style={{ color: 'var(--danger)',  fontWeight: 600 }}>{ABSENT}</td>
                  <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{LATE}</td>
                  <td>{EXCUSED}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AttendanceManagement() {
  const { currentUser } = useAuth();
  const isTeacher = currentUser?.role === 'teacher';
  return isTeacher ? <MarkAttendance /> : <AttendanceOverview />;
}
