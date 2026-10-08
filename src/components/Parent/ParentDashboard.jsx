import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import * as attendanceApi from '../../api/attendanceApi';
import * as feeApi from '../../api/feeApi';
import * as academicsApi from '../../api/academicsApi';
import { readWithFallback, writeThroughMock } from '../../api/mockFallback';
import { deriveStudentAttendance, deriveStudentFeeStatus, applyPayFee, deriveResultsByStudent } from '../../data/mockStore';
function todayISO() { return new Date().toISOString().slice(0, 10); }

/* ── Dashboard ──────────────────────────────────────────────── */
function Dashboard({ parent, children }) {
  const { classes, announcements, homework } = useData();
  const child = children[0];

  const [attSummary, setAttSummary] = useState(null);
  useEffect(() => {
    if (!child) return;
    readWithFallback(
      () => attendanceApi.getStudentAttendance(child.id),
      () => deriveStudentAttendance(child.id),
      { label: 'getStudentAttendance' },
    ).then(setAttSummary);
  }, [child]);

  const [feeStatus, setFeeStatus] = useState(null);
  useEffect(() => {
    if (!child) return;
    readWithFallback(
      () => feeApi.getStatusForStudent(child.id),
      () => deriveStudentFeeStatus(child.id),
      { label: 'getStatusForStudent' },
    ).then(setFeeStatus);
  }, [child]);

  const [myResults, setMyResults] = useState([]);
  useEffect(() => {
    if (!child) return;
    readWithFallback(
      () => academicsApi.getResultsByStudent(child.id),
      () => deriveResultsByStudent(child.id),
      { label: 'getResultsByStudent' },
    ).then(setMyResults);
  }, [child]);

  if (!child) return <div className="empty-state"><div className="empty-state-icon">👶</div><h3>No children linked</h3></div>;

  const childClassName = classes.find(c => c.id === child.classId)?.name;
  const attPct      = attSummary?.attendancePercentage ?? 0;
  const presentDays = attSummary?.presentDays ?? 0;
  const absentDays  = attSummary?.absentDays ?? 0;
  const lateDays    = (attSummary?.records || []).filter(r => r.status === 'LATE').length;
  const pendingHW= homework.filter(h => h.classId === child.classId && h.dueDate >= todayISO()).length;
  const feeDue   = feeStatus?.pendingAmount ?? 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Hello, {parent.username} 👋</h1>
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
              Class {childClassName} · Admission No. {child.admissionNumber}
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
            {[['Present', presentDays, 'var(--success)'],
              ['Absent',  absentDays,  'var(--danger)'],
              ['Late',    lateDays,    'var(--warning)'],
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
            {myResults.map((r, i) => {
              const pct = Math.round(r.marksObtained / r.maxMarks * 100);
              return (
                <div key={i} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{r.subject}</div>
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
            {myResults.length === 0 && (
              <div style={{ padding: 20, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>No results published yet.</div>
            )}
          </div>
        </div>

        {/* Homework */}
        <div className="card">
          <div className="card-header"><div className="card-title">Homework Status</div></div>
          <div className="card-body" style={{ padding: 0 }}>
            {homework.filter(h => h.classId === child.classId).slice(0, 5).map(hw => (
              <div key={hw.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{hw.title}</div>
                <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{hw.subject} · Due: {hw.dueDate}</div>
              </div>
            ))}
            {homework.filter(h => h.classId === child.classId).length === 0 && (
              <div style={{ padding: 20, textAlign:'center', color:'var(--text-muted)', fontSize: 13 }}>No homework assigned yet.</div>
            )}
          </div>
        </div>

        {/* Notices */}
        <div className="card">
          <div className="card-header"><div className="card-title">School Notices</div></div>
          <div className="card-body" style={{ padding:'8px 0' }}>
            {announcements.slice(0, 4).map(a => (
              <div key={a.id} style={{ padding:'10px 20px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{a.title}</div>
                <div style={{ fontSize: 11, color:'var(--text-muted)' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</div>
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
  const { classes } = useData();
  const child = children[0];
  const childClassName = classes.find(c => c.id === child?.classId)?.name;

  const [attSummary, setAttSummary] = useState(null);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (!child) return;
    setLoading(true);
    readWithFallback(
      () => attendanceApi.getStudentAttendance(child.id),
      () => deriveStudentAttendance(child.id),
      { label: 'getStudentAttendance' },
    )
      .then(setAttSummary)
      .finally(() => setLoading(false));
  }, [child]);

  const records = [...(attSummary?.records || [])].sort((a,b) => new Date(b.date) - new Date(a.date));
  const pct     = attSummary?.attendancePercentage ?? 0;
  const present = attSummary?.presentDays ?? 0;
  const absent  = attSummary?.absentDays ?? 0;
  const late    = records.filter(r => r.status === 'LATE').length;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{child?.name}'s Attendance</h1>
          <p>Class {childClassName}</p>
        </div>
      </div>

      <div className="stat-grid mb-20">
        {[['✅','Present', present,   'bg-green'],
          ['❌','Absent',  absent,    'bg-red'],
          ['⏰','Late',    late,      'bg-yellow'],
          ['📊','Att. %',  `${pct}%`, 'bg-blue'],
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
              {loading ? (
                <tr><td colSpan={3} style={{ textAlign:'center', padding: 24 }}>Loading…</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign:'center', color:'var(--text-muted)', padding: 24 }}>No attendance records yet.</td></tr>
              ) : records.map((a,i) => (
                <tr key={a.id ?? i}>
                  <td>{a.date}</td>
                  <td style={{ fontSize: 12, color:'var(--text-muted)' }}>{new Date(a.date).toLocaleDateString('en-IN',{weekday:'long'})}</td>
                  <td>
                    <span className={`badge badge-${a.status==='PRESENT'?'success':a.status==='ABSENT'?'danger':'warning'}`}>
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
  const [myResults, setMyResults] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!child) { setLoading(false); return; }
    readWithFallback(
      () => academicsApi.getResultsByStudent(child.id),
      () => deriveResultsByStudent(child.id),
      { label: 'getResultsByStudent' },
    )
      .then(setMyResults)
      .finally(() => setLoading(false));
  }, [child]);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{child?.name}'s Results</h1>
          <p>All examination results</p>
        </div>
      </div>

      {!loading && myResults.length === 0 ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">📊</div><h3>No results yet</h3><p>Results will appear here after exams.</p></div></div>
      ) : (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Subject</th><th>Marks</th><th>Max</th><th>%</th><th>Grade</th></tr></thead>
              <tbody>
                {myResults.map((r,i) => {
                  const pct = Math.round(r.marksObtained/r.maxMarks*100);
                  return (
                    <tr key={i}>
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
  const { classes, homework } = useData();
  const child = children[0];
  const childClassName = classes.find(c => c.id === child?.classId)?.name;
  const myHW  = homework.filter(h => h.classId === child?.classId);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{child?.name}'s Homework</h1>
          <p>Class {childClassName} assignments</p>
        </div>
      </div>

      <div style={{ display:'grid', gap: 12 }}>
        {myHW.map(hw => (
          <div key={hw.id} className="card">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ display:'flex', alignItems:'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>{hw.title}</span>
                <span className="badge badge-info">{hw.subject}</span>
              </div>
              <p style={{ fontSize: 13, color:'var(--text-secondary)', marginBottom: 8 }}>{hw.description}</p>
              <div style={{ fontSize: 12, color:'var(--text-muted)' }}>Due: {hw.dueDate}</div>
            </div>
          </div>
        ))}
        {myHW.length === 0 && (
          <div className="card"><div className="card-body" style={{ textAlign:'center', color:'var(--text-muted)' }}>
            No homework assigned yet.
          </div></div>
        )}
      </div>
    </div>
  );
}

/* ── Fee Status ─────────────────────────────────────────────── */
const FEE_METHODS = ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER'];
const FEE_METHOD_LABELS = { CASH: 'Cash', CARD: 'Card', UPI: 'UPI', BANK_TRANSFER: 'Bank Transfer' };
function feeStatusBadge(status) {
  return { PAID: 'success', PARTIAL: 'warning', PENDING: 'danger', OVERDUE: 'danger' }[status] || 'gray';
}

function FeeStatus({ children }) {
  const child = children[0];
  const [feeStatus, setFeeStatus] = useState(null);
  const [loading,   setLoading]   = useState(false);

  const [showPay,     setShowPay]     = useState(false);
  const [payAmount,   setPayAmount]   = useState('');
  const [payMethod,   setPayMethod]   = useState('CASH');
  const [payRef,      setPayRef]      = useState('');
  const [payError,    setPayError]    = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);

  const load = () => {
    if (!child) return;
    setLoading(true);
    readWithFallback(
      () => feeApi.getStatusForStudent(child.id),
      () => deriveStudentFeeStatus(child.id),
      { label: 'getStatusForStudent' },
    )
      .then(setFeeStatus)
      .finally(() => setLoading(false));
  };

  useEffect(load, [child]);

  const submitPay = () => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) { setPayError('Enter a valid amount.'); return; }
    setPaySubmitting(true);
    setPayError('');
    const updated = writeThroughMock(
      () => {
        applyPayFee({ feeRecordId: feeStatus.feeRecordId, amount, method: payMethod, reference: payRef || undefined });
        return deriveStudentFeeStatus(child.id);
      },
      () => feeApi.payFee({ feeRecordId: feeStatus.feeRecordId, amount, method: payMethod, reference: payRef || undefined }),
      { label: 'payFee' },
    );
    setFeeStatus(updated);
    setShowPay(false);
    setPayAmount('');
    setPayRef('');
    setPaySubmitting(false);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Fee Status — {child?.name}</h1>
          <p>Academic Year {feeStatus?.academicYear || '—'}</p>
        </div>
      </div>

      {loading ? (
        <div className="card"><div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div></div>
      ) : !feeStatus ? (
        <div className="card"><div className="empty-state"><div className="empty-state-icon">💰</div><h3>No fee records found</h3></div></div>
      ) : (
        <>
          <div className="stat-grid mb-20">
            <div className="stat-card"><div className="stat-icon bg-blue">💰</div><div className="stat-info"><div className="stat-value">₹{feeStatus.totalAmount.toLocaleString()}</div><div className="stat-label">Total Fees</div></div></div>
            <div className="stat-card"><div className="stat-icon bg-green">✅</div><div className="stat-info"><div className="stat-value">₹{feeStatus.paidAmount.toLocaleString()}</div><div className="stat-label">Paid</div></div></div>
            <div className="stat-card"><div className="stat-icon bg-red">⏳</div><div className="stat-info"><div className="stat-value">₹{feeStatus.pendingAmount.toLocaleString()}</div><div className="stat-label">Pending</div></div></div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Current Fee Record</div>
              <span className={`badge badge-${feeStatusBadge(feeStatus.status)}`}>{feeStatus.status}</span>
            </div>
            <div className="card-body">
              {feeStatus.status !== 'PAID' && !showPay && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowPay(true)}>Pay Now</button>
              )}
              {showPay && (
                <div style={{ marginTop: 12 }}>
                  {payError && <div className="alert alert-danger mb-8" style={{ fontSize: 12 }}>{payError}</div>}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input type="number" className="form-control" style={{ width: 120 }}
                      placeholder="Amount" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                    <select className="form-control" style={{ width: 150 }}
                      value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                      {FEE_METHODS.map(m => <option key={m} value={m}>{FEE_METHOD_LABELS[m]}</option>)}
                    </select>
                    <input className="form-control" style={{ width: 150 }}
                      placeholder="Reference (optional)" value={payRef} onChange={e => setPayRef(e.target.value)} />
                    <button className="btn btn-primary btn-sm" disabled={paySubmitting} onClick={submitPay}>
                      {paySubmitting ? 'Paying…' : 'Confirm Payment'}
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setShowPay(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Contact Teacher ────────────────────────────────────────── */
function ContactTeacher({ parent, children }) {
  const { allStaff } = useAuth();
  const { addMessage } = useData();
  const child = children[0];
  const teachers = allStaff.filter(u => u.role === 'teacher');
  const [selected, setSelected] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!selected || !subject || !body) return;
    addMessage({ fromId: parent.id, toId: selected.id, subject, body });
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
              <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{t.staffCode}</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{t.email}</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{t.phone}</div>
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
  const { messages, directoryUsers } = useData();
  const myMessages = messages.filter(m => m.toId === parent.id || m.fromId === parent.id);

  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>Messages</h1></div></div>
      <div className="card">
        <div className="card-body" style={{ padding:0 }}>
          {myMessages.map(m => {
            const other = directoryUsers.find(u => u.id === (m.fromId === parent.id ? m.toId : m.fromId));
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
  const { announcements } = useData();
  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>School Notices</h1></div></div>
      <div style={{ display:'grid', gap:12 }}>
        {announcements.map(a=>(
          <div key={a.id} className="card"><div className="card-body" style={{padding:16}}>
            <div style={{fontWeight:600,fontSize:14,marginBottom:6}}>{a.title}</div>
            <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:8}}>{a.body}</p>
            <div style={{fontSize:11,color:'var(--text-muted)'}}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</div>
          </div></div>
        ))}
        {announcements.length === 0 && (
          <div className="card"><div className="card-body" style={{ textAlign:'center', color:'var(--text-muted)', padding: 40 }}>No notices yet.</div></div>
        )}
      </div>
    </div>
  );
}

/* ── Academic Calendar ─────────────────────────────────────── */
function AcademicCalendar() {
  const { holidays } = useData();
  const badgeColors = { National:'badge-danger', Festival:'badge-warning', Regional:'badge-purple' };
  const upcoming = holidays.filter(h => new Date(h.date) >= new Date(todayISO()));

  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>Academic Calendar</h1></div></div>
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
    </div>
  );
}

/* ── Root ──────────────────────────────────────────────────── */
export default function ParentDashboard({ activeTab }) {
  const { currentUser, myChildren } = useAuth();
  const parent   = currentUser;
  const children = myChildren;

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
