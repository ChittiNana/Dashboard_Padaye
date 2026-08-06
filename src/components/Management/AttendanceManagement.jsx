import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function AttendanceManagement() {
  const { attendance, saveAttendance, classes } = useData();
  const { currentUser, allUsers } = useAuth();
  const students  = allUsers.filter(u => u.role === 'student');
  const isTeacher = currentUser?.role === 'teacher';

  const myClasses = isTeacher
    ? (currentUser.classesHandled || [])
    : classes.map(c => c.name);

  const today = new Date().toISOString().slice(0, 10);

  const [selectedClass, setSelectedClass] = useState(myClasses[0] || '');
  const [date,          setDate]          = useState(today);
  const [attState,      setAttState]      = useState(() => buildInit(myClasses[0] || '', today));
  const [saved,         setSaved]         = useState(false);

  function buildInit(cls, dt) {
    const init = {};
    students.filter(u => u.class === cls).forEach(s => {
      const existing = attendance.find(a => a.studentId === s.id && a.date === dt);
      init[s.id] = existing?.status || 'Present';
    });
    return init;
  }

  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    setAttState(buildInit(cls, date));
    setSaved(false);
  };

  const handleDateChange = (dt) => {
    setDate(dt);
    setAttState(buildInit(selectedClass, dt));
    setSaved(false);
  };

  const toggle = (id, val) => { setAttState(prev => ({ ...prev, [id]: val })); setSaved(false); };

  const setAll = (status) => {
    const n = {};
    students.filter(u => u.class === selectedClass).forEach(s => { n[s.id] = status; });
    setAttState(n);
    setSaved(false);
  };

  const save = () => {
    if (!selectedClass || !date) return;
    const classStudents = students.filter(u => u.class === selectedClass);
    const records = classStudents.map(s => ({
      studentId: s.id,
      class: selectedClass,
      date,
      status: attState[s.id] || 'Present',
    }));
    saveAttendance(records);
    setSaved(true);
  };

  // ── Principal / Headmaster: attendance overview ───────────────────────────
  if (!isTeacher) {
    const studentAtt = {};
    students.forEach(s => {
      const recs    = attendance.filter(a => a.studentId === s.id);
      const present = recs.filter(a => a.status === 'Present').length;
      const absent  = recs.filter(a => a.status === 'Absent').length;
      const late    = recs.filter(a => a.status === 'Late').length;
      const total   = recs.length;
      studentAtt[s.id] = { present, absent, late, total, pct: total ? Math.round((present + late * 0.5) / total * 100) : 0 };
    });
    const avgPct  = students.length ? Math.round(Object.values(studentAtt).reduce((s, a) => s + a.pct, 0) / students.length) : 0;
    const below75 = Object.values(studentAtt).filter(a => a.pct < 75).length;

    return (
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Attendance Overview</h1>
            <p>Student attendance records for all classes</p>
          </div>
        </div>

        <div className="stat-grid mb-20">
          <div className="stat-card"><div className="stat-icon bg-green">✅</div><div className="stat-info"><div className="stat-value">{avgPct}%</div><div className="stat-label">Avg Attendance</div></div></div>
          <div className="stat-card"><div className="stat-icon bg-orange">⚠</div><div className="stat-info"><div className="stat-value">{below75}</div><div className="stat-label">Below 75%</div></div></div>
          <div className="stat-card"><div className="stat-icon bg-blue">📋</div><div className="stat-info"><div className="stat-value">{attendance.length}</div><div className="stat-label">Total Records</div></div></div>
        </div>

        <div className="card">
          <div className="card-header"><div className="card-title">Student Attendance Summary</div></div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Student</th><th>Class</th><th>Present</th><th>Absent</th><th>Late</th><th>Total Days</th><th>Attendance %</th></tr>
              </thead>
              <tbody>
                {students.map(s => {
                  const a   = studentAtt[s.id] || {};
                  const low = (a.pct || 0) < 75;
                  return (
                    <tr key={s.id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span className="avatar avatar-sm role-student">{s.avatar}</span>{s.name}</div></td>
                      <td>{s.class}</td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>{a.present || 0}</td>
                      <td style={{ color: 'var(--danger)',  fontWeight: 600 }}>{a.absent  || 0}</td>
                      <td style={{ color: 'var(--warning)', fontWeight: 600 }}>{a.late    || 0}</td>
                      <td>{a.total || 0}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${a.pct || 0}%`, background: low ? 'var(--danger)' : 'var(--success)', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: low ? 'var(--danger)' : 'var(--success)', minWidth: 38 }}>{a.pct || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Teacher: mark attendance ──────────────────────────────────────────────
  const classStudents = students.filter(u => u.class === selectedClass);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Mark Attendance</h1></div>
        <div className="page-header-actions">
          <select className="form-control" style={{ width: 120 }}
            value={selectedClass} onChange={e => handleClassChange(e.target.value)}>
            {myClasses.map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
          <input type="date" className="form-control" style={{ width: 160 }}
            value={date} onChange={e => handleDateChange(e.target.value)} />
          <button
            className={`btn btn-${saved ? 'success' : 'primary'}`}
            onClick={save}
          >
            {saved ? '✓ Saved' : 'Save Attendance'}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Class {selectedClass} — {date}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-success btn-sm" onClick={() => setAll('Present')}>All Present</button>
            <button className="btn btn-danger btn-sm"  onClick={() => setAll('Absent')}>All Absent</button>
          </div>
        </div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Roll No</th><th>Student Name</th><th>Present</th><th>Absent</th><th>Late</th></tr></thead>
            <tbody>
              {classStudents.map(s => (
                <tr key={s.id}>
                  <td>{s.rollNo}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="avatar avatar-sm role-student">{s.avatar}</span>
                      {s.name}
                    </div>
                  </td>
                  {['Present', 'Absent', 'Late'].map(status => (
                    <td key={status}>
                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name={`att-${s.id}`}
                          checked={(attState[s.id] || 'Present') === status}
                          onChange={() => toggle(s.id, status)}
                        />
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
              {classStudents.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No students found for Class {selectedClass}.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
