import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import * as attendanceApi from '../../api/attendanceApi';
import * as timetableApi from '../../api/timetableApi';
import * as academicsApi from '../../api/academicsApi';
import { readWithFallback } from '../../api/mockFallback';
import { listTable, deriveStudentAttendance, deriveResultsByStudent, deriveClassTimetable } from '../../data/mockStore';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function todayDayOfWeek() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function dayLabel(day) {
  return day.charAt(0) + day.slice(1).toLowerCase();
}
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${period}`;
}

/* ── Dashboard ──────────────────────────────────────────────── */
function Dashboard({ student }) {
  const { homework, exams, announcements } = useData();
  const [attSummary,   setAttSummary]   = useState(null);
  const [myResults,    setMyResults]    = useState([]);
  const [todaySlots,   setTodaySlots]   = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  useEffect(() => {
    if (!student.studentId) return;
    readWithFallback(
      () => attendanceApi.getStudentAttendance(student.studentId),
      () => deriveStudentAttendance(student.studentId),
      { label: 'getStudentAttendance' },
    ).then(setAttSummary);
    readWithFallback(
      () => academicsApi.getResultsByStudent(student.studentId),
      () => deriveResultsByStudent(student.studentId),
      { label: 'getResultsByStudent' },
    ).then(setMyResults);
  }, [student.studentId]);

  useEffect(() => {
    let active = true;
    if (!student.classId) { setSlotsLoading(false); return; }
    readWithFallback(
      () => timetableApi.getClassTimetable(student.classId),
      () => deriveClassTimetable(student.classId),
      { label: 'getClassTimetable' },
    )
      .then(data => { if (active) setTodaySlots(data.filter(s => s.dayOfWeek === todayDayOfWeek())); })
      .finally(() => { if (active) setSlotsLoading(false); });
    return () => { active = false; };
  }, [student.classId]);

  const attPct  = attSummary?.attendancePercentage ?? 0;
  const myHW    = homework.filter(h => h.classId === student.classId);
  const myExams = exams.filter(e => e.classId === student.classId && e.examDate >= todayISO());

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Hey, {student.name?.split(' ')[0]}! 👋</h1>
          <p>Admission No. {student.admissionNumber ?? '—'}</p>
        </div>
        <span className="badge badge-success">Student Portal</span>
      </div>

      {/* Quick stats */}
      <div className="stat-grid mb-20">
        <div className="stat-card">
          <div className="stat-icon bg-blue">✅</div>
          <div className="stat-info">
            <div className="stat-value">{attPct}%</div>
            <div className="stat-label">Attendance</div>
            <div className={`stat-change ${attPct >= 75 ? 'up' : 'down'}`}>
              {attPct >= 75 ? 'Good standing' : '⚠ Below 75%!'}
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange">📝</div>
          <div className="stat-info">
            <div className="stat-value">{myHW.length}</div>
            <div className="stat-label">Assignments</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red">📋</div>
          <div className="stat-info">
            <div className="stat-value">{myExams.length}</div>
            <div className="stat-label">Upcoming Exams</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple">🏆</div>
          <div className="stat-info">
            <div className="stat-value">{myResults.length > 0 ? Math.round(myResults.reduce((s,r)=>s+r.marksObtained/r.maxMarks,0)/myResults.length*100) : '—'}%</div>
            <div className="stat-label">Avg Score</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid grid-2">
        {/* Today's Classes */}
        <div className="card">
          <div className="card-header"><div className="card-title">Today's Schedule ({dayLabel(todayDayOfWeek())})</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {todaySlots.slice().sort((a, b) => a.periodNumber - b.periodNumber).map(p => {
              const colors = { Mathematics:'#ebf8ff', Science:'#f0fff4', English:'#faf5ff', History:'#fffaf0', Geography:'#e6fffa', Computer:'#fff5f5', PE:'#f0f4ff', Drawing:'#fff0f5' };
              return (
                <div key={p.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)', display:'flex', gap: 10, alignItems:'center' }}>
                  <div style={{ background: colors[p.subject] || '#f7fafc', borderRadius: 8, padding:'8px 12px', minWidth: 88, textAlign:'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{formatTime(p.startTime)}</div>
                    <div style={{ fontSize: 10, color:'var(--text-muted)' }}>P{p.periodNumber}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.subject}</div>
                  </div>
                </div>
              );
            })}
            {!slotsLoading && todaySlots.length === 0 && (
              <div style={{ padding: 24, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>No classes scheduled for today</div>
            )}
          </div>
        </div>

        {/* Homework */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Homework</div>
            {myHW.length > 0 && <span className="badge badge-warning">{myHW.length}</span>}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {myHW.length === 0 ? (
              <div style={{ padding: 24, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>🎉 All caught up!</div>
            ) : myHW.map(hw => (
              <div key={hw.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{hw.title}</div>
                    <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{hw.subject} · Due: {hw.dueDate}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="card">
          <div className="card-header"><div className="card-title">Upcoming Exams</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {myExams.slice(0, 5).map(e => (
              <div key={e.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontWeight: 600 }}>{e.subject}</div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{e.examDate}</div>
                  <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Max: {e.maxMarks}</div>
                </div>
              </div>
            ))}
            {myExams.length === 0 && (
              <div style={{ padding: 24, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>No upcoming exams</div>
            )}
          </div>
        </div>

        {/* School Notices */}
        <div className="card">
          <div className="card-header"><div className="card-title">School Notices</div></div>
          <div className="card-body" style={{ padding:'8px 0' }}>
            {announcements.slice(0, 4).map(a => (
              <div key={a.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{a.title}</div>
                <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Timetable ─────────────────────────────────────────────── */
function Timetable({ student }) {
  const [slots,       setSlots]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selectedDay, setSelectedDay] = useState(todayDayOfWeek());

  useEffect(() => {
    let active = true;
    if (!student.classId) { setLoading(false); return; }
    readWithFallback(
      () => timetableApi.getClassTimetable(student.classId),
      () => deriveClassTimetable(student.classId),
      { label: 'getClassTimetable' },
    )
      .then(data => { if (active) setSlots(data); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [student.classId]);

  const daySchedule = slots.filter(s => s.dayOfWeek === selectedDay).sort((a, b) => a.periodNumber - b.periodNumber);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Weekly Timetable</h1>
        </div>
      </div>

      <div className="tabs">
        {DAY_ORDER.map(d => (
          <div key={d} className={`tab ${selectedDay === d ? 'active' : ''}`}
            onClick={() => setSelectedDay(d)}>{dayLabel(d)}</div>
        ))}
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {daySchedule.map(p => (
            <div key={p.id} style={{
              display:'flex', gap: 12, padding:'14px 20px',
              borderBottom:'1px solid var(--border)',
              alignItems:'center',
            }}>
              <div style={{ width: 56, textAlign:'center', flexShrink: 0 }}>
                <div style={{ fontSize: 10, color:'var(--text-muted)', fontWeight: 600 }}>P{p.periodNumber}</div>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{formatTime(p.startTime)}</div>
                <div style={{ fontSize: 10, color:'var(--text-muted)' }}>{formatTime(p.endTime)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{p.subject}</div>
              </div>
            </div>
          ))}
          {!loading && daySchedule.length === 0 && (
            <div style={{ padding: 24, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>No classes scheduled for this day.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Study Materials ────────────────────────────────────────── */
function StudyMaterials({ student }) {
  const { notes } = useData();
  const [filterSubject, setFilterSubject] = useState('all');
  const myNotes = notes.filter(n => n.classId === student.classId);
  const subjects = [...new Set(myNotes.map(n => n.subject))];
  const filtered = filterSubject === 'all' ? myNotes : myNotes.filter(n => n.subject === filterSubject);

  const subjectBg = {
    Mathematics: 'linear-gradient(135deg, #1e3a5f, #2c5282)',
    Science:     'linear-gradient(135deg, #276749, #22543d)',
    English:     'linear-gradient(135deg, #553c9a, #44337a)',
    History:     'linear-gradient(135deg, #7b341e, #652b19)',
    Geography:   'linear-gradient(135deg, #285e61, #1d4044)',
    Computer:    'linear-gradient(135deg, #c53030, #9b2c2c)',
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Study Materials</h1>
          <p>Notes and resources for your class</p>
        </div>
        <select className="form-control" style={{ width: 160 }}
          value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Subject quick-access */}
      <div className="subject-cards mb-20">
        {subjects.map(sub => {
          const count = myNotes.filter(n => n.subject === sub).length;
          return (
            <div key={sub} className="subject-card"
              style={{ background: subjectBg[sub] || 'linear-gradient(135deg, #4a5568,#2d3748)' }}
              onClick={() => setFilterSubject(sub === filterSubject ? 'all' : sub)}>
              <h4>{sub}</h4>
              <p>{count} {count === 1 ? 'note' : 'notes'}</p>
            </div>
          );
        })}
      </div>

      {/* Notes table */}
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Subject</th><th>Title</th><th>File</th></tr></thead>
            <tbody>
              {filtered.map(n => (
                <tr key={n.id}>
                  <td>
                    <span className="badge badge-info">{n.subject}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{n.title}</td>
                  <td>
                    {n.fileUrl ? <a href={n.fileUrl} target="_blank" rel="noreferrer">📥 Open</a> : <span style={{ color:'var(--text-muted)' }}>—</span>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No materials found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Homework ───────────────────────────────────────────────── */
function Homework({ student }) {
  const { homework } = useData();
  const myHW = homework.filter(h => h.classId === student.classId);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Homework & Assignments</h1>
        </div>
      </div>

      <div style={{ display:'grid', gap: 12 }}>
        {myHW.map(hw => (
          <div key={hw.id} className="card">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>📝</span>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{hw.title}</span>
                <span className="badge badge-info">{hw.subject}</span>
              </div>
              <p style={{ fontSize: 13, color:'var(--text-secondary)', marginBottom: 8 }}>{hw.description}</p>
              <div style={{ display:'flex', gap: 16, fontSize: 12, color:'var(--text-muted)' }}>
                <span>⏰ Due: {hw.dueDate}</span>
              </div>
            </div>
          </div>
        ))}
        {myHW.length === 0 && (
          <div className="card"><div className="card-body" style={{ textAlign:'center', color:'var(--text-muted)' }}>
            No homework assigned yet.
          </div></div>
        )}
      </div>
    </div>
  );
}

/* ── Exam Schedule ──────────────────────────────────────────── */
function ExamSchedule({ student }) {
  const { exams } = useData();
  const [filter, setFilter] = useState('upcoming');
  const myExams = exams.filter(e => e.classId === student.classId);
  const statusFor = (e) => (e.examDate && e.examDate < todayISO() ? 'completed' : 'upcoming');
  const filtered = filter === 'all' ? myExams : myExams.filter(e => statusFor(e) === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Exam Schedule</h1>
          <p>{student.name}</p>
        </div>
      </div>

      <div className="tabs">
        {['upcoming','completed','all'].map(f => (
          <div key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ textTransform:'capitalize' }}>{f}</div>
        ))}
      </div>

      {filter === 'upcoming' && (
        <div style={{ background:'#fffbeb', border:'1px solid #fcd34d', borderRadius: 8, padding:'10px 16px', marginBottom: 16, fontSize: 13 }}>
          ⚠️ <strong>Reminder:</strong> Bring your Hall Ticket and stationery to all exams. Late entry is not permitted after 10 minutes.
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Subject</th><th>Date</th><th>Max Marks</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>
                    <span className="badge badge-info">{e.subject}</span>
                  </td>
                  <td>{e.examDate}</td>
                  <td style={{ fontWeight: 600 }}>{e.maxMarks}</td>
                  <td>
                    <span className={`badge badge-${statusFor(e) === 'upcoming' ? 'warning' : 'success'}`}>
                      {statusFor(e)}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No exams found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Past Papers ────────────────────────────────────────────── */
function PastPapers({ student }) {
  const [papers,  setPapers]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    readWithFallback(
      () => academicsApi.listQuestionPapers(),
      () => listTable('questionPapers'),
      { label: 'listQuestionPapers' },
    )
      .then(data => { if (active) setPapers(data); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const myPapers = papers.filter(p => p.classId === student.classId && p.content?.status === 'published');
  const questionCount = (p) => (p.content?.sections || []).reduce((s, sec) => s + (sec.questions?.length || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Past Exam Papers</h1>
          <p>Question papers for your class</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Title</th><th>Subject</th><th>Questions</th><th>Max Marks</th><th>Uploaded</th><th>Action</th></tr></thead>
            <tbody>
              {myPapers.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td><span className="badge badge-info">{p.subject}</span></td>
                  <td>{questionCount(p)} Qs</td>
                  <td>{p.content?.maxMarks ?? '—'}</td>
                  <td style={{ fontSize: 12 }}>
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}
                  </td>
                  <td>
                    {p.fileUrl
                      ? <a className="btn btn-primary btn-sm" href={p.fileUrl} target="_blank" rel="noreferrer">📥 Download</a>
                      : <span style={{ color:'var(--text-muted)', fontSize: 12 }}>No file</span>}
                  </td>
                </tr>
              ))}
              {!loading && myPapers.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No question papers found for your class.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Results ────────────────────────────────────────────────── */
function Results({ student }) {
  const { exams } = useData();
  const [myResults, setMyResults] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!student.studentId) { setLoading(false); return; }
    readWithFallback(
      () => academicsApi.getResultsByStudent(student.studentId),
      () => deriveResultsByStudent(student.studentId),
      { label: 'getResultsByStudent' },
    )
      .then(setMyResults)
      .finally(() => setLoading(false));
  }, [student.studentId]);

  const avgPct = myResults.length
    ? Math.round(myResults.reduce((s, r) => s + r.marksObtained / r.maxMarks, 0) / myResults.length * 100)
    : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Results</h1>
          <p>Examination results for {student.name}</p>
        </div>
      </div>

      {!loading && myResults.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <h3>No results yet</h3>
            <p>Your exam results will appear here once published.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="stat-grid mb-20">
            <div className="stat-card">
              <div className="stat-icon bg-blue">📊</div>
              <div className="stat-info">
                <div className="stat-value">{avgPct}%</div>
                <div className="stat-label">Overall Average</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-green">🏆</div>
              <div className="stat-info">
                <div className="stat-value">{myResults.filter(r => r.grade.startsWith('A')).length}</div>
                <div className="stat-label">A Grade Subjects</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon bg-purple">📋</div>
              <div className="stat-info">
                <div className="stat-value">{myResults.length}</div>
                <div className="stat-label">Exams Appeared</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Subject</th><th>Exam Date</th><th>Marks</th><th>Out of</th><th>%</th><th>Grade</th></tr></thead>
                <tbody>
                  {myResults.map(r => {
                    const exam = exams.find(e => e.id === r.examId);
                    const pct  = Math.round(r.marksObtained / r.maxMarks * 100);
                    return (
                      <tr key={r.id}>
                        <td><span className="badge badge-info">{r.subject}</span></td>
                        <td>{exam?.examDate ?? '—'}</td>
                        <td style={{ fontWeight: 700, fontSize: 16 }}>{r.marksObtained}</td>
                        <td>{r.maxMarks}</td>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                            <div style={{ width: 50, height: 6, background:'var(--border)', borderRadius: 3, overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${pct}%`, background: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)' }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{pct}%</span>
                          </div>
                        </td>
                        <td>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%',
                            display:'grid', placeItems:'center', fontWeight: 700,
                            background: r.grade.startsWith('A') ? '#f0fff4' : '#ebf8ff',
                            color: r.grade.startsWith('A') ? 'var(--success)' : 'var(--secondary)',
                          }}>
                            {r.grade}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Attendance ─────────────────────────────────────────────── */
function AttendanceView({ student }) {
  const [attSummary, setAttSummary] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [loadError,  setLoadError]  = useState('');

  useEffect(() => {
    if (!student.studentId) return;
    setLoading(true);
    setLoadError('');
    readWithFallback(
      () => attendanceApi.getStudentAttendance(student.studentId),
      () => deriveStudentAttendance(student.studentId),
      { label: 'getStudentAttendance' },
    )
      .then(setAttSummary)
      .finally(() => setLoading(false));
  }, [student.studentId]);

  const myAtt   = [...(attSummary?.records || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const present = attSummary?.presentDays ?? 0;
  const absent  = attSummary?.absentDays ?? 0;
  const late    = myAtt.filter(a => a.status === 'LATE').length;
  const pct     = attSummary?.attendancePercentage ?? 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Attendance</h1>
          <p>July 2026</p>
        </div>
      </div>

      <div className="stat-grid mb-20">
        <div className="stat-card">
          <div className="stat-icon bg-green">✅</div>
          <div className="stat-info">
            <div className="stat-value">{present}</div>
            <div className="stat-label">Present</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red">❌</div>
          <div className="stat-info">
            <div className="stat-value">{absent}</div>
            <div className="stat-label">Absent</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-yellow">⏰</div>
          <div className="stat-info">
            <div className="stat-value">{late}</div>
            <div className="stat-label">Late</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-blue">📊</div>
          <div className="stat-info">
            <div className="stat-value" style={{ color: pct < 75 ? 'var(--danger)' : 'inherit' }}>{pct}%</div>
            <div className="stat-label">Attendance %</div>
            {pct < 75 && <div className="stat-change down">⚠ Minimum 75% required</div>}
          </div>
        </div>
      </div>

      {pct < 75 && (
        <div style={{ background:'#fff5f5', border:'1px solid #fed7d7', color:'#c53030', padding:'12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          ⚠️ <strong>Warning:</strong> Your attendance is below the required 75%. Please attend classes regularly to avoid exam debarment.
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Daily Record</div>
          <div style={{ display:'flex', gap: 12, fontSize: 12 }}>
            <span style={{ display:'flex', alignItems:'center', gap: 4 }}><span className="att-dot att-present" />Present</span>
            <span style={{ display:'flex', alignItems:'center', gap: 4 }}><span className="att-dot att-absent"  />Absent</span>
            <span style={{ display:'flex', alignItems:'center', gap: 4 }}><span className="att-dot att-late"    />Late</span>
          </div>
        </div>
        {loadError && <div className="alert alert-danger" style={{ margin: 16 }}>{loadError}</div>}
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Day</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', padding: 24 }}>Loading…</td></tr>
              ) : myAtt.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No attendance records found.</td></tr>
              ) : myAtt.map((a, i) => (
                <tr key={i}>
                  <td>{a.date}</td>
                  <td style={{ color:'var(--text-muted)', fontSize: 12 }}>
                    {new Date(a.date).toLocaleDateString('en-IN', { weekday:'long' })}
                  </td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                      <span className={`att-dot att-${a.status.toLowerCase()}`} />
                      <span className={`badge badge-${a.status === 'PRESENT' ? 'success' : a.status === 'ABSENT' ? 'danger' : 'warning'}`}>
                        {a.status}
                      </span>
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

/* ── Holidays ──────────────────────────────────────────────── */
function HolidayList() {
  const { holidays } = useData();
  const upcoming = holidays.filter(h => new Date(h.date) >= new Date());
  const badgeColors = { National: 'badge-danger', Festival: 'badge-warning', Regional: 'badge-purple' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Holiday List 2026-27</h1>
          <p>{upcoming.length} holidays remaining this year</p>
        </div>
      </div>

      <div className="dashboard-grid grid-2">
        <div className="card col-span-2">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Date</th><th>Day</th><th>Holiday Name</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>
                {holidays.map(h => {
                  const isPast = new Date(h.date) < new Date();
                  return (
                    <tr key={h.id} style={{ opacity: isPast ? 0.5 : 1 }}>
                      <td style={{ fontSize: 12, color:'var(--text-muted)' }}>{h.id}</td>
                      <td style={{ fontWeight: 500 }}>
                        {new Date(h.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                      <td style={{ fontSize: 12, color:'var(--text-muted)' }}>
                        {new Date(h.date).toLocaleDateString('en-IN', { weekday:'long' })}
                      </td>
                      <td style={{ fontWeight: 600 }}>{h.name}</td>
                      <td><span className={`badge ${badgeColors[h.type]}`}>{h.type}</span></td>
                      <td style={{ fontSize: 12, color:'var(--text-secondary)' }}>{h.description}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Notices ────────────────────────────────────────────────── */
function Notices() {
  const { announcements } = useData();
  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>School Notices</h1></div></div>
      <div style={{ display:'grid', gap: 12 }}>
        {announcements.map(a => (
          <div key={a.id} className="card">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{a.title}</div>
              <p style={{ fontSize: 13, color:'var(--text-secondary)', marginBottom: 8 }}>{a.body}</p>
              <div style={{ fontSize: 11, color:'var(--text-muted)' }}>
                {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="card"><div className="card-body" style={{ textAlign:'center', color:'var(--text-muted)', padding: 40 }}>No notices yet.</div></div>
        )}
      </div>
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────── */
export default function StudentDashboard({ activeTab }) {
  const { currentUser } = useAuth();
  const student = currentUser;

  const views = {
    dashboard:  <Dashboard student={student} />,
    timetable:  <Timetable student={student} />,
    notes:      <StudyMaterials student={student} />,
    homework:   <Homework student={student} />,
    exams:      <ExamSchedule student={student} />,
    papers:     <PastPapers student={student} />,
    results:    <Results student={student} />,
    attendance: <AttendanceView student={student} />,
    holidays:   <HolidayList />,
    notices:    <Notices />,
  };
  return views[activeTab] || <Dashboard student={student} />;
}
