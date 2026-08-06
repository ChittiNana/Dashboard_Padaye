import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const BLANK_FEE = { studentId: '', term: '', amount: '' };
const TERMS   = ['Term 1 (Apr–Jun)', 'Term 2 (Jul–Sep)', 'Term 3 (Oct–Dec)', 'Term 4 (Jan–Mar)', 'Exam Fee', 'Annual Fee'];
const METHODS = ['Cash', 'Online Transfer', 'Cheque', 'Demand Draft'];

export default function FeeManagement() {
  const { fees, addFeeRecord, markFeePaid, deleteFeeRecord } = useData();
  const { allUsers, currentUser } = useAuth();
  const students  = allUsers.filter(u => u.role === 'student');
  const canManage = ['accountant', 'principal'].includes(currentUser?.role);

  const [showAdd,       setShowAdd]       = useState(false);
  const [form,          setForm]          = useState(BLANK_FEE);
  const [payModal,      setPayModal]      = useState(null); // composite key "sid-term"
  const [payMethod,     setPayMethod]     = useState('Cash');
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const totalFees = fees.reduce((s, f) => s + f.amount, 0);
  const collected = fees.filter(f => f.paid).reduce((s, f) => s + f.amount, 0);
  const pending   = fees.filter(f => !f.paid).reduce((s, f) => s + f.amount, 0);

  const filtered = fees.filter(f =>
    filterStatus === 'all' ||
    (filterStatus === 'paid' ? f.paid : !f.paid)
  );

  const submitAdd = () => {
    if (!form.studentId || !form.term || !form.amount) return;
    addFeeRecord({ studentId: Number(form.studentId), term: form.term, amount: Number(form.amount), paid: false, paidDate: null, method: null });
    setForm(BLANK_FEE);
    setShowAdd(false);
  };

  const feeKey = (f) => `${f.studentId}-${f.term}`;

  const confirmPay = (f) => {
    markFeePaid(f.studentId, f.term, payMethod);
    setPayModal(null);
    setPayMethod('Cash');
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Fees &amp; Accounts</h1>
          <p>Manage fee collection and payment records</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowAdd(s => !s)}>
            {showAdd ? 'Cancel' : '+ Add Fee Record'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stat-grid mb-20">
        <div className="stat-card">
          <div className="stat-icon bg-blue">💰</div>
          <div className="stat-info"><div className="stat-value">₹{(totalFees/1000).toFixed(0)}k</div><div className="stat-label">Total Due</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green">✅</div>
          <div className="stat-info"><div className="stat-value">₹{(collected/1000).toFixed(0)}k</div><div className="stat-label">Collected</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-orange">⏳</div>
          <div className="stat-info"><div className="stat-value">₹{(pending/1000).toFixed(0)}k</div><div className="stat-label">Pending</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red">❌</div>
          <div className="stat-info"><div className="stat-value">{fees.filter(f => !f.paid).length}</div><div className="stat-label">Unpaid Records</div></div>
        </div>
      </div>

      {/* Add Record form */}
      {showAdd && canManage && (
        <div className="card mb-20">
          <div className="card-header">
            <div className="card-title">Add Fee Record</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select className="form-control" value={form.studentId} onChange={e => set('studentId', e.target.value)}>
                  <option value="">Select student…</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} — Class {s.class}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Term *</label>
                <select className="form-control" value={form.term} onChange={e => set('term', e.target.value)}>
                  <option value="">Select term…</option>
                  {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input type="number" className="form-control" value={form.amount}
                  onChange={e => set('amount', e.target.value)} placeholder="e.g. 12000" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" onClick={submitAdd}>Add Record</button>
              <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Fee Records</div>
          <select className="form-control" style={{ width: 140 }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Records</option>
            <option value="paid">Paid Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th><th>Class</th><th>Term</th><th>Amount</th>
                <th>Status</th><th>Paid Date</th><th>Method</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((f, i) => {
                const s   = allUsers.find(u => u.id === f.studentId);
                const key = feeKey(f);
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="avatar avatar-sm role-student">{s?.avatar}</span>
                        {s?.name || `Student #${f.studentId}`}
                      </div>
                    </td>
                    <td>{s?.class || '—'}</td>
                    <td>{f.term}</td>
                    <td style={{ fontWeight: 600 }}>₹{f.amount.toLocaleString()}</td>
                    <td><span className={`badge badge-${f.paid ? 'success' : 'danger'}`}>{f.paid ? 'Paid' : 'Pending'}</span></td>
                    <td style={{ fontSize: 12 }}>{f.paidDate || '—'}</td>
                    <td style={{ fontSize: 12 }}>{f.method || '—'}</td>
                    {canManage && (
                      <td>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                          {/* Mark Paid inline */}
                          {!f.paid && payModal === key ? (
                            <>
                              <select
                                className="form-control"
                                style={{ width: 120, height: 30, fontSize: 12, padding: '2px 6px' }}
                                value={payMethod}
                                onChange={e => setPayMethod(e.target.value)}
                              >
                                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                              <button className="btn btn-success btn-sm" onClick={() => confirmPay(f)}>OK</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setPayModal(null)}>✕</button>
                            </>
                          ) : !f.paid ? (
                            <button className="btn btn-success btn-sm" onClick={() => { setPayModal(key); setPayMethod('Cash'); }}>
                              Mark Paid
                            </button>
                          ) : null}
                          {/* Delete */}
                          {deleteConfirm === key ? (
                            <>
                              <button className="btn btn-danger btn-sm" onClick={() => { deleteFeeRecord(f.studentId, f.term); setDeleteConfirm(null); }}>Yes</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>No</button>
                            </>
                          ) : (
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteConfirm(key)}>Del</button>
                          )}
                        </div>
                      </td>
                    )}
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
