import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import * as attendanceApi from '../../api/attendanceApi';
import * as reportingApi from '../../api/reportingApi';
import { schoolInfo } from '../../data/mockData';
import { readWithFallback } from '../../api/mockFallback';
import {
  deriveSchoolAttendanceSummary, deriveAttendanceReport, deriveExamResultsReport,
  deriveFeeCollectionReport, deriveStaffPerformanceReport, deriveAnalytics,
} from '../../data/mockStore';
import Registration          from '../Auth/Registration';
import QuestionPaperManagement from '../Exams/QuestionPaperManagement';
import ClassManagement        from '../Management/ClassManagement';
import ExamManagement         from '../Management/ExamManagement';
import NoticeManagement       from '../Management/NoticeManagement';
import HolidayManagement      from '../Management/HolidayManagement';
import FeeManagement          from '../Management/FeeManagement';
import AttendanceManagement   from '../Management/AttendanceManagement';

function todayISO() { return new Date().toISOString().slice(0, 10); }
function statusFor(e) { return e.examDate && e.examDate < todayISO() ? 'completed' : 'upcoming'; }

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
  const { classes, exams, announcements, fees } = useData();
  const { allStaff, allStudents, allUsers } = useAuth();
  const teachers = allStaff.filter(u => u.role === 'teacher');
  const students = allStudents;
  const totalPaid    = fees.reduce((s, f) => s + f.paidAmount, 0);

  const [attSummary, setAttSummary] = useState(null);
  useEffect(() => {
    readWithFallback(
      () => attendanceApi.getSchoolSummary(),
      () => deriveSchoolAttendanceSummary(),
      { label: 'getSchoolSummary' },
    ).then(setAttSummary);
  }, []);
  const presentToday = attSummary?.presentToday ?? '—';

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
        <StatCard icon="👩‍🎓" label="Total Students"  value={students.length}       color="bg-blue"   />
        <StatCard icon="👔"  label="Total Staff"     value={allStaff.length}        color="bg-green"  />
        <StatCard icon="🏫"  label="Classes"         value={classes.length}         color="bg-purple" />
        <StatCard icon="✅"  label="Attendance Today" value={`${presentToday}/${students.length}`} color="bg-teal" />
        <StatCard icon="💰"  label="Fees Collected"  value={`₹${(totalPaid/1000).toFixed(0)}k`}  color="bg-orange" />
        <StatCard icon="📋"  label="Upcoming Exams"  value={exams.filter(e => statusFor(e) === 'upcoming').length} color="bg-yellow" />
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
                <div className="notif-icon bg-blue"
                  style={{ width: 36, height: 36, borderRadius: 8, display: 'grid', placeItems: 'center', fontSize: 16, flexShrink: 0 }}>
                  📢
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'} · By{' '}
                    {allUsers.find(u => u.userId === a.postedByUserId)?.name || 'Admin'}
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
                  <tr><th>Name</th><th>Staff Code</th></tr>
                </thead>
                <tbody>
                  {teachers.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className="avatar avatar-sm role-teacher">{t.avatar}</span>
                          <span style={{ fontWeight: 500 }}>{t.name}</span>
                        </div>
                      </td>
                      <td>{t.staffCode}</td>
                    </tr>
                  ))}
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
                <thead><tr><th>Subject</th><th>Class</th><th>Date</th><th>Marks</th></tr></thead>
                <tbody>
                  {exams.filter(e => statusFor(e) === 'upcoming').slice(0, 5).map(e => (
                    <tr key={e.id}>
                      <td style={{ fontWeight: 500 }}>{e.subject}</td>
                      <td><span className="badge badge-info">{classes.find(c => c.id === e.classId)?.name || '—'}</span></td>
                      <td>{e.examDate}</td>
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
            {classes.filter(c => c.active !== false).map(cls => {
              const strength = students.filter(s => s.classId === cls.id).length;
              return (
                <div key={cls.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>Class {cls.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{strength} students</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{
                      width: `${(strength / 45) * 100}%`,
                      background: cls.gradeLevel === 10 ? '#3182ce' : cls.gradeLevel === 9 ? '#38a169' : '#805ad5',
                    }} />
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

/* ── Staff Management ──────────────────────────────────────── */
function StaffManagement() {
  const { allStaff } = useAuth();
  const [search, setSearch] = useState('');
  const staffList = allStaff.filter(u => ['teacher','headmaster'].includes(u.role));
  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.staffCode?.toLowerCase().includes(search.toLowerCase())
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
              <tr><th>Staff Member</th><th>Role</th><th>Staff Code</th><th>Phone</th><th>Email</th></tr>
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
                  <td>{s.staffCode || '—'}</td>
                  <td style={{ fontSize: 12 }}>{s.phone}</td>
                  <td style={{ fontSize: 12 }}>{s.email}</td>
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
  const { classes } = useData();
  const { allStudents } = useAuth();
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('all');
  const students = allStudents;

  const all = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (filterClass === 'all' || String(s.classId) === filterClass)
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
            {classes.filter(c => c.active !== false).map(c => <option key={c.id} value={String(c.id)}>Class {c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Student</th><th>Admission No</th><th>Class</th><th>DOB</th><th>Guardian</th><th>Guardian Phone</th></tr>
            </thead>
            <tbody>
              {all.map(s => {
                const cls = classes.find(c => c.id === s.classId);
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 10 }}>
                        <span className="avatar role-student">{s.avatar}</span>
                        <div style={{ fontWeight: 600 }}>{s.name}</div>
                      </div>
                    </td>
                    <td>{s.admissionNumber}</td>
                    <td><span className="badge badge-info">Class {cls?.name || '—'}</span></td>
                    <td style={{ fontSize: 12 }}>{s.dateOfBirth}</td>
                    <td style={{ fontSize: 12 }}>{s.guardianName || '—'}</td>
                    <td style={{ fontSize: 12 }}>{s.guardianPhone || '—'}</td>
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
const PRINCIPAL_REPORTS = [
  { key: 'attendance',        icon: '✅', title: 'Attendance Report',     desc: "Today's school-wide attendance",       color: 'bg-green',  fetch: reportingApi.getAttendanceReport,       fallback: deriveAttendanceReport },
  { key: 'exam-results',      icon: '📋', title: 'Exam Results Report',  desc: 'Exams and recorded results',            color: 'bg-teal',   fetch: reportingApi.getExamResultsReport,      fallback: deriveExamResultsReport },
  { key: 'fee-collection',    icon: '💰', title: 'Fee Collection Report', desc: 'Billed, collected and outstanding fees', color: 'bg-orange', fetch: reportingApi.getFeeCollectionReport,    fallback: deriveFeeCollectionReport },
  { key: 'staff-performance', icon: '👔', title: 'Staff Report',          desc: 'Staff counts by role',                   color: 'bg-purple', fetch: reportingApi.getStaffPerformanceReport, fallback: deriveStaffPerformanceReport },
];

function Reports() {
  const [activeKey, setActiveKey] = useState(null);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);

  const generate = (report) => {
    setActiveKey(report.key);
    setData(null);
    setLoading(true);
    readWithFallback(
      () => report.fetch(),
      () => report.fallback(),
      { label: report.key },
    )
      .then(setData)
      .finally(() => setLoading(false));
  };

  const active = PRINCIPAL_REPORTS.find(r => r.key === activeKey);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Reports & Analytics</h1></div>
      </div>
      <div className="dashboard-grid grid-3">
        {PRINCIPAL_REPORTS.map(r => (
          <div key={r.key} className="stat-card" style={{ flexDirection:'column', alignItems:'flex-start', cursor:'pointer' }}>
            <div className={`stat-icon ${r.color}`} style={{ marginBottom: 12 }}>{r.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{r.title}</div>
            <div style={{ fontSize: 12, color:'var(--text-muted)', marginBottom: 12 }}>{r.desc}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => generate(r)}>Generate Report →</button>
          </div>
        ))}
      </div>

      {active && (
        <div className="card mt-20">
          <div className="card-header">
            <div className="card-title">{active.title}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveKey(null)}>Close</button>
          </div>
          <div className="card-body">
            {loading && <p style={{ fontSize: 13, color:'var(--text-muted)' }}>Loading…</p>}

            {data && activeKey === 'attendance' && (
              <div className="stat-grid">
                <StatCard icon="📋" label="Marked Today"  value={data.summary.totalRecordsToday} color="bg-blue" />
                <StatCard icon="✅" label="Present Today" value={data.summary.presentToday}       color="bg-green" />
                <StatCard icon="⚠"  label="Absent Today"  value={data.summary.absentToday}        color="bg-orange" />
              </div>
            )}

            {data && activeKey === 'exam-results' && (
              <div className="stat-grid">
                <StatCard icon="📋" label="Total Exams"       value={data.exams.length}      color="bg-blue" />
                <StatCard icon="📝" label="Results Recorded" value={data.allResults.length} color="bg-purple" />
              </div>
            )}

            {data && activeKey === 'fee-collection' && (
              <div className="stat-grid">
                <StatCard icon="💰" label="Total Billed"    value={`₹${(data.totalBilled/1000).toFixed(0)}k`}     color="bg-blue" />
                <StatCard icon="✅" label="Total Collected" value={`₹${(data.totalCollected/1000).toFixed(0)}k`}  color="bg-green" />
                <StatCard icon="⚠"  label="Outstanding"     value={`₹${(data.totalOutstanding/1000).toFixed(0)}k`} color="bg-orange" />
                <StatCard icon="📄" label="Fee Records"     value={data.recordCount}                              color="bg-purple" />
              </div>
            )}

            {data && activeKey === 'staff-performance' && (
              <div>
                <div className="stat-grid mb-12">
                  <StatCard icon="👔" label="Total Staff"  value={data.totalStaff}  color="bg-blue" />
                  <StatCard icon="✅" label="Active Staff" value={data.activeStaff} color="bg-green" />
                </div>
                {Object.entries(data.countByRole).map(([role, count]) => (
                  <div key={role} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize: 13, borderBottom:'1px solid var(--border)' }}>
                    <span style={{ textTransform:'capitalize' }}>{role.toLowerCase()}</span>
                    <span style={{ fontWeight: 600 }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Analytics ─────────────────────────────────────────────── */
const ANALYTICS_SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer'];
const GRADE_BUCKETS = [['A+', '#38a169'], ['A', '#3182ce'], ['B+', '#805ad5'], ['B', '#d69e2e'], ['C', '#dd6b20'], ['D', '#e53e3e']];

function Analytics() {
  const { notes, homework, results } = useData();

  const [analytics, setAnalytics] = useState(null);
  useEffect(() => {
    readWithFallback(
      () => reportingApi.getAnalytics(),
      () => deriveAnalytics(),
      { label: 'getAnalytics' },
    ).then(setAnalytics);
  }, []);

  const pctOf = (r) => Math.round((r.marksObtained / r.maxMarks) * 100);
  const passRate = results.length ? Math.round(results.filter(r => pctOf(r) >= 40).length / results.length * 100) : 0;
  const distinctions = results.filter(r => pctOf(r) >= 90).length;

  const subjectAvg = ANALYTICS_SUBJECTS.map(sub => {
    const subResults = results.filter(r => r.subject === sub);
    const avg = subResults.length ? Math.round(subResults.reduce((s, r) => s + pctOf(r), 0) / subResults.length) : 0;
    return { sub, avg };
  });

  const gradeCounts = GRADE_BUCKETS.map(([grade, color]) => ({
    grade, color, count: results.filter(r => r.grade === grade).length,
  }));
  const maxGradeCount = Math.max(1, ...gradeCounts.map(g => g.count));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>School Analytics</h1></div>
      </div>
      <div className="stat-grid mb-20">
        <StatCard icon="📈" label="Pass Rate"           value={`${passRate}%`} color="bg-green" />
        <StatCard icon="🏆" label="Distinction (90+)"   value={distinctions}   color="bg-yellow" />
        <StatCard icon="✅" label="School Attendance"   value={analytics ? `${Math.round(analytics.schoolWideAttendancePercentage)}%` : '—'} color="bg-teal" />
        <StatCard icon="📚" label="Notes Uploaded"      value={notes.length}   color="bg-blue" />
        <StatCard icon="📝" label="Homework Given"      value={homework.length} color="bg-purple" />
      </div>
      <div className="dashboard-grid grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Subject Performance (Avg %)</div></div>
          <div className="card-body">
            {subjectAvg.map(({ sub, avg }) => (
              <div key={sub} style={{ marginBottom: 12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{sub}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{avg}%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width:`${avg}%`, background: avg >= 80 ? 'var(--success)' : avg >= 70 ? 'var(--warning)' : 'var(--danger)' }} />
                </div>
              </div>
            ))}
            {results.length === 0 && <p style={{ fontSize: 13, color:'var(--text-muted)' }}>No results recorded yet.</p>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Grade Distribution</div></div>
          <div className="card-body">
            {gradeCounts.map(({ grade, color, count }) => (
              <div key={grade} style={{ display:'flex', alignItems:'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, flex: 1 }}>{grade}</span>
                <div style={{ width: 100, height: 6, background:'var(--border)', borderRadius: 3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${(count/maxGradeCount)*100}%`, background: color, borderRadius: 3 }} />
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
