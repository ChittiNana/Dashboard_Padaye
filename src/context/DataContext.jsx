import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as classesApi from '../api/classesApi';
import * as academicsApi from '../api/academicsApi';
import * as feeApi from '../api/feeApi';
import * as communicationApi from '../api/communicationApi';
import {
  holidays    as initialHolidays,
} from '../data/mockData';

const DataContext = createContext(null);

const CLASSES_VISIBLE_ROLES   = ['principal', 'headmaster', 'teacher', 'accountant', 'support_staff'];
const EXAMS_VISIBLE_ROLES     = ['student', 'teacher', 'principal', 'headmaster'];
const HOMEWORK_VISIBLE_ROLES  = ['student', 'parent', 'teacher'];
const NOTES_VISIBLE_ROLES     = ['student', 'teacher'];
const RESULTS_VISIBLE_ROLES   = ['teacher', 'principal', 'headmaster'];
const FEES_VISIBLE_ROLES      = ['principal', 'accountant'];

const nextId = (arr) =>
  arr.length ? Math.max(...arr.map(x => Number(x.id) || 0)) + 1 : 1;

export function DataProvider({ children }) {
  const { currentUser } = useAuth();
  const [classes,        setClasses]        = useState([]);
  const [exams,          setExams]          = useState([]);
  const [announcements,  setAnnouncements]  = useState([]);
  const [holidays,       setHolidays]       = useState(initialHolidays);
  const [fees,           setFees]           = useState([]);
  const [homework,       setHomework]       = useState([]);
  const [notes,          setNotes]          = useState([]);
  const [results,        setResults]        = useState([]);

  // ── Classes ──────────────────────────────────────────────────────────────────
  const loadClasses = useCallback(async () => {
    if (!currentUser || !CLASSES_VISIBLE_ROLES.includes(currentUser.role)) {
      setClasses([]);
      return;
    }
    try {
      const data = await classesApi.listClasses();
      setClasses(data);
    } catch {
      setClasses([]);
    }
  }, [currentUser]);

  useEffect(() => { loadClasses(); }, [loadClasses]);

  const addClass = async (d) => {
    const created = await classesApi.createClass({
      name: d.name,
      gradeLevel: d.grade,
      section: d.section,
      classTeacherStaffId: d.classTeacherId || null,
    });
    setClasses(p => [...p, created]);
  };
  const updateClass = async (id, d) => {
    const current = classes.find(c => c.id === id);
    const updated = await classesApi.updateClass(id, {
      name: d.name ?? current?.name,
      gradeLevel: d.grade ?? current?.gradeLevel,
      section: d.section ?? current?.section,
      classTeacherStaffId: (d.classTeacherId ?? current?.classTeacherStaffId) || null,
      active: d.active ?? current?.active ?? true,
    });
    setClasses(p => p.map(c => c.id === id ? updated : c));
  };
  const deleteClass = async (id) => {
    const current = classes.find(c => c.id === id);
    if (!current) return;
    const updated = await classesApi.updateClass(id, {
      name: current.name,
      gradeLevel: current.gradeLevel,
      section: current.section,
      classTeacherStaffId: current.classTeacherStaffId,
      active: false,
    });
    setClasses(p => p.map(c => c.id === id ? updated : c));
  };

  // ── Exams ─────────────────────────────────────────────────────────────────────
  const loadExams = useCallback(async () => {
    if (!currentUser || !EXAMS_VISIBLE_ROLES.includes(currentUser.role)) {
      setExams([]);
      return;
    }
    try {
      setExams(await academicsApi.listExams());
    } catch {
      setExams([]);
    }
  }, [currentUser]);

  useEffect(() => { loadExams(); }, [loadExams]);

  const addExam = async (d) => {
    const created = await academicsApi.createExam(d);
    setExams(p => [...p, created]);
  };

  // ── Announcements ─────────────────────────────────────────────────────────────
  const loadAnnouncements = useCallback(async () => {
    if (!currentUser) {
      setAnnouncements([]);
      return;
    }
    try {
      setAnnouncements(await communicationApi.listNotices());
    } catch {
      setAnnouncements([]);
    }
  }, [currentUser]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const addAnnouncement = async (d) => {
    const created = await communicationApi.createNotice(d);
    setAnnouncements(p => [created, ...p]);
    return created;
  };
  const updateAnnouncement = async (id, d) => {
    const updated = await communicationApi.updateNotice(id, d);
    setAnnouncements(p => p.map(a => a.id === id ? updated : a));
    return updated;
  };
  const deleteAnnouncement = async (id) => {
    await communicationApi.deleteNotice(id);
    setAnnouncements(p => p.filter(a => a.id !== id));
  };

  // ── Holidays ──────────────────────────────────────────────────────────────────
  const addHoliday    = (d) => setHolidays(p => [...p, { ...d, id: nextId(p) }]);
  const deleteHoliday = (id) => setHolidays(p => p.filter(h => h.id !== id));

  // ── Fees ──────────────────────────────────────────────────────────────────────
  const loadFees = useCallback(async () => {
    if (!currentUser || !FEES_VISIBLE_ROLES.includes(currentUser.role)) {
      setFees([]);
      return;
    }
    try {
      setFees(await feeApi.listFeeRecords());
    } catch {
      setFees([]);
    }
  }, [currentUser]);

  useEffect(() => { loadFees(); }, [loadFees]);

  const payFee = async (d) => {
    const created = await feeApi.payFee(d);
    await loadFees();
    return created;
  };
  const updateFeeRecord = async (id, d) => {
    const updated = await feeApi.updateFeeRecord(id, d);
    setFees(p => p.map(f => f.id === id ? updated : f));
    return updated;
  };

  // ── Homework ──────────────────────────────────────────────────────────────────
  const loadHomework = useCallback(async () => {
    if (!currentUser || !HOMEWORK_VISIBLE_ROLES.includes(currentUser.role)) {
      setHomework([]);
      return;
    }
    try {
      setHomework(await academicsApi.listHomework());
    } catch {
      setHomework([]);
    }
  }, [currentUser]);

  useEffect(() => { loadHomework(); }, [loadHomework]);

  const addHomework = async (d) => {
    const created = await academicsApi.createHomework(d);
    setHomework(p => [...p, created]);
  };

  // ── Notes ─────────────────────────────────────────────────────────────────────
  const loadNotes = useCallback(async () => {
    if (!currentUser || !NOTES_VISIBLE_ROLES.includes(currentUser.role)) {
      setNotes([]);
      return;
    }
    try {
      setNotes(await academicsApi.listNotes());
    } catch {
      setNotes([]);
    }
  }, [currentUser]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const addNote = async (d) => {
    const created = await academicsApi.createNote(d);
    setNotes(p => [...p, created]);
  };

  // ── Results ───────────────────────────────────────────────────────────────────
  const loadResults = useCallback(async () => {
    if (!currentUser || !RESULTS_VISIBLE_ROLES.includes(currentUser.role)) {
      setResults([]);
      return;
    }
    try {
      setResults(await academicsApi.listResults());
    } catch {
      setResults([]);
    }
  }, [currentUser]);

  useEffect(() => { loadResults(); }, [loadResults]);

  const addResult = async (d) => {
    const created = await academicsApi.createResult(d);
    setResults(p => [...p, created]);
    return created;
  };

  return (
    <DataContext.Provider value={{
      classes, exams, announcements, holidays, fees,
      homework, notes, results,
      addClass, updateClass, deleteClass,
      addExam,
      addAnnouncement, updateAnnouncement, deleteAnnouncement,
      addHoliday, deleteHoliday,
      payFee, updateFeeRecord,
      addHomework,
      addNote,
      addResult,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
