import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const STATUS_OPTIONS = ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'];
const METHODS = ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER'];
const METHOD_LABELS = { CASH: 'Cash', CARD: 'Card', UPI: 'UPI', BANK_TRANSFER: 'Bank Transfer' };

function statusBadge(status) {
  return { PAID: 'success', PARTIAL: 'warning', PENDING: 'danger', OVERDUE: 'danger' }[status] || 'gray';
}

export default function FeeManagement() {
  const { fees, payFee, updateFeeRecord } = useData();
  const { allStudents, currentUser } = useAuth();
  const canPay     = currentUser?.role === 'accountant';
  const canUpdate  = ['accountant', 'principal'].includes(currentUser?.role);
  const hasActions = canPay || canUpdate;

  const [filterStatus, setFilterStatus] = useState('all');

  const [payModal,      setPayModal]      = useState(null);
  const [payAmount,     setPayAmount]     = useState('');
  const [payMethod,     setPayMethod]     = useState('CASH');
  const [payRef,        setPayRef]        = useState('');
  const [payError,      setPayError]      = useState('');
  const [paySubmitting, setPaySubmitting] = useState(false);

  const [editModal,      setEditModal]      = useState(null);
  const [editForm,       setEditForm]       = useState({ totalAmount: '', dueDate: '', status: 'PENDING' });
  const [editError,      setEditError]      = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const totalFees   = fees.reduce((s, f) => s + f.totalAmount, 0);
  const collected   = fees.reduce((s, f) => s + f.paidAmount, 0);
  const pending     = totalFees - collected;
  const unpaidCount = fees.filter(f => f.status !== 'PAID').length;

  const filtered = fees.filter(f => filterStatus === 'all' || f.status === filterStatus);

  const openPay = (f) => {
    setPayModal(f.id);
    setPayAmount('');
    setPayMethod('CASH');
    setPayRef('');
    setPayError('');
  };

  const submitPay = async (f) => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) { setPayError('Enter a valid amount.'); return; }
    setPaySubmitting(true);
    setPayError('');
    try {
      await payFee({ feeRecordId: f.id, amount, method: payMethod, reference: payRef || undefined });
      setPayModal(null);
    } catch (err) {
      setPayError(err.message || 'Payment failed.');
    } finally {
      setPaySubmitting(false);
    }
  };

  const openEdit = (f) => {
    setEditModal(f.id);
    setEditForm({ totalAmount: f.totalAmount, dueDate: f.dueDate, status: f.status });
    setEditError('');
  };

  const submitEdit = async (f) => {
    if (!editForm.totalAmount || !editForm.dueDate) { setEditError('All fields are required.'); return; }
    setEditSubmitting(true);
    setEditError('');
    try {
      await updateFeeRecord(f.id, {
        totalAmount: Number(editForm.totalAmount),
        dueDate: editForm.dueDate,
        status: editForm.status,
      });
      setEditModal(null);
    } catch (err) {
      setEditError(err.message || 'Update failed.');
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Fees &amp; Accounts</h1>
          <p>Manage fee collection and payment records</p>
        </div>
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
          <div className="stat-info"><div className="stat-value">{unpaidCount}</div><div className="stat-label">Unpaid Records</div></div>
        </div>
      </div>

      {/* Fee Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Fee Records</div>
          <select className="form-control" style={{ width: 140 }}
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Records</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th><th>Academic Year</th><th>Total</th><th>Paid</th>
                <th>Due Date</th><th>Status</th>
                {hasActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const s = allStudents.find(st => st.id === f.studentId);
                return (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="avatar avatar-sm role-student">{s?.avatar}</span>
                        {s?.name || `Student #${f.studentId}`}
                      </div>
                    </td>
                    <td>{f.academicYear}</td>
                    <td style={{ fontWeight: 600 }}>₹{f.totalAmount.toLocaleString()}</td>
                    <td>₹{f.paidAmount.toLocaleString()}</td>
                    <td style={{ fontSize: 12 }}>{f.dueDate}</td>
                    <td><span className={`badge badge-${statusBadge(f.status)}`}>{f.status}</span></td>
                    {hasActions && (
                      <td>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                          {canPay && f.status !== 'PAID' && (
                            <button className="btn btn-success btn-sm" onClick={() => openPay(f)}>Record Payment</button>
                          )}
                          {canUpdate && (
                            <button className="btn btn-outline btn-sm" onClick={() => openEdit(f)}>Edit</button>
                          )}
                        </div>

                        {payModal === f.id && (
                          <div className="card mt-8" style={{ padding: 12 }}>
                            {payError && <div className="alert alert-danger mb-8" style={{ fontSize: 12 }}>{payError}</div>}
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                              <input type="number" className="form-control" style={{ width: 100 }}
                                placeholder="Amount" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
                              <select className="form-control" style={{ width: 130 }}
                                value={payMethod} onChange={e => setPayMethod(e.target.value)}>
                                {METHODS.map(m => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                              </select>
                              <input className="form-control" style={{ width: 130 }}
                                placeholder="Reference (optional)" value={payRef} onChange={e => setPayRef(e.target.value)} />
                              <button className="btn btn-success btn-sm" disabled={paySubmitting} onClick={() => submitPay(f)}>
                                {paySubmitting ? 'Saving…' : 'OK'}
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setPayModal(null)}>Cancel</button>
                            </div>
                          </div>
                        )}

                        {editModal === f.id && (
                          <div className="card mt-8" style={{ padding: 12 }}>
                            {editError && <div className="alert alert-danger mb-8" style={{ fontSize: 12 }}>{editError}</div>}
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                              <input type="number" className="form-control" style={{ width: 100 }}
                                placeholder="Total amount" value={editForm.totalAmount}
                                onChange={e => setEditForm(f2 => ({ ...f2, totalAmount: e.target.value }))} />
                              <input type="date" className="form-control" style={{ width: 140 }}
                                value={editForm.dueDate}
                                onChange={e => setEditForm(f2 => ({ ...f2, dueDate: e.target.value }))} />
                              <select className="form-control" style={{ width: 110 }}
                                value={editForm.status}
                                onChange={e => setEditForm(f2 => ({ ...f2, status: e.target.value }))}>
                                {STATUS_OPTIONS.map(s2 => <option key={s2} value={s2}>{s2}</option>)}
                              </select>
                              <button className="btn btn-primary btn-sm" disabled={editSubmitting} onClick={() => submitEdit(f)}>
                                {editSubmitting ? 'Saving…' : 'Save'}
                              </button>
                              <button className="btn btn-ghost btn-sm" onClick={() => setEditModal(null)}>Cancel</button>
                            </div>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={hasActions ? 7 : 6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No fee records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
