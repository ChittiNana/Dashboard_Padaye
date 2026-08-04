import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { attendance, notes, homework, exams, examPapers, results, timetable, holidays, announcements } from '../../data/mockData';

/* ── Dashboard ──────────────────────────────────────────────── */
function Dashboard({ student }) {
  const myAtt = attendance.filter(a => a.studentId === student.id);
  const presentDays = myAtt.filter(a => a.status === 'Present').length;
  const attPct = myAtt.length ? Math.round((presentDays + myAtt.filter(a=>a.status==='Late').length * 0.5) / myAtt.length * 100) : 0;
  const myHW    = homework.filter(h => h.class === student.class && h.status === 'pending');
  const myExams = exams.filter(e => e.class === student.class && e.status === 'upcoming');
  const today   = 'Monday';
  const todayClasses = (timetable[student.class]?.[today] || []).filter(p => p.subject !== 'Break' && p.subject !== 'Lunch');
  const myResults = results.filter(r => r.studentId === student.id);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Hey, {student.name.split(' ')[0]}! 👋</h1>
          <p>Class {student.class} · Roll No. {student.rollNo}</p>
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
            <div className="stat-label">Pending Tasks</div>
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
          <div className="card-header"><div className="card-title">Today's Schedule ({today})</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {todayClasses.map(p => {
              const colors = { Mathematics:'#ebf8ff', Science:'#f0fff4', English:'#faf5ff', History:'#fffaf0', Geography:'#e6fffa', Computer:'#fff5f5', PE:'#f0f4ff', Drawing:'#fff0f5', Library:'#f7fafc' };
              return (
                <div key={p.period} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)', display:'flex', gap: 10, alignItems:'center' }}>
                  <div style={{ background: colors[p.subject] || '#f7fafc', borderRadius: 8, padding:'8px 12px', minWidth: 88, textAlign:'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{p.time.split('-')[0]}</div>
                    <div style={{ fontSize: 10, color:'var(--text-muted)' }}>P{p.period}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.subject}</div>
                    <div style={{ fontSize: 12, color:'var(--text-muted)' }}>{p.teacher}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Homework */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Pending Homework</div>
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
                  <span className="badge badge-warning">Due soon</span>
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
                <div>
                  <div style={{ fontWeight: 600 }}>{e.subject}</div>
                  <div style={{ fontSize: 12, color:'var(--text-muted)' }}>{e.name} · {e.date} at {e.time}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{e.room}</div>
                  <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{e.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* School Notices */}
        <div className="card">
          <div className="card-header"><div className="card-title">School Notices</div></div>
          <div className="card-body" style={{ padding:'8px 0' }}>
            {announcements.filter(a => a.audience === 'all').slice(0, 4).map(a => (
              <div key={a.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{a.title}</div>
                <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{a.date}</div>
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
  const [selectedDay, setSelectedDay] = useState('Monday');
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const subjectColors = {
    Mathematics:'bg-blue', Science:'bg-green', English:'bg-purple',
    History:'bg-orange', Geography:'bg-teal', Computer:'bg-red',
    PE:'bg-yellow', Drawing:'bg-pink', Library:'bg-gray',
  };

  const schedule = timetable[student.class] || {};
  const daySchedule = schedule[selectedDay] || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Weekly Timetable</h1>
          <p>Class {student.class}</p>
        </div>
      </div>

      <div className="tabs">
        {days.map(d => (
          <div key={d} className={`tab ${selectedDay === d ? 'active' : ''}`}
            onClick={() => setSelectedDay(d)}>{d}</div>
        ))}
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {daySchedule.map(p => {
            const isBreak = ['Break','Lunch','Library'].includes(p.subject);
            return (
              <div key={p.period} style={{
                display:'flex', gap: 12, padding:'14px 20px',
                borderBottom:'1px solid var(--border)',
                background: isBreak ? '#fafafa' : '#fff',
                alignItems:'center',
              }}>
                <div style={{ width: 56, textAlign:'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, color:'var(--text-muted)', fontWeight: 600 }}>P{p.period}</div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{p.time.split('-')[0]}</div>
                  <div style={{ fontSize: 10, color:'var(--text-muted)' }}>{p.time.split('-')[1]}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: isBreak ? 400 : 600, color: isBreak ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {p.subject}
                  </div>
                  {!isBreak && <div style={{ fontSize: 12, color:'var(--text-muted)', marginTop: 2 }}>{p.teacher}</div>}
                </div>
                {!isBreak && (
                  <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{p.time}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Study Materials ────────────────────────────────────────── */
function StudyMaterials({ student }) {
  const [filterSubject, setFilterSubject] = useState('all');
  const myNotes = notes.filter(n => n.class === student.class);
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
          <p>Notes and resources for Class {student.class}</p>
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
            <thead><tr><th>Subject</th><th>Title</th><th>Uploaded By</th><th>Date</th><th>Type</th><th>Pages</th><th>Action</th></tr></thead>
            <tbody>
              {filtered.map(n => (
                <tr key={n.id}>
                  <td>
                    <span className="badge badge-info">{n.subject}</span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{n.title}</td>
                  <td style={{ fontSize: 12 }}>{n.uploadedBy}</td>
                  <td style={{ fontSize: 12 }}>{n.date}</td>
                  <td><span className="badge badge-gray">{n.fileType}</span></td>
                  <td>{n.pages}</td>
                  <td>
                    <button className="btn btn-primary btn-sm">📥 Download</button>
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

/* ── Homework ───────────────────────────────────────────────── */
function Homework({ student }) {
  const [filter, setFilter] = useState('all');
  const myHW = homework.filter(h => h.class === student.class);
  const filtered = filter === 'all' ? myHW : myHW.filter(h => h.status === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Homework & Assignments</h1>
          <p>Class {student.class}</p>
        </div>
      </div>

      <div className="tabs">
        {['all','pending','submitted','graded'].map(f => (
          <div key={f} className={`tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)} style={{ textTransform:'capitalize' }}>{f}</div>
        ))}
      </div>

      <div style={{ display:'grid', gap: 12 }}>
        {filtered.map(hw => (
          <div key={hw.id} className="card">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>📝</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{hw.title}</span>
                    <span className="badge badge-info">{hw.subject}</span>
                    <span className={`badge badge-${hw.status === 'graded' ? 'success' : hw.status === 'submitted' ? 'info' : 'warning'}`}>
                      {hw.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color:'var(--text-secondary)', marginBottom: 8 }}>{hw.description}</p>
                  <div style={{ display:'flex', gap: 16, fontSize: 12, color:'var(--text-muted)' }}>
                    <span>📅 Assigned: {hw.assignedDate}</span>
                    <span>⏰ Due: {hw.dueDate}</span>
                    <span>👨‍🏫 {hw.assignedBy}</span>
                    {hw.grade && <span style={{ color:'var(--success)', fontWeight: 600 }}>✓ Grade: {hw.grade}</span>}
                  </div>
                </div>
                {hw.status === 'pending' && (
                  <button className="btn btn-primary btn-sm">Submit</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Exam Schedule ──────────────────────────────────────────── */
function ExamSchedule({ student }) {
  const [filter, setFilter] = useState('upcoming');
  const myExams = exams.filter(e => e.class === student.class);
  const filtered = filter === 'all' ? myExams : myExams.filter(e => e.status === filter);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Exam Schedule</h1>
          <p>Class {student.class} — {student.name}</p>
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
            <thead><tr><th>Exam</th><th>Subject</th><th>Date</th><th>Time</th><th>Duration</th><th>Max Marks</th><th>Venue</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td>
                    <span className="badge badge-info">{e.subject}</span>
                  </td>
                  <td>{e.date}</td>
                  <td>{e.time}</td>
                  <td>{e.duration}</td>
                  <td style={{ fontWeight: 600 }}>{e.maxMarks}</td>
                  <td>{e.room}</td>
                  <td>
                    <span className={`badge badge-${e.status === 'upcoming' ? 'warning' : 'success'}`}>
                      {e.status}
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

/* ── Past Papers ────────────────────────────────────────────── */
function PastPapers({ student }) {
  const papers = examPapers.filter(p => p.class === student.class);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Past Exam Papers</h1>
          <p>Previous years' question papers for Class {student.class}</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Exam</th><th>Subject</th><th>Year</th><th>Questions</th><th>Max Marks</th><th>Uploaded</th><th>Action</th></tr></thead>
            <tbody>
              {papers.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.examName}</td>
                  <td><span className="badge badge-info">{p.subject}</span></td>
                  <td><span className="badge badge-gray">{p.year}</span></td>
                  <td>{p.questions} Qs</td>
                  <td>{p.maxMarks}</td>
                  <td style={{ fontSize: 12 }}>{p.uploadDate}</td>
                  <td>
                    <button className="btn btn-primary btn-sm">📥 Download</button>
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

/* ── Results ────────────────────────────────────────────────── */
function Results({ student }) {
  const myResults = results.filter(r => r.studentId === student.id);
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

      {myResults.length === 0 ? (
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
                <thead><tr><th>Exam</th><th>Subject</th><th>Marks</th><th>Out of</th><th>%</th><th>Grade</th><th>Remarks</th></tr></thead>
                <tbody>
                  {myResults.map((r, i) => {
                    const exam = exams.find(e => e.id === r.examId);
                    const pct  = Math.round(r.marksObtained / r.maxMarks * 100);
                    return (
                      <tr key={i}>
                        <td>{exam?.name}</td>
                        <td><span className="badge badge-info">{r.subject}</span></td>
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
                        <td><span className="badge badge-gray">{r.remarks}</span></td>
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
  const myAtt = attendance.filter(a => a.studentId === student.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const present = myAtt.filter(a => a.status === 'Present').length;
  const absent  = myAtt.filter(a => a.status === 'Absent').length;
  const late    = myAtt.filter(a => a.status === 'Late').length;
  const total   = myAtt.length;
  const pct     = total ? Math.round((present + late * 0.5) / total * 100) : 0;

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
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Day</th><th>Status</th></tr></thead>
            <tbody>
              {myAtt.map((a, i) => (
                <tr key={i}>
                  <td>{a.date}</td>
                  <td style={{ color:'var(--text-muted)', fontSize: 12 }}>
                    {new Date(a.date).toLocaleDateString('en-IN', { weekday:'long' })}
                  </td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap: 6 }}>
                      <span className={`att-dot att-${a.status.toLowerCase()}`} />
                      <span className={`badge badge-${a.status === 'Present' ? 'success' : a.status === 'Absent' ? 'danger' : 'warning'}`}>
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
  const upcoming = holidays.filter(h => new Date(h.date) >= new Date('2026-08-04'));
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
                  const isPast = new Date(h.date) < new Date('2026-08-04');
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
  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>School Notices</h1></div></div>
      <div style={{ display:'grid', gap: 12 }}>
        {announcements.filter(a => a.audience === 'all').map(a => (
          <div key={a.id} className="card">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{a.title}</div>
              <p style={{ fontSize: 13, color:'var(--text-secondary)', marginBottom: 8 }}>{a.body}</p>
              <div style={{ fontSize: 11, color:'var(--text-muted)' }}>
                By {a.postedBy} · {a.date} ·{' '}
                <span className={`badge badge-${a.priority === 'high' ? 'danger' : 'warning'}`}>{a.priority}</span>
              </div>
            </div>
          </div>
        ))}
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
