// One-off/rerunnable generator for public/students.csv — 100 students per
// grade (1-10), split across sections A/B in a varied ratio per grade.
// Run with: node scripts/generateStudentsCsv.js
// Re-run any time you want a freshly regenerated bulk roster (this OVERWRITES
// public/students.csv) — or just hand-edit that CSV directly afterwards,
// which is the whole point of it living there instead of in code.

const fs = require('fs');
const path = require('path');

const FIRST_NAMES_M = [
  'Aarav','Vihaan','Arjun','Sai','Reyansh','Krishna','Ishaan','Shaurya','Atharv','Advik',
  'Vivaan','Aditya','Kabir','Ayaan','Darsh','Rudra','Yuvraj','Dhruv','Karthik','Rohan',
  'Siddharth','Nikhil','Varun','Aryan','Harsh','Pranav','Akshay','Vikram','Rahul','Amit',
];
const FIRST_NAMES_F = [
  'Ananya','Diya','Saanvi','Myra','Aadhya','Kiara','Pari','Anika','Navya','Riya',
  'Ira','Sara','Isha','Tara','Priya','Meera','Kavya','Nisha','Pooja','Divya',
  'Shreya','Neha','Sneha','Aditi','Rhea','Lavanya','Sanjana','Trisha','Zara','Vani',
];
const LAST_NAMES = [
  'Sharma','Verma','Patel','Singh','Kumar','Gupta','Nair','Reddy','Rao','Mehta',
  'Kapoor','Joshi','Iyer','Pillai','Chawla','Bose','Chatterjee','Mukherjee','Agarwal','Malhotra',
  'Bhatt','Desai','Thakur','Shetty','Menon','Bansal','Chopra','Saxena','Dubey','Pandey',
];
const BLOOD_GROUPS = ['O+','A+','B+','AB+','O-','A-','B-','AB+'];

// grade -> { A: count, B: count } — varied ratios as requested, each pair sums to 100.
const SECTION_SPLIT = {
  1: { A: 50, B: 50 },
  2: { A: 55, B: 45 },
  3: { A: 60, B: 40 },
  4: { A: 45, B: 55 },
  5: { A: 50, B: 50 },
  6: { A: 40, B: 60 },
  7: { A: 65, B: 35 },
  8: { A: 50, B: 50 },
  9: { A: 58, B: 42 },
  10: { A: 52, B: 48 },
};

function pad(n) { return String(n).padStart(2, '0'); }

function dobForGrade(grade, seed) {
  const age = grade + 5; // Grade 1 ~ age 6 ... Grade 10 ~ age 15
  const year = new Date().getFullYear() - age;
  const month = (seed % 12) + 1;
  const day = ((seed * 7) % 28) + 1;
  return `${year}-${pad(month)}-${pad(day)}`;
}

function phoneFor(seed) {
  const n = 9000000000 + (seed * 97) % 999999999;
  return `+91-${String(n).slice(0, 5)}-${String(n).slice(5, 10)}`;
}

const rows = [['firstName', 'lastName', 'gradeLevel', 'section', 'gender', 'dateOfBirth', 'guardianName', 'guardianPhone', 'bloodGroup']];

let seed = 0;
for (let grade = 1; grade <= 10; grade++) {
  const split = SECTION_SPLIT[grade];
  for (const section of ['A', 'B']) {
    const count = split[section];
    for (let i = 0; i < count; i++) {
      seed++;
      const isMale = seed % 2 === 0;
      const firstPool = isMale ? FIRST_NAMES_M : FIRST_NAMES_F;
      const firstName = firstPool[seed % firstPool.length];
      const lastName = LAST_NAMES[(seed * 3) % LAST_NAMES.length];
      const gender = isMale ? 'Male' : 'Female';
      const guardianLast = LAST_NAMES[(seed * 5) % LAST_NAMES.length];
      const guardianFirst = (isMale ? FIRST_NAMES_M : FIRST_NAMES_F)[(seed + 1) % firstPool.length];
      const guardianName = `${isMale ? 'Mr.' : 'Mrs.'} ${guardianFirst} ${guardianLast}`;
      rows.push([
        firstName, lastName, grade, section, gender,
        dobForGrade(grade, seed), guardianName, phoneFor(seed),
        BLOOD_GROUPS[seed % BLOOD_GROUPS.length],
      ]);
    }
  }
}

const csv = rows.map(r => r.join(',')).join('\n') + '\n';
const outPath = path.join(__dirname, '..', 'public', 'students.csv');
fs.writeFileSync(outPath, csv, 'utf8');
console.log(`Wrote ${rows.length - 1} student rows to ${outPath}`);
