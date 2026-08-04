import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { users, attendance, results, homework, fees, exams, messages, announcements, holidays } from '../../data/mockData';

/* ── Dashboard ──────────────────────────────────────────────── */
function Dashboard({ parent, children }) {
  const child = children[0];
  if (!child) return <div className="empty-state"><div className="empty-state-icon">👶</div><h3>No children linked</h3></div>;

  const myAtt    = attendance.filter(a => a.studentId === child.id);
  const attPct   = myAtt.length ? Math.round(myAtt.filter(a=>a.status==='Present').length / myAtt.length * 100) : 0;
  const pendingHW= homework.filter(h => h.class === child.class && h.status === 'pending').length;
  const myFees   = fees.filter(f => f.studentId === child.id);
  const feeDue   = myFees.filter(f => !f.paid).reduce((s,f)=>s+f.amount,0);
  const unread   = messages.filter(m => m.toId === parent.id && !m.read);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Hello, {parent.name.split(' ')[1]} 👋</h1>
          <p>Parent Portal — monitoring {children.map(c=>c.name).join(', ')}</p>
        </div>
        <span className="badge badge-orange">Parent Portal</span>
      </div>

      {/* Child Profile Card */}
      <div className="card mb-20" style={{ background:'linear-gradient(135deg, #1e3a5f, #2c5282)', color:'#fff' }}>
        <div className="card-body" style={{ display:'flex', alignItems:'center', gap: 20 }}>
          <span className="avatar avatar-xl role-student" style={{ border:'3px solid rgba(255,255,255,0.3)' }}>{child.avatar}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{child.name}</div>
            <div style={{ opacity: 0.8, fontSize: 13 }}>
              Class {child.class} · Roll No. {child.rollNo} · Admission Year {child.admissionYear}
            </div>
          </div>
          <div style={{ display:'flex', gap: 24, textAlign:'center' }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: attPct < 75 ? '#fca5a5' : '#86efac' }}>{attPct}%</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Attendance</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: pendingHW > 0 ? '#fed7aa' : '#86efac' }}>{pendingHW}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Pending HW</div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: feeDue > 0 ? '#fca5a5' : '#86efac' }}>₹{(feeDue/1000).toFixed(0)}k</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Fee Due</div>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid grid-2">
        {/* Attendance Summary */}
        <div className="card">
          <div className="card-header"><div className="card-title">Attendance Overview</div></div>
          <div className="card-body">
            {[['Present', myAtt.filter(a=>a.status==='Present').length, 'var(--success)'],
              ['Absent',  myAtt.filter(a=>a.status==='Absent').length,  'var(--danger)'],
              ['Late',    myAtt.filter(a=>a.status==='Late').length,    'var(--warning)'],
            ].map(([label, count, color]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 700, color }}>{count} days</span>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color:'var(--text-muted)' }}>Overall Attendance</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: attPct < 75 ? 'var(--danger)' : 'var(--success)' }}>{attPct}%</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width:`${attPct}%`, background: attPct < 75 ? 'var(--danger)' : 'var(--success)' }} />
              </div>
              {attPct < 75 && <div style={{ fontSize: 11, color:'var(--danger)', marginTop: 4 }}>⚠ Below required 75%</div>}
            </div>
          </div>
        </div>

        {/* Recent Results */}
        <div className="card">
          <div className="card-header"><div className="card-title">Latest Results</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {results.filter(r => r.studentId === child.id).map((r, i) => {
              const exam = exams.find(e => e.id === r.examId);
              const pct = Math.round(r.marksObtained / r.maxMarks * 100);
              return (
                <div key={i} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{r.subject}</div>
                    <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{exam?.name}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap: 8 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      display:'grid', placeItems:'center', fontWeight: 700, fontSize: 12,
                      background: r.grade.startsWith('A') ? '#f0fff4' : '#ebf8ff',
                      color: r.grade.startsWith('A') ? 'var(--success)' : 'var(--secondary)',
                    }}>
                      {r.grade}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight: 700 }}>{r.marksObtained}/{r.maxMarks}</div>
                      <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{pct}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {results.filter(r => r.studentId === child.id).length === 0 && (
              <div style={{ padding: 20, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>No results published yet.</div>
            )}
          </div>
        </div>

        {/* Homework */}
        <div className="card">
          <div className="card-header"><div className="card-title">Homework Status</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {homework.filter(h => h.class === child.class).slice(0, 5).map(hw => (
              <div key={hw.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{hw.title}</div>
                  <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{hw.subject} · Due: {hw.dueDate}</div>
                </div>
                <span className={`badge badge-${hw.status === 'graded' ? 'success' : hw.status === 'submitted' ? 'info' : 'warning'}`}>
                  {hw.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notices */}
        <div className="card">
          <div className="card-header"><div className="card-title">School Notices</div></div>
          <div className="card-body" style={{ padding:'8px 0' }}>
            {announcements.filter(a => a.audience === 'all' || a.audience === 'parent').slice(0, 4).map(a => (
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

/* ── Attendance View ────────────────────────────────────────── */
function AttendanceView({ children }) {
  const child = children[0];
  const myAtt = attendance.filter(a => a.studentId === child?.id).sort((a,b) => new Date(b.date) - new Date(a.date));
  const pct = myAtt.length ? Math.round(myAtt.filter(a=>a.status==='Present').length / myAtt.length * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{child?.name}'s Attendance</h1>
          <p>Class {child?.class}</p>
        </div>
      </div>

      <div className="stat-grid mb-20">
        {[['✅','Present', myAtt.filter(a=>a.status==='Present').length,'bg-green'],
          ['❌','Absent',  myAtt.filter(a=>a.status==='Absent').length, 'bg-red'],
          ['⏰','Late',    myAtt.filter(a=>a.status==='Late').length,   'bg-yellow'],
          ['📊','Att. %',  `${pct}%`,                                    'bg-blue'],
        ].map(([icon,label,val,color]) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-info"><div className="stat-value">{val}</div><div className="stat-label">{label}</div></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Day</th><th>Status</th></tr></thead>
            <tbody>
              {myAtt.map((a,i) => (
                <tr key={i}>
                  <td>{a.date}</td>
                  <td style={{ fontSize: 12, color:'var(--text-muted)' }}>{new Date(a.date).toLocaleDateString('en-IN',{weekday:'long'})}</td>
                  <td>
                    <span className={`badge badge-${a.status==='Present'?'success':a.status==='Absent'?'danger':'warning'}`}>
                      {a.status}
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

/* ── Exam Results ───────────────────────────────────────────── */
function ExamResults({ children }) {
  const child = children[0];
  const myResults = results.filter(r => r.studentId === child?.id);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{child?.name}'s Results</h1>
          <p>All examination results</p>
        </div>
      </div>

      {myResults.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📊</div><h3>No results yet</h3><p>Results will appear here after exams.</p></div></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Exam</th><th>Subject</th><th>Marks</th><th>Max</th><th>%</th><th>Grade</th><th>Remarks</th></tr></thead>
              <tbody>
                {myResults.map((r,i) => {
                  const exam = exams.find(e => e.id === r.examId);
                  const pct = Math.round(r.marksObtained/r.maxMarks*100);
                  return (
                    <tr key={i}>
                      <td>{exam?.name}</td>
                      <td><span className="badge badge-info">{r.subject}</span></td>
                      <td style={{ fontWeight:700, fontSize:16 }}>{r.marksObtained}</td>
                      <td>{r.maxMarks}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <div style={{width:50,height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                            <div style={{height:'100%',width:`${pct}%`,background:pct>=80?'var(--success)':pct>=60?'var(--warning)':'var(--danger)'}}/>
                          </div>
                          <span style={{fontSize:12}}>{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{width:40,height:40,borderRadius:'50%',display:'grid',placeItems:'center',fontWeight:700,
                          background:r.grade.startsWith('A')?'#f0fff4':'#ebf8ff',
                          color:r.grade.startsWith('A')?'var(--success)':'var(--secondary)'}}>
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
      )}
    </div>
  );
}

/* ── Homework Status ────────────────────────────────────────── */
function HomeworkView({ children }) {
  const child = children[0];
  const myHW  = homework.filter(h => h.class === child?.class);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{child?.name}'s Homework</h1>
          <p>Class {child?.class} assignments</p>
        </div>
      </div>

      <div style={{ display:'grid', gap: 12 }}>
        {myHW.map(hw => (
          <div key={hw.id} className="card">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{hw.title}</span>
                    <span className="badge badge-info">{hw.subject}</span>
                    <span className={`badge badge-${hw.status==='graded'?'success':hw.status==='submitted'?'info':'warning'}`}>{hw.status}</span>
                  </div>
                  <p style={{ fontSize: 13, color:'var(--text-secondary)', marginBottom: 8 }}>{hw.description}</p>
                  <div style={{ fontSize: 12, color:'var(--text-muted)' }}>
                    Assigned: {hw.assignedDate} · Due: {hw.dueDate} · By {hw.assignedBy}
                    {hw.grade && <span style={{ color:'var(--success)', fontWeight:600, marginLeft:8 }}>Grade: {hw.grade}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Fee Status ─────────────────────────────────────────────── */
function FeeStatus({ children }) {
  const child = children[0];
  const myFees = fees.filter(f => f.studentId === child?.id);
  const total = myFees.reduce((s,f)=>s+f.amount,0);
  const paid  = myFees.filter(f=>f.paid).reduce((s,f)=>s+f.amount,0);
  const due   = total - paid;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Fee Status — {child?.name}</h1>
          <p>Academic Year 2026-27</p>
        </div>
      </div>

      <div className="stat-grid mb-20">
        <div className="stat-card"><div className="stat-icon bg-blue">💰</div><div className="stat-info"><div className="stat-value">₹{total.toLocaleString()}</div><div className="stat-label">Total Annual Fees</div></div></div>
        <div className="stat-card"><div className="stat-icon bg-green">✅</div><div className="stat-info"><div className="stat-value">₹{paid.toLocaleString()}</div><div className="stat-label">Paid</div></div></div>
        <div className="stat-card"><div className="stat-icon bg-red">⏳</div><div className="stat-info"><div className="stat-value">₹{due.toLocaleString()}</div><div className="stat-label">Pending</div></div></div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Term</th><th>Amount</th><th>Status</th><th>Paid Date</th><th>Method</th><th>Action</th></tr></thead>
            <tbody>
              {myFees.map((f,i) => (
                <tr key={i}>
                  <td style={{fontWeight:500}}>{f.term}</td>
                  <td style={{fontWeight:600}}>₹{f.amount.toLocaleString()}</td>
                  <td><span className={`badge badge-${f.paid?'success':'danger'}`}>{f.paid?'Paid':'Pending'}</span></td>
                  <td style={{fontSize:12}}>{f.paidDate||'—'}</td>
                  <td style={{fontSize:12}}>{f.method||'—'}</td>
                  <td>{!f.paid && <button className="btn btn-primary btn-sm">Pay Now</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── Contact Teacher ────────────────────────────────────────── */
function ContactTeacher({ parent, children }) {
  const child = children[0];
  const teachers = users.filter(u => u.role === 'teacher' && u.classesHandled?.includes(child?.class));
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!selected || !subject || !body) return;
    setSent(true);
    setSubject(''); setBody(''); setSelected(null);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Contact Teacher</h1>
          <p>Get in touch with {child?.name}'s teachers</p>
        </div>
      </div>

      {sent && (
        <div style={{ background:'#f0fff4', border:'1px solid #9ae6b4', color:'#276749', padding:'10px 16px', borderRadius:8, marginBottom:16, fontSize:13 }}>
          ✅ Message sent successfully!
        </div>
      )}

      {/* Teacher Cards */}
      <div className="dashboard-grid grid-3 mb-20">
        {teachers.map(t => (
          <div key={t.id} className="card" style={{ cursor:'pointer', border: selected?.id === t.id ? '2px solid var(--secondary)' : undefined }}
            onClick={() => setSelected(t)}>
            <div className="card-body" style={{ textAlign:'center', padding: 20 }}>
              <span className="avatar avatar-lg role-teacher" style={{ margin:'0 auto 10px' }}>{t.avatar}</span>
              <div style={{ fontWeight:700, fontSize:14 }}>{t.name}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.subject}</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{t.email}</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{t.phone}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, justifyContent:'center', marginTop:8 }}>
                {t.classesHandled?.map(c => <span key={c} className="badge badge-info">{c}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Compose Form */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Compose Message</div>
          {selected && <span className="badge badge-info">To: {selected.name}</span>}
        </div>
        <div className="card-body">
          {!selected && (
            <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)', fontSize:13 }}>
              Select a teacher above to compose a message
            </div>
          )}
          {selected && (
            <>
              <div className="form-group"><label className="form-label">Subject</label><input className="form-control" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Regarding exam performance" /></div>
              <div className="form-group"><label className="form-label">Message</label><textarea className="form-control" rows={4} value={body} onChange={e=>setBody(e.target.value)} placeholder="Type your message…"/></div>
              <button className="btn btn-primary" onClick={handleSend}>Send Message</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Messages ──────────────────────────────────────────────── */
function MessagesView({ parent }) {
  const myMessages = messages.filter(m => m.toId === parent.id || m.fromId === parent.id);

  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>Messages</h1></div></div>
      <div className="card">
        <div className="card-body" style={{ padding:0 }}>
          {myMessages.map(m => {
            const other = users.find(u => u.id === (m.fromId === parent.id ? m.toId : m.fromId));
            const isSent = m.fromId === parent.id;
            return (
              <div key={m.id} style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                  <span className={`avatar avatar-sm role-${other?.role}`}>{other?.avatar}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                      <span style={{ fontWeight:m.read||isSent?400:700, fontSize:13 }}>{isSent?'→ ':''}{other?.name}</span>
                      <span style={{ fontSize:11, color:'var(--text-muted)' }}>{m.date}</span>
                    </div>
                    <div style={{ fontWeight:m.read||isSent?400:600, fontSize:13, marginBottom:4 }}>{m.subject}</div>
                    <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{m.body.substring(0,120)}…</div>
                  </div>
                </div>
              </div>
            );
          })}
          {myMessages.length === 0 && <div style={{padding:24,textAlign:'center',color:'var(--text-muted)'}}>No messages yet.</div>}
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
      <div style={{ display:'grid', gap:12 }}>
        {announcements.filter(a=>a.audience==='all'||a.audience==='parent').map(a=>(
          <div key={a.id} className="card"><div className="card-body" style={{padding:16}}>
            <div style={{fontWeight:600,fontSize:14,marginBottom:6}}>{a.title}</div>
            <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:8}}>{a.body}</p>
            <div style={{fontSize:11,color:'var(--text-muted)'}}>By {a.postedBy} · {a.date} · <span className={`badge badge-${a.priority==='high'?'danger':'warning'}`}>{a.priority}</span></div>
          </div></div>
        ))}
      </div>
    </div>
  );
}

/* ── Academic Calendar ─────────────────────────────────────── */
function AcademicCalendar() {
  const badgeColors = { National:'badge-danger', Festival:'badge-warning', Regional:'badge-purple' };
  const upcoming = holidays.filter(h => new Date(h.date) >= new Date('2026-08-04'));
  const upcomingExams = exams.filter(e => e.status === 'upcoming');

  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>Academic Calendar</h1></div></div>
      <div className="dashboard-grid grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Upcoming Holidays ({upcoming.length})</div></div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Holiday</th><th>Type</th></tr></thead>
              <tbody>
                {upcoming.slice(0,8).map(h=>(
                  <tr key={h.id}>
                    <td style={{fontWeight:500}}>{new Date(h.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</td>
                    <td style={{fontWeight:600}}>{h.name}</td>
                    <td><span className={`badge ${badgeColors[h.type]}`}>{h.type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Upcoming Exams</div></div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Exam</th><th>Subject</th><th>Date</th></tr></thead>
              <tbody>
                {upcomingExams.slice(0,8).map(e=>(
                  <tr key={e.id}>
                    <td style={{fontWeight:500}}>{e.name}</td>
                    <td><span className="badge badge-info">{e.subject}</span></td>
                    <td style={{fontSize:12}}>{e.date}</td>
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

/* ── Root ──────────────────────────────────────────────────── */
export default function ParentDashboard({ activeTab }) {
  const { currentUser } = useAuth();
  const parent   = currentUser;
  const children = users.filter(u => parent?.childrenIds?.includes(u.id));

  const views = {
    dashboard:  <Dashboard parent={parent} children={children} />,
    attendance: <AttendanceView children={children} />,
    results:    <ExamResults children={children} />,
    homework:   <HomeworkView children={children} />,
    fees:       <FeeStatus children={children} />,
    contact:    <ContactTeacher parent={parent} children={children} />,
    messages:   <MessagesView parent={parent} />,
    notices:    <Notices />,
    holidays:   <AcademicCalendar />,
  };
  return views[activeTab] || <Dashboard parent={parent} children={children} />;
}
