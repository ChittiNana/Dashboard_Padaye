import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { users, messages } from '../../data/mockData';
import * as timetableApi from '../../api/timetableApi';
import QuestionPaperManagement  from '../Exams/QuestionPaperManagement';
import AttendanceManagement     from '../Management/AttendanceManagement';
import HomeworkManagement       from '../Management/HomeworkManagement';
import NotesManagement          from '../Management/NotesManagement';

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
function classLabel(classId, classes) {
  const cls = classes.find(c => String(c.id) === String(classId));
  return cls ? `${cls.gradeLevel}${cls.section}` : (classId ?? '—');
}
function formatTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  const hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${m} ${period}`;
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────────── */
function Dashboard({ teacher }) {
  const { notes, homework, exams, classes } = useData();
  const { allUsers } = useAuth();

  const [todaySlots,   setTodaySlots]   = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!teacher.staffId) { setSlotsLoading(false); return; }
    timetableApi.getTeacherTimetable(teacher.staffId)
      .then(data => { if (active) setTodaySlots(data.filter(s => s.dayOfWeek === todayDayOfWeek())); })
      .catch(() => { if (active) setTodaySlots([]); })
      .finally(() => { if (active) setSlotsLoading(false); });
    return () => { active = false; };
  }, [teacher.staffId]);

  const myClassIds = classes.filter(c => c.classTeacherStaffId === teacher.staffId).map(c => c.id);
  const myNotes    = notes.filter(n => n.uploadedByStaffId === teacher.staffId);
  const myHomework = homework.filter(h => h.createdByStaffId === teacher.staffId);
  const myExams    = exams.filter(e => myClassIds.includes(e.classId));
  const myStudents = allUsers.filter(u => myClassIds.includes(u.classId));
  const unread     = messages.filter(m => m.toId === teacher.id && !m.read);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Welcome, {teacher.name} 👋</h1>
          <p>Classes: {myClassIds.length ? myClassIds.map(id => classLabel(id, classes)).join(', ') : '—'}</p>
        </div>
        <span className="badge badge-info">Teacher Portal</span>
      </div>

      <div className="stat-grid mb-20">
        <StatCard icon="🏫" label="My Classes"         value={myClassIds.length}   color="bg-blue"   />
        <StatCard icon="👩‍🎓" label="My Students"       value={myStudents.length}  color="bg-green"  />
        <StatCard icon="📚" label="Notes Uploaded"     value={myNotes.length}      color="bg-purple" />
        <StatCard icon="📝" label="Assignments Given"  value={myHomework.length}   color="bg-orange" />
        <StatCard icon="📋" label="Exams Scheduled"    value={myExams.length}      color="bg-teal"   />
        <StatCard icon="💬" label="Unread Messages"    value={unread.length}       color="bg-red"    />
      </div>

      <div className="dashboard-grid grid-2">
        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header"><div className="card-title">Today's Schedule ({dayLabel(todayDayOfWeek())})</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {todaySlots.slice().sort((a, b) => a.periodNumber - b.periodNumber).map(p => (
              <div key={p.id} style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', display:'flex', gap: 12, alignItems:'center' }}>
                <div style={{ background:'#ebf8ff', borderRadius: 8, padding:'8px 12px', textAlign:'center', minWidth: 80, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color:'#2b6cb0' }}>{formatTime(p.startTime)}</div>
                  <div style={{ fontSize: 10, color:'#4a90d9' }}>{formatTime(p.endTime)}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.subject}</div>
                  <div style={{ fontSize: 12, color:'var(--text-muted)' }}>Period {p.periodNumber} · Class {classLabel(p.classId, classes)}</div>
                </div>
              </div>
            ))}
            {!slotsLoading && todaySlots.length === 0 && (
              <div style={{ padding: 20, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>
                No classes scheduled for today
              </div>
            )}
          </div>
        </div>

        {/* Assignments */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">My Assignments</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {myHomework.map(hw => (
              <div key={hw.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{hw.title}</div>
                    <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Due: {hw.dueDate} · Class {classLabel(hw.classId, classes)}</div>
                  </div>
                  <span className="badge badge-info">{hw.subject}</span>
                </div>
              </div>
            ))}
            {myHomework.length === 0 && (
              <div style={{ padding: 20, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>No assignments given yet</div>
            )}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="card">
          <div className="card-header"><div className="card-title">My Classes' Exams</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {myExams.slice(0, 5).map(e => (
              <div key={e.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{e.subject}</div>
                  <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{e.examDate}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span className="badge badge-info">{classLabel(e.classId, classes)}</span>
                  <div style={{ fontSize: 11, color:'var(--text-muted)', marginTop: 2 }}>Max: {e.maxMarks}</div>
                </div>
              </div>
            ))}
            {myExams.length === 0 && (
              <div style={{ padding: 20, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>No exams scheduled</div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Messages</div>
            {unread.length > 0 && <span className="badge badge-danger">{unread.length} unread</span>}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {messages.filter(m => m.toId === teacher.id || m.fromId === teacher.id).map(m => {
              const sender = users.find(u => u.id === m.fromId);
              return (
                <div key={m.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', gap: 8, alignItems:'flex-start' }}>
                    <span className={`avatar avatar-sm role-${sender?.role}`}>{sender?.avatar}</span>
                    <div>
                      <div style={{ fontWeight: m.read ? 400 : 600, fontSize: 13 }}>{m.subject}</div>
                      <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{sender?.name} · {m.date}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── My Classes ─────────────────────────────────────────────── */
function MyClasses({ teacher }) {
  const { classes } = useData();
  const { allUsers } = useAuth();
  const myClasses = classes.filter(c => c.classTeacherStaffId === teacher.staffId);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Classes</h1>
          <p>Classes you are the class teacher for</p>
        </div>
      </div>
      <div className="dashboard-grid grid-3">
        {myClasses.map(cls => {
          const studentCount = allUsers.filter(u => u.classId === cls.id).length;

          return (
            <div key={cls.id} className="card">
              <div className="card-body">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 22 }}>Class {cls.gradeLevel}{cls.section}</div>
                  <span className={`badge badge-${cls.active ? 'success' : 'gray'}`}>{cls.active ? 'Active' : 'Inactive'}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr', gap: 8, marginBottom: 14 }}>
                  <div style={{ background:'#f0fff4', borderRadius: 8, padding:'8px 10px', textAlign:'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{studentCount}</div>
                    <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Students</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>Take Attendance</button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>View Students</button>
                </div>
              </div>
            </div>
          );
        })}
        {myClasses.length === 0 && (
          <div className="card"><div className="card-body" style={{ textAlign:'center', color:'var(--text-muted)' }}>
            You are not the class teacher for any class.
          </div></div>
        )}
      </div>
    </div>
  );
}

/* ── Grade Book ────────────────────────────────────────────── */
function GradeBook({ teacher }) {
  const { classes, exams, results } = useData();
  const { allUsers } = useAuth();
  const myClassIds = classes.filter(c => c.classTeacherStaffId === teacher.staffId).map(c => c.id);
  const myResults = results.filter(r => {
    const student = allUsers.find(u => u.id === r.studentId);
    return student && myClassIds.includes(student.classId);
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Grade Book — My Classes</h1></div>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Subject</th><th>Exam Date</th><th>Marks Obtained</th><th>Max Marks</th><th>Percentage</th><th>Grade</th></tr></thead>
            <tbody>
              {myResults.map(r => {
                const pct = Math.round(r.marksObtained / r.maxMarks * 100);
                const st = allUsers.find(u => u.id === r.studentId);
                const exam = exams.find(e => e.id === r.examId);
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <span className="avatar avatar-sm role-student">{st?.avatar}</span>{st?.name}
                      </div>
                    </td>
                    <td>{r.subject}</td>
                    <td>{exam?.examDate ?? '—'}</td>
                    <td style={{ fontWeight: 600 }}>{r.marksObtained}</td>
                    <td>{r.maxMarks}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <div style={{ width: 60, height: 6, background:'var(--border)', borderRadius: 3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)' }} />
                        </div>
                        <span style={{ fontSize: 12 }}>{pct}%</span>
                      </div>
                    </td>
                    <td>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', display:'grid', placeItems:'center',
                        fontWeight: 700, fontSize: 13,
                        background: r.grade.startsWith('A') ? '#f0fff4' : r.grade.startsWith('B') ? '#ebf8ff' : '#fffaf0',
                        color:      r.grade.startsWith('A') ? 'var(--success)' : r.grade.startsWith('B') ? 'var(--secondary)' : 'var(--warning)',
                      }}>
                        {r.grade}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {myResults.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No results found for your classes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Holidays ──────────────────────────────────────────────── */
function HolidayView() {
  const { holidays } = useData();
  const badgeColors = { National: 'badge-danger', Festival: 'badge-warning', Regional: 'badge-purple' };
  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>Holiday Calendar 2026-27</h1></div></div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Day</th><th>Holiday</th><th>Type</th></tr></thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 500 }}>
                    {new Date(h.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </td>
                  <td style={{ color:'var(--text-muted)', fontSize: 12 }}>
                    {new Date(h.date).toLocaleDateString('en-IN', { weekday:'long' })}
                  </td>
                  <td style={{ fontWeight: 600 }}>{h.name}</td>
                  <td><span className={`badge ${badgeColors[h.type]}`}>{h.type}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Timetable ─────────────────────────────────────────────── */
function TeacherTimetable({ teacher }) {
  const { classes } = useData();
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    let active = true;
    if (!teacher.staffId) { setLoading(false); return; }
    timetableApi.getTeacherTimetable(teacher.staffId)
      .then(data => { if (active) setSlots(data); })
      .catch(err => { if (active) setError(err.message || 'Failed to load timetable'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [teacher.staffId]);

  const byDay = DAY_ORDER.map(day => ({
    day,
    periods: slots.filter(s => s.dayOfWeek === day).sort((a, b) => a.periodNumber - b.periodNumber),
  }));

  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>My Timetable</h1></div></div>
      {error && <div className="alert alert-danger mb-12">{error}</div>}
      {!loading && slots.length === 0 && !error && (
        <div className="card"><div className="card-body" style={{ textAlign:'center', color:'var(--text-muted)' }}>
          No timetable slots assigned yet.
        </div></div>
      )}
      {byDay.map(({ day, periods }) => periods.length > 0 ? (
        <div key={day} className="card mb-12">
          <div className="card-header"><div className="card-title">{dayLabel(day)}</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {periods.map(p => (
              <div key={p.id} style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', display:'flex', gap: 12, alignItems:'center' }}>
                <div style={{ background:'#ebf8ff', borderRadius: 8, padding:'8px 16px', textAlign:'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color:'#2b6cb0' }}>{formatTime(p.startTime)} – {formatTime(p.endTime)}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.subject}</div>
                  <div style={{ fontSize: 12, color:'var(--text-muted)' }}>Class {classLabel(p.classId, classes)} · Period {p.periodNumber}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null)}
    </div>
  );
}

/* ── Exams ─────────────────────────────────────────────────── */
function ExamsView({ teacher }) {
  const { classes, exams } = useData();
  const myClassIds = classes.filter(c => c.classTeacherStaffId === teacher.staffId).map(c => c.id);
  const myExams = exams.filter(e => myClassIds.includes(e.classId));
  const statusFor = (e) => (e.examDate && e.examDate < todayISO() ? 'completed' : 'upcoming');

  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>Exams — My Classes</h1></div></div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Subject</th><th>Class</th><th>Date</th><th>Max Marks</th><th>Status</th></tr></thead>
            <tbody>
              {myExams.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.subject}</td>
                  <td><span className="badge badge-info">{classLabel(e.classId, classes)}</span></td>
                  <td>{e.examDate}</td>
                  <td>{e.maxMarks}</td>
                  <td><span className={`badge badge-${statusFor(e) === 'upcoming' ? 'warning' : 'success'}`}>{statusFor(e)}</span></td>
                </tr>
              ))}
              {myExams.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No exams found for your classes.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Messages ──────────────────────────────────────────────── */
function MessagesView({ teacher }) {
  const [compose, setCompose] = useState(false);
  const myMessages = messages.filter(m => m.toId === teacher.id || m.fromId === teacher.id);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Messages</h1></div>
        <button className="btn btn-primary" onClick={() => setCompose(s => !s)}>+ Compose</button>
      </div>

      {compose && (
        <div className="card mb-20">
          <div className="card-header"><div className="card-title">New Message</div></div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">To (Parent/Admin)</label>
              <select className="form-control">
                {users.filter(u => ['parent','headmaster','principal'].includes(u.role)).map(u => (
                  <option key={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Subject</label><input className="form-control" /></div>
            <div className="form-group"><label className="form-label">Message</label><textarea className="form-control" rows={4} /></div>
            <button className="btn btn-primary">Send</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {myMessages.map(m => {
            const other = users.find(u => u.id === (m.fromId === teacher.id ? m.toId : m.fromId));
            const isSent = m.fromId === teacher.id;
            return (
              <div key={m.id} style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', gap: 10, alignItems:'flex-start' }}>
                  <span className={`avatar avatar-sm role-${other?.role}`}>{other?.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 2 }}>
                      <span style={{ fontWeight: m.read || isSent ? 400 : 700, fontSize: 13 }}>
                        {isSent ? '→ ' : ''}{other?.name}
                      </span>
                      <span style={{ fontSize: 11, color:'var(--text-muted)' }}>{m.date}</span>
                    </div>
                    <div style={{ fontWeight: m.read || isSent ? 400 : 600, fontSize: 13, marginBottom: 4 }}>{m.subject}</div>
                    <div style={{ fontSize: 12, color:'var(--text-secondary)' }}>{m.body.substring(0, 100)}…</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────── */
export default function TeacherDashboard({ activeTab }) {
  const { currentUser } = useAuth();
  const teacher = currentUser;

  const views = {
    dashboard:        <Dashboard teacher={teacher} />,
    myclasses:        <MyClasses teacher={teacher} />,
    timetable:        <TeacherTimetable teacher={teacher} />,
    attendance:       <AttendanceManagement />,
    notes:            <NotesManagement />,
    homework:         <HomeworkManagement />,
    exams:            <ExamsView teacher={teacher} />,
    'question-papers':<QuestionPaperManagement />,
    gradebook:        <GradeBook teacher={teacher} />,
    holidays:         <HolidayView />,
    messages:         <MessagesView teacher={teacher} />,
  };
  return views[activeTab] || <Dashboard teacher={teacher} />;
}
