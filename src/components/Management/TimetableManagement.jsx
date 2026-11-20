import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import * as timetableApi from '../../api/timetableApi';
import { readWithFallback, writeWithApi } from '../../api/mockFallback';
import { errorText } from '../../utils/apiError';
import {
  deriveClassTimetableAll, derivePendingClassIds,
  applySaveTimetableSlot, applyDeleteTimetableSlot,
  applySubmitClassTimetable, applyApproveClassTimetable, applyRejectClassTimetable,
} from '../../data/mockStore';

const DAY_ORDER = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer', 'PE', 'Drawing'];
const STATUS_BADGE = { draft: 'gray', pending_approval: 'warning', approved: 'success' };
const STATUS_LABEL = { draft: 'Draft', pending_approval: 'Pending Approval', approved: 'Approved' };

function dayLabel(d) { return d.charAt(0) + d.slice(1).toLowerCase(); }
// Backend sends times as HH:mm:ss; show/edit HH:mm.
function hhmm(t) { return typeof t === 'string' ? t.slice(0, 5) : t; }

/* ── Slot add/edit form ───────────────────────────────────────── */
function SlotForm({ classId, teachers, initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial
    ? { ...initial, startTime: hhmm(initial.startTime), endTime: hhmm(initial.endTime) }
    : { dayOfWeek: 'MONDAY', periodNumber: 1, startTime: '08:00', endTime: '08:45', subject: '', teacherStaffId: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.subject || !form.teacherStaffId || !form.startTime || !form.endTime) return;
    onSave({
      ...form,
      id: initial?.id,
      classId,
      periodNumber: Number(form.periodNumber),
      teacherStaffId: Number(form.teacherStaffId),
    });
  };

  return (
    <div className="card mb-12" style={{ padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="form-control" style={{ width: 120 }} value={form.dayOfWeek} onChange={e => set('dayOfWeek', e.target.value)}>
          {DAY_ORDER.map(d => <option key={d} value={d}>{dayLabel(d)}</option>)}
        </select>
        <input type="number" className="form-control" style={{ width: 70 }} min="1" placeholder="Period"
          value={form.periodNumber} onChange={e => set('periodNumber', e.target.value)} />
        <input type="time" className="form-control" style={{ width: 110 }} value={form.startTime} onChange={e => set('startTime', e.target.value)} />
        <input type="time" className="form-control" style={{ width: 110 }} value={form.endTime} onChange={e => set('endTime', e.target.value)} />
        <select className="form-control" style={{ width: 140 }} value={form.subject} onChange={e => set('subject', e.target.value)}>
          <option value="">Subject…</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="form-control" style={{ width: 170 }} value={form.teacherStaffId} onChange={e => set('teacherStaffId', e.target.value)}>
          <option value="">Teacher…</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={submit}>Save</button>
        <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* ── Headmaster: draft/edit a class's weekly timetable ──────────── */
function TimetableEditor() {
  const { classes } = useData();
  const { allStaff } = useAuth();
  const teachers = allStaff.filter(u => u.role === 'teacher');

  const [classId,    setClassId]    = useState(null);
  const [slots,      setSlots]      = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [editing,    setEditing]    = useState(null); // null | 'new' | slot object
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => { if (classes.length && classId === null) setClassId(classes[0].id); }, [classes, classId]);

  const load = useCallback(() => {
    if (classId == null) return;
    setLoading(true);
    readWithFallback(
      () => timetableApi.getClassTimetable(classId),
      () => deriveClassTimetableAll(classId),
      { label: 'getClassTimetableAll' },
    ).then(setSlots).finally(() => setLoading(false));
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  const saveSlot = async (slot) => {
    setError('');
    try {
      await writeWithApi(
        () => (slot.id ? timetableApi.updateTimetableSlot(slot.id, slot) : timetableApi.createTimetableSlot(slot)),
        () => applySaveTimetableSlot(slot),
        { label: 'saveTimetableSlot' },
      );
      setEditing(null);
      load();
    } catch (err) {
      setError(errorText(err, 'Failed to save period.'));
    }
  };

  const removeSlot = async (id) => {
    setError('');
    try {
      await writeWithApi(
        () => timetableApi.deleteTimetableSlot(id),
        () => applyDeleteTimetableSlot(id),
        { label: 'deleteTimetableSlot' },
      );
      load();
    } catch (err) {
      setError(errorText(err, 'Failed to delete period.'));
    }
  };

  const submitForApproval = async () => {
    setSubmitting(true);
    setError('');
    try {
      await writeWithApi(
        () => timetableApi.submitClassTimetable(classId),
        () => applySubmitClassTimetable(classId),
        { label: 'submitClassTimetable' },
      );
      load();
    } catch (err) {
      setError(errorText(err, 'Failed to submit timetable.'));
    } finally {
      setSubmitting(false);
    }
  };

  const draftCount = slots.filter(s => s.status === 'draft').length;
  const pendingCount = slots.filter(s => s.status === 'pending_approval').length;
  const rejected = slots.find(s => s.rejectionNote);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Timetable Builder</h1>
          <p>Draft the weekly schedule, then submit it to the Principal for approval</p>
        </div>
        <div className="page-header-actions" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select className="form-control" style={{ width: 110 }} value={classId ?? ''} onChange={e => setClassId(Number(e.target.value))}>
            {classes.map(c => <option key={c.id} value={c.id}>Class {c.name}</option>)}
          </select>
          <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>+ Add Period</button>
          {draftCount > 0 && (
            <button className="btn btn-success btn-sm" disabled={submitting} onClick={submitForApproval}>
              {submitting ? 'Submitting…' : `Submit ${draftCount} for Approval`}
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-danger mb-12">{error}</div>}
      {pendingCount > 0 && <div className="alert alert-warning mb-12">{pendingCount} period(s) awaiting Principal approval.</div>}
      {rejected && <div className="alert alert-danger mb-12">A previous submission was rejected: {rejected.rejectionNote}</div>}

      {editing && (
        <SlotForm
          classId={classId}
          teachers={teachers}
          initial={editing === 'new' ? null : editing}
          onSave={saveSlot}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="card">
        <div className="card-body">
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</p>
          ) : DAY_ORDER.map(day => {
            const daySlots = slots.filter(s => s.dayOfWeek === day).sort((a, b) => a.periodNumber - b.periodNumber);
            if (daySlots.length === 0) return null;
            return (
              <div key={day} style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{dayLabel(day)}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {daySlots.map(s => {
                    const teacher = teachers.find(t => t.id === s.teacherStaffId);
                    return (
                      <div key={s.id} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', minWidth: 170 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{s.subject}</div>
                          <span className={`badge badge-${STATUS_BADGE[s.status] || 'gray'}`} style={{ fontSize: 9 }}>{STATUS_LABEL[s.status] || s.status}</span>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{hhmm(s.startTime)}–{hhmm(s.endTime)} · {teacher?.name || '—'}</div>
                        <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => setEditing(s)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px', fontSize: 11, color: 'var(--danger)' }} onClick={() => removeSlot(s.id)}>Delete</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {!loading && slots.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No periods added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Principal: review and approve/reject a Headmaster's draft ──── */
function TimetableApprovals() {
  const { classes } = useData();
  const { allStaff } = useAuth();
  const teachers = allStaff.filter(u => u.role === 'teacher');

  const [pendingIds,   setPendingIds]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [expanded,     setExpanded]     = useState(null);
  const [slotsByClass, setSlotsByClass] = useState({});
  const [rejectNote,   setRejectNote]   = useState('');
  const [error,        setError]        = useState('');

  const load = useCallback(() => {
    setLoading(true);
    readWithFallback(
      () => timetableApi.listPendingApproval(),
      () => derivePendingClassIds(),
      { label: 'listPendingApproval' },
    ).then(setPendingIds).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const expand = async (classId) => {
    if (expanded === classId) { setExpanded(null); return; }
    setExpanded(classId);
    const slots = await readWithFallback(
      () => timetableApi.getClassTimetable(classId),
      () => deriveClassTimetableAll(classId),
      { label: 'getClassTimetableAll' },
    );
    setSlotsByClass(p => ({ ...p, [classId]: slots }));
  };

  const approve = async (classId) => {
    setError('');
    try {
      await writeWithApi(
        () => timetableApi.approveClassTimetable(classId),
        () => applyApproveClassTimetable(classId),
        { label: 'approveClassTimetable' },
      );
      setExpanded(null);
      setSlotsByClass(p => { const n = { ...p }; delete n[classId]; return n; });
      load();
    } catch (err) {
      setError(errorText(err, 'Failed to approve timetable.'));
    }
  };

  const reject = async (classId) => {
    if (!rejectNote.trim()) return;
    setError('');
    try {
      await writeWithApi(
        () => timetableApi.rejectClassTimetable(classId, rejectNote.trim()),
        () => applyRejectClassTimetable(classId, rejectNote),
        { label: 'rejectClassTimetable' },
      );
      setRejectNote('');
      setExpanded(null);
      setSlotsByClass(p => { const n = { ...p }; delete n[classId]; return n; });
      load();
    } catch (err) {
      setError(errorText(err, 'Failed to reject timetable.'));
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Timetable Approvals</h1>
          <p>{pendingIds.length} class timetable{pendingIds.length === 1 ? '' : 's'} awaiting your approval</p>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-12">{error}</div>}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</p>
      ) : pendingIds.length === 0 ? (
        <div className="card"><div className="card-body" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Nothing pending approval.</div></div>
      ) : pendingIds.map(classId => {
        const cls = classes.find(c => c.id === classId);
        const slots = slotsByClass[classId] || [];
        const pendingSlots = slots.filter(s => s.status === 'pending_approval');
        return (
          <div key={classId} className="card mb-12">
            <div className="card-header">
              <div className="card-title">Class {cls?.name || classId}</div>
              <button className="btn btn-ghost btn-sm" onClick={() => expand(classId)}>{expanded === classId ? 'Hide' : 'Review'}</button>
            </div>
            {expanded === classId && (
              <div className="card-body">
                <div className="table-wrapper mb-12">
                  <table>
                    <thead><tr><th>Day</th><th>Period</th><th>Time</th><th>Subject</th><th>Teacher</th></tr></thead>
                    <tbody>
                      {pendingSlots.map(s => {
                        const t = teachers.find(te => te.id === s.teacherStaffId);
                        return (
                          <tr key={s.id}>
                            <td style={{ fontSize: 12 }}>{dayLabel(s.dayOfWeek)}</td>
                            <td style={{ fontSize: 12 }}>{s.periodNumber}</td>
                            <td style={{ fontSize: 12 }}>{hhmm(s.startTime)}–{hhmm(s.endTime)}</td>
                            <td style={{ fontSize: 12, fontWeight: 600 }}>{s.subject}</td>
                            <td style={{ fontSize: 12 }}>{t?.name || '—'}</td>
                          </tr>
                        );
                      })}
                      {pendingSlots.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 16 }}>No pending periods for this class.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-success btn-sm" onClick={() => approve(classId)}>Approve</button>
                  <input className="form-control" style={{ width: 220 }} placeholder="Rejection note (required)"
                    value={rejectNote} onChange={e => setRejectNote(e.target.value)} />
                  <button className="btn btn-danger btn-sm" disabled={!rejectNote.trim()} onClick={() => reject(classId)}>Reject</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function TimetableManagement() {
  const { currentUser } = useAuth();
  return currentUser?.role === 'principal' ? <TimetableApprovals /> : <TimetableEditor />;
}
