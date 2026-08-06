// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = [
  { id: 1,  username: 'principal',  password: 'principal123', role: 'principal',    name: 'Dr. Rajesh Kumar',    avatar: 'RK',  phone: '+91-98765-43210', email: 'principal@greenwood.edu',    joinDate: '2015-06-01', employeeId: 'EMP001', qualification: 'Ph.D. Education', gender: 'Male',   address: '12, Park Lane, New Delhi' },
  { id: 2,  username: 'headmaster', password: 'head123',      role: 'headmaster',   name: 'Mrs. Priya Sharma',   avatar: 'PS',  phone: '+91-98765-43211', email: 'headmaster@greenwood.edu',   joinDate: '2017-07-15', employeeId: 'EMP002', qualification: 'M.Ed.',            gender: 'Female', address: '34, Sector 7, New Delhi' },
  { id: 3,  username: 'teacher1',   password: 'teach123',     role: 'teacher',      name: 'Mr. Amit Verma',      avatar: 'AV',  phone: '+91-98765-43212', email: 'amit.verma@greenwood.edu',   joinDate: '2018-06-01', employeeId: 'EMP003', qualification: 'M.Sc. Mathematics', gender: 'Male',   subject: 'Mathematics', subjects: ['Mathematics'], classesHandled: ['10A','10B','9A'] },
  { id: 4,  username: 'teacher2',   password: 'teach123',     role: 'teacher',      name: 'Ms. Sunita Patel',    avatar: 'SP',  phone: '+91-98765-43213', email: 'sunita.patel@greenwood.edu', joinDate: '2019-07-01', employeeId: 'EMP004', qualification: 'M.Sc. Science',    gender: 'Female', subject: 'Science',     subjects: ['Science'],     classesHandled: ['10A','8A','8B'] },
  { id: 5,  username: 'teacher3',   password: 'teach123',     role: 'teacher',      name: 'Mr. John Davis',      avatar: 'JD',  phone: '+91-98765-43214', email: 'john.davis@greenwood.edu',   joinDate: '2020-06-01', employeeId: 'EMP005', qualification: 'M.A. English',     gender: 'Male',   subject: 'English',     subjects: ['English'],     classesHandled: ['10B','9A','9B'] },
  { id: 6,  username: 'student1',   password: 'stud123',      role: 'student',      name: 'Rahul Singh',         avatar: 'RS',  class: '10A', rollNo: '001', parentId: 9,  dob: '2009-05-15', admissionYear: 2020, bloodGroup: 'O+',  gender: 'Male' },
  { id: 7,  username: 'student2',   password: 'stud123',      role: 'student',      name: 'Priya Kapoor',        avatar: 'PK',  class: '10A', rollNo: '002', parentId: 10, dob: '2009-08-22', admissionYear: 2020, bloodGroup: 'B+',  gender: 'Female' },
  { id: 8,  username: 'student3',   password: 'stud123',      role: 'student',      name: 'Arjun Mehta',         avatar: 'AM',  class: '9A',  rollNo: '001', parentId: 11, dob: '2010-03-10', admissionYear: 2021, bloodGroup: 'A+',  gender: 'Male' },
  { id: 9,  username: 'parent1',    password: 'par123',       role: 'parent',       name: 'Mr. Ravi Singh',      avatar: 'RVS', phone: '+91-98765-43215', email: 'ravi.singh@gmail.com',       childrenIds: [6],  occupation: 'Engineer', gender: 'Male' },
  { id: 10, username: 'parent2',    password: 'par123',       role: 'parent',       name: 'Mrs. Anita Kapoor',   avatar: 'ANK', phone: '+91-98765-43216', email: 'anita.kapoor@gmail.com',     childrenIds: [7],  occupation: 'Doctor',   gender: 'Female' },
  { id: 11, username: 'parent3',    password: 'par123',       role: 'parent',       name: 'Mr. Suresh Mehta',    avatar: 'SRM', phone: '+91-98765-43217', email: 'suresh.mehta@gmail.com',     childrenIds: [8],  occupation: 'Business', gender: 'Male' },
  { id: 12, username: 'guest',      password: 'guest',        role: 'guest',        name: 'Guest User',          avatar: 'GU',  gender: 'Other' },
  { id: 13, username: 'accountant1',password: 'acc123',       role: 'accountant',   name: 'Ms. Kavya Sharma',    avatar: 'KSH', phone: '+91-98765-43220', email: 'kavya.sharma@greenwood.edu', joinDate: '2019-01-15', employeeId: 'EMP013', qualification: 'B.Com, CA', gender: 'Female', address: '56, Nehru Nagar, Delhi' },
  { id: 14, username: 'gatekeeper1',password: 'gate123',      role: 'support_staff',name: 'Mr. Ramesh Kumar',    avatar: 'RMK', phone: '+91-98765-43221', email: 'ramesh.kumar@greenwood.edu', joinDate: '2020-03-01', employeeId: 'EMP014', subRole: 'Gate Keeper', shift: 'Morning (6AM-2PM)', gender: 'Male', address: '78, Lajpat Nagar, Delhi' },
  { id: 15, username: 'watchman1',  password: 'watch123',     role: 'support_staff',name: 'Mr. Vijay Patil',     avatar: 'VJP', phone: '+91-98765-43222', email: 'vijay.patil@greenwood.edu',  joinDate: '2021-06-01', employeeId: 'EMP015', subRole: 'Watchman',    shift: 'Night (10PM-6AM)',  gender: 'Male', address: '90, Rohini, Delhi' },
  { id: 16, username: 'cleaner1',   password: 'clean123',     role: 'support_staff',name: 'Mrs. Lata Yadav',     avatar: 'LTY', phone: '+91-98765-43223', email: 'lata.yadav@greenwood.edu',   joinDate: '2022-01-10', employeeId: 'EMP016', subRole: 'Cleaner',     shift: 'Morning (6AM-2PM)', gender: 'Female', address: '11, Dwarka, Delhi' },
  { id: 17, username: 'security1',  password: 'sec123',       role: 'support_staff',name: 'Mr. Deepak Singh',    avatar: 'DPS', phone: '+91-98765-43224', email: 'deepak.singh@greenwood.edu', joinDate: '2021-09-01', employeeId: 'EMP017', subRole: 'Security',    shift: 'Afternoon (2PM-10PM)', gender: 'Male', address: '22, Karol Bagh, Delhi' },
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
  { id: 1, studentId: 6, examId: 9,  subject: 'Mathematics', marksObtained: 85, maxMarks: 100, grade: 'A',  percentage: 85, remarks: 'Excellent',    paperId: 3 },
  { id: 2, studentId: 6, examId: 10, subject: 'Science',     marksObtained: 78, maxMarks: 100, grade: 'B+', percentage: 78, remarks: 'Good',          paperId: null },
  { id: 3, studentId: 7, examId: 9,  subject: 'Mathematics', marksObtained: 91, maxMarks: 100, grade: 'A+', percentage: 91, remarks: 'Outstanding',   paperId: 3 },
  { id: 4, studentId: 7, examId: 10, subject: 'Science',     marksObtained: 88, maxMarks: 100, grade: 'A',  percentage: 88, remarks: 'Excellent',     paperId: null },
  { id: 5, studentId: 8, examId: 9,  subject: 'Mathematics', marksObtained: 72, maxMarks: 100, grade: 'B',  percentage: 72, remarks: 'Good',          paperId: 3 },
  { id: 6, studentId: 6, examId: 9,  subject: 'English',     marksObtained: 80, maxMarks: 100, grade: 'A',  percentage: 80, remarks: 'Very Good',     paperId: null },
  { id: 7, studentId: 7, examId: 9,  subject: 'English',     marksObtained: 76, maxMarks: 100, grade: 'B+', percentage: 76, remarks: 'Good',          paperId: null },
  { id: 8, studentId: 8, examId: 9,  subject: 'English',     marksObtained: 68, maxMarks: 100, grade: 'B',  percentage: 68, remarks: 'Satisfactory', paperId: null },
];

// ─── QUESTION PAPERS ──────────────────────────────────────────────────────────
export const questionPapers = [
  {
    id: 1,
    title: 'Unit Test 1 – Mathematics',
    examId: 1,
    className: '10A',
    subject: 'Mathematics',
    academicYear: '2026-27',
    maxMarks: 50,
    duration: '2 hrs',
    instructions: 'All questions are compulsory. Show all working clearly. Use blue or black pen only.',
    createdBy: 'Mr. Amit Verma',
    createdDate: '2026-07-20',
    status: 'published',
    sections: [
      {
        id: 1, title: 'Section A – Objective Questions', sectionInstructions: 'Choose the correct option. (1 mark each)',
        questions: [
          { id: 1, text: 'Which of the following is an irrational number?',              type: 'MCQ',   marks: 1, options: ['√4', '√9', '√2', '3/4'],              answer: '√2' },
          { id: 2, text: 'The HCF of 12 and 18 is:',                                    type: 'MCQ',   marks: 1, options: ['3', '6', '9', '12'],                  answer: '6' },
          { id: 3, text: 'The degree of polynomial 3x² + 5x – 2 is:',                   type: 'MCQ',   marks: 1, options: ['1', '2', '3', '5'],                   answer: '2' },
          { id: 4, text: 'If p(x) = x² – 5x + 6, then p(2) = ?',                        type: 'MCQ',   marks: 1, options: ['-1', '0', '1', '2'],                  answer: '0' },
          { id: 5, text: 'The product of two consecutive positive integers is divisible by:', type: 'MCQ', marks: 1, options: ['2', '3', '4', '5'],              answer: '2' },
        ],
      },
      {
        id: 2, title: 'Section B – Short Answer', sectionInstructions: 'Answer each question showing all steps. (3 marks each)',
        questions: [
          { id: 6, text: 'Find the HCF and LCM of 12, 15 and 21 using prime factorisation.', type: 'Short', marks: 3, answer: 'HCF = 3, LCM = 420' },
          { id: 7, text: 'Find the zeroes of p(x) = x² – 3x + 2 and verify the relationship between zeroes and coefficients.', type: 'Short', marks: 3, answer: 'Zeroes: 1 and 2. Sum = 3 = –(–3)/1, Product = 2 = 2/1 ✓' },
          { id: 8, text: 'Express 156 as a product of its prime factors.',                   type: 'Short', marks: 3, answer: '156 = 2² × 3 × 13' },
        ],
      },
      {
        id: 3, title: 'Section C – Long Answer', sectionInstructions: 'Show detailed working. (5 marks each)',
        questions: [
          { id: 9, text: 'Prove that √2 is irrational using the method of contradiction.',  type: 'Long',  marks: 5, answer: 'Assume √2 = p/q in lowest terms. Then 2q² = p², so p is even. Let p = 2m, then 2q² = 4m², q² = 2m², so q is also even. This contradicts HCF(p,q)=1. Hence √2 is irrational.' },
          { id: 10, text: 'Divide 2x³ – 3x² + 5x – 6 by x² – x + 1 and verify the division algorithm.', type: 'Long', marks: 5, answer: 'Quotient: 2x – 1, Remainder: 4x – 5. Verification: (x²–x+1)(2x–1)+(4x–5) = 2x³–3x²+5x–6 ✓' },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Unit Test 1 – Science',
    examId: 2,
    className: '10A',
    subject: 'Science',
    academicYear: '2026-27',
    maxMarks: 50,
    duration: '2 hrs',
    instructions: 'All questions are compulsory. Diagrams must be neat, labelled, and drawn in pencil.',
    createdBy: 'Ms. Sunita Patel',
    createdDate: '2026-07-22',
    status: 'published',
    sections: [
      {
        id: 1, title: 'Section A – Objective Questions', sectionInstructions: 'Choose the correct option. (1 mark each)',
        questions: [
          { id: 1, text: 'Which of the following is a physical change?',        type: 'MCQ', marks: 1, options: ['Burning of paper', 'Melting of ice', 'Rusting of iron', 'Digestion of food'], answer: 'Melting of ice' },
          { id: 2, text: 'The chemical formula of quicklime is:',               type: 'MCQ', marks: 1, options: ['Ca(OH)₂', 'CaO', 'CaCO₃', 'CaCl₂'],                                         answer: 'CaO' },
          { id: 3, text: 'Acid rain is mainly caused by:',                      type: 'MCQ', marks: 1, options: ['CO₂', 'SO₂ and NO₂', 'O₃', 'CH₄'],                                           answer: 'SO₂ and NO₂' },
          { id: 4, text: 'pH of a neutral solution is:',                        type: 'MCQ', marks: 1, options: ['0', '7', '14', '1'],                                                          answer: '7' },
          { id: 5, text: 'Which indicator turns red in acid?',                  type: 'MCQ', marks: 1, options: ['Phenolphthalein', 'Litmus', 'Turmeric', 'Methyl orange'],                     answer: 'Litmus' },
        ],
      },
      {
        id: 2, title: 'Section B – Short Answer', sectionInstructions: '(3 marks each)',
        questions: [
          { id: 6, text: 'Explain the difference between exothermic and endothermic reactions with one example each.', type: 'Short', marks: 3, answer: 'Exothermic: releases heat, e.g. burning of coal. Endothermic: absorbs heat, e.g. photosynthesis.' },
          { id: 7, text: 'What is a balanced equation? Balance: H₂ + O₂ → H₂O',  type: 'Short', marks: 3, answer: '2H₂ + O₂ → 2H₂O. A balanced equation has equal atoms of each element on both sides.' },
          { id: 8, text: 'Describe two properties each of acids and bases.',        type: 'Short', marks: 3, answer: 'Acids: sour taste, pH < 7, turns litmus red. Bases: bitter taste, soapy feel, pH > 7, turns litmus blue.' },
        ],
      },
      {
        id: 3, title: 'Section C – Long Answer', sectionInstructions: '(5 marks each)',
        questions: [
          { id: 9, text: 'Explain with a neat labelled diagram the process of photosynthesis. State the conditions necessary for the process.', type: 'Long', marks: 5, answer: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Conditions: sunlight, chlorophyll, CO₂, water. [Draw diagram of leaf cross-section with arrow showing CO₂ in, O₂ out, sunlight arrow, glucose stored.]' },
          { id: 10, text: 'What is a displacement reaction? Write the chemical equation for iron and copper sulphate solution and state your observations.', type: 'Long', marks: 5, answer: 'Fe + CuSO₄ → FeSO₄ + Cu. Observations: blue colour of solution fades, brown copper deposits on iron nail, nail loses mass.' },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'First Term Mathematics – 2025-26',
    examId: 9,
    className: '10A',
    subject: 'Mathematics',
    academicYear: '2025-26',
    maxMarks: 100,
    duration: '3 hrs',
    instructions: 'All questions are compulsory. No calculator permitted. Show all steps for full marks.',
    createdBy: 'Mr. Amit Verma',
    createdDate: '2026-04-14',
    status: 'published',
    sections: [
      {
        id: 1, title: 'Section A – Multiple Choice (20 marks)', sectionInstructions: '20 questions of 1 mark each. Choose the best option.',
        questions: [
          { id: 1, text: 'The sum of exponents of prime factors of 540 is:',          type: 'MCQ', marks: 1, options: ['5', '6', '7', '8'],                          answer: '6' },
          { id: 2, text: 'If one zero of 4x² – 9 is 3/2, the other zero is:',        type: 'MCQ', marks: 1, options: ['3/2', '–3/2', '2/3', '–2/3'],                answer: '–3/2' },
          { id: 3, text: 'The discriminant of x² – 2x + 1 = 0 is:',                  type: 'MCQ', marks: 1, options: ['0', '4', '–4', '8'],                          answer: '0' },
          { id: 4, text: 'The 10th term of AP: 5, 8, 11, 14, … is:',                 type: 'MCQ', marks: 1, options: ['29', '32', '35', '38'],                        answer: '32' },
          { id: 5, text: 'HCF × LCM = __ for two numbers a and b:',                  type: 'MCQ', marks: 1, options: ['a + b', 'a × b', 'a – b', 'a / b'],           answer: 'a × b' },
        ],
      },
      {
        id: 2, title: 'Section B – Short Answer I (20 marks)', sectionInstructions: '10 questions of 2 marks each.',
        questions: [
          { id: 6, text: 'Find the LCM of 96 and 360.',                                  type: 'Short', marks: 2, answer: '720' },
          { id: 7, text: 'If α, β are zeroes of x² + 7x + 10, find α² + β².',           type: 'Short', marks: 2, answer: 'α+β=–7, αβ=10. α²+β²=(α+β)²–2αβ=49–20=29' },
          { id: 8, text: 'Solve: 2x + 3y = 11 and 2x – 4y = –24.',                      type: 'Short', marks: 2, answer: 'y = 5, x = –2' },
          { id: 9, text: 'Find k so that kx(x–2) + 6 = 0 has equal roots.',             type: 'Short', marks: 2, answer: 'k = 6' },
          { id: 10, text: 'In an AP, a₃ = 4 and a₉ = –8. Which term is zero?',          type: 'Short', marks: 2, answer: '6th term (a₆ = 0)' },
        ],
      },
      {
        id: 3, title: 'Section C – Short Answer II (30 marks)', sectionInstructions: '10 questions of 3 marks each.',
        questions: [
          { id: 11, text: 'Prove that 5√3 is irrational.',                               type: 'Short', marks: 3, answer: 'Assume 5√3 = p/q. Then √3 = p/5q, which is rational. But √3 is irrational. Contradiction.' },
          { id: 12, text: 'Find all zeroes of 2x⁴ – 3x³ – 3x² + 6x – 2 given √2 and –√2 are two zeroes.', type: 'Short', marks: 3, answer: '(x²–2) divides 2x⁴–3x³–3x²+6x–2. Quotient: 2x²–3x+1. Other zeroes: 1, 1/2.' },
          { id: 13, text: 'A fraction becomes 9/11 if 2 is added to both numerator and denominator. If 3 is added to both, it becomes 5/6. Find the fraction.', type: 'Short', marks: 3, answer: '7/9' },
          { id: 14, text: 'The sum of a two-digit number and the number obtained by reversing its digits is 99. If the digits differ by 3, find the number.', type: 'Short', marks: 3, answer: '36 or 63' },
        ],
      },
      {
        id: 4, title: 'Section D – Long Answer (30 marks)', sectionInstructions: '6 questions of 5 marks each.',
        questions: [
          { id: 15, text: 'Solve graphically: 2x + y = 6 and 2x – y = 2. Also find the vertices of the triangle formed with the x-axis.', type: 'Long', marks: 5, answer: 'Intersection: (2, 2). X-intercepts: (3, 0) and (1, 0). Triangle vertices: (2,2), (3,0), (1,0). Area = 2 sq units.' },
          { id: 16, text: 'The sum of first n terms of an AP is 5n² – 3n. Find the AP and its 20th term.', type: 'Long', marks: 5, answer: 'a₁ = S₁ = 2. a₂ = S₂ – S₁ = 14. d = 12. AP: 2, 14, 26, … a₂₀ = 2 + 19 × 12 = 230.' },
          { id: 17, text: 'Prove that the ratio of the areas of two similar triangles is equal to the ratio of the squares of their corresponding sides.', type: 'Long', marks: 5, answer: '[Standard proof with diagram: Draw altitudes, prove triangles similar, ratio of areas = ratio of products of bases and heights = ratio of squares of sides.]' },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Unit Test 1 – English',
    examId: 3,
    className: '10A',
    subject: 'English',
    academicYear: '2026-27',
    maxMarks: 50,
    duration: '2 hrs',
    instructions: 'Attempt all sections. Write in clear, legible handwriting. Grammatical accuracy will be considered.',
    createdBy: 'Mr. John Davis',
    createdDate: '2026-07-24',
    status: 'draft',
    sections: [
      {
        id: 1, title: 'Section A – Reading Comprehension', sectionInstructions: '(10 marks)',
        questions: [
          { id: 1, text: 'Read the following passage and answer the questions below:\n\n"The Himalayan ecosystem is one of the most fragile on Earth. Climate change has caused glaciers to retreat at an alarming rate, threatening water supplies for hundreds of millions of people across South Asia…"\n\n(a) What makes the Himalayan ecosystem fragile? (2 marks)\n(b) How does climate change affect glaciers? (2 marks)\n(c) What are the consequences for people? (2 marks)\n(d) Suggest two measures to protect Himalayan glaciers. (4 marks)', type: 'Long', marks: 10, answer: '(a) Sensitive to temperature changes, biodiversity, altitude. (b) Causes retreat, reduces ice mass. (c) Water scarcity for 100s of millions. (d) Reduce emissions, afforestation, sustainable tourism.' },
        ],
      },
      {
        id: 2, title: 'Section B – Grammar & Language', sectionInstructions: 'Attempt all questions.',
        questions: [
          { id: 2, text: 'Change the following sentences into Passive Voice:\n(a) She wrote the letter. (1 mark)\n(b) They are building a new bridge. (1 mark)\n(c) He will complete the project tomorrow. (1 mark)', type: 'Short', marks: 3, answer: '(a) The letter was written by her. (b) A new bridge is being built by them. (c) The project will be completed by him tomorrow.' },
          { id: 3, text: 'Fill in the blanks with correct form of verbs in brackets:\n(a) She _____ (play) tennis every day. (b) They _____ (arrive) by the time we reached. (c) He _____ (read) the novel since morning.', type: 'Short', marks: 3, answer: '(a) plays (b) had arrived (c) has been reading' },
          { id: 4, text: 'Identify the type of clause in the following sentences and state its function:\n(a) "The book that she borrowed was very interesting." (2 marks)', type: 'Short', marks: 2, answer: '"that she borrowed" – Relative/Adjective clause; modifies "the book".' },
        ],
      },
      {
        id: 3, title: 'Section C – Writing', sectionInstructions: '(15 marks)',
        questions: [
          { id: 5, text: 'Write a letter to the Editor of a local newspaper expressing your concern about increasing noise pollution in your city. (120–150 words)', type: 'Long', marks: 7, answer: '[Format: Sender address, date, Editor address, subject, salutation, body with causes/effects/suggestions, closing, name/signature]' },
          { id: 6, text: 'Write a short paragraph (80–100 words) on the importance of reading books in the age of digital media.', type: 'Long', marks: 8, answer: '[Evaluate: content, language, coherence, vocabulary, grammar]' },
        ],
      },
    ],
  },
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
  { role: 'Principal',     username: 'principal',   password: 'principal123' },
  { role: 'Headmaster',    username: 'headmaster',  password: 'head123'      },
  { role: 'Teacher',       username: 'teacher1',    password: 'teach123'     },
  { role: 'Student',       username: 'student1',    password: 'stud123'      },
  { role: 'Parent',        username: 'parent1',     password: 'par123'       },
  { role: 'Accountant',    username: 'accountant1', password: 'acc123'       },
  { role: 'Support Staff', username: 'gatekeeper1', password: 'gate123'      },
  { role: 'Guest',         username: 'guest',       password: 'guest'        },
];
