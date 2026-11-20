// Hand-editable defaults for school-wide static setup — Subjects and the
// starting Classes/Sections. Edit this file directly to change what the app
// starts with instead of hunting through component code.
//
// Subjects: the app always tries a real backend config endpoint first
// (src/api/configApi.js) and falls back to `defaultSubjects` below — same
// "try API, fall back locally" pattern used everywhere else in this app.
// Once seeded, Subjects also live in their own mock table (editable from the
// Principal's "Subjects" screen) — this list is only the one-time starting
// point, not re-read after that.
//
// Classes/Sections: these already have a full real CRUD path
// (src/api/classesApi.js + the Class Management screen) — `defaultClasses`
// below is purely the initial seed, not a second config source.

// Shown on the Login/Guest screens (pre-authentication, so no real data is
// available yet — totalStudents/totalStaff/totalClasses here are display-only
// marketing numbers, not live counts). Anywhere real counts ARE available
// post-login, components use the real data instead of these.
export const defaultSchoolInfo = {
  name: 'Meridian School',
  established: 1985,
  address: 'Gachibowli. New Telangana – 521237',
  phone: '+91-8547854895',
  email: 'info@greenwood.edu',
  website: 'www.greenwood.edu',
  affiliation: 'CBSE Affiliation No: 23456',
  motto: 'Knowledge, Character, Service',
  principalName: 'Dr. Rajesh Kumar',
  totalStudents: 1240,
  totalStaff: 68,
  totalClasses: 36,
};

// Derives a plausible email domain from the school's configured name, e.g.
// "Meridian International School" -> "meridian.com", so registration forms
// can auto-fill a school email as the user types a username, without a
// separate "domain" setting to keep in sync. Takes the name's first
// significant word, since that's usually what the real domain is based on
// too (e.g. this file's own default "Greenwood Public School" -> "greenwood").
export function schoolEmailDomain(schoolName) {
  const firstWord = (schoolName || '').trim().split(/\s+/)[0] || 'school';
  const slug = firstWord.toLowerCase().replace(/[^a-z0-9]/g, '') || 'school';
  return `${slug}.com`;
}

// Staff Code / Admission Number format for anyone newly registered through the
// app (seeded demo accounts keep their existing codes as-is). `padLength` is
// how many digits the increasing number is zero-padded to, e.g. padLength 4
// + startAt 100 -> "EMP0100", "EMP0101", … Edit the prefixes/padding here to
// change the format app-wide — no code changes needed elsewhere.
export const defaultIdFormat = {
  staffPrefix: 'EMP',
  staffPadLength: 4,
  staffStartAt: 100,
  studentPrefix: 'ADM',
  studentPadLength: 4,
  studentStartAt: 100,
};

export const defaultSubjects = [
  'Mathematics', 'Science', 'English', 'Hindi', 'History', 'Geography', 'Computer', 'PE', 'Drawing',
];

// classTeacherStaffId refers to the seeded demo staff ids in mockStore.js
// (3 = teacher1, 4 = teacher2, 5 = teacher3).
export const defaultClasses = [
  { gradeLevel: 10, section: 'A', feeAmount: 48000, classTeacherStaffId: 3 },
  { gradeLevel: 10, section: 'B', feeAmount: 48000, classTeacherStaffId: 5 },
  { gradeLevel: 9,  section: 'A', feeAmount: 44000, classTeacherStaffId: 3 },
  { gradeLevel: 9,  section: 'B', feeAmount: 44000, classTeacherStaffId: 5 },
  { gradeLevel: 8,  section: 'A', feeAmount: 40000, classTeacherStaffId: 4 },
  { gradeLevel: 8,  section: 'B', feeAmount: 40000, classTeacherStaffId: 4 },
  { gradeLevel: 7,  section: 'A', feeAmount: 48000, classTeacherStaffId: 3 },
  { gradeLevel: 7,  section: 'B', feeAmount: 48000, classTeacherStaffId: 5 },
  { gradeLevel: 6,  section: 'A', feeAmount: 44000, classTeacherStaffId: 3 },
  { gradeLevel: 6,  section: 'B', feeAmount: 44000, classTeacherStaffId: 5 },
  { gradeLevel: 5,  section: 'A', feeAmount: 40000, classTeacherStaffId: 4 },
  { gradeLevel: 5,  section: 'B', feeAmount: 40000, classTeacherStaffId: 4 },
  { gradeLevel: 4,  section: 'A', feeAmount: 48000, classTeacherStaffId: 3 },
  { gradeLevel: 4,  section: 'B', feeAmount: 48000, classTeacherStaffId: 5 },
  { gradeLevel: 3,  section: 'A', feeAmount: 44000, classTeacherStaffId: 3 },
  { gradeLevel: 3,  section: 'B', feeAmount: 44000, classTeacherStaffId: 5 },
  { gradeLevel: 2,  section: 'A', feeAmount: 40000, classTeacherStaffId: 4 },
  { gradeLevel: 2,  section: 'B', feeAmount: 40000, classTeacherStaffId: 4 },
  { gradeLevel: 1,  section: 'A', feeAmount: 44000, classTeacherStaffId: 3 },
  { gradeLevel: 1,  section: 'B', feeAmount: 44000, classTeacherStaffId: 5 }
];
