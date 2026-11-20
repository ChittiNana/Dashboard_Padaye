import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import * as attendanceApi from '../../api/attendanceApi';
import * as reportingApi from '../../api/reportingApi';
import { readWithFallback } from '../../api/mockFallback';
import {
  deriveSchoolAttendanceSummary, deriveAttendanceReport,
  deriveExamResultsReport, deriveStaffPerformanceReport,
} from '../../data/mockStore';
import Registration          from '../Auth/Registration';
import QuestionPaperManagement from '../Exams/QuestionPaperManagement';
import ClassManagement        from '../Management/ClassManagement';
import ExamManagement         from '../Management/ExamManagement';
import NoticeManagement       from '../Management/NoticeManagement';
import HolidayManagement      from '../Management/HolidayManagement';
import AttendanceManagement   from '../Management/AttendanceManagement';
import HomeworkManagement     from '../Management/HomeworkManagement';
import TimetableManagement    from '../Management/TimetableManagement';

function todayISO() { return new Date().toISOString().slice(0, 10); }
function statusFor(e) { return e.examDate && e.examDate < todayISO() ? 'completed' : 'upcoming'; }

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
  const { classes, exams, announcements } = useData();
  const { allStaff, allStudents, allUsers } = useAuth();
  const teachers = allStaff.filter(u => u.role === 'teacher');
  const students = allStudents;
  const upcoming = exams.filter(e => statusFor(e) === 'upcoming').length;

  const [attSummary, setAttSummary] = useState(null);
  useEffect(() => {
    readWithFallback(
      () => attendanceApi.getSchoolSummary(),
      () => deriveSchoolAttendanceSummary(),
      { label: 'getSchoolSummary' },
    ).then(setAttSummary);
  }, []);

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
      </div>

      <div className="dashboard-grid grid-2">
        {/* Today's Attendance */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Today's Attendance</div>
          </div>
          <div className="card-body">
            <div className="stat-grid">
              <StatCard icon="📋" label="Marked"  value={attSummary?.totalRecordsToday ?? '—'} color="bg-blue" />
              <StatCard icon="✅" label="Present"  value={attSummary?.presentToday ?? '—'}      color="bg-green" />
              <StatCard icon="⚠"  label="Absent"   value={attSummary?.absentToday ?? '—'}       color="bg-orange" />
            </div>
          </div>
        </div>

        {/* Upcoming Exams */}
        <div className="card">
          <div className="card-header"><div className="card-title">Upcoming Exams</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            <table style={{ width:'100%', fontSize: 13 }}>
              <thead><tr><th>Subject</th><th>Date</th><th>Class</th></tr></thead>
              <tbody>
                {exams.filter(e => statusFor(e) === 'upcoming').slice(0, 6).map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight: 500 }}>{e.subject}</td>
                    <td style={{ fontSize: 12 }}>{e.examDate}</td>
                    <td><span className="badge badge-info">{classes.find(c => c.id === e.classId)?.name || '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Class Strength */}
        <div className="card">
          <div className="card-header"><div className="card-title">Class Strength</div></div>
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
                    <div className="progress-bar" style={{ width: `${(strength / 45) * 100}%`, background: '#3182ce' }} />
                  </div>
                </div>
              );
            })}
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
                  {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'} · By{' '}
                  {allUsers.find(u => u.userId === a.postedByUserId)?.name || 'Admin'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Staff Overview ─────────────────────────────────────────── */
function StaffOverview() {
  const { allStaff } = useAuth();
  const teachers = allStaff.filter(u => u.role === 'teacher');

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
              <div style={{ fontSize: 12, color:'var(--text-muted)', marginBottom: 8 }}>{t.staffCode}</div>
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
  const { classes } = useData();
  const { allStudents } = useAuth();
  const students = allStudents;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Students</h1></div>
      </div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Class</th><th>Admission No</th></tr></thead>
            <tbody>
              {students.map(s => {
                const cls = classes.find(c => c.id === s.classId);
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                        <span className="avatar avatar-sm role-student">{s.avatar}</span>
                        {s.name}
                      </div>
                    </td>
                    <td>{cls?.name || '—'}</td>
                    <td>{s.admissionNumber}</td>
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
const HEADMASTER_REPORTS = [
  { key: 'attendance',        icon: '✅', title: 'Attendance Summary', color: 'bg-green',  fetch: reportingApi.getAttendanceReport,       fallback: deriveAttendanceReport },
  { key: 'exam-results',      icon: '📋', title: 'Exam Analysis',      color: 'bg-blue',   fetch: reportingApi.getExamResultsReport,      fallback: deriveExamResultsReport },
  { key: 'staff-performance', icon: '👔', title: 'Staff Performance',  color: 'bg-orange', fetch: reportingApi.getStaffPerformanceReport, fallback: deriveStaffPerformanceReport },
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

  const active = HEADMASTER_REPORTS.find(r => r.key === activeKey);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Reports</h1></div>
      </div>
      <div className="dashboard-grid grid-2">
        {HEADMASTER_REPORTS.map(r => (
          <div key={r.key} className="stat-card clickable" onClick={() => generate(r)}>
            <div className={`stat-icon ${r.color}`}>{r.icon}</div>
            <div className="stat-info">
              <div style={{ fontWeight: 600, fontSize: 15 }}>{r.title}</div>
              <div style={{ fontSize: 12, color:'var(--text-muted)', margin:'4px 0 10px' }}>Click to generate</div>
              <button className="btn btn-ghost btn-sm" onClick={() => generate(r)}>Generate →</button>
            </div>
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

/* ── Root ──────────────────────────────────────────────────── */
export default function HeadmasterDashboard({ activeTab }) {
  const views = {
    dashboard:         <Dashboard />,
    registration:      <Registration />,
    classes:           <ClassManagement />,
    timetable:         <TimetableManagement />,
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
