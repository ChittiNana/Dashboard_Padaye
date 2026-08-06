import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { schoolInfo, results } from '../../data/mockData';
import Registration          from '../Auth/Registration';
import QuestionPaperManagement from '../Exams/QuestionPaperManagement';
import ClassManagement        from '../Management/ClassManagement';
import ExamManagement         from '../Management/ExamManagement';
import NoticeManagement       from '../Management/NoticeManagement';
import HolidayManagement      from '../Management/HolidayManagement';
import FeeManagement          from '../Management/FeeManagement';
import AttendanceManagement   from '../Management/AttendanceManagement';

function StatCard({ icon, label, value, color, change }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {change && <div className={`stat-change ${change.dir}`}>{change.text}</div>}
      </div>
    </div>
  );
}

/* ── Dashboard ─────────────────────────────────────────────── */
function Dashboard() {
  const { classes, exams, announcements, fees, attendance, staffAttendance } = useData();
  const { allUsers } = useAuth();
  const teachers = allUsers.filter(u => u.role === 'teacher');
  const students = allUsers.filter(u => u.role === 'student');
  const today    = new Date().toISOString().slice(0, 10);
  const todayAtt = attendance.filter(a => a.date === today);
  const presentToday = todayAtt.filter(a => a.status === 'Present').length;
  const totalPaid    = fees.filter(f => f.paid).reduce((s, f) => s + f.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Good Morning, Dr. Kumar 👋</h1>
          <p>Here's what's happening at {schoolInfo.name} today.</p>
        </div>
        <div className="page-header-actions">
          <span className="badge badge-info">Session 2026-27</span>
        </div>
      </div>

      <div className="stat-grid mb-20">
        <StatCard icon="👩‍🎓" label="Total Students"  value={students.length}       color="bg-blue"   change={{ dir:'up', text:'↑ 48 from last year' }} />
        <StatCard icon="👔"  label="Total Staff"     value={schoolInfo.totalStaff}  color="bg-green"  change={{ dir:'up', text:'↑ 3 new joins' }} />
        <StatCard icon="🏫"  label="Classes"         value={classes.length}         color="bg-purple" />
        <StatCard icon="✅"  label="Attendance Today" value={`${presentToday}/${students.length}`} color="bg-teal" />
        <StatCard icon="💰"  label="Fees Collected"  value={`₹${(totalPaid/1000).toFixed(0)}k`}  color="bg-orange" change={{ dir:'up', text:'₹48k pending' }} />
        <StatCard icon="📋"  label="Upcoming Exams"  value={exams.filter(e=>e.status==='upcoming').length} color="bg-yellow" />
      </div>

      <div className="dashboard-grid grid-2">
        {/* Recent Announcements */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Announcements</div>
              <div className="card-subtitle">Latest notices for the school</div>
            </div>
            <span className="badge badge-danger">{announcements.length}</span>
          </div>
          <div className="card-body" style={{ padding: '8px 0' }}>
            {announcements.slice(0, 4).map(a => (
              <div key={a.id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div className={`notif-icon bg-${a.priority === 'high' ? 'red' : a.priority === 'medium' ? 'orange' : 'blue'}`}
                  style={{ width: 36, height: 36, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>
                  📢
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {a.date} · By {a.postedBy} ·{' '}
                    <span className={`badge badge-${a.priority === 'high' ? 'danger' : a.priority === 'medium' ? 'warning' : 'info'}`}>
                      {a.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff at a glance */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Staff Overview</div>
              <div className="card-subtitle">Subject teachers in school</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Name</th><th>Subject</th><th>Classes</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {teachers.map(t => {
                    const s = staffAttendance.find(sa => sa.staffId === t.id && sa.date === today);
                    return (
                      <tr key={t.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="avatar avatar-sm role-teacher">{t.avatar}</span>
                            <span style={{ fontWeight: 500 }}>{t.name}</span>
                          </div>
                        </td>
                        <td>{t.subject}</td>
                        <td>{t.classesHandled?.join(', ')}</td>
                        <td>
                          <span className={`badge badge-${s?.status === 'Present' ? 'success' : s?.status === 'Absent' ? 'danger' : 'warning'}`}>
                            {s?.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Upcoming Examinations</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Exam</th><th>Subject</th><th>Class</th><th>Date</th><th>Marks</th></tr></thead>
                <tbody>
                  {exams.filter(e => e.status === 'upcoming').slice(0, 5).map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 500 }}>{e.name}</td>
                      <td>{e.subject}</td>
                      <td><span className="badge badge-info">{e.class}</span></td>
                      <td>{e.date}</td>
                      <td>{e.maxMarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Class Distribution */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Class Strength</div>
          </div>
          <div className="card-body">
            {classes.map(cls => (
              <div key={cls.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>Class {cls.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cls.strength} students</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{
                    width: `${(cls.strength / 45) * 100}%`,
                    background: cls.grade === 10 ? '#3182ce' : cls.grade === 9 ? '#38a169' : '#805ad5',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Staff Management ──────────────────────────────────────── */
function StaffManagement() {
  const { allUsers } = useAuth();
  const [search, setSearch] = useState('');
  const allStaff = allUsers.filter(u => ['teacher','headmaster'].includes(u.role));
  const filtered = allStaff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Staff Management</h1>
          <p>Manage all teaching and administrative staff</p>
        </div>
        <div className="page-header-actions">
          <input className="form-control" style={{ width: 220 }} placeholder="Search staff…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Staff Member</th><th>Role</th><th>Subject</th><th>Classes</th><th>Phone</th><th>Email</th><th>Since</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                      <span className={`avatar role-${s.role}`}>{s.avatar}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                        <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge badge-${s.role === 'headmaster' ? 'purple' : 'info'}`} style={{ textTransform:'capitalize' }}>{s.role}</span></td>
                  <td>{s.subject || '—'}</td>
                  <td>{s.classesHandled?.join(', ') || '—'}</td>
                  <td style={{ fontSize: 12 }}>{s.phone}</td>
                  <td style={{ fontSize: 12 }}>{s.email}</td>
                  <td style={{ fontSize: 12 }}>{s.joinDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── All Students ──────────────────────────────────────────── */
function AllStudents() {
  const { classes, attendance } = useData();
  const { allUsers } = useAuth();
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const students = allUsers.filter(u => u.role === 'student');
  const parents  = allUsers.filter(u => u.role === 'parent');

  const all = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterClass === 'all' || s.class === filterClass)
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Student Records</h1>
          <p>All enrolled students — {students.length} total</p>
        </div>
        <div className="page-header-actions">
          <input className="form-control" style={{ width: 200 }} placeholder="Search…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-control" style={{ width: 120 }}
            value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.name}>Class {c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Student</th><th>Roll No</th><th>Class</th><th>DOB</th><th>Parent</th><th>Admission</th></tr>
            </thead>
            <tbody>
              {all.map(s => {
                const parent = parents.find(u => u.id === s.parentId);
                const attRec = attendance.filter(a => a.studentId === s.id);
                const pct = attRec.length ? Math.round(attRec.filter(a => a.status === 'Present').length / attRec.length * 100) : 0;
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                        <span className="avatar role-student">{s.avatar}</span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Att: {pct}%</div>
                        </div>
                      </div>
                    </td>
                    <td>{s.rollNo}</td>
                    <td><span className="badge badge-info">Class {s.class}</span></td>
                    <td style={{ fontSize: 12 }}>{s.dob}</td>
                    <td style={{ fontSize: 12 }}>{parent?.name || '—'}</td>
                    <td style={{ fontSize: 12 }}>{s.admissionYear}</td>
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
        <div className="page-header-left"><h1>Reports & Analytics</h1></div>
      </div>
      <div className="dashboard-grid grid-3">
        {[
          { icon:'📊', title:'Academic Performance', desc:'Subject-wise student performance analysis', color:'bg-blue' },
          { icon:'✅', title:'Attendance Report',    desc:'Monthly and yearly attendance statistics', color:'bg-green' },
          { icon:'💰', title:'Fee Collection Report',desc:'Term-wise fee collection and pending dues', color:'bg-orange' },
          { icon:'👔', title:'Staff Report',         desc:'Teaching hours, leave records, performance', color:'bg-purple' },
          { icon:'📋', title:'Exam Results Report',  desc:'Exam-wise results and grade distribution', color:'bg-teal' },
          { icon:'🏆', title:'Topper\'s Report',     desc:'Top performers across all classes', color:'bg-yellow' },
        ].map(r => (
          <div key={r.title} className="stat-card" style={{ flexDirection:'column', alignItems:'flex-start', cursor:'pointer' }}>
            <div className={`stat-icon ${r.color}`} style={{ marginBottom: 12 }}>{r.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontSize: 12, color:'var(--text-muted)', marginBottom: 12 }}>{r.desc}</div>
            <button className="btn btn-ghost btn-sm">Generate Report →</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Analytics ─────────────────────────────────────────────── */
function Analytics() {
  const { notes, homework } = useData();
  const { allUsers } = useAuth();
  const results2 = results;
  const students = allUsers.filter(u => u.role === 'student');
  const graded   = results2.filter(r => r.marksObtained >= 80).length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>School Analytics</h1></div>
      </div>
      <div className="stat-grid mb-20">
        <StatCard icon="📈" label="Pass Rate"         value="94.2%" color="bg-green" change={{ dir:'up', text:'↑ 2.1% vs last year' }} />
        <StatCard icon="🏆" label="Distinction (90+)" value={graded}   color="bg-yellow" />
        <StatCard icon="📚" label="Notes Uploaded"    value={notes.length}   color="bg-blue" />
        <StatCard icon="📝" label="Homework Given"    value={homework.length} color="bg-purple" />
      </div>
      <div className="dashboard-grid grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Subject Performance (Avg Marks)</div></div>
          <div className="card-body">
            {['Mathematics','Science','English','History','Geography','Computer'].map((sub, i) => {
              const pct = [78, 82, 85, 74, 71, 88][i];
              return (
                <div key={sub} style={{ marginBottom: 12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{sub}</span>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width:`${pct}%`, background: pct >= 80 ? 'var(--success)' : pct >= 70 ? 'var(--warning)' : 'var(--danger)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Grade Distribution</div></div>
          <div className="card-body">
            {[['A+ (90-100)', 127, '#38a169'],['A (80-89)', 248, '#3182ce'],['B+ (70-79)', 312, '#805ad5'],['B (60-69)', 198, '#d69e2e'],['C (50-59)', 89, '#dd6b20'],['D (<50)', 34, '#e53e3e']].map(([grade, count, color]) => (
              <div key={grade} style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, flex: 1 }}>{grade}</span>
                <div style={{ width: 100, height: 6, background:'var(--border)', borderRadius: 3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(count/312)*100}%`, background: color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, minWidth: 32, textAlign:'right' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Messages ──────────────────────────────────────────────── */
function Messages() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Messages</h1></div>
        <button className="btn btn-primary">+ Compose</button>
      </div>
      <div className="card">
        <div style={{ padding: 24, textAlign:'center', color:'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <h3 style={{ color:'var(--text-secondary)', marginBottom: 6 }}>Internal Messaging</h3>
          <p style={{ fontSize: 13 }}>View and send messages to staff, students, and parents.</p>
        </div>
      </div>
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────── */
export default function PrincipalDashboard({ activeTab }) {
  const views = {
    dashboard:         <Dashboard />,
    analytics:         <Analytics />,
    registration:      <Registration />,
    staff:             <StaffManagement />,
    students:          <AllStudents />,
    classes:           <ClassManagement />,
    fees:              <FeeManagement />,
    exams:             <ExamManagement />,
    'question-papers': <QuestionPaperManagement />,
    attendance:        <AttendanceManagement />,
    holidays:          <HolidayManagement canEdit />,
    notices:           <NoticeManagement canPost />,
    messages:          <Messages />,
    reports:           <Reports />,
  };
  return views[activeTab] || <Dashboard />;
}
