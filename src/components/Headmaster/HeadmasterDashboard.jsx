import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import Registration          from '../Auth/Registration';
import QuestionPaperManagement from '../Exams/QuestionPaperManagement';
import ClassManagement        from '../Management/ClassManagement';
import ExamManagement         from '../Management/ExamManagement';
import NoticeManagement       from '../Management/NoticeManagement';
import HolidayManagement      from '../Management/HolidayManagement';
import AttendanceManagement   from '../Management/AttendanceManagement';
import HomeworkManagement     from '../Management/HomeworkManagement';

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
function Dashboard() {
  const { classes, exams, announcements, homework, staffAttendance } = useData();
  const { allUsers } = useAuth();
  const teachers = allUsers.filter(u => u.role === 'teacher');
  const students = allUsers.filter(u => u.role === 'student');
  const today    = new Date().toISOString().slice(0, 10);
  const pending  = homework.filter(h => h.status === 'pending').length;
  const upcoming = exams.filter(e => e.status === 'upcoming').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Headmaster Dashboard 👩‍💼</h1>
          <p>Academic oversight and school administration</p>
        </div>
        <span className="badge badge-purple">Headmaster Access</span>
      </div>

      <div className="stat-grid mb-20">
        <StatCard icon="🏫" label="Classes"          value={classes.length}  color="bg-blue"   />
        <StatCard icon="👔" label="Teachers"          value={teachers.length} color="bg-green"  />
        <StatCard icon="👩‍🎓" label="Students"         value={students.length} color="bg-purple" />
        <StatCard icon="📋" label="Upcoming Exams"   value={upcoming}        color="bg-orange" />
        <StatCard icon="📝" label="Pending Homework"  value={pending}         color="bg-teal"   />
      </div>

      <div className="dashboard-grid grid-2">
        {/* Teacher Attendance Today */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Teacher Attendance — Today</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table style={{ width:'100%', fontSize: 13 }}>
              <thead><tr><th>Teacher</th><th>Subject</th><th>Status</th></tr></thead>
              <tbody>
                {teachers.map(t => {
                  const sa = staffAttendance.find(s => s.staffId === t.id && s.date === today);
                  return (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                          <span className="avatar avatar-sm role-teacher">{t.avatar}</span>
                          {t.name}
                        </div>
                      </td>
                      <td>{t.subject}</td>
                      <td><span className={`badge badge-${sa?.status === 'Present' ? 'success' : sa?.status === 'Absent' ? 'danger' : 'warning'}`}>{sa?.status || '—'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="card">
          <div className="card-header"><div className="card-title">Upcoming Exams</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table style={{ width:'100%', fontSize: 13 }}>
              <thead><tr><th>Exam</th><th>Subject</th><th>Date</th><th>Class</th></tr></thead>
              <tbody>
                {exams.filter(e => e.status === 'upcoming').slice(0, 6).map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.name}</td>
                    <td>{e.subject}</td>
                    <td style={{ fontSize: 12 }}>{e.date}</td>
                    <td><span className="badge badge-info">{e.class}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Homework Overview */}
        <div className="card">
          <div className="card-header"><div className="card-title">Homework Tracker</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table style={{ width:'100%', fontSize: 13 }}>
              <thead><tr><th>Subject</th><th>Title</th><th>Class</th><th>Due</th><th>Status</th></tr></thead>
              <tbody>
                {homework.map(hw => (
                  <tr key={hw.id}>
                    <td>{hw.subject}</td>
                    <td style={{ fontSize: 12 }}>{hw.title}</td>
                    <td><span className="badge badge-info">{hw.class}</span></td>
                    <td style={{ fontSize: 12 }}>{hw.dueDate}</td>
                    <td>
                      <span className={`badge badge-${hw.status === 'graded' ? 'success' : hw.status === 'submitted' ? 'info' : 'warning'}`}>
                        {hw.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="card-header"><div className="card-title">Recent Notices</div></div>
          <div className="card-body" style={{ padding:'8px 0' }}>
            {announcements.slice(0, 4).map(a => (
              <div key={a.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                <div style={{ fontSize: 11, color:'var(--text-muted)' }}>
                  {a.date} ·{' '}
                  <span className={`badge badge-${a.priority === 'high' ? 'danger' : 'warning'}`}>{a.priority}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Timetable View ─────────────────────────────────────────── */
function TimetableView() {
  const { classes, timetable } = useData();
  const [selectedClass, setSelectedClass] = useState('10A');
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const subjectColors = {
    'Mathematics': '#ebf8ff', 'Science': '#f0fff4', 'English': '#faf5ff',
    'History': '#fffaf0', 'Geography': '#e6fffa', 'Computer': '#fff5f5',
    'PE': '#f0f4ff', 'Drawing': '#fff0f5', 'Library': '#f7fafc',
    'Break': '#f7fafc', 'Lunch': '#f7fafc',
  };
  const schedule = timetable[selectedClass] || {};

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>School Timetable</h1></div>
        <select className="form-control" style={{ width: 120 }}
          value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
          {classes.map(c => <option key={c.id} value={c.name}>Class {c.name}</option>)}
        </select>
      </div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Class {selectedClass} Weekly Schedule</div>
        </div>
        <div className="card-body" style={{ overflowX:'auto' }}>
          {days.map(day => (
            schedule[day] && (
              <div key={day} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color:'var(--text-muted)', marginBottom: 8, textTransform:'uppercase', letterSpacing:'0.05em' }}>{day}</div>
                <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
                  {schedule[day].map(p => (
                    <div key={p.period} style={{ padding:'8px 12px', borderRadius: 8, background: subjectColors[p.subject] || '#f7fafc', border:'1px solid var(--border)', minWidth: 120, flex: '0 0 auto' }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{p.subject}</div>
                      <div style={{ fontSize: 10, color:'var(--text-muted)' }}>{p.time}</div>
                      {p.teacher !== '-' && <div style={{ fontSize: 10, color:'var(--text-secondary)', marginTop: 2 }}>{p.teacher}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Staff Overview ─────────────────────────────────────────── */
function StaffOverview() {
  const { allUsers } = useAuth();
  const teachers = allUsers.filter(u => u.role === 'teacher');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Staff Overview</h1></div>
      </div>
      <div className="dashboard-grid grid-3">
        {teachers.map(t => (
          <div key={t.id} className="card">
            <div className="card-body" style={{ textAlign:'center' }}>
              <span className="avatar avatar-xl role-teacher" style={{ margin:'0 auto 12px' }}>{t.avatar}</span>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{t.name}</div>
              <div style={{ fontSize: 12, color:'var(--text-muted)', marginBottom: 8 }}>{t.subject}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap: 4, justifyContent:'center', marginBottom: 12 }}>
                {t.classesHandled?.map(c => <span key={c} className="badge badge-info">{c}</span>)}
              </div>
              <div style={{ fontSize: 12, color:'var(--text-secondary)' }}>{t.email}</div>
              <div style={{ fontSize: 12, color:'var(--text-secondary)' }}>{t.phone}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Students ───────────────────────────────────────────────── */
function StudentsView() {
  const { attendance } = useData();
  const { allUsers } = useAuth();
  const students = allUsers.filter(u => u.role === 'student');

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Students</h1></div>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Class</th><th>Roll No</th><th>Attendance</th></tr></thead>
            <tbody>
              {students.map(s => {
                const recs = attendance.filter(a => a.studentId === s.id);
                const pct = recs.length ? Math.round(recs.filter(a => a.status === 'Present').length / recs.length * 100) : 0;
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <span className="avatar avatar-sm role-student">{s.avatar}</span>
                        {s.name}
                      </div>
                    </td>
                    <td>{s.class}</td>
                    <td>{s.rollNo}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <div style={{ width: 80, height: 6, background:'var(--border)', borderRadius: 3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background: pct < 75 ? 'var(--danger)' : 'var(--success)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{pct}%</span>
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

/* ── Reports ───────────────────────────────────────────────── */
function Reports() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Reports</h1></div>
      </div>
      <div className="dashboard-grid grid-2">
        {[
          { icon:'✅', title:'Attendance Summary', color:'bg-green' },
          { icon:'📋', title:'Exam Analysis',      color:'bg-blue'  },
          { icon:'📝', title:'Homework Report',    color:'bg-purple'},
          { icon:'👔', title:'Staff Performance',  color:'bg-orange'},
        ].map(r => (
          <div key={r.title} className="stat-card" style={{ cursor:'pointer' }}>
            <div className={`stat-icon ${r.color}`}>{r.icon}</div>
            <div className="stat-info">
              <div style={{ fontWeight: 600, fontSize: 15 }}>{r.title}</div>
              <div style={{ fontSize: 12, color:'var(--text-muted)', margin:'4px 0 10px' }}>Click to generate</div>
              <button className="btn btn-ghost btn-sm">Generate →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────── */
export default function HeadmasterDashboard({ activeTab }) {
  const views = {
    dashboard:         <Dashboard />,
    registration:      <Registration />,
    classes:           <ClassManagement />,
    timetable:         <TimetableView />,
    exams:             <ExamManagement />,
    'question-papers': <QuestionPaperManagement />,
    attendance:        <AttendanceManagement />,
    homework:          <HomeworkManagement />,
    staff:             <StaffOverview />,
    students:          <StudentsView />,
    holidays:          <HolidayManagement canEdit />,
    notices:           <NoticeManagement canPost />,
    reports:           <Reports />,
  };
  return views[activeTab] || <Dashboard />;
}
