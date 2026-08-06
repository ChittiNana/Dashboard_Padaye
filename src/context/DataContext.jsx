import { createContext, useContext, useState } from 'react';
import {
  classes     as initialClasses,
  exams       as initialExams,
  announcements as initialAnnouncements,
  holidays    as initialHolidays,
  fees        as initialFees,
  homework    as initialHomework,
  notes       as initialNotes,
  attendance  as initialAttendance,
  staffAttendance as initialStaffAttendance,
  timetable   as initialTimetable,
} from '../data/mockData';

const DataContext = createContext(null);

const nextId = (arr) =>
  arr.length ? Math.max(...arr.map(x => Number(x.id) || 0)) + 1 : 1;

export function DataProvider({ children }) {
  const [classes,        setClasses]        = useState(initialClasses);
  const [exams,          setExams]          = useState(initialExams);
  const [announcements,  setAnnouncements]  = useState(initialAnnouncements);
  const [holidays,       setHolidays]       = useState(initialHolidays);
  const [fees,           setFees]           = useState(initialFees);
  const [homework,       setHomework]       = useState(initialHomework);
  const [notes,          setNotes]          = useState(initialNotes);
  const [attendance,     setAttendance]     = useState(initialAttendance);
  const [staffAttendance]                   = useState(initialStaffAttendance);
  const [timetable,      setTimetable]      = useState(initialTimetable);

  // ── Classes ──────────────────────────────────────────────────────────────────
  const addClass    = (d) => setClasses(p => [...p, { ...d, id: `cls-${Date.now()}` }]);
  const updateClass = (id, d) => setClasses(p => p.map(c => c.id === id ? { ...c, ...d } : c));
  const deleteClass = (id) => setClasses(p => p.filter(c => c.id !== id));

  // ── Exams ─────────────────────────────────────────────────────────────────────
  const addExam    = (d) => setExams(p => [...p, { ...d, id: nextId(p) }]);
  const updateExam = (id, d) => setExams(p => p.map(e => e.id === id ? { ...e, ...d } : e));
  const deleteExam = (id) => setExams(p => p.filter(e => e.id !== id));

  // ── Announcements ─────────────────────────────────────────────────────────────
  const addAnnouncement    = (d) => setAnnouncements(p => [...p, { ...d, id: nextId(p) }]);
  const updateAnnouncement = (id, d) => setAnnouncements(p => p.map(a => a.id === id ? { ...a, ...d } : a));
  const deleteAnnouncement = (id) => setAnnouncements(p => p.filter(a => a.id !== id));

  // ── Holidays ──────────────────────────────────────────────────────────────────
  const addHoliday    = (d) => setHolidays(p => [...p, { ...d, id: nextId(p) }]);
  const deleteHoliday = (id) => setHolidays(p => p.filter(h => h.id !== id));

  // ── Fees (composite key: studentId + term) ────────────────────────────────────
  const addFeeRecord = (d) => setFees(p => [...p, d]);
  const markFeePaid  = (studentId, term, method) => {
    const today = new Date().toISOString().slice(0, 10);
    setFees(p => p.map(f =>
      f.studentId === studentId && f.term === term
        ? { ...f, paid: true, paidDate: today, method }
        : f
    ));
  };
  const deleteFeeRecord = (studentId, term) =>
    setFees(p => p.filter(f => !(f.studentId === studentId && f.term === term)));

  // ── Homework ──────────────────────────────────────────────────────────────────
  const addHomework    = (d) => setHomework(p => [...p, { ...d, id: nextId(p) }]);
  const deleteHomework = (id) => setHomework(p => p.filter(h => h.id !== id));

  // ── Notes ─────────────────────────────────────────────────────────────────────
  const addNote    = (d) => setNotes(p => [...p, { ...d, id: nextId(p) }]);
  const deleteNote = (id) => setNotes(p => p.filter(n => n.id !== id));

  // ── Attendance (upsert by studentId+date) ─────────────────────────────────────
  const saveAttendance = (records) => {
    setAttendance(prev => {
      const key = (r) => `${r.studentId}-${r.date}`;
      const newKeys = new Set(records.map(key));
      return [...prev.filter(r => !newKeys.has(key(r))), ...records];
    });
  };

  // ── Timetable ─────────────────────────────────────────────────────────────────
  const updateTimetableDay = (className, day, periods) =>
    setTimetable(prev => ({
      ...prev,
      [className]: { ...(prev[className] || {}), [day]: periods },
    }));

  return (
    <DataContext.Provider value={{
      classes, exams, announcements, holidays, fees,
      homework, notes, attendance, staffAttendance, timetable,
      addClass, updateClass, deleteClass,
      addExam, updateExam, deleteExam,
      addAnnouncement, updateAnnouncement, deleteAnnouncement,
      addHoliday, deleteHoliday,
      addFeeRecord, markFeePaid, deleteFeeRecord,
      addHomework, deleteHomework,
      addNote, deleteNote,
      saveAttendance,
      updateTimetableDay,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
