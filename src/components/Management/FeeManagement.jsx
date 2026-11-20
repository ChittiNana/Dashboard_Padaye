import { useState, useRef } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import * as feeApi from '../../api/feeApi';
import * as notificationsApi from '../../api/notificationsApi';
import * as peopleApi from '../../api/peopleApi';
import { readWithFallback, isBackendUnavailable, writeWithApi } from '../../api/mockFallback';
import { errorText } from '../../utils/apiError';
import { derivePaymentHistory, applyCreateNotification } from '../../data/mockStore';
import ProfileAvatar from '../Shared/ProfileAvatar';

function newIdempotencyKey() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`;
}

const STATUS_OPTIONS =['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'];
const METHODS = ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER'];
const METHOD_LABELS = { CASH: 'Cash', CARD: 'Card', UPI: 'UPI', BANK_TRANSFER: 'Bank Transfer' };

function statusBadge(status) {
  return { PAID: 'success', PARTIAL: 'warning', PENDING: 'danger', OVERDUE: 'danger' }[status] || 'gray';
}

// Indian school year convention used throughout the seed data (e.g. "2026-27") — starts in April.
function currentAcademicYear() {
  const now = new Date();
  const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  return `${y}-${String((y + 1) % 100).padStart(2, '0')}`;
}

export default function FeeManagement() {
  const { fees, classes, addFeeRecord, payFee, updateFeeRecord } = useData();
  const { allStudents, currentUser } = useAuth();
  const canPay     = currentUser?.role === 'accountant';
  const canUpdate  = ['accountant', 'principal'].includes(currentUser?.role);
  const canCreate  = canUpdate;
  const hasActions = canPay || canUpdate;

  const [filterStatus, setFilterStatus] = useState('all');

  const [showCreate,       setShowCreate]       = useState(false);
  const [createForm,       setCreateForm]       = useState({ studentId: '', academicYear: currentAcademicYear(), totalAmount: '', dueDate: '' });
  const [createError,      setCreateError]      = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const [payModal,      setPayModal]      = useState(null);
  const [payAmount,     setPayAmount]     = useState('');
  const [payMethod,     setPayMethod]     = useState('CASH');
  const [payRef,        setPayRef]        = useState('');
  const [payError,      setPayError]      = useState('');
  const payKeyRef = useRef(null); // one Idempotency-Key per payment attempt
  const [paySubmitting, setPaySubmitting] = useState(false);

  const [editModal,      setEditModal]      = useState(null);
  const [editForm,       setEditForm]       = useState({ totalAmount: '', dueDate: '', status: 'PENDING' });
  const [editError,      setEditError]      = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [historyFor,     setHistoryFor]     = useState(null);
  const [historyRows,    setHistoryRows]    = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [notifyFor,      setNotifyFor]      = useState(null);
  const [notifyText,     setNotifyText]     = useState('');
  const [notifySending,  setNotifySending]  = useState(false);
  const [notifySent,     setNotifySent]     = useState(null);
  const [notifyError,    setNotifyError]    = useState('');

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
    payKeyRef.current = newIdempotencyKey();
  };

  const submitPay = async (f) => {
    const amount = Number(payAmount);
    if (!amount || amount <= 0) { setPayError('Enter a valid amount.'); return; }
    setPaySubmitting(true);
    setPayError('');
    try {
      if (!payKeyRef.current) payKeyRef.current = newIdempotencyKey();
      await payFee({ feeRecordId: f.id, amount, method: payMethod, reference: payRef || undefined }, payKeyRef.current);
      payKeyRef.current = null; // success: the next payment gets a new key
      setPayModal(null);
    } catch (err) {
      setPayError(errorText(err, 'Payment failed.'));
    } finally {
      setPaySubmitting(false);
    }
  };

  const toggleHistory = async (f) => {
    if (historyFor === f.id) { setHistoryFor(null); return; }
    setHistoryFor(f.id);
    setHistoryLoading(true);
    const rows = await readWithFallback(
      () => feeApi.getPaymentHistory(f.id),
      () => derivePaymentHistory(f.id),
      { label: 'getPaymentHistory' },
    );
    setHistoryRows(rows);
    setHistoryLoading(false);
  };

  const openNotify = (f, student) => {
    setNotifyFor(f.id);
    setNotifySent(null);
    setNotifyError('');
    const pending = f.totalAmount - f.paidAmount;
    setNotifyText(
      `Reminder: ₹${pending.toLocaleString()} is still pending for ${student?.name || 'your child'} ` +
      `(due ${f.dueDate}). Please clear the pending amount to avoid late fees/suspension of services.`,
    );
  };

  const sendNotify = async (f, student) => {
    setNotifySending(true);
    setNotifyError('');
    try {
      let parentIds;
      try {
        const parents = await peopleApi.getStudentParents(student.id);
        parentIds = (parents || []).map(p => p.parentUserId).filter(id => id != null);
      } catch (err) {
        if (!isBackendUnavailable(err)) throw err;
        parentIds = student.parentUserId ? [student.parentUserId] : [];
      }
      if (parentIds.length === 0) { setNotifyError('No linked parent account found for this student.'); return; }
      for (const userId of parentIds) {
        const body = { userId, message: notifyText, link: '/fees' };
        await writeWithApi(
          () => notificationsApi.create(body),
          () => applyCreateNotification(body),
          { label: 'createNotification' },
        );
      }
      setNotifySent(f.id);
      setNotifyFor(null);
    } catch (err) {
      setNotifyError(errorText(err, 'Failed to send notification.'));
    } finally {
      setNotifySending(false);
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
      setEditError(errorText(err, 'Update failed.'));
    } finally {
      setEditSubmitting(false);
    }
  };

  const studentsMissingRecord = allStudents.filter(
    s => !fees.some(f => f.studentId === s.id && f.academicYear === createForm.academicYear),
  );

  const openCreate = () => {
    setShowCreate(true);
    setCreateError('');
    setCreateForm({ studentId: '', academicYear: currentAcademicYear(), totalAmount: '', dueDate: '' });
  };

  const selectCreateStudent = (studentId) => {
    const student = allStudents.find(s => s.id === Number(studentId));
    const cls = classes.find(c => c.id === student?.classId);
    setCreateForm(f => ({ ...f, studentId, totalAmount: cls?.feeAmount ?? f.totalAmount }));
  };

  const submitCreate = async () => {
    if (!createForm.studentId || !createForm.academicYear.trim() || !createForm.totalAmount || !createForm.dueDate) {
      setCreateError('All fields are required.');
      return;
    }
    setCreateSubmitting(true);
    setCreateError('');
    try {
      await addFeeRecord({
        studentId: Number(createForm.studentId),
        academicYear: createForm.academicYear.trim(),
        totalAmount: Number(createForm.totalAmount),
        dueDate: createForm.dueDate,
      });
      setShowCreate(false);
    } catch (err) {
      setCreateError(errorText(err, 'Failed to create fee record.'));
    } finally {
      setCreateSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Fees &amp; Accounts</h1>
          <p>Manage fee collection and payment records</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => (showCreate ? setShowCreate(false) : openCreate())}>
            {showCreate ? 'Cancel' : '+ Add Fee Record'}
          </button>
        )}
      </div>

      {showCreate && (
        <div className="card mb-20">
          <div className="card-header"><div className="card-title">New Fee Record</div></div>
          <div className="card-body">
            {createError && <div className="alert alert-danger mb-12">{createError}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Student *</label>
                <select className="form-control" value={createForm.studentId} onChange={e => selectCreateStudent(e.target.value)}>
                  <option value="">Select student…</option>
                  {studentsMissingRecord.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {createForm.studentId && studentsMissingRecord.length === 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Every student already has a {createForm.academicYear} record.
                  </div>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">Academic Year *</label>
                <input className="form-control" value={createForm.academicYear}
                  onChange={e => setCreateForm(f => ({ ...f, academicYear: e.target.value }))} placeholder="e.g. 2026-27" />
              </div>
              <div className="form-group">
                <label className="form-label">Total Amount (₹) *</label>
                <input type="number" className="form-control" min="0" step="0.01" value={createForm.totalAmount}
                  onChange={e => setCreateForm(f => ({ ...f, totalAmount: e.target.value }))} placeholder="Auto-filled from class fee" />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input type="date" className="form-control" value={createForm.dueDate}
                  onChange={e => setCreateForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-primary" onClick={submitCreate} disabled={createSubmitting}>
                {createSubmitting ? 'Creating…' : 'Create Record'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
                <th>Student</th><th>Academic Year</th><th>Class Fee</th><th>Total</th><th>Paid</th>
                <th>Due Date</th><th>Status</th>
                {hasActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const s = allStudents.find(st => st.id === f.studentId);
                const cls = classes.find(c => c.id === s?.classId);
                return (
                  <tr key={f.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ProfileAvatar image={s?.profileImage} gender={s?.gender} role="student" size={28} />
                        {s?.name || `Student #${f.studentId}`}
                      </div>
                    </td>
                    <td>{f.academicYear}</td>
                    <td style={{ fontSize: 12 }}>{cls ? `₹${cls.feeAmount?.toLocaleString() ?? '—'} (Class ${cls.name})` : '—'}</td>
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
                          <button className="btn btn-ghost btn-sm" onClick={() => toggleHistory(f)}>
                            {historyFor === f.id ? 'Hide History' : 'History'}
                          </button>
                          {f.status !== 'PAID' && (
                            <button className="btn btn-ghost btn-sm" onClick={() => openNotify(f, s)}>Notify Parent</button>
                          )}
                        </div>

                        {notifySent === f.id && (
                          <div className="alert-success mt-8" style={{ fontSize: 12 }}>Notification sent to parent.</div>
                        )}

                        {notifyFor === f.id && (
                          <div className="card mt-8" style={{ padding: 12 }}>
                            {notifyError && <div className="alert alert-danger mb-8" style={{ fontSize: 12 }}>{notifyError}</div>}
                            {!s ? (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Student not found.</div>
                            ) : (
                              <>
                                <textarea className="form-control mb-8" rows={3} value={notifyText} onChange={e => setNotifyText(e.target.value)} />
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <button className="btn btn-primary btn-sm" disabled={notifySending} onClick={() => sendNotify(f, s)}>
                                    {notifySending ? 'Sending…' : 'Send'}
                                  </button>
                                  <button className="btn btn-ghost btn-sm" onClick={() => setNotifyFor(null)}>Cancel</button>
                                </div>
                              </>
                            )}
                          </div>
                        )}

                        {historyFor === f.id && (
                          <div className="card mt-8" style={{ padding: 12 }}>
                            {historyLoading ? (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading…</div>
                            ) : historyRows.length === 0 ? (
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No payments recorded yet.</div>
                            ) : (
                              <table style={{ width: '100%' }}>
                                <thead><tr><th style={{ fontSize: 11 }}>Date</th><th style={{ fontSize: 11 }}>Amount</th><th style={{ fontSize: 11 }}>Method</th><th style={{ fontSize: 11 }}>Reference</th></tr></thead>
                                <tbody>
                                  {historyRows.map(p => (
                                    <tr key={p.id}>
                                      <td style={{ fontSize: 12 }}>{new Date(p.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                      <td style={{ fontSize: 12, fontWeight: 600 }}>₹{Number(p.amount).toLocaleString()}</td>
                                      <td style={{ fontSize: 12 }}>{METHOD_LABELS[p.method] || p.method}</td>
                                      <td style={{ fontSize: 12 }}>{p.reference || '—'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}

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
                <tr><td colSpan={hasActions ? 8 : 7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No fee records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
