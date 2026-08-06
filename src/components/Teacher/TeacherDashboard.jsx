import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { users, results, timetable, messages } from '../../data/mockData';
import QuestionPaperManagement  from '../Exams/QuestionPaperManagement';
import AttendanceManagement     from '../Management/AttendanceManagement';
import HomeworkManagement       from '../Management/HomeworkManagement';
import NotesManagement          from '../Management/NotesManagement';

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
  const { notes, homework, exams } = useData();
  const { allUsers } = useAuth();
  const myNotes    = notes.filter(n => n.uploadedBy === teacher.name);
  const myHomework = homework.filter(h => h.assignedBy === teacher.name);
  const myExams    = exams.filter(e => teacher.classesHandled?.includes(e.class) && e.subject === teacher.subject);
  const myStudents = allUsers.filter(u => u.role === 'student' && teacher.classesHandled?.includes(u.class));
  const unread     = messages.filter(m => m.toId === teacher.id && !m.read);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Welcome, {teacher.name} 👋</h1>
          <p>Subject: {teacher.subject} · Classes: {teacher.classesHandled?.join(', ')}</p>
        </div>
        <span className="badge badge-info">Teacher Portal</span>
      </div>

      <div className="stat-grid mb-20">
        <StatCard icon="🏫" label="My Classes"         value={teacher.classesHandled?.length}   color="bg-blue"   />
        <StatCard icon="👩‍🎓" label="My Students"       value={myStudents.length}                color="bg-green"  />
        <StatCard icon="📚" label="Notes Uploaded"     value={myNotes.length}                   color="bg-purple" />
        <StatCard icon="📝" label="Assignments Given"  value={myHomework.length}                color="bg-orange" />
        <StatCard icon="📋" label="Exams Scheduled"    value={myExams.length}                   color="bg-teal"   />
        <StatCard icon="💬" label="Unread Messages"    value={unread.length}                    color="bg-red"    />
      </div>

      <div className="dashboard-grid grid-2">
        {/* Today's Schedule */}
        <div className="card">
          <div className="card-header"><div className="card-title">Today's Schedule (Monday)</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {(timetable['10A']?.Monday || []).filter(p => p.teacher === teacher.name).map(p => (
              <div key={p.period} style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', display:'flex', gap: 12, alignItems:'center' }}>
                <div style={{ background:'#ebf8ff', borderRadius: 8, padding:'8px 12px', textAlign:'center', minWidth: 80, flexShrink: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color:'#2b6cb0' }}>{p.time.split('-')[0]}</div>
                  <div style={{ fontSize: 10, color:'#4a90d9' }}>{p.time.split('-')[1]}</div>
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.subject}</div>
                  <div style={{ fontSize: 12, color:'var(--text-muted)' }}>Period {p.period} · Class 10A</div>
                </div>
              </div>
            ))}
            {!(timetable['10A']?.Monday || []).find(p => p.teacher === teacher.name) && (
              <div style={{ padding: 20, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>
                No classes scheduled for today in Class 10A
              </div>
            )}
          </div>
        </div>

        {/* Pending Homework */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Assignments Status</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {myHomework.map(hw => (
              <div key={hw.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{hw.title}</div>
                    <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Due: {hw.dueDate} · Class {hw.class}</div>
                  </div>
                  <span className={`badge badge-${hw.status === 'graded' ? 'success' : hw.status === 'submitted' ? 'info' : 'warning'}`}>
                    {hw.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="card">
          <div className="card-header"><div className="card-title">My Subject Exams</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {exams.filter(e => e.subject === teacher.subject).slice(0, 5).map(e => (
              <div key={e.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{e.name}</div>
                  <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{e.date} · {e.time} · {e.room}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span className="badge badge-info">{e.class}</span>
                  <div style={{ fontSize: 11, color:'var(--text-muted)', marginTop: 2 }}>Max: {e.maxMarks}</div>
                </div>
              </div>
            ))}
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
  const { classes, attendance } = useData();
  const { allUsers } = useAuth();
  const myClasses = classes.filter(c => teacher.classesHandled?.includes(c.name));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Classes</h1>
          <p>Classes you teach — {teacher.subject}</p>
        </div>
      </div>
      <div className="dashboard-grid grid-3">
        {myClasses.map(cls => {
          const studentCount = allUsers.filter(u => u.role === 'student' && u.class === cls.name).length;
          const attRec = attendance.filter(a => a.class === cls.name);
          const avgAtt = attRec.length ? Math.round(attRec.filter(a => a.status === 'Present').length / attRec.length * 100) : 0;

          return (
            <div key={cls.id} className="card">
              <div className="card-body">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 22 }}>Class {cls.name}</div>
                  <span className="badge badge-info">{cls.room}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 14 }}>
                  <div style={{ background:'#f0fff4', borderRadius: 8, padding:'8px 10px', textAlign:'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{studentCount}</div>
                    <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Students</div>
                  </div>
                  <div style={{ background:'#ebf8ff', borderRadius: 8, padding:'8px 10px', textAlign:'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: avgAtt < 75 ? 'var(--danger)' : 'var(--success)' }}>{avgAtt}%</div>
                    <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Avg Attendance</div>
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
      </div>
    </div>
  );
}

/* ── Grade Book ────────────────────────────────────────────── */
function GradeBook({ teacher }) {
  const { exams } = useData();
  const { allUsers } = useAuth();
  const myResults = results.filter(r => r.subject === teacher.subject);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Grade Book — {teacher.subject}</h1></div>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Exam</th><th>Marks Obtained</th><th>Max Marks</th><th>Percentage</th><th>Grade</th><th>Remarks</th></tr></thead>
            <tbody>
              {myResults.map((r, i) => {
                const pct = Math.round(r.marksObtained / r.maxMarks * 100);
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        {(() => { const st = allUsers.find(u => u.id === r.studentId); return <><span className="avatar avatar-sm role-student">{st?.avatar}</span>{st?.name}</>; })()}
                      </div>
                    </td>
                    <td>{exams.find(e => e.id === r.examId)?.name}</td>
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
                    <td><span className="badge badge-gray">{r.remarks}</span></td>
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
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>My Timetable</h1></div></div>
      {days.map(day => {
        const periods = (timetable['10A']?.[day] || []).filter(p => p.teacher === teacher.name);
        return periods.length > 0 ? (
          <div key={day} className="card mb-12">
            <div className="card-header"><div className="card-title">{day}</div></div>
            <div className="card-body" style={{ padding: 0 }}>
              {periods.map(p => (
                <div key={p.period} style={{ padding:'12px 20px', borderBottom:'1px solid var(--border)', display:'flex', gap: 12, alignItems:'center' }}>
                  <div style={{ background:'#ebf8ff', borderRadius: 8, padding:'8px 16px', textAlign:'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color:'#2b6cb0' }}>{p.time}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.subject}</div>
                    <div style={{ fontSize: 12, color:'var(--text-muted)' }}>Class 10A · Period {p.period}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
}

/* ── Exams ─────────────────────────────────────────────────── */
function ExamsView({ teacher }) {
  const { exams } = useData();
  const myExams = exams.filter(e => e.subject === teacher.subject);
  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>Exams — {teacher.subject}</h1></div></div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Exam</th><th>Class</th><th>Date</th><th>Time</th><th>Duration</th><th>Max Marks</th><th>Room</th><th>Status</th></tr></thead>
            <tbody>
              {myExams.map(e => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 500 }}>{e.name}</td>
                  <td><span className="badge badge-info">{e.class}</span></td>
                  <td>{e.date}</td>
                  <td>{e.time}</td>
                  <td>{e.duration}</td>
                  <td>{e.maxMarks}</td>
                  <td>{e.room}</td>
                  <td><span className={`badge badge-${e.status === 'upcoming' ? 'warning' : 'success'}`}>{e.status}</span></td>
                </tr>
              ))}
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
