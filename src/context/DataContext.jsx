import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as classesApi from '../api/classesApi';
import * as academicsApi from '../api/academicsApi';
import * as feeApi from '../api/feeApi';
import * as communicationApi from '../api/communicationApi';
import { readWithFallback, writeThroughMock } from '../api/mockFallback';
import { listTable, insertRecord, updateRecord, deleteRecord, applyPayFee } from '../data/mockStore';

const DataContext = createContext(null);

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

  const addClass = (d) => writeThroughMock(
    () => {
      const created = insertRecord('classes', {
        name: d.name,
        gradeLevel: d.grade,
        section: d.section,
        classTeacherStaffId: d.classTeacherId || null,
        active: true,
      });
      setClasses(p => [...p, created]);
      return created;
    },
    () => classesApi.createClass({
      name: d.name,
      gradeLevel: d.grade,
      section: d.section,
      classTeacherStaffId: d.classTeacherId || null,
    }),
    { label: 'addClass' },
  );

  const updateClass = (id, d) => writeThroughMock(
    () => {
      const current = classes.find(c => c.id === id);
      const updated = updateRecord('classes', id, {
        name: d.name ?? current?.name,
        gradeLevel: d.grade ?? current?.gradeLevel,
        section: d.section ?? current?.section,
        classTeacherStaffId: (d.classTeacherId ?? current?.classTeacherStaffId) || null,
        active: d.active ?? current?.active ?? true,
      });
      setClasses(p => p.map(c => c.id === id ? updated : c));
      return updated;
    },
    () => {
      const current = classes.find(c => c.id === id);
      return classesApi.updateClass(id, {
        name: d.name ?? current?.name,
        gradeLevel: d.grade ?? current?.gradeLevel,
        section: d.section ?? current?.section,
        classTeacherStaffId: (d.classTeacherId ?? current?.classTeacherStaffId) || null,
        active: d.active ?? current?.active ?? true,
      });
    },
    { label: 'updateClass' },
  );

  const deleteClass = (id) => writeThroughMock(
    () => {
      const current = classes.find(c => c.id === id);
      if (!current) return null;
      const updated = updateRecord('classes', id, { active: false });
      setClasses(p => p.map(c => c.id === id ? updated : c));
      return updated;
    },
    () => {
      const current = classes.find(c => c.id === id);
      if (!current) return null;
      return classesApi.updateClass(id, {
        name: current.name,
        gradeLevel: current.gradeLevel,
        section: current.section,
        classTeacherStaffId: current.classTeacherStaffId,
        active: false,
      });
    },
    { label: 'deleteClass' },
  );

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

  const addExam = (d) => writeThroughMock(
    () => {
      const created = insertRecord('exams', d);
      setExams(p => [...p, created]);
      return created;
    },
    () => academicsApi.createExam(d),
    { label: 'addExam' },
  );

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

  const addAnnouncement = (d) => writeThroughMock(
    () => {
      const created = insertRecord('notices', d);
      setAnnouncements(p => [created, ...p]);
      return created;
    },
    () => communicationApi.createNotice(d),
    { label: 'addAnnouncement' },
  );
  const updateAnnouncement = (id, d) => writeThroughMock(
    () => {
      const updated = updateRecord('notices', id, d);
      setAnnouncements(p => p.map(a => a.id === id ? updated : a));
      return updated;
    },
    () => communicationApi.updateNotice(id, d),
    { label: 'updateAnnouncement' },
  );
  const deleteAnnouncement = (id) => writeThroughMock(
    () => {
      deleteRecord('notices', id);
      setAnnouncements(p => p.filter(a => a.id !== id));
    },
    () => communicationApi.deleteNotice(id),
    { label: 'deleteAnnouncement' },
  );

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

  const payFee = (d) => writeThroughMock(
    () => {
      const updated = applyPayFee(d);
      if (updated) setFees(p => p.map(f => f.id === updated.id ? updated : f));
      return updated;
    },
    () => feeApi.payFee(d),
    { label: 'payFee' },
  );
  const updateFeeRecord = (id, d) => writeThroughMock(
    () => {
      const updated = updateRecord('fees', id, d);
      setFees(p => p.map(f => f.id === id ? updated : f));
      return updated;
    },
    () => feeApi.updateFeeRecord(id, d),
    { label: 'updateFeeRecord' },
  );

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

  const addHomework = (d) => writeThroughMock(
    () => {
      const created = insertRecord('homework', d);
      setHomework(p => [...p, created]);
      return created;
    },
    () => academicsApi.createHomework(d),
    { label: 'addHomework' },
  );

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

  const addNote = (d) => writeThroughMock(
    () => {
      const created = insertRecord('notes', d);
      setNotes(p => [...p, created]);
      return created;
    },
    () => academicsApi.createNote(d),
    { label: 'addNote' },
  );

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

  const addResult = (d) => writeThroughMock(
    () => {
      const created = insertRecord('results', d);
      setResults(p => [...p, created]);
      return created;
    },
    () => academicsApi.createResult(d),
    { label: 'addResult' },
  );

  return (
    <DataContext.Provider value={{
      classes, exams, announcements, holidays, fees,
      homework, notes, results, messages, directoryUsers,
      addClass, updateClass, deleteClass,
      addExam,
      addAnnouncement, updateAnnouncement, deleteAnnouncement,
      addHoliday, deleteHoliday,
      payFee, updateFeeRecord,
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
