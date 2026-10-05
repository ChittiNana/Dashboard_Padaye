import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import * as attendanceApi from '../../api/attendanceApi';
import * as timetableApi from '../../api/timetableApi';
import * as reportingApi from '../../api/reportingApi';
import Registration          from '../Auth/Registration';
import QuestionPaperManagement from '../Exams/QuestionPaperManagement';
import ClassManagement        from '../Management/ClassManagement';
import ExamManagement         from '../Management/ExamManagement';
import NoticeManagement       from '../Management/NoticeManagement';
import HolidayManagement      from '../Management/HolidayManagement';
import AttendanceManagement   from '../Management/AttendanceManagement';
import HomeworkManagement     from '../Management/HomeworkManagement';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
function dayLabel(day) { return day.charAt(0) + day.slice(1).toLowerCase(); }
function todayISO() { return new Date().toISOString().slice(0, 10); }
function statusFor(e) { return e.examDate && e.examDate < todayISO() ? 'completed' : 'upcoming'; }
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
function Dashboard() {
  const { classes, exams, announcements } = useData();
  const { allStaff, allStudents, allUsers } = useAuth();
  const teachers = allStaff.filter(u => u.role === 'teacher');
  const students = allStudents;
  const upcoming = exams.filter(e => statusFor(e) === 'upcoming').length;

  const [attSummary, setAttSummary] = useState(null);
  useEffect(() => {
    attendanceApi.getSchoolSummary().then(setAttSummary).catch(() => setAttSummary(null));
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

/* ── Timetable View ─────────────────────────────────────────── */
function TimetableView() {
  const { classes } = useData();
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [slots,   setSlots]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const subjectColors = {
    Mathematics: '#ebf8ff', Science: '#f0fff4', English: '#faf5ff',
    History: '#fffaf0', Geography: '#e6fffa', Computer: '#fff5f5',
    PE: '#f0f4ff', Drawing: '#fff0f5',
  };

  useEffect(() => {
    if (classes.length && selectedClassId === null) setSelectedClassId(classes[0].id);
  }, [classes, selectedClassId]);

  useEffect(() => {
    let active = true;
    if (selectedClassId === null) return;
    setLoading(true);
    setError('');
    timetableApi.getClassTimetable(selectedClassId)
      .then(data => { if (active) setSlots(data); })
      .catch(err => { if (active) setError(err.message || 'Failed to load timetable'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedClassId]);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>School Timetable</h1></div>
        <select className="form-control" style={{ width: 120 }}
          value={selectedClassId ?? ''} onChange={e => setSelectedClassId(Number(e.target.value))}>
          {classes.map(c => <option key={c.id} value={c.id}>Class {c.name}</option>)}
        </select>
      </div>
      {error && <div className="alert alert-danger mb-12">{error}</div>}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Class {selectedClass?.name || '—'} Weekly Schedule</div>
        </div>
        <div className="card-body" style={{ overflowX:'auto' }}>
          {DAY_ORDER.map(day => {
            const daySlots = slots.filter(s => s.dayOfWeek === day).sort((a, b) => a.periodNumber - b.periodNumber);
            if (daySlots.length === 0) return null;
            return (
              <div key={day} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color:'var(--text-muted)', marginBottom: 8, textTransform:'uppercase', letterSpacing:'0.05em' }}>{dayLabel(day)}</div>
                <div style={{ display:'flex', gap: 8, flexWrap:'wrap' }}>
                  {daySlots.map(p => (
                    <div key={p.id} style={{ padding:'8px 12px', borderRadius: 8, background: subjectColors[p.subject] || '#f7fafc', border:'1px solid var(--border)', minWidth: 120, flex: '0 0 auto' }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{p.subject}</div>
                      <div style={{ fontSize: 10, color:'var(--text-muted)' }}>{formatTime(p.startTime)} – {formatTime(p.endTime)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {!loading && slots.length === 0 && (
            <div style={{ padding: 24, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>No timetable slots for this class.</div>
          )}
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
  { key: 'attendance',        icon: '✅', title: 'Attendance Summary', color: 'bg-green',  fetch: reportingApi.getAttendanceReport },
  { key: 'exam-results',      icon: '📋', title: 'Exam Analysis',      color: 'bg-blue',   fetch: reportingApi.getExamResultsReport },
  { key: 'staff-performance', icon: '👔', title: 'Staff Performance',  color: 'bg-orange', fetch: reportingApi.getStaffPerformanceReport },
];

function Reports() {
  const [activeKey, setActiveKey] = useState(null);
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const generate = (report) => {
    setActiveKey(report.key);
    setData(null);
    setError('');
    setLoading(true);
    report.fetch()
      .then(setData)
      .catch(err => setError(err.message || 'Failed to load report.'))
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
          <div key={r.key} className="stat-card" style={{ cursor:'pointer' }}>
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
            {error && <div className="alert alert-danger mb-8" style={{ fontSize: 12 }}>{error}</div>}

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
