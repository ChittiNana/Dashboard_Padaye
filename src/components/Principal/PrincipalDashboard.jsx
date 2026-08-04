import { useState } from 'react';
import {
  users, classes, announcements, attendance, exams, fees, staffAttendance,
  schoolInfo, holidays, homework, results
} from '../../data/mockData';

const teachers  = users.filter(u => u.role === 'teacher');
const students  = users.filter(u => u.role === 'student');
const parents   = users.filter(u => u.role === 'parent');

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
  const totalPaid = fees.filter(f => f.paid).reduce((s, f) => s + f.amount, 0);
  const totalDue  = fees.filter(f => !f.paid).reduce((s, f) => s + f.amount, 0);
  const todayAtt  = attendance.filter(a => a.date === '2026-07-31');
  const presentToday = todayAtt.filter(a => a.status === 'Present').length;

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

      {/* Stats */}
      <div className="stat-grid mb-20">
        <StatCard icon="👩‍🎓" label="Total Students"  value={schoolInfo.totalStudents} color="bg-blue"   change={{ dir:'up', text:'↑ 48 from last year' }} />
        <StatCard icon="👔"  label="Total Staff"     value={schoolInfo.totalStaff}    color="bg-green"  change={{ dir:'up', text:'↑ 3 new joins' }} />
        <StatCard icon="🏫"  label="Classes"         value={schoolInfo.totalClasses}  color="bg-purple" />
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
                  <tr>
                    <th>Name</th>
                    <th>Subject</th>
                    <th>Classes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map(t => {
                    const todayStatus = staffAttendance.find(sa => sa.staffId === t.id && sa.date === '2026-08-03');
                    return (
                      <tr key={t.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className={`avatar avatar-sm role-teacher`}>{t.avatar}</span>
                            <span style={{ fontWeight: 500 }}>{t.name}</span>
                          </div>
                        </td>
                        <td>{t.subject}</td>
                        <td>{t.classesHandled?.join(', ')}</td>
                        <td>
                          <span className={`badge badge-${todayStatus?.status === 'Present' ? 'success' : todayStatus?.status === 'Absent' ? 'danger' : 'warning'}`}>
                            {todayStatus?.status || 'Unknown'}
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
  const [search, setSearch] = useState('');
  const allStaff = users.filter(u => ['teacher','headmaster'].includes(u.role));
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
          <button className="btn btn-primary">+ Add Staff</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Staff Member</th><th>Role</th><th>Subject</th><th>Classes</th><th>Phone</th><th>Email</th><th>Since</th><th>Actions</th></tr>
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
                  <td>
                    <div style={{ display:'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm">View</button>
                      <button className="btn btn-outline btn-sm">Edit</button>
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

/* ── All Students ──────────────────────────────────────────── */
function AllStudents() {
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const all = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterClass === 'all' || s.class === filterClass)
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Student Records</h1>
          <p>All enrolled students — {schoolInfo.totalStudents} total</p>
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
              <tr><th>Student</th><th>Roll No</th><th>Class</th><th>DOB</th><th>Parent</th><th>Admission</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {all.map(s => {
                const parent = users.find(u => u.id === s.parentId);
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
                    <td><button className="btn btn-ghost btn-sm">View Profile</button></td>
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

/* ── Fees & Finance ────────────────────────────────────────── */
function FeesFinance() {
  const totalFees   = fees.reduce((s, f) => s + f.amount, 0);
  const collectedFees = fees.filter(f => f.paid).reduce((s, f) => s + f.amount, 0);
  const pendingFees = fees.filter(f => !f.paid).reduce((s, f) => s + f.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Fees & Finance</h1>
          <p>Track fee collection and pending dues</p>
        </div>
      </div>

      <div className="stat-grid mb-20">
        <StatCard icon="💰" label="Total Fees Due"  value={`₹${(totalFees/1000).toFixed(0)}k`}     color="bg-blue"   />
        <StatCard icon="✅" label="Fees Collected"  value={`₹${(collectedFees/1000).toFixed(0)}k`} color="bg-green"  change={{ dir:'up', text: `${Math.round(collectedFees/totalFees*100)}% collected` }} />
        <StatCard icon="⏳" label="Pending Fees"    value={`₹${(pendingFees/1000).toFixed(0)}k`}   color="bg-orange" change={{ dir:'down', text:`${fees.filter(f=>!f.paid).length} records pending` }} />
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Fee Records</div></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Term</th><th>Amount</th><th>Status</th><th>Paid Date</th><th>Method</th></tr></thead>
            <tbody>
              {fees.map((f, i) => {
                const s = users.find(u => u.id === f.studentId);
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <span className="avatar avatar-sm role-student">{s?.avatar}</span>
                        {s?.name}
                      </div>
                    </td>
                    <td>{f.term}</td>
                    <td style={{ fontWeight: 600 }}>₹{f.amount.toLocaleString()}</td>
                    <td><span className={`badge badge-${f.paid ? 'success' : 'danger'}`}>{f.paid ? 'Paid' : 'Pending'}</span></td>
                    <td style={{ fontSize: 12 }}>{f.paidDate || '—'}</td>
                    <td style={{ fontSize: 12 }}>{f.method || '—'}</td>
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

/* ── Notices ───────────────────────────────────────────────── */
function Notices({ canPost = true }) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Notices & Announcements</h1>
          <p>All school communications</p>
        </div>
        {canPost && (
          <div className="page-header-actions">
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Post Notice</button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="card mb-20">
          <div className="card-header">
            <div className="card-title">New Notice</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <div className="card-body">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-control" placeholder="Notice title" />
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-control"><option>High</option><option>Medium</option><option>Low</option></select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Audience</label>
              <select className="form-control"><option>All</option><option>Students</option><option>Parents</option><option>Staff</option></select>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-control" rows={4} placeholder="Notice content…" />
            </div>
            <button className="btn btn-primary">Post Notice</button>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gap: 12 }}>
        {announcements.map(a => (
          <div key={a.id} className="card">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>📢</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</span>
                    <span className={`badge badge-${a.priority === 'high' ? 'danger' : a.priority === 'medium' ? 'warning' : 'info'}`}>
                      {a.priority}
                    </span>
                    <span className="badge badge-gray">{a.audience === 'all' ? 'All' : a.audience}</span>
                  </div>
                  <p style={{ fontSize: 13, color:'var(--text-secondary)', marginBottom: 8 }}>{a.body}</p>
                  <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Posted by {a.postedBy} · {a.date}</div>
                </div>
                {canPost && (
                  <div style={{ display:'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm">Edit</button>
                    <button className="btn btn-danger btn-sm">Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Holiday Calendar ──────────────────────────────────────── */
function HolidayCalendar({ canEdit = false }) {
  const typeColors = { National: 'bg-red', Festival: 'bg-orange', Regional: 'bg-purple' };
  const badgeColors = { National: 'badge-danger', Festival: 'badge-warning', Regional: 'badge-purple' };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Holiday Calendar 2026-27</h1>
          <p>{holidays.length} holidays this academic year</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary">+ Add Holiday</button>
        )}
      </div>

      <div className="dashboard-grid grid-2">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>#</th><th>Date</th><th>Holiday</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>
                {holidays.map(h => (
                  <tr key={h.id}>
                    <td style={{ color:'var(--text-muted)', fontSize: 12 }}>{h.id}</td>
                    <td style={{ fontWeight: 500 }}>
                      {new Date(h.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      <div style={{ fontSize: 11, color:'var(--text-muted)' }}>
                        {new Date(h.date).toLocaleDateString('en-IN', { weekday:'long' })}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{h.name}</td>
                    <td><span className={`badge ${badgeColors[h.type]}`}>{h.type}</span></td>
                    <td style={{ fontSize: 12, color:'var(--text-secondary)' }}>{h.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Attendance (Principal view) ────────────────────────────── */
function AttendanceOverview() {
  const studentAtt = {};
  students.forEach(s => {
    const recs = attendance.filter(a => a.studentId === s.id);
    const present = recs.filter(a => a.status === 'Present').length;
    const absent  = recs.filter(a => a.status === 'Absent').length;
    const late    = recs.filter(a => a.status === 'Late').length;
    const total   = recs.length;
    studentAtt[s.id] = { present, absent, late, total, pct: total ? Math.round((present + late * 0.5) / total * 100) : 0 };
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Attendance Overview</h1>
          <p>Student attendance records for the current month</p>
        </div>
      </div>

      <div className="stat-grid mb-20">
        <StatCard icon="✅" label="Avg Attendance"  value="89.3%"   color="bg-green"  />
        <StatCard icon="❌" label="Avg Absent Rate" value="8.2%"    color="bg-red"    />
        <StatCard icon="⚠" label="Below 75%"       value="12"      color="bg-orange" />
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Student Attendance Summary</div></div>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Class</th><th>Present</th><th>Absent</th><th>Late</th><th>Total Days</th><th>Attendance %</th></tr></thead>
            <tbody>
              {students.map(s => {
                const a = studentAtt[s.id] || {};
                const low = a.pct < 75;
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <span className="avatar avatar-sm role-student">{s.avatar}</span>
                        {s.name}
                      </div>
                    </td>
                    <td>{s.class}</td>
                    <td style={{ color:'var(--success)', fontWeight: 600 }}>{a.present}</td>
                    <td style={{ color:'var(--danger)',  fontWeight: 600 }}>{a.absent}</td>
                    <td style={{ color:'var(--warning)', fontWeight: 600 }}>{a.late}</td>
                    <td>{a.total}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background:'var(--border)', borderRadius: 3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${a.pct}%`, background: low ? 'var(--danger)' : 'var(--success)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: low ? 'var(--danger)' : 'var(--success)', minWidth: 38 }}>{a.pct}%</span>
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
        <div className="page-header-left"><h1>Reports & Analytics</h1></div>
      </div>
      <div className="dashboard-grid grid-3">
        {[
          { icon:'📊', title:'Academic Performance', desc:'Subject-wise student performance analysis', color:'bg-blue' },
          { icon:'✅', title:'Attendance Report',    desc:'Monthly and yearly attendance statistics', color:'bg-green' },
          { icon:'💰', title:'Fee Collection Report',desc:'Term-wise fee collection and pending dues', color:'bg-orange' },
          { icon:'👔', title:'Staff Report',         desc:'Teaching hours, leave records, performance', color:'bg-purple' },
          { icon:'📋', title:'Exam Results Report',  desc:'Exam-wise results and grade distribution', color:'bg-teal' },
          { icon:'🏆', title:'Topper\'s Report',      desc:'Top performers across all classes', color:'bg-yellow' },
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

/* ── Exam Management ───────────────────────────────────────── */
function ExamManagement() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Exam Management</h1></div>
        <button className="btn btn-primary">+ Schedule Exam</button>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Exam</th><th>Subject</th><th>Class</th><th>Date</th><th>Time</th><th>Duration</th><th>Max Marks</th><th>Room</th><th>Status</th></tr></thead>
            <tbody>
              {exams.map(e => (
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

/* ── Classes ───────────────────────────────────────────────── */
function ClassesView() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Classes</h1></div>
        <button className="btn btn-primary">+ Add Class</button>
      </div>
      <div className="dashboard-grid grid-3">
        {classes.map(cls => {
          const ct = users.find(u => u.id === cls.classTeacherId);
          return (
            <div key={cls.id} className="card" style={{ cursor:'pointer' }}>
              <div className="card-body">
                <div style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background:'#ebf8ff', display:'grid', placeItems:'center', fontSize: 22 }}>🏫</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>Class {cls.name}</div>
                    <div style={{ fontSize: 12, color:'var(--text-muted)' }}>{cls.room}</div>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ background:'var(--bg-app)', borderRadius: 8, padding:'8px 12px' }}>
                    <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Strength</div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{cls.strength}</div>
                  </div>
                  <div style={{ background:'var(--bg-app)', borderRadius: 8, padding:'8px 12px' }}>
                    <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Grade</div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{cls.grade}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                  <span className="avatar avatar-sm role-teacher">{ct?.avatar}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{ct?.name}</div>
                    <div style={{ fontSize: 11, color:'var(--text-muted)' }}>Class Teacher</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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

/* ── Analytics ─────────────────────────────────────────────── */
function Analytics() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>School Analytics</h1></div>
      </div>
      <div className="stat-grid mb-20">
        <StatCard icon="📈" label="Pass Rate"         value="94.2%" color="bg-green" change={{ dir:'up', text:'↑ 2.1% vs last year' }} />
        <StatCard icon="🏆" label="Distinction (90+)" value="127"   color="bg-yellow" />
        <StatCard icon="📚" label="Notes Uploaded"    value="148"   color="bg-blue" />
        <StatCard icon="📝" label="Homework Given"    value="312"   color="bg-purple" />
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

/* ── Root ──────────────────────────────────────────────────── */
export default function PrincipalDashboard({ activeTab }) {
  const views = {
    dashboard:  <Dashboard />,
    analytics:  <Analytics />,
    staff:      <StaffManagement />,
    students:   <AllStudents />,
    classes:    <ClassesView />,
    fees:       <FeesFinance />,
    exams:      <ExamManagement />,
    attendance: <AttendanceOverview />,
    holidays:   <HolidayCalendar canEdit />,
    notices:    <Notices canPost />,
    messages:   <Messages />,
    reports:    <Reports />,
  };
  return views[activeTab] || <Dashboard />;
}
