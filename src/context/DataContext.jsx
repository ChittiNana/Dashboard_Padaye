import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as classesApi from '../api/classesApi';
import * as academicsApi from '../api/academicsApi';
import * as feeApi from '../api/feeApi';
import * as communicationApi from '../api/communicationApi';
import * as configApi from '../api/configApi';
import * as countsApi from '../api/countsApi';
import { readWithFallback, writeThroughMock, writeWithApi } from '../api/mockFallback';
import { listTable, insertRecord, updateRecord, deleteRecord, applyPayFee, applyUpdateSchoolInfo } from '../data/mockStore';
import { errorText } from '../utils/apiError';

const DataContext = createContext(null);

// Live school info: every field is null until loaded from the backend (UI shows 'N/A').
const EMPTY_SCHOOL_INFO = {
  name: null, established: null, address: null, phone: null, email: null, website: null,
  affiliation: null, motto: null, principalName: null,
  totalStudents: null, totalStaff: null, totalClasses: null,
};

const CLASSES_VISIBLE_ROLES   = ['principal', 'headmaster', 'teacher', 'accountant', 'support_staff'];
const EXAMS_VISIBLE_ROLES     = ['student', 'teacher', 'principal', 'headmaster'];
const HOMEWORK_VISIBLE_ROLES  = ['student', 'parent', 'teacher'];
const NOTES_VISIBLE_ROLES     = ['student', 'teacher'];
const RESULTS_VISIBLE_ROLES   = ['teacher', 'principal', 'headmaster'];
const FEES_VISIBLE_ROLES      = ['principal', 'accountant'];
const MESSAGES_VISIBLE_ROLES  = ['teacher', 'parent', 'principal', 'headmaster'];

export function DataProvider({ children }) {
  const { currentUser } = useAuth();
  const [classes,        setClasses]        = useState([]);
  const [exams,          setExams]          = useState([]);
  const [announcements,  setAnnouncements]  = useState([]);
  const [holidays,       setHolidays]       = useState([]);
  const [fees,           setFees]           = useState([]);
  const [homework,       setHomework]       = useState([]);
  const [notes,          setNotes]          = useState([]);
  const [results,        setResults]        = useState([]);
  const [messages,       setMessages]       = useState([]);
  const [directoryUsers, setDirectoryUsers] = useState([]);
  const [subjects,       setSubjects]       = useState([]);
  const [schoolInfo,     setSchoolInfo]     = useState(EMPTY_SCHOOL_INFO);

  // ── School info + live counts (public — needed on the pre-login screens too) ──
  // No mock fallback: any failed/missing value stays null and the UI shows 'N/A'.
  useEffect(() => {
    let active = true;
    (async () => {
      const results = await Promise.allSettled([
        configApi.getSchoolInfo(),
        countsApi.getStudentCount(),
        countsApi.getStaffCount(),
        countsApi.getClassCount(),
      ]);
      results.forEach(r => {
        if (r.status === 'rejected') console.debug('[school info/counts] load failed:', r.reason);
      });
      if (!active) return;
      const [infoR, stuR, staffR, clsR] = results;
      const info = infoR.status === 'fulfilled' && infoR.value && typeof infoR.value === 'object' ? infoR.value : {};
      const num = (r) => (r.status === 'fulfilled' && typeof r.value === 'number' ? r.value : null);
      const next = { ...EMPTY_SCHOOL_INFO };
      Object.keys(EMPTY_SCHOOL_INFO).forEach(k => { next[k] = info[k] ?? null; });
      next.totalStudents = num(stuR);
      next.totalStaff = num(staffR);
      next.totalClasses = num(clsR);
      setSchoolInfo(next);
    })();
    return () => { active = false; };
  }, []);

  const updateSchoolInfo = async (patch) => {
    const { result, real } = await writeWithApi(
      () => configApi.updateSchoolInfo(patch),
      () => applyUpdateSchoolInfo(patch),
      { label: 'updateSchoolInfo' },
    );
    const updated = real ? { ...patch, ...(result || {}) } : result;
    setSchoolInfo(prev => ({
      ...prev,
      ...updated,
      totalStudents: prev.totalStudents,
      totalStaff: prev.totalStaff,
      totalClasses: prev.totalClasses,
    }));
    return updated;
  };

  // ── Classes ──────────────────────────────────────────────────────────────────
  const loadClasses = useCallback(async () => {
    if (!currentUser || !CLASSES_VISIBLE_ROLES.includes(currentUser.role)) {
      setClasses([]);
      return;
    }
    setClasses(await readWithFallback(
      () => classesApi.listClasses(),
      () => listTable('classes'),
      { label: 'listClasses' },
    ));
  }, [currentUser]);

  useEffect(() => { loadClasses(); }, [loadClasses]);

  // ── Subjects (school-wide static config — visible to any signed-in role) ─────
  const loadSubjects = useCallback(async () => {
    if (!currentUser) { setSubjects([]); return; }
    setSubjects(await readWithFallback(
      () => configApi.listSubjects(),
      () => listTable('subjects'),
      { label: 'listSubjects' },
    ));
  }, [currentUser]);

  useEffect(() => { loadSubjects(); }, [loadSubjects]);

  const addSubject = async (name) => {
    const { result } = await writeWithApi(
      () => configApi.createSubject({ name }),
      () => insertRecord('subjects', { name }),
      { label: 'addSubject' },
    );
    setSubjects(p => [...p, result]);
    return result;
  };

  const deleteSubject = async (id) => {
    await writeWithApi(
      () => configApi.deleteSubject(id),
      () => deleteRecord('subjects', id),
      { label: 'deleteSubject' },
    );
    setSubjects(p => p.filter(s => s.id !== id));
    return true;
  };

  const addClass = async (d) => {
    const gradeLevel = Number(d.grade);
    if (!Number.isFinite(gradeLevel) || gradeLevel < 1) throw new Error('Grade level must be 1 or higher.');
    if (!String(d.section ?? '').trim()) throw new Error('Section is required.');
    const { result } = await writeWithApi(
      () => classesApi.createClass({
        name: d.name,
        gradeLevel: d.grade,
        section: d.section,
        classTeacherStaffId: d.classTeacherId || null,
        feeAmount: d.feeAmount != null ? Number(d.feeAmount) : null,
      }),
      () => insertRecord('classes', {
        name: d.name,
        gradeLevel: d.grade,
        section: d.section,
        classTeacherStaffId: d.classTeacherId || null,
        feeAmount: d.feeAmount != null ? Number(d.feeAmount) : null,
        active: true,
      }),
      { label: 'addClass' },
    );
    setClasses(p => [...p, result]);
    return result;
  };

  const updateClass = async (id, d) => {
    const current = classes.find(c => c.id === id);
    const body = {
      name: d.name ?? current?.name,
      gradeLevel: d.grade ?? current?.gradeLevel,
      section: d.section ?? current?.section,
      classTeacherStaffId: (d.classTeacherId ?? current?.classTeacherStaffId) || null,
      feeAmount: d.feeAmount != null ? Number(d.feeAmount) : (current?.feeAmount ?? null),
      active: d.active ?? current?.active ?? true,
    };
    const { result } = await writeWithApi(
      () => classesApi.updateClass(id, body),
      () => updateRecord('classes', id, body),
      { label: 'updateClass' },
    );
    setClasses(p => p.map(c => c.id === id ? result : c));
    return result;
  };

  const deleteClass = async (id) => {
    const current = classes.find(c => c.id === id);
    if (!current) return null;
    const { result } = await writeWithApi(
      () => classesApi.updateClass(id, {
        name: current.name,
        gradeLevel: current.gradeLevel,
        section: current.section,
        classTeacherStaffId: current.classTeacherStaffId,
        feeAmount: current.feeAmount,
        active: false,
      }),
      () => updateRecord('classes', id, { active: false }),
      { label: 'deleteClass' },
    );
    setClasses(p => p.map(c => c.id === id ? result : c));
    return result;
  };

  // ── Exams ─────────────────────────────────────────────────────────────────────
  const loadExams = useCallback(async () => {
    if (!currentUser || !EXAMS_VISIBLE_ROLES.includes(currentUser.role)) {
      setExams([]);
      return;
    }
    setExams(await readWithFallback(
      () => academicsApi.listExams(),
      () => listTable('exams'),
      { label: 'listExams' },
    ));
  }, [currentUser]);

  useEffect(() => { loadExams(); }, [loadExams]);

  const addExam = async (d) => {
    if (!(Number(d.maxMarks) > 0)) throw new Error('Max marks must be greater than 0.');
    const { result } = await writeWithApi(
      () => academicsApi.createExam(d),
      () => insertRecord('exams', d),
      { label: 'addExam' },
    );
    setExams(p => [...p, result]);
    return result;
  };

  // ── Announcements ─────────────────────────────────────────────────────────────
  const loadAnnouncements = useCallback(async () => {
    if (!currentUser) {
      setAnnouncements([]);
      return;
    }
    setAnnouncements(await readWithFallback(
      () => communicationApi.listNotices(),
      () => listTable('notices'),
      { label: 'listNotices' },
    ));
  }, [currentUser]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const addAnnouncement = async (d) => {
    try {
      const { result } = await writeWithApi(
        () => communicationApi.createNotice(d),
        () => insertRecord('notices', d),
        { label: 'addAnnouncement' },
      );
      setAnnouncements(p => [result, ...p]);
      return result;
    } catch (err) { throw new Error(errorText(err, 'Failed to save notice.')); }
  };
  const updateAnnouncement = async (id, d) => {
    try {
      const { result } = await writeWithApi(
        () => communicationApi.updateNotice(id, d),
        () => updateRecord('notices', id, d),
        { label: 'updateAnnouncement' },
      );
      setAnnouncements(p => p.map(a => a.id === id ? result : a));
      return result;
    } catch (err) { throw new Error(errorText(err, 'Failed to save notice.')); }
  };
  const deleteAnnouncement = async (id) => {
    try {
      await writeWithApi(
        () => communicationApi.deleteNotice(id),
        () => deleteRecord('notices', id),
        { label: 'deleteAnnouncement' },
      );
      setAnnouncements(p => p.filter(a => a.id !== id));
    } catch (err) { throw new Error(errorText(err, 'Failed to delete notice.')); }
  };

  // ── Holidays (client-side only — no backend module exists) ───────────────────
  useEffect(() => { setHolidays(listTable('holidays')); }, []);

  const addHoliday = (d) => writeThroughMock(
    () => {
      const created = insertRecord('holidays', d);
      setHolidays(p => [...p, created]);
      return created;
    },
    () => Promise.resolve(),
    { label: 'addHoliday' },
  );
  const deleteHoliday = (id) => writeThroughMock(
    () => {
      deleteRecord('holidays', id);
      setHolidays(p => p.filter(h => h.id !== id));
    },
    () => Promise.resolve(),
    { label: 'deleteHoliday' },
  );

  // ── Directory (client-side only — login identities for message sender/recipient display) ──
  useEffect(() => { setDirectoryUsers(listTable('users')); }, []);

  // ── Messages (client-side only — no backend module exists) ───────────────────
  const loadMessages = useCallback(() => {
    if (!currentUser || !MESSAGES_VISIBLE_ROLES.includes(currentUser.role)) {
      setMessages([]);
      return;
    }
    setMessages(listTable('messages'));
  }, [currentUser]);

  useEffect(() => { loadMessages(); }, [loadMessages]);

  const addMessage = (d) => writeThroughMock(
    () => {
      const created = insertRecord('messages', {
        ...d,
        date: d.date || new Date().toISOString().slice(0, 10),
        read: false,
      });
      setMessages(p => [...p, created]);
      return created;
    },
    () => Promise.resolve(),
    { label: 'addMessage' },
  );

  // ── Fees ──────────────────────────────────────────────────────────────────────
  const loadFees = useCallback(async () => {
    if (!currentUser || !FEES_VISIBLE_ROLES.includes(currentUser.role)) {
      setFees([]);
      return;
    }
    setFees(await readWithFallback(
      () => feeApi.listFeeRecords(),
      () => listTable('fees'),
      { label: 'listFeeRecords' },
    ));
  }, [currentUser]);

  useEffect(() => { loadFees(); }, [loadFees]);

  const addFeeRecord = async (d) => {
    const body = { ...d, totalAmount: Math.round(Number(d.totalAmount) * 100) / 100 };
    try {
      const { result } = await writeWithApi(
        () => feeApi.createFeeRecord(body),
        () => insertRecord('fees', {
          studentId: body.studentId,
          academicYear: body.academicYear,
          totalAmount: body.totalAmount,
          paidAmount: 0,
          dueDate: body.dueDate,
          status: 'PENDING',
        }),
        { label: 'addFeeRecord' },
      );
      setFees(p => [...p, result]);
      return result;
    } catch (err) { throw new Error(errorText(err, 'Failed to create fee record.')); }
  };

  // idempotencyKey: one key per payment attempt (reuse it when retrying the same attempt).
  const payFee = async (d, idempotencyKey) => {
    try {
      const { result, real } = await writeWithApi(
        () => feeApi.payFee(d, idempotencyKey),
        () => applyPayFee(d),
        { label: 'payFee' },
      );
      if (real) await loadFees(); // balances/status come from the server
      else if (result) setFees(p => p.map(f => f.id === result.id ? result : f));
      return result;
    } catch (err) { throw new Error(errorText(err, 'Payment failed.')); }
  };
  const updateFeeRecord = async (id, d) => {
    try {
      const { result } = await writeWithApi(
        () => feeApi.updateFeeRecord(id, d),
        () => updateRecord('fees', id, d),
        { label: 'updateFeeRecord' },
      );
      setFees(p => p.map(f => f.id === id ? result : f));
      return result;
    } catch (err) { throw new Error(errorText(err, 'Update failed.')); }
  };

  // ── Homework ──────────────────────────────────────────────────────────────────
  const loadHomework = useCallback(async () => {
    if (!currentUser || !HOMEWORK_VISIBLE_ROLES.includes(currentUser.role)) {
      setHomework([]);
      return;
    }
    setHomework(await readWithFallback(
      () => academicsApi.listHomework(),
      () => listTable('homework'),
      { label: 'listHomework' },
    ));
  }, [currentUser]);

  useEffect(() => { loadHomework(); }, [loadHomework]);

  const addHomework = async (d) => {
    // createdByStaffId is set by the backend from the signed-in user; only the local mock needs it.
    // eslint-disable-next-line no-unused-vars
    const { createdByStaffId, ...apiBody } = d;
    const { result } = await writeWithApi(
      () => academicsApi.createHomework(apiBody),
      () => insertRecord('homework', d),
      { label: 'addHomework' },
    );
    setHomework(p => [...p, result]);
    return result;
  };

  // ── Notes ─────────────────────────────────────────────────────────────────────
  const loadNotes = useCallback(async () => {
    if (!currentUser || !NOTES_VISIBLE_ROLES.includes(currentUser.role)) {
      setNotes([]);
      return;
    }
    setNotes(await readWithFallback(
      () => academicsApi.listNotes(),
      () => listTable('notes'),
      { label: 'listNotes' },
    ));
  }, [currentUser]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const addNote = async (d) => {
    if (!String(d.fileUrl ?? '').trim()) throw new Error('A file URL is required.');
    const { result } = await writeWithApi(
      () => academicsApi.createNote(d),
      () => insertRecord('notes', d),
      { label: 'addNote' },
    );
    setNotes(p => [...p, result]);
    return result;
  };

  // ── Results ───────────────────────────────────────────────────────────────────
  const loadResults = useCallback(async () => {
    if (!currentUser || !RESULTS_VISIBLE_ROLES.includes(currentUser.role)) {
      setResults([]);
      return;
    }
    setResults(await readWithFallback(
      () => academicsApi.listResults(),
      () => listTable('results'),
      { label: 'listResults' },
    ));
  }, [currentUser]);

  useEffect(() => { loadResults(); }, [loadResults]);

  const addResult = async (d) => {
    const { result } = await writeWithApi(
      () => academicsApi.createResult(d),
      () => insertRecord('results', d),
      { label: 'addResult' },
    );
    setResults(p => [...p, result]);
    return result;
  };

  return (
    <DataContext.Provider value={{
      classes, exams, announcements, holidays, fees, schoolInfo,
      homework, notes, results, messages, directoryUsers, subjects,
      addClass, updateClass, deleteClass,
      addSubject, deleteSubject,
      updateSchoolInfo,
      addExam,
      addAnnouncement, updateAnnouncement, deleteAnnouncement,
      addHoliday, deleteHoliday,
      addFeeRecord, payFee, updateFeeRecord,
      addHomework,
      addNote,
      addResult,
      addMessage,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
