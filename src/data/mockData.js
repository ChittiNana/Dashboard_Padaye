// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = [
  { id: 1,  username: 'principal',  password: 'principal123', role: 'principal',  name: 'Dr. Rajesh Kumar',    avatar: 'RK', phone: '+91-98765-43210', email: 'principal@greenwood.edu',   joinDate: '2015-06-01' },
  { id: 2,  username: 'headmaster', password: 'head123',      role: 'headmaster', name: 'Mrs. Priya Sharma',   avatar: 'PS', phone: '+91-98765-43211', email: 'headmaster@greenwood.edu',  joinDate: '2017-07-15' },
  { id: 3,  username: 'teacher1',   password: 'teach123',     role: 'teacher',    name: 'Mr. Amit Verma',      avatar: 'AV', phone: '+91-98765-43212', email: 'amit.verma@greenwood.edu',  joinDate: '2018-06-01', subject: 'Mathematics', classesHandled: ['10A','10B','9A'] },
  { id: 4,  username: 'teacher2',   password: 'teach123',     role: 'teacher',    name: 'Ms. Sunita Patel',    avatar: 'SP', phone: '+91-98765-43213', email: 'sunita.patel@greenwood.edu',joinDate: '2019-07-01', subject: 'Science',     classesHandled: ['10A','8A','8B'] },
  { id: 5,  username: 'teacher3',   password: 'teach123',     role: 'teacher',    name: 'Mr. John Davis',      avatar: 'JD', phone: '+91-98765-43214', email: 'john.davis@greenwood.edu',  joinDate: '2020-06-01', subject: 'English',     classesHandled: ['10B','9A','9B'] },
  { id: 6,  username: 'student1',   password: 'stud123',      role: 'student',    name: 'Rahul Singh',         avatar: 'RS', class: '10A', rollNo: '001', parentId: 9,  dob: '2009-05-15', admissionYear: 2020 },
  { id: 7,  username: 'student2',   password: 'stud123',      role: 'student',    name: 'Priya Kapoor',        avatar: 'PK', class: '10A', rollNo: '002', parentId: 10, dob: '2009-08-22', admissionYear: 2020 },
  { id: 8,  username: 'student3',   password: 'stud123',      role: 'student',    name: 'Arjun Mehta',         avatar: 'AM', class: '9A',  rollNo: '001', parentId: 11, dob: '2010-03-10', admissionYear: 2021 },
  { id: 9,  username: 'parent1',    password: 'par123',       role: 'parent',     name: 'Mr. Ravi Singh',      avatar: 'RVS', phone: '+91-98765-43215', email: 'ravi.singh@gmail.com',    childrenIds: [6] },
  { id: 10, username: 'parent2',    password: 'par123',       role: 'parent',     name: 'Mrs. Anita Kapoor',   avatar: 'ANK', phone: '+91-98765-43216', email: 'anita.kapoor@gmail.com',  childrenIds: [7] },
  { id: 11, username: 'parent3',    password: 'par123',       role: 'parent',     name: 'Mr. Suresh Mehta',    avatar: 'SRM', phone: '+91-98765-43217', email: 'suresh.mehta@gmail.com',  childrenIds: [8] },
  { id: 12, username: 'guest',      password: 'guest',        role: 'guest',      name: 'Guest User',          avatar: 'GU' },
];

// ─── CLASSES ─────────────────────────────────────────────────────────────────
export const classes = [
  { id: 'cls1', name: '10A', grade: 10, section: 'A', classTeacherId: 3, studentIds: [6, 7], strength: 42, room: 'Room 101' },
  { id: 'cls2', name: '10B', grade: 10, section: 'B', classTeacherId: 5, studentIds: [],     strength: 40, room: 'Room 102' },
  { id: 'cls3', name: '9A',  grade: 9,  section: 'A', classTeacherId: 3, studentIds: [8],    strength: 38, room: 'Room 201' },
  { id: 'cls4', name: '9B',  grade: 9,  section: 'B', classTeacherId: 5, studentIds: [],     strength: 39, room: 'Room 202' },
  { id: 'cls5', name: '8A',  grade: 8,  section: 'A', classTeacherId: 4, studentIds: [],     strength: 41, room: 'Room 301' },
  { id: 'cls6', name: '8B',  grade: 8,  section: 'B', classTeacherId: 4, studentIds: [],     strength: 37, room: 'Room 302' },
];

// ─── TIMETABLE ────────────────────────────────────────────────────────────────
export const timetable = {
  '10A': {
    Monday:    [{ period: 1, subject: 'Mathematics', teacher: 'Mr. Amit Verma',   time: '08:00-08:45' }, { period: 2, subject: 'Science',     teacher: 'Ms. Sunita Patel',  time: '08:45-09:30' }, { period: 3, subject: 'English',     teacher: 'Mr. John Davis',    time: '09:30-10:15' }, { period: 4, subject: 'Break',       teacher: '-',                 time: '10:15-10:30' }, { period: 5, subject: 'History',     teacher: 'Mrs. Geeta Nair',   time: '10:30-11:15' }, { period: 6, subject: 'Geography',   teacher: 'Mr. Arun Roy',      time: '11:15-12:00' }, { period: 7, subject: 'Lunch',       teacher: '-',                 time: '12:00-12:45' }, { period: 8, subject: 'Computer',    teacher: 'Ms. Ritu Gupta',    time: '12:45-13:30' }],
    Tuesday:   [{ period: 1, subject: 'English',     teacher: 'Mr. John Davis',    time: '08:00-08:45' }, { period: 2, subject: 'Mathematics', teacher: 'Mr. Amit Verma',   time: '08:45-09:30' }, { period: 3, subject: 'Science',     teacher: 'Ms. Sunita Patel',  time: '09:30-10:15' }, { period: 4, subject: 'Break',       teacher: '-',                 time: '10:15-10:30' }, { period: 5, subject: 'Computer',    teacher: 'Ms. Ritu Gupta',    time: '10:30-11:15' }, { period: 6, subject: 'History',     teacher: 'Mrs. Geeta Nair',   time: '11:15-12:00' }, { period: 7, subject: 'Lunch',       teacher: '-',                 time: '12:00-12:45' }, { period: 8, subject: 'Mathematics', teacher: 'Mr. Amit Verma',   time: '12:45-13:30' }],
    Wednesday: [{ period: 1, subject: 'Science',     teacher: 'Ms. Sunita Patel',  time: '08:00-08:45' }, { period: 2, subject: 'Geography',   teacher: 'Mr. Arun Roy',      time: '08:45-09:30' }, { period: 3, subject: 'Mathematics', teacher: 'Mr. Amit Verma',   time: '09:30-10:15' }, { period: 4, subject: 'Break',       teacher: '-',                 time: '10:15-10:30' }, { period: 5, subject: 'English',     teacher: 'Mr. John Davis',    time: '10:30-11:15' }, { period: 6, subject: 'PE',          teacher: 'Mr. Vikram Singh',  time: '11:15-12:00' }, { period: 7, subject: 'Lunch',       teacher: '-',                 time: '12:00-12:45' }, { period: 8, subject: 'History',     teacher: 'Mrs. Geeta Nair',   time: '12:45-13:30' }],
    Thursday:  [{ period: 1, subject: 'History',     teacher: 'Mrs. Geeta Nair',   time: '08:00-08:45' }, { period: 2, subject: 'English',     teacher: 'Mr. John Davis',    time: '08:45-09:30' }, { period: 3, subject: 'Science',     teacher: 'Ms. Sunita Patel',  time: '09:30-10:15' }, { period: 4, subject: 'Break',       teacher: '-',                 time: '10:15-10:30' }, { period: 5, subject: 'Mathematics', teacher: 'Mr. Amit Verma',   time: '10:30-11:15' }, { period: 6, subject: 'Computer',    teacher: 'Ms. Ritu Gupta',    time: '11:15-12:00' }, { period: 7, subject: 'Lunch',       teacher: '-',                 time: '12:00-12:45' }, { period: 8, subject: 'Geography',   teacher: 'Mr. Arun Roy',      time: '12:45-13:30' }],
    Friday:    [{ period: 1, subject: 'Computer',    teacher: 'Ms. Ritu Gupta',    time: '08:00-08:45' }, { period: 2, subject: 'Science',     teacher: 'Ms. Sunita Patel',  time: '08:45-09:30' }, { period: 3, subject: 'Geography',   teacher: 'Mr. Arun Roy',      time: '09:30-10:15' }, { period: 4, subject: 'Break',       teacher: '-',                 time: '10:15-10:30' }, { period: 5, subject: 'English',     teacher: 'Mr. John Davis',    time: '10:30-11:15' }, { period: 6, subject: 'Mathematics', teacher: 'Mr. Amit Verma',   time: '11:15-12:00' }, { period: 7, subject: 'Lunch',       teacher: '-',                 time: '12:00-12:45' }, { period: 8, subject: 'PE',          teacher: 'Mr. Vikram Singh',  time: '12:45-13:30' }],
    Saturday:  [{ period: 1, subject: 'Mathematics', teacher: 'Mr. Amit Verma',   time: '08:00-08:45' }, { period: 2, subject: 'English',     teacher: 'Mr. John Davis',    time: '08:45-09:30' }, { period: 3, subject: 'Science',     teacher: 'Ms. Sunita Patel',  time: '09:30-10:15' }, { period: 4, subject: 'Break',       teacher: '-',                 time: '10:15-10:30' }, { period: 5, subject: 'Drawing',     teacher: 'Ms. Kavya Menon',   time: '10:30-11:15' }, { period: 6, subject: 'Library',     teacher: '-',                 time: '11:15-12:00' }],
  },
};

// ─── NOTES / STUDY MATERIALS ─────────────────────────────────────────────────
export const notes = [
  { id: 1, subject: 'Mathematics', title: 'Chapter 1: Real Numbers',          uploadedBy: 'Mr. Amit Verma',   class: '10A', date: '2026-07-10', fileType: 'PDF',  pages: 12, downloads: 34 },
  { id: 2, subject: 'Mathematics', title: 'Chapter 2: Polynomials',            uploadedBy: 'Mr. Amit Verma',   class: '10A', date: '2026-07-18', fileType: 'PDF',  pages: 15, downloads: 28 },
  { id: 3, subject: 'Mathematics', title: 'Chapter 3: Linear Equations',       uploadedBy: 'Mr. Amit Verma',   class: '10A', date: '2026-07-25', fileType: 'DOCX', pages: 10, downloads: 21 },
  { id: 4, subject: 'Science',     title: 'Chapter 1: Chemical Reactions',     uploadedBy: 'Ms. Sunita Patel', class: '10A', date: '2026-07-12', fileType: 'PDF',  pages: 18, downloads: 40 },
  { id: 5, subject: 'Science',     title: 'Chapter 2: Acids, Bases and Salts', uploadedBy: 'Ms. Sunita Patel', class: '10A', date: '2026-07-20', fileType: 'PDF',  pages: 14, downloads: 32 },
  { id: 6, subject: 'English',     title: 'Poetry Analysis Guide',             uploadedBy: 'Mr. John Davis',   class: '10A', date: '2026-07-14', fileType: 'PDF',  pages: 8,  downloads: 19 },
  { id: 7, subject: 'English',     title: 'Grammar: Voice & Narration',        uploadedBy: 'Mr. John Davis',   class: '10A', date: '2026-07-22', fileType: 'DOCX', pages: 6,  downloads: 24 },
  { id: 8, subject: 'Mathematics', title: 'Chapter 1: Real Numbers (9A)',      uploadedBy: 'Mr. Amit Verma',   class: '9A',  date: '2026-07-10', fileType: 'PDF',  pages: 10, downloads: 25 },
];

// ─── EXAMS ────────────────────────────────────────────────────────────────────
export const exams = [
  { id: 1,  name: 'Unit Test 1',           subject: 'Mathematics', class: '10A', date: '2026-08-10', time: '10:00', duration: '2 hrs', maxMarks: 50,  room: 'Hall A', status: 'upcoming' },
  { id: 2,  name: 'Unit Test 1',           subject: 'Science',     class: '10A', date: '2026-08-12', time: '10:00', duration: '2 hrs', maxMarks: 50,  room: 'Hall A', status: 'upcoming' },
  { id: 3,  name: 'Unit Test 1',           subject: 'English',     class: '10A', date: '2026-08-14', time: '10:00', duration: '2 hrs', maxMarks: 50,  room: 'Hall B', status: 'upcoming' },
  { id: 4,  name: 'Half Yearly Exam',      subject: 'Mathematics', class: '10A', date: '2026-09-01', time: '09:00', duration: '3 hrs', maxMarks: 100, room: 'Hall A', status: 'upcoming' },
  { id: 5,  name: 'Half Yearly Exam',      subject: 'Science',     class: '10A', date: '2026-09-03', time: '09:00', duration: '3 hrs', maxMarks: 100, room: 'Hall A', status: 'upcoming' },
  { id: 6,  name: 'Half Yearly Exam',      subject: 'English',     class: '10A', date: '2026-09-05', time: '09:00', duration: '3 hrs', maxMarks: 100, room: 'Hall B', status: 'upcoming' },
  { id: 7,  name: 'Terminal Exam',         subject: 'Mathematics', class: '10A', date: '2026-11-10', time: '09:00', duration: '3 hrs', maxMarks: 100, room: 'Hall A', status: 'upcoming' },
  { id: 8,  name: 'Terminal Exam',         subject: 'Science',     class: '10A', date: '2026-11-12', time: '09:00', duration: '3 hrs', maxMarks: 100, room: 'Hall A', status: 'upcoming' },
  { id: 9,  name: 'First Term',            subject: 'Mathematics', class: '10A', date: '2026-04-15', time: '09:00', duration: '3 hrs', maxMarks: 100, room: 'Hall A', status: 'completed' },
  { id: 10, name: 'First Term',            subject: 'Science',     class: '10A', date: '2026-04-17', time: '09:00', duration: '3 hrs', maxMarks: 100, room: 'Hall A', status: 'completed' },
];

// ─── EXAM PAPERS (past) ────────────────────────────────────────────────────────
export const examPapers = [
  { id: 1, examName: 'First Term Mathematics', class: '10A', year: '2025-26', subject: 'Mathematics', questions: 10, maxMarks: 100, uploadDate: '2026-04-30' },
  { id: 2, examName: 'First Term Science',     class: '10A', year: '2025-26', subject: 'Science',     questions: 12, maxMarks: 100, uploadDate: '2026-04-30' },
  { id: 3, examName: 'Annual 2024-25 Math',    class: '10A', year: '2024-25', subject: 'Mathematics', questions: 10, maxMarks: 100, uploadDate: '2025-04-30' },
  { id: 4, examName: 'Annual 2024-25 Science', class: '10A', year: '2024-25', subject: 'Science',     questions: 12, maxMarks: 100, uploadDate: '2025-04-30' },
  { id: 5, examName: 'Annual 2024-25 English', class: '10A', year: '2024-25', subject: 'English',     questions: 8,  maxMarks: 100, uploadDate: '2025-04-30' },
];

// ─── RESULTS ──────────────────────────────────────────────────────────────────
export const results = [
  { studentId: 6, examId: 9,  subject: 'Mathematics', marksObtained: 85, maxMarks: 100, grade: 'A',  remarks: 'Excellent' },
  { studentId: 6, examId: 10, subject: 'Science',     marksObtained: 78, maxMarks: 100, grade: 'B+', remarks: 'Good'      },
  { studentId: 7, examId: 9,  subject: 'Mathematics', marksObtained: 91, maxMarks: 100, grade: 'A+', remarks: 'Outstanding' },
  { studentId: 7, examId: 10, subject: 'Science',     marksObtained: 88, maxMarks: 100, grade: 'A',  remarks: 'Excellent' },
  { studentId: 8, examId: 9,  subject: 'Mathematics', marksObtained: 72, maxMarks: 100, grade: 'B',  remarks: 'Good'      },
];

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const attendance = [
  { studentId: 6, date: '2026-07-01', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-02', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-03', status: 'Absent',  class: '10A' },
  { studentId: 6, date: '2026-07-04', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-07', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-08', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-09', status: 'Late',    class: '10A' },
  { studentId: 6, date: '2026-07-10', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-11', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-14', status: 'Absent',  class: '10A' },
  { studentId: 6, date: '2026-07-15', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-16', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-17', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-18', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-21', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-22', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-23', status: 'Late',    class: '10A' },
  { studentId: 6, date: '2026-07-24', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-25', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-28', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-29', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-30', status: 'Present', class: '10A' },
  { studentId: 6, date: '2026-07-31', status: 'Present', class: '10A' },
  { studentId: 7, date: '2026-07-01', status: 'Present', class: '10A' },
  { studentId: 7, date: '2026-07-02', status: 'Present', class: '10A' },
  { studentId: 7, date: '2026-07-03', status: 'Present', class: '10A' },
  { studentId: 7, date: '2026-07-04', status: 'Absent',  class: '10A' },
  { studentId: 7, date: '2026-07-07', status: 'Present', class: '10A' },
  { studentId: 8, date: '2026-07-01', status: 'Present', class: '9A' },
  { studentId: 8, date: '2026-07-02', status: 'Absent',  class: '9A' },
  { studentId: 8, date: '2026-07-03', status: 'Present', class: '9A' },
];

// ─── HOMEWORK ─────────────────────────────────────────────────────────────────
export const homework = [
  { id: 1, subject: 'Mathematics', title: 'Exercise 1.3 – Real Numbers',       class: '10A', assignedBy: 'Mr. Amit Verma',   assignedDate: '2026-07-28', dueDate: '2026-08-04', status: 'pending',   description: 'Complete problems 1-15 from Exercise 1.3 in NCERT textbook.' },
  { id: 2, subject: 'Science',     title: 'Lab Report – Chemical Reactions',    class: '10A', assignedBy: 'Ms. Sunita Patel', assignedDate: '2026-07-29', dueDate: '2026-08-05', status: 'pending',   description: 'Write a detailed lab report for the vinegar-baking soda experiment.' },
  { id: 3, subject: 'English',     title: 'Essay – My School Memories',         class: '10A', assignedBy: 'Mr. John Davis',   assignedDate: '2026-07-25', dueDate: '2026-08-01', status: 'submitted', description: 'Write a 500-word essay on your favourite school memory.' },
  { id: 4, subject: 'Mathematics', title: 'Chapter 2 Practice Problems',        class: '10A', assignedBy: 'Mr. Amit Verma',   assignedDate: '2026-07-22', dueDate: '2026-07-28', status: 'graded',    description: 'Practice problems from Chapter 2 – Polynomials.', grade: '48/50' },
  { id: 5, subject: 'History',     title: 'Timeline – Indian Independence',     class: '10A', assignedBy: 'Mrs. Geeta Nair',  assignedDate: '2026-07-30', dueDate: '2026-08-06', status: 'pending',   description: 'Create a detailed timeline of events leading to Indian Independence.' },
  { id: 6, subject: 'Mathematics', title: 'Algebra Worksheet 1 (9A)',           class: '9A',  assignedBy: 'Mr. Amit Verma',   assignedDate: '2026-07-28', dueDate: '2026-08-04', status: 'pending',   description: 'Complete worksheet on algebraic expressions.' },
];

// ─── HOLIDAYS ────────────────────────────────────────────────────────────────
export const holidays = [
  { id: 1,  date: '2026-08-15', name: 'Independence Day',     type: 'National',   description: 'India\'s 80th Independence Day celebrations' },
  { id: 2,  date: '2026-08-26', name: 'Janmashtami',          type: 'Festival',   description: 'Festival celebrating Lord Krishna\'s birthday' },
  { id: 3,  date: '2026-09-05', name: 'Teacher\'s Day',        type: 'National',   description: 'Celebration of Dr. Sarvepalli Radhakrishnan\'s birthday' },
  { id: 4,  date: '2026-09-14', name: 'Hindi Diwas',          type: 'National',   description: 'Celebration of Hindi as official language' },
  { id: 5,  date: '2026-10-02', name: 'Gandhi Jayanti',       type: 'National',   description: 'Birth anniversary of Mahatma Gandhi' },
  { id: 6,  date: '2026-10-07', name: 'Navratri begins',      type: 'Festival',   description: 'Nine nights of Navratri festival' },
  { id: 7,  date: '2026-10-20', name: 'Dussehra',             type: 'Festival',   description: 'Festival of triumph of good over evil' },
  { id: 8,  date: '2026-11-01', name: 'Diwali Holiday',       type: 'Festival',   description: 'Diwali vacation – school closed for 3 days' },
  { id: 9,  date: '2026-11-02', name: 'Diwali Holiday',       type: 'Festival',   description: 'Diwali vacation' },
  { id: 10, date: '2026-11-03', name: 'Diwali Holiday',       type: 'Festival',   description: 'Diwali vacation' },
  { id: 11, date: '2026-12-25', name: 'Christmas Day',        type: 'National',   description: 'Christmas celebration' },
  { id: 12, date: '2027-01-01', name: 'New Year\'s Day',       type: 'National',   description: 'New Year holiday' },
  { id: 13, date: '2027-01-26', name: 'Republic Day',         type: 'National',   description: 'India\'s Republic Day' },
  { id: 14, date: '2027-02-19', name: 'Shivaji Jayanti',      type: 'Regional',   description: 'Birth anniversary of Chhatrapati Shivaji Maharaj' },
  { id: 15, date: '2027-03-08', name: 'Holi',                 type: 'Festival',   description: 'Festival of colours' },
];

// ─── ANNOUNCEMENTS / NOTICES ─────────────────────────────────────────────────
export const announcements = [
  { id: 1, title: 'Annual Sports Day Registrations Open',       date: '2026-08-01', postedBy: 'Principal', audience: 'all',     priority: 'high',   body: 'Annual Sports Day will be held on September 20, 2026. Registrations are now open. Students interested in participating must submit their names to their respective class teachers by August 15, 2026.' },
  { id: 2, title: 'Parent-Teacher Meeting – Class 10',          date: '2026-07-30', postedBy: 'Headmaster', audience: 'parent', priority: 'high',   body: 'A Parent-Teacher meeting for Class 10 students is scheduled on August 8, 2026 from 10:00 AM to 1:00 PM. All parents are requested to attend.' },
  { id: 3, title: 'Unit Test 1 Schedule Released',              date: '2026-07-28', postedBy: 'Headmaster', audience: 'all',    priority: 'medium', body: 'The Unit Test 1 schedule has been released. Tests will be conducted from August 10–20, 2026. Students are advised to prepare accordingly.' },
  { id: 4, title: 'Library Renovation Notice',                  date: '2026-07-25', postedBy: 'Principal', audience: 'all',    priority: 'low',    body: 'The school library will be closed for renovation from August 5–10, 2026. Students are requested to borrow books before this period.' },
  { id: 5, title: 'Independence Day Celebration Programme',     date: '2026-08-03', postedBy: 'Principal', audience: 'all',    priority: 'high',   body: 'Independence Day celebrations will be held on August 15, 2026 at 8:00 AM in the school ground. Attendance is compulsory for all students and staff.' },
  { id: 6, title: 'Fee Reminder – Second Instalment',           date: '2026-07-20', postedBy: 'Admin',     audience: 'parent', priority: 'medium', body: 'This is a reminder that the second instalment of school fees is due by August 31, 2026. Please ensure timely payment to avoid late fees.' },
];

// ─── FEES ─────────────────────────────────────────────────────────────────────
export const fees = [
  { studentId: 6, term: 'Term 1 (Apr–Jun)', amount: 12000, paid: true,  paidDate: '2026-04-05', method: 'Online' },
  { studentId: 6, term: 'Term 2 (Jul–Sep)', amount: 12000, paid: false, paidDate: null,         method: null },
  { studentId: 6, term: 'Term 3 (Oct–Dec)', amount: 12000, paid: false, paidDate: null,         method: null },
  { studentId: 6, term: 'Term 4 (Jan–Mar)', amount: 12000, paid: false, paidDate: null,         method: null },
  { studentId: 7, term: 'Term 1 (Apr–Jun)', amount: 12000, paid: true,  paidDate: '2026-04-10', method: 'Cheque' },
  { studentId: 7, term: 'Term 2 (Jul–Sep)', amount: 12000, paid: true,  paidDate: '2026-07-08', method: 'Online' },
  { studentId: 8, term: 'Term 1 (Apr–Jun)', amount: 11000, paid: true,  paidDate: '2026-04-08', method: 'Cash' },
  { studentId: 8, term: 'Term 2 (Jul–Sep)', amount: 11000, paid: false, paidDate: null,         method: null },
];

// ─── STAFF ATTENDANCE ─────────────────────────────────────────────────────────
export const staffAttendance = [
  { staffId: 3, date: '2026-08-01', status: 'Present' },
  { staffId: 3, date: '2026-08-02', status: 'Present' },
  { staffId: 3, date: '2026-08-03', status: 'Present' },
  { staffId: 4, date: '2026-08-01', status: 'Present' },
  { staffId: 4, date: '2026-08-02', status: 'Absent'  },
  { staffId: 4, date: '2026-08-03', status: 'Present' },
  { staffId: 5, date: '2026-08-01', status: 'Present' },
  { staffId: 5, date: '2026-08-02', status: 'Present' },
  { staffId: 5, date: '2026-08-03', status: 'Leave'   },
];

// ─── MESSAGES / COMMUNICATIONS ───────────────────────────────────────────────
export const messages = [
  { id: 1, fromId: 9,  toId: 3, subject: 'Regarding Rahul\'s Math performance', body: 'Dear Sir, I noticed Rahul\'s performance in Maths has dropped slightly. Could we schedule a meeting?', date: '2026-07-28', read: false },
  { id: 2, fromId: 3,  toId: 9, subject: 'RE: Regarding Rahul\'s Math performance', body: 'Dear Mr. Singh, Yes, Rahul needs a bit more practice on polynomials. Please come on Saturday at 11 AM.', date: '2026-07-29', read: true  },
  { id: 3, fromId: 10, toId: 4, subject: 'Priya\'s Science Project',              body: 'Hello Ma\'am, Can you share the topics for the Science project due next month?', date: '2026-07-30', read: false },
  { id: 4, fromId: 2,  toId: 3, subject: 'Class 10A Attendance Report',           body: 'Please submit the detailed attendance report for class 10A for July 2026 by end of this week.', date: '2026-07-31', read: false },
];

// ─── SCHOOL INFO ──────────────────────────────────────────────────────────────
export const schoolInfo = {
  name: 'Greenwood Public School',
  established: 1985,
  address: '42, Greenwood Avenue, Sector 7, New Delhi – 110007',
  phone: '+91-11-2345-6789',
  email: 'info@greenwood.edu',
  website: 'www.greenwood.edu',
  affiliation: 'CBSE Affiliation No: 23456',
  motto: 'Knowledge, Character, Service',
  totalStudents: 1240,
  totalStaff: 68,
  totalClasses: 36,
  principalName: 'Dr. Rajesh Kumar',
};

export const getDemoCredentials = () => [
  { role: 'Principal',  username: 'principal',  password: 'principal123' },
  { role: 'Headmaster', username: 'headmaster', password: 'head123'      },
  { role: 'Teacher',    username: 'teacher1',   password: 'teach123'     },
  { role: 'Student',    username: 'student1',   password: 'stud123'      },
  { role: 'Parent',     username: 'parent1',    password: 'par123'       },
  { role: 'Guest',      username: 'guest',      password: 'guest'        },
];
