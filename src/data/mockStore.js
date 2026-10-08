// Local "database" that stands in for the real backend while it's unreliable.
// Persists to localStorage so data survives logout/login across roles, and
// reseeds from scratch after MOCK_STORE_TTL_MS so stale demo data doesn't pile up.

const STORAGE_KEY = 'padaye_mock_store_v1';
const MOCK_STORE_TTL_MS = 24 * 60 * 60 * 1000;

function pad(n) { return String(n).padStart(2, '0'); }
function isoDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

// Most recent `count` weekdays (Mon–Fri), oldest first, so seeded attendance
// always has data for "today" regardless of when the app happens to run.
function recentWeekdays(count) {
  const dates = [];
  const d = new Date();
  while (dates.length < count) {
    if (d.getDay() !== 0 && d.getDay() !== 6) dates.unshift(isoDate(new Date(d)));
    d.setDate(d.getDate() - 1);
  }
  return dates;
}

function buildSeed() {
  const weekdays = recentWeekdays(10);

  const users = [
    { id: 1,  username: 'principal',   password: 'principal123', role: 'principal',     name: 'Dr. Rajesh Kumar',  avatar: 'RK',  email: 'principal@greenwood.edu',    phone: '+91-98765-43210', joinDate: '2015-06-01' },
    { id: 2,  username: 'headmaster',  password: 'head123',      role: 'headmaster',    name: 'Mrs. Priya Sharma', avatar: 'PS',  email: 'headmaster@greenwood.edu',   phone: '+91-98765-43211', joinDate: '2017-07-15' },
    { id: 3,  username: 'teacher1',    password: 'teach123',     role: 'teacher',       name: 'Mr. Amit Verma',    avatar: 'AV',  email: 'amit.verma@greenwood.edu',   phone: '+91-98765-43212', joinDate: '2018-06-01' },
    { id: 4,  username: 'teacher2',    password: 'teach123',     role: 'teacher',       name: 'Ms. Sunita Patel',  avatar: 'SP',  email: 'sunita.patel@greenwood.edu', phone: '+91-98765-43213', joinDate: '2019-07-01' },
    { id: 5,  username: 'teacher3',    password: 'teach123',     role: 'teacher',       name: 'Mr. John Davis',    avatar: 'JD',  email: 'john.davis@greenwood.edu',   phone: '+91-98765-43214', joinDate: '2020-06-01' },
    { id: 6,  username: 'student1',    password: 'stud123',      role: 'student',       name: 'Rahul Singh',       avatar: 'RS' },
    { id: 7,  username: 'student2',    password: 'stud123',      role: 'student',       name: 'Priya Kapoor',      avatar: 'PK' },
    { id: 8,  username: 'student3',    password: 'stud123',      role: 'student',       name: 'Arjun Mehta',       avatar: 'AM' },
    { id: 9,  username: 'parent1',     password: 'par123',       role: 'parent',        name: 'Mr. Ravi Singh',    avatar: 'RVS', email: 'ravi.singh@gmail.com',   phone: '+91-98765-43215' },
    { id: 10, username: 'parent2',     password: 'par123',       role: 'parent',        name: 'Mrs. Anita Kapoor', avatar: 'ANK', email: 'anita.kapoor@gmail.com', phone: '+91-98765-43216' },
    { id: 11, username: 'parent3',     password: 'par123',       role: 'parent',        name: 'Mr. Suresh Mehta',  avatar: 'SRM', email: 'suresh.mehta@gmail.com', phone: '+91-98765-43217' },
    { id: 12, username: 'guest',       password: 'guest',        role: 'guest',         name: 'Guest User',        avatar: 'GU' },
    { id: 13, username: 'accountant1', password: 'acc123',       role: 'accountant',    name: 'Ms. Kavya Sharma',  avatar: 'KSH', email: 'kavya.sharma@greenwood.edu', phone: '+91-98765-43220', joinDate: '2019-01-15' },
    { id: 14, username: 'gatekeeper1', password: 'gate123',      role: 'support_staff', name: 'Mr. Ramesh Kumar',  avatar: 'RMK', email: 'ramesh.kumar@greenwood.edu', phone: '+91-98765-43221', joinDate: '2020-03-01' },
    { id: 18, username: 'teacher4',    password: 'teach123',     role: 'teacher',       name: 'Mrs. Geeta Nair',   avatar: 'GN',  email: 'geeta.nair@greenwood.edu',   phone: '+91-98765-43225', joinDate: '2016-06-01' },
    { id: 19, username: 'teacher5',    password: 'teach123',     role: 'teacher',       name: 'Mr. Arun Roy',      avatar: 'AR',  email: 'arun.roy@greenwood.edu',     phone: '+91-98765-43226', joinDate: '2017-06-01' },
  ];

  const students = [
    { id: 6, firstName: 'Rahul', lastName: 'Singh',  admissionNumber: 'ADM2020006', classId: 1, dateOfBirth: '2009-05-15', guardianName: 'Mr. Ravi Singh',    guardianPhone: '+91-98765-43215', bloodGroup: 'O+', gender: 'Male',   parentUserId: 9 },
    { id: 7, firstName: 'Priya', lastName: 'Kapoor', admissionNumber: 'ADM2020007', classId: 1, dateOfBirth: '2009-08-22', guardianName: 'Mrs. Anita Kapoor', guardianPhone: '+91-98765-43216', bloodGroup: 'B+', gender: 'Female', parentUserId: 10 },
    { id: 8, firstName: 'Arjun', lastName: 'Mehta',  admissionNumber: 'ADM2021008', classId: 3, dateOfBirth: '2010-03-10', guardianName: 'Mr. Suresh Mehta',  guardianPhone: '+91-98765-43217', bloodGroup: 'A+', gender: 'Male',   parentUserId: 11 },
  ];

  const staff = [
    { id: 1,  firstName: 'Rajesh', lastName: 'Kumar',  staffCode: 'EMP001', staffRole: 'PRINCIPAL',     email: 'principal@greenwood.edu',    phone: '+91-98765-43210', active: true },
    { id: 2,  firstName: 'Priya',  lastName: 'Sharma', staffCode: 'EMP002', staffRole: 'HEADMASTER',    email: 'headmaster@greenwood.edu',   phone: '+91-98765-43211', active: true },
    { id: 3,  firstName: 'Amit',   lastName: 'Verma',  staffCode: 'EMP003', staffRole: 'TEACHER',       email: 'amit.verma@greenwood.edu',   phone: '+91-98765-43212', active: true, subject: 'Mathematics' },
    { id: 4,  firstName: 'Sunita', lastName: 'Patel',  staffCode: 'EMP004', staffRole: 'TEACHER',       email: 'sunita.patel@greenwood.edu', phone: '+91-98765-43213', active: true, subject: 'Science' },
    { id: 5,  firstName: 'John',   lastName: 'Davis',  staffCode: 'EMP005', staffRole: 'TEACHER',       email: 'john.davis@greenwood.edu',   phone: '+91-98765-43214', active: true, subject: 'English' },
    { id: 13, firstName: 'Kavya',  lastName: 'Sharma', staffCode: 'EMP013', staffRole: 'ACCOUNTANT',    email: 'kavya.sharma@greenwood.edu', phone: '+91-98765-43220', active: true },
    { id: 14, firstName: 'Ramesh', lastName: 'Kumar',  staffCode: 'EMP014', staffRole: 'SUPPORT_STAFF', email: 'ramesh.kumar@greenwood.edu', phone: '+91-98765-43221', active: true },
    { id: 18, firstName: 'Geeta',  lastName: 'Nair',   staffCode: 'EMP018', staffRole: 'TEACHER',       email: 'geeta.nair@greenwood.edu',   phone: '+91-98765-43225', active: true, subject: 'History' },
    { id: 19, firstName: 'Arun',   lastName: 'Roy',    staffCode: 'EMP019', staffRole: 'TEACHER',       email: 'arun.roy@greenwood.edu',     phone: '+91-98765-43226', active: true, subject: 'Geography' },
  ];

  const classes = [
    { id: 1, name: '10A', gradeLevel: 10, section: 'A', classTeacherStaffId: 3, active: true },
    { id: 2, name: '10B', gradeLevel: 10, section: 'B', classTeacherStaffId: 5, active: true },
    { id: 3, name: '9A',  gradeLevel: 9,  section: 'A', classTeacherStaffId: 3, active: true },
    { id: 4, name: '9B',  gradeLevel: 9,  section: 'B', classTeacherStaffId: 5, active: true },
    { id: 5, name: '8A',  gradeLevel: 8,  section: 'A', classTeacherStaffId: 4, active: true },
    { id: 6, name: '8B',  gradeLevel: 8,  section: 'B', classTeacherStaffId: 4, active: true },
  ];

  const exams = [
    { id: 1,  classId: 1, subject: 'Mathematics', examDate: '2026-08-10', maxMarks: 50 },
    { id: 2,  classId: 1, subject: 'Science',     examDate: '2026-08-12', maxMarks: 50 },
    { id: 3,  classId: 1, subject: 'English',     examDate: '2026-08-14', maxMarks: 50 },
    { id: 4,  classId: 1, subject: 'Mathematics', examDate: '2026-09-01', maxMarks: 100 },
    { id: 5,  classId: 1, subject: 'Science',     examDate: '2026-09-03', maxMarks: 100 },
    { id: 6,  classId: 1, subject: 'English',     examDate: '2026-09-05', maxMarks: 100 },
    { id: 9,  classId: 1, subject: 'Mathematics', examDate: '2026-04-15', maxMarks: 100 },
    { id: 10, classId: 1, subject: 'Science',     examDate: '2026-04-17', maxMarks: 100 },
    { id: 11, classId: 3, subject: 'Mathematics', examDate: '2026-08-11', maxMarks: 50 },
  ];

  const homework = [
    { id: 1, classId: 1, subject: 'Mathematics', title: 'Exercise 1.3 – Real Numbers',   description: 'Complete problems 1-15 from Exercise 1.3 in NCERT textbook.',       dueDate: '2026-08-04', createdByStaffId: 3 },
    { id: 2, classId: 1, subject: 'Science',     title: 'Lab Report – Chemical Reactions', description: 'Write a detailed lab report for the vinegar-baking soda experiment.', dueDate: '2026-08-05', createdByStaffId: 4 },
    { id: 3, classId: 1, subject: 'English',     title: 'Essay – My School Memories',     description: 'Write a 500-word essay on your favourite school memory.',          dueDate: '2026-08-01', createdByStaffId: 5 },
    { id: 4, classId: 1, subject: 'Mathematics', title: 'Chapter 2 Practice Problems',    description: 'Practice problems from Chapter 2 – Polynomials.',                  dueDate: '2026-07-28', createdByStaffId: 3 },
    { id: 5, classId: 1, subject: 'History',     title: 'Timeline – Indian Independence', description: 'Create a detailed timeline of events leading to Indian Independence.', dueDate: '2026-08-06', createdByStaffId: 18 },
    { id: 6, classId: 3, subject: 'Mathematics', title: 'Algebra Worksheet 1',            description: 'Complete worksheet on algebraic expressions.',                      dueDate: '2026-08-04', createdByStaffId: 3 },
  ];

  const notes = [
    { id: 1, classId: 1, subject: 'Mathematics', title: 'Chapter 1: Real Numbers',          fileUrl: '', uploadedByStaffId: 3 },
    { id: 2, classId: 1, subject: 'Mathematics', title: 'Chapter 2: Polynomials',            fileUrl: '', uploadedByStaffId: 3 },
    { id: 3, classId: 1, subject: 'Mathematics', title: 'Chapter 3: Linear Equations',       fileUrl: '', uploadedByStaffId: 3 },
    { id: 4, classId: 1, subject: 'Science',     title: 'Chapter 1: Chemical Reactions',     fileUrl: '', uploadedByStaffId: 4 },
    { id: 5, classId: 1, subject: 'Science',     title: 'Chapter 2: Acids, Bases and Salts', fileUrl: '', uploadedByStaffId: 4 },
    { id: 6, classId: 1, subject: 'English',     title: 'Poetry Analysis Guide',             fileUrl: '', uploadedByStaffId: 5 },
    { id: 7, classId: 1, subject: 'English',     title: 'Grammar: Voice & Narration',        fileUrl: '', uploadedByStaffId: 5 },
    { id: 8, classId: 3, subject: 'Mathematics', title: 'Chapter 1: Real Numbers (9A)',      fileUrl: '', uploadedByStaffId: 3 },
  ];

  const results = [
    { id: 1, studentId: 6, examId: 9,  subject: 'Mathematics', marksObtained: 85, maxMarks: 100, grade: 'A'  },
    { id: 2, studentId: 6, examId: 10, subject: 'Science',     marksObtained: 78, maxMarks: 100, grade: 'B+' },
    { id: 3, studentId: 7, examId: 9,  subject: 'Mathematics', marksObtained: 91, maxMarks: 100, grade: 'A+' },
    { id: 4, studentId: 7, examId: 10, subject: 'Science',     marksObtained: 88, maxMarks: 100, grade: 'A'  },
    { id: 5, studentId: 8, examId: 9,  subject: 'Mathematics', marksObtained: 72, maxMarks: 100, grade: 'B'  },
    { id: 6, studentId: 6, examId: 9,  subject: 'English',     marksObtained: 80, maxMarks: 100, grade: 'A'  },
    { id: 7, studentId: 7, examId: 9,  subject: 'English',     marksObtained: 76, maxMarks: 100, grade: 'B+' },
    { id: 8, studentId: 8, examId: 9,  subject: 'English',     marksObtained: 68, maxMarks: 100, grade: 'B'  },
  ];

  const questionPapers = [
    {
      id: 1, classId: 1, subject: 'Mathematics', title: 'Unit Test 1 – Mathematics', examId: 1, fileUrl: '',
      createdAt: '2026-07-20T09:00:00Z',
      content: {
        paperType: 'complete', academicYear: '2026-27', maxMarks: 50, duration: '2 hrs',
        instructions: 'All questions are compulsory. Show all working clearly. Use blue or black pen only.',
        status: 'published',
        sections: [
          {
            id: 1, title: 'Section A – Objective Questions', sectionInstructions: 'Choose the correct option. (1 mark each)',
            questions: [
              { id: 1, type: 'MCQ', text: 'Which of the following is an irrational number?', marks: 1, options: ['√4', '√9', '√2', '3/4'], answer: '√2' },
              { id: 2, type: 'MCQ', text: 'The HCF of 12 and 18 is:', marks: 1, options: ['3', '6', '9', '12'], answer: '6' },
              { id: 3, type: 'MCQ', text: 'The degree of polynomial 3x² + 5x – 2 is:', marks: 1, options: ['1', '2', '3', '5'], answer: '2' },
            ],
          },
          {
            id: 2, title: 'Section B – Short Answer', sectionInstructions: 'Answer each question showing all steps. (3 marks each)',
            questions: [
              { id: 4, type: 'Short', text: 'Find the HCF and LCM of 12, 15 and 21 using prime factorisation.', marks: 3, answer: 'HCF = 3, LCM = 420' },
              { id: 5, type: 'Short', text: 'Express 156 as a product of its prime factors.', marks: 3, answer: '156 = 2² × 3 × 13' },
            ],
          },
        ],
      },
    },
    {
      id: 2, classId: 1, subject: 'Science', title: 'Unit Test 1 – Science', examId: 2, fileUrl: '',
      createdAt: '2026-07-22T09:00:00Z',
      content: {
        paperType: 'complete', academicYear: '2026-27', maxMarks: 50, duration: '2 hrs',
        instructions: 'All questions are compulsory. Diagrams must be neat, labelled, and drawn in pencil.',
        status: 'published',
        sections: [
          {
            id: 1, title: 'Section A – Objective Questions', sectionInstructions: 'Choose the correct option. (1 mark each)',
            questions: [
              { id: 1, type: 'MCQ', text: 'Which of the following is a physical change?', marks: 1, options: ['Burning of paper', 'Melting of ice', 'Rusting of iron', 'Digestion of food'], answer: 'Melting of ice' },
              { id: 2, type: 'MCQ', text: 'The chemical formula of quicklime is:', marks: 1, options: ['Ca(OH)₂', 'CaO', 'CaCO₃', 'CaCl₂'], answer: 'CaO' },
            ],
          },
          {
            id: 2, title: 'Section B – Short Answer', sectionInstructions: '(3 marks each)',
            questions: [
              { id: 3, type: 'Short', text: 'What is a balanced equation? Balance: H₂ + O₂ → H₂O', marks: 3, answer: '2H₂ + O₂ → 2H₂O.' },
            ],
          },
        ],
      },
    },
    {
      id: 3, classId: 1, subject: 'Mathematics', title: 'First Term Mathematics – 2025-26', examId: 9, fileUrl: '',
      createdAt: '2026-04-14T09:00:00Z',
      content: {
        paperType: 'complete', academicYear: '2025-26', maxMarks: 100, duration: '3 hrs',
        instructions: 'All questions are compulsory. No calculator permitted. Show all steps for full marks.',
        status: 'published',
        sections: [
          {
            id: 1, title: 'Section A – Multiple Choice (20 marks)', sectionInstructions: '20 questions of 1 mark each. Choose the best option.',
            questions: [
              { id: 1, type: 'MCQ', text: 'The sum of exponents of prime factors of 540 is:', marks: 1, options: ['5', '6', '7', '8'], answer: '6' },
              { id: 2, type: 'MCQ', text: 'The discriminant of x² – 2x + 1 = 0 is:', marks: 1, options: ['0', '4', '–4', '8'], answer: '0' },
            ],
          },
          {
            id: 2, title: 'Section B – Match the Following', sectionInstructions: 'Match Column A with Column B.',
            questions: [
              {
                id: 3, type: 'MatchFollowing', text: 'Match the following:', marks: 5, answer: '',
                pairs: [
                  { id: 1, left: 'HCF(12, 18)', right: '6' },
                  { id: 2, left: 'LCM(4, 6)',    right: '12' },
                  { id: 3, left: '√2',           right: 'Irrational' },
                  { id: 4, left: 'Degree of 3x²+5x-2', right: '2' },
                ],
              },
            ],
          },
          {
            id: 3, title: 'Section C – Match the Following (Shuffled)', sectionInstructions: 'Match Column A with Column B.',
            questions: [
              {
                id: 4, type: 'MatchFollowingShuffled', text: 'Match the following:', marks: 5, answer: '',
                pairs: [
                  { id: 1, left: 'Sum of zeroes',     right: '-b/a' },
                  { id: 2, left: 'Product of zeroes',  right: 'c/a' },
                  { id: 3, left: 'Nature of roots (D=0)', right: 'Real and equal' },
                  { id: 4, left: 'nth term of AP',     right: 'a + (n-1)d' },
                ],
                shuffledOrder: [2, 3, 0, 1],
              },
            ],
          },
        ],
      },
    },
    {
      id: 4, classId: 1, subject: 'English', title: 'Unit Test 1 – English', examId: 3, fileUrl: '',
      createdAt: '2026-07-24T09:00:00Z',
      content: {
        paperType: 'complete', academicYear: '2026-27', maxMarks: 50, duration: '2 hrs',
        instructions: 'Attempt all sections. Write in clear, legible handwriting.',
        status: 'draft',
        sections: [
          {
            id: 1, title: 'Section A – Grammar', sectionInstructions: 'Fill in the blanks.',
            questions: [
              { id: 1, type: 'FillBlanks', text: 'The capital of India is ______.', marks: 1, answer: 'New Delhi' },
              { id: 2, type: 'TrueFalse', text: 'A noun is a part of speech.', marks: 1, answer: 'True' },
            ],
          },
        ],
      },
    },
  ];

  const notices = [
    { id: 1, title: 'Annual Sports Day Registrations Open',   body: 'Annual Sports Day will be held on September 20, 2026. Registrations are now open. Submit names to your class teacher by August 15, 2026.', audienceRole: 'ALL',    postedByUserId: 1, createdAt: '2026-08-01T08:00:00Z' },
    { id: 2, title: 'Parent-Teacher Meeting – Class 10',      body: 'A Parent-Teacher meeting for Class 10 students is scheduled on August 8, 2026 from 10:00 AM to 1:00 PM.',                                   audienceRole: 'PARENT', postedByUserId: 2, createdAt: '2026-07-30T08:00:00Z' },
    { id: 3, title: 'Unit Test 1 Schedule Released',          body: 'The Unit Test 1 schedule has been released. Tests will be conducted from August 10–20, 2026.',                                              audienceRole: 'ALL',    postedByUserId: 2, createdAt: '2026-07-28T08:00:00Z' },
    { id: 4, title: 'Library Renovation Notice',              body: 'The school library will be closed for renovation from August 5–10, 2026.',                                                                   audienceRole: 'ALL',    postedByUserId: 1, createdAt: '2026-07-25T08:00:00Z' },
    { id: 5, title: 'Independence Day Celebration Programme', body: 'Independence Day celebrations will be held on August 15, 2026 at 8:00 AM in the school ground. Attendance is compulsory.',                   audienceRole: 'ALL',    postedByUserId: 1, createdAt: '2026-08-03T08:00:00Z' },
    { id: 6, title: 'Fee Reminder – Second Instalment',       body: 'This is a reminder that the second instalment of school fees is due by August 31, 2026.',                                                     audienceRole: 'PARENT', postedByUserId: 13, createdAt: '2026-07-20T08:00:00Z' },
  ];

  const fees = [
    { id: 1, studentId: 6, academicYear: '2026-27', totalAmount: 48000, paidAmount: 12000, dueDate: '2026-08-31', status: 'PARTIAL' },
    { id: 2, studentId: 7, academicYear: '2026-27', totalAmount: 48000, paidAmount: 24000, dueDate: '2026-08-31', status: 'PARTIAL' },
    { id: 3, studentId: 8, academicYear: '2026-27', totalAmount: 44000, paidAmount: 11000, dueDate: '2026-08-31', status: 'PARTIAL' },
  ];

  const holidays = [
    { id: 1,  date: '2026-08-15', name: 'Independence Day', type: 'National', description: "India's 80th Independence Day celebrations" },
    { id: 2,  date: '2026-08-26', name: 'Janmashtami',      type: 'Festival', description: "Festival celebrating Lord Krishna's birthday" },
    { id: 3,  date: '2026-09-05', name: "Teacher's Day",    type: 'National', description: "Celebration of Dr. Sarvepalli Radhakrishnan's birthday" },
    { id: 4,  date: '2026-09-14', name: 'Hindi Diwas',      type: 'National', description: 'Celebration of Hindi as official language' },
    { id: 5,  date: '2026-10-02', name: 'Gandhi Jayanti',   type: 'National', description: 'Birth anniversary of Mahatma Gandhi' },
    { id: 6,  date: '2026-10-07', name: 'Navratri begins',  type: 'Festival', description: 'Nine nights of Navratri festival' },
    { id: 7,  date: '2026-10-20', name: 'Dussehra',         type: 'Festival', description: 'Festival of triumph of good over evil' },
    { id: 8,  date: '2026-11-01', name: 'Diwali Holiday',   type: 'Festival', description: 'Diwali vacation – school closed for 3 days' },
    { id: 9,  date: '2026-11-02', name: 'Diwali Holiday',   type: 'Festival', description: 'Diwali vacation' },
    { id: 10, date: '2026-11-03', name: 'Diwali Holiday',   type: 'Festival', description: 'Diwali vacation' },
    { id: 11, date: '2026-12-25', name: 'Christmas Day',    type: 'National', description: 'Christmas celebration' },
    { id: 12, date: '2027-01-01', name: "New Year's Day",   type: 'National', description: 'New Year holiday' },
    { id: 13, date: '2027-01-26', name: 'Republic Day',     type: 'National', description: "India's Republic Day" },
    { id: 14, date: '2027-02-19', name: 'Shivaji Jayanti',  type: 'Regional', description: 'Birth anniversary of Chhatrapati Shivaji Maharaj' },
    { id: 15, date: '2027-03-08', name: 'Holi',             type: 'Festival', description: 'Festival of colours' },
  ];

  // Attendance for the last 10 weekdays so "today" always has data.
  const attendanceRecords = [];
  let aId = 1;
  const perStudentClass = [{ studentId: 6, classId: 1 }, { studentId: 7, classId: 1 }, { studentId: 8, classId: 3 }];
  weekdays.forEach((date, i) => {
    perStudentClass.forEach(({ studentId, classId }) => {
      const roll = (studentId * 7 + i * 3) % 10;
      const status = roll === 0 ? 'ABSENT' : roll === 1 ? 'LATE' : 'PRESENT';
      attendanceRecords.push({ id: aId++, studentId, classId, date, status });
    });
  });

  const timetableSlots = [
    { id: 1,  classId: 1, teacherStaffId: 3,  dayOfWeek: 'MONDAY',    periodNumber: 1, startTime: '08:00', endTime: '08:45', subject: 'Mathematics' },
    { id: 2,  classId: 1, teacherStaffId: 4,  dayOfWeek: 'MONDAY',    periodNumber: 2, startTime: '08:45', endTime: '09:30', subject: 'Science' },
    { id: 3,  classId: 1, teacherStaffId: 5,  dayOfWeek: 'MONDAY',    periodNumber: 3, startTime: '09:30', endTime: '10:15', subject: 'English' },
    { id: 4,  classId: 1, teacherStaffId: 18, dayOfWeek: 'MONDAY',    periodNumber: 4, startTime: '10:30', endTime: '11:15', subject: 'History' },
    { id: 5,  classId: 1, teacherStaffId: 19, dayOfWeek: 'MONDAY',    periodNumber: 5, startTime: '11:15', endTime: '12:00', subject: 'Geography' },
    { id: 6,  classId: 1, teacherStaffId: 4,  dayOfWeek: 'TUESDAY',   periodNumber: 1, startTime: '08:00', endTime: '08:45', subject: 'Science' },
    { id: 7,  classId: 1, teacherStaffId: 3,  dayOfWeek: 'TUESDAY',   periodNumber: 2, startTime: '08:45', endTime: '09:30', subject: 'Mathematics' },
    { id: 8,  classId: 1, teacherStaffId: 5,  dayOfWeek: 'TUESDAY',   periodNumber: 3, startTime: '09:30', endTime: '10:15', subject: 'English' },
    { id: 9,  classId: 1, teacherStaffId: 3,  dayOfWeek: 'WEDNESDAY', periodNumber: 1, startTime: '08:00', endTime: '08:45', subject: 'Mathematics' },
    { id: 10, classId: 1, teacherStaffId: 18, dayOfWeek: 'WEDNESDAY', periodNumber: 2, startTime: '08:45', endTime: '09:30', subject: 'History' },
    { id: 11, classId: 1, teacherStaffId: 5,  dayOfWeek: 'THURSDAY',  periodNumber: 1, startTime: '08:00', endTime: '08:45', subject: 'English' },
    { id: 12, classId: 1, teacherStaffId: 4,  dayOfWeek: 'THURSDAY',  periodNumber: 2, startTime: '08:45', endTime: '09:30', subject: 'Science' },
    { id: 13, classId: 1, teacherStaffId: 3,  dayOfWeek: 'FRIDAY',    periodNumber: 1, startTime: '08:00', endTime: '08:45', subject: 'Mathematics' },
    { id: 14, classId: 1, teacherStaffId: 19, dayOfWeek: 'FRIDAY',    periodNumber: 2, startTime: '08:45', endTime: '09:30', subject: 'Geography' },
    { id: 15, classId: 3, teacherStaffId: 3,  dayOfWeek: 'MONDAY',    periodNumber: 1, startTime: '08:00', endTime: '08:45', subject: 'Mathematics' },
    { id: 16, classId: 3, teacherStaffId: 5,  dayOfWeek: 'TUESDAY',   periodNumber: 1, startTime: '08:00', endTime: '08:45', subject: 'English' },
  ];

  const messages = [
    { id: 1, fromId: 9,  toId: 3, subject: "Regarding Rahul's Math performance",     body: "Dear Sir, I noticed Rahul's performance in Maths has dropped slightly. Could we schedule a meeting?", date: '2026-07-28', read: false },
    { id: 2, fromId: 3,  toId: 9, subject: "RE: Regarding Rahul's Math performance", body: 'Dear Mr. Singh, Yes, Rahul needs a bit more practice on polynomials. Please come on Saturday at 11 AM.', date: '2026-07-29', read: true },
    { id: 3, fromId: 10, toId: 4, subject: "Priya's Science Project",                body: "Hello Ma'am, Can you share the topics for the Science project due next month?", date: '2026-07-30', read: false },
    { id: 4, fromId: 2,  toId: 3, subject: 'Class 10A Attendance Report',            body: 'Please submit the detailed attendance report for class 10A for July 2026 by end of this week.', date: '2026-07-31', read: false },
  ];

  return {
    users, students, staff, classes, exams, homework, notes, results,
    questionPapers, notices, fees, holidays, attendanceRecords, timetableSlots, messages,
  };
}

function readRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(store) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch { /* storage unavailable */ }
}

let cache = null;

function ensureStore() {
  if (cache) return cache;
  const existing = readRaw();
  if (existing && existing.seededAt && Date.now() - existing.seededAt < MOCK_STORE_TTL_MS) {
    cache = existing;
    return cache;
  }
  cache = { seededAt: Date.now(), tables: buildSeed() };
  persist(cache);
  return cache;
}

function saveStore() { persist(cache); }

function newLocalId(name) {
  return `local-${name}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function listTable(name) {
  const store = ensureStore();
  return (store.tables[name] || []).map(r => ({ ...r }));
}

export function getById(name, id) {
  if (id === null || id === undefined) return null;
  return listTable(name).find(r => String(r.id) === String(id)) || null;
}

export function insertRecord(name, data) {
  const store = ensureStore();
  if (!store.tables[name]) store.tables[name] = [];
  const record = { id: newLocalId(name), ...data };
  store.tables[name].push(record);
  saveStore();
  return { ...record };
}

export function updateRecord(name, id, patch) {
  const store = ensureStore();
  const list = store.tables[name] || [];
  const idx = list.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch };
  saveStore();
  return { ...list[idx] };
}

export function deleteRecord(name, id) {
  const store = ensureStore();
  const list = store.tables[name] || [];
  const idx = list.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return false;
  list.splice(idx, 1);
  saveStore();
  return true;
}

// ── Adapters ──────────────────────────────────────────────────────────────

// usersApi.listUsers() shape (Registration.jsx): fullName, UPPERCASE role, active, createdAt.
export function toUsersApiShape(u) {
  return {
    id: u.id,
    fullName: u.name,
    username: u.username,
    role: (u.role || '').toUpperCase(),
    email: u.email || '',
    active: true,
    createdAt: u.joinDate || '2020-01-01',
  };
}

// ── Derived domain helpers (mirror what the real backend endpoints return) ──

export function deriveClassTimetable(classId) {
  return listTable('timetableSlots').filter(s => String(s.classId) === String(classId));
}

export function deriveTeacherTimetable(teacherStaffId) {
  return listTable('timetableSlots').filter(s => String(s.teacherStaffId) === String(teacherStaffId));
}

export function deriveClassAttendance(classId, date) {
  let recs = listTable('attendanceRecords').filter(r => String(r.classId) === String(classId));
  if (date) recs = recs.filter(r => r.date === date);
  return { records: recs.map(r => ({ studentId: r.studentId, status: r.status })) };
}

export function deriveStudentAttendance(studentId) {
  const recs = listTable('attendanceRecords')
    .filter(r => String(r.studentId) === String(studentId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const presentDays = recs.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  const absentDays = recs.filter(r => r.status === 'ABSENT').length;
  const attendancePercentage = recs.length ? Math.round((presentDays / recs.length) * 100) : 0;
  return { attendancePercentage, presentDays, absentDays, records: recs.map(r => ({ date: r.date, status: r.status })) };
}

export function deriveSchoolAttendanceSummary() {
  const today = isoDate(new Date());
  const todays = listTable('attendanceRecords').filter(r => r.date === today);
  return {
    totalRecordsToday: todays.length,
    presentToday: todays.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length,
    absentToday: todays.filter(r => r.status === 'ABSENT').length,
  };
}

export function applyMarkAttendance(classId, date, entries) {
  const store = ensureStore();
  if (!store.tables.attendanceRecords) store.tables.attendanceRecords = [];
  const list = store.tables.attendanceRecords;
  entries.forEach(({ studentId, status }) => {
    const idx = list.findIndex(r => String(r.classId) === String(classId) && r.date === date && String(r.studentId) === String(studentId));
    if (idx >= 0) list[idx] = { ...list[idx], status };
    else list.push({ id: newLocalId('attendanceRecords'), classId, studentId, date, status });
  });
  saveStore();
  return deriveClassAttendance(classId, date);
}

export function deriveStudentFeeStatus(studentId) {
  const rec = listTable('fees').find(f => String(f.studentId) === String(studentId));
  if (!rec) return null;
  return { ...rec, feeRecordId: rec.id, pendingAmount: rec.totalAmount - rec.paidAmount };
}

export function applyPayFee({ feeRecordId, amount, method, reference }) {
  const store = ensureStore();
  const list = store.tables.fees || [];
  const idx = list.findIndex(r => String(r.id) === String(feeRecordId));
  if (idx === -1) return null;
  const updated = { ...list[idx], paidAmount: list[idx].paidAmount + Number(amount), lastPaymentMethod: method, lastPaymentReference: reference };
  updated.status = updated.paidAmount >= updated.totalAmount ? 'PAID' : updated.paidAmount > 0 ? 'PARTIAL' : 'PENDING';
  list[idx] = updated;
  saveStore();
  return { ...updated };
}

export function deriveResultsByStudent(studentId) {
  return listTable('results').filter(r => String(r.studentId) === String(studentId));
}

export function deriveAttendanceReport() {
  return { summary: deriveSchoolAttendanceSummary() };
}

export function deriveExamResultsReport() {
  return { exams: listTable('exams'), allResults: listTable('results') };
}

export function deriveFeeCollectionReport() {
  const fees = listTable('fees');
  const totalBilled = fees.reduce((s, f) => s + f.totalAmount, 0);
  const totalCollected = fees.reduce((s, f) => s + f.paidAmount, 0);
  return { totalBilled, totalCollected, totalOutstanding: totalBilled - totalCollected, recordCount: fees.length };
}

export function deriveStaffPerformanceReport() {
  const staff = listTable('staff');
  const countByRole = {};
  staff.forEach(s => { countByRole[s.staffRole] = (countByRole[s.staffRole] || 0) + 1; });
  return { totalStaff: staff.length, activeStaff: staff.filter(s => s.active).length, countByRole };
}

export function deriveAnalytics() {
  const students = listTable('students');
  const pct = students.length
    ? Math.round(students.reduce((s, st) => s + deriveStudentAttendance(st.id).attendancePercentage, 0) / students.length)
    : 0;
  return { schoolWideAttendancePercentage: pct };
}
