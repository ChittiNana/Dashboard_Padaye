import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { questionPapers as initialPapers, exams, classes, users, results as initialResults, schoolInfo } from '../../data/mockData';

const SUBJECTS    = ['Mathematics', 'Science', 'English', 'Hindi', 'History', 'Geography', 'Computer', 'PE', 'Drawing'];
const CLASS_NAMES = classes.map(c => c.name);

const PAPER_TYPES = [
  {
    value: 'complete',
    label: 'Complete Question Paper',
    icon: '📋',
    desc: 'Mix of all types — MCQ, Short, Long Answer, True/False, Fill in Blanks, and more. Best for term exams.',
    color: '#4f46e5',
    allowedTypes: null,
    defaults: { duration: '3 hrs', maxMarks: 100 },
  },
  {
    value: 'quick',
    label: 'Quick Test',
    icon: '⚡',
    desc: 'Short timed assessment with mixed question types. Ideal for weekly or surprise tests.',
    color: '#f59e0b',
    allowedTypes: null,
    defaults: { duration: '30 mins', maxMarks: 20 },
  },
  {
    value: 'mcq',
    label: 'Multiple Choice Only',
    icon: '🔘',
    desc: 'All questions are Multiple Choice Questions. Best for objective-type and competitive practice.',
    color: '#0ea5e9',
    allowedTypes: ['MCQ'],
    defaults: { duration: '1 hr', maxMarks: 50 },
  },
  {
    value: 'fill',
    label: 'Fill in the Blanks',
    icon: '✏️',
    desc: 'Students fill in missing words or phrases. Use ______ in question text to mark blanks.',
    color: '#10b981',
    allowedTypes: ['FillBlanks'],
    defaults: { duration: '30 mins', maxMarks: 20 },
  },
  {
    value: 'match',
    label: 'Match the Following',
    icon: '🔗',
    desc: 'Two-column matching. Students match Column A items to Column B descriptions.',
    color: '#8b5cf6',
    allowedTypes: ['MatchFollowing'],
    defaults: { duration: '30 mins', maxMarks: 20 },
  },
];

const ALL_Q_TYPES = [
  { value: 'MCQ',            label: 'MCQ',                desc: 'Multiple Choice'    },
  { value: 'Short',          label: 'Short Answer',        desc: 'Short Answer'       },
  { value: 'Long',           label: 'Long Answer',         desc: 'Long Answer'        },
  { value: 'TrueFalse',      label: 'True / False',        desc: 'True or False'      },
  { value: 'FillBlanks',     label: 'Fill in the Blanks',  desc: 'Fill blanks'        },
  { value: 'MatchFollowing', label: 'Match the Following', desc: 'Match two columns'  },
];

function gradeFromPct(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 33) return 'D';
  return 'F';
}

function remarkFromPct(pct) {
  if (pct >= 90) return 'Outstanding';
  if (pct >= 80) return 'Excellent';
  if (pct >= 70) return 'Very Good';
  if (pct >= 60) return 'Good';
  if (pct >= 50) return 'Satisfactory';
  if (pct >= 33) return 'Needs Improvement';
  return 'Fail';
}

// ─── Paper Type Picker ────────────────────────────────────────────────────────
function PaperTypePicker({ onSelect, onBack }) {
  const [selected, setSelected] = useState(null);
  const selInfo = PAPER_TYPES.find(p => p.value === selected);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Create Question Paper</h1>
          <p>Step 1 of 2 — Select the type of paper you want to create</p>
        </div>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
      </div>

      <div className="pt-grid">
        {PAPER_TYPES.map(pt => (
          <div
            key={pt.value}
            className={`pt-card${selected === pt.value ? ' pt-selected' : ''}`}
            style={selected === pt.value ? { borderColor: pt.color, background: `${pt.color}12` } : {}}
            onClick={() => setSelected(pt.value)}
          >
            <span className="pt-icon">{pt.icon}</span>
            <div className="pt-label" style={selected === pt.value ? { color: pt.color } : {}}>{pt.label}</div>
            <div className="pt-desc">{pt.desc}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-gray" style={{ fontSize: 11 }}>⏱ {pt.defaults.duration}</span>
              <span className="badge badge-gray" style={{ fontSize: 11 }}>📊 {pt.defaults.maxMarks} marks</span>
              {pt.allowedTypes && (
                <span className="badge badge-info" style={{ fontSize: 11 }}>
                  {pt.allowedTypes[0] === 'MCQ' ? 'Objective Only' : pt.allowedTypes[0] === 'FillBlanks' ? 'Fill Blanks Only' : 'Matching Only'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {selected ? (
        <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Selected: <strong style={{ color: selInfo?.color }}>{selInfo?.icon} {selInfo?.label}</strong>
          </span>
          <button className="btn btn-ghost" onClick={() => setSelected(null)}>Change</button>
          <button className="btn btn-primary" onClick={() => onSelect(selInfo)}>
            Continue to Paper Setup →
          </button>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 28 }}>
          Click a paper type above to select it, then click Continue.
        </p>
      )}
    </div>
  );
}

// ─── Paper List ───────────────────────────────────────────────────────────────
function PaperList({ papers, onView, onEdit, onDelete, onCreateResult, currentUser }) {
  const [search, setSearch]               = useState('');
  const [filterClass, setFilterClass]     = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [filterType, setFilterType]       = useState('all');

  const canManage = ['principal', 'headmaster', 'teacher'].includes(currentUser?.role);
  const getPTInfo = v  => PAPER_TYPES.find(t => t.value === (v || 'complete')) || PAPER_TYPES[0];
  const totalQ    = p  => p.sections.reduce((s, sec) => s + sec.questions.length, 0);

  const filtered = papers.filter(p => {
    const ms  = !search       || p.title.toLowerCase().includes(search.toLowerCase()) || p.subject.toLowerCase().includes(search.toLowerCase());
    const mc  = filterClass   === 'all' || p.className                  === filterClass;
    const msu = filterSubject === 'all' || p.subject                    === filterSubject;
    const mst = filterStatus  === 'all' || p.status                     === filterStatus;
    const mtp = filterType    === 'all' || (p.paperType || 'complete')  === filterType;
    return ms && mc && msu && mst && mtp;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Question Papers</h1>
          <p>Create, manage, and view question papers for all exams</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => onEdit(null)}>+ Create Paper</button>
        )}
      </div>

      <div className="stat-grid mb-20" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
        {[
          { label: 'Total Papers',    value: papers.length,                                       icon: '📄', color: 'bg-blue'   },
          { label: 'Published',       value: papers.filter(p => p.status === 'published').length, icon: '✅', color: 'bg-green'  },
          { label: 'Drafts',          value: papers.filter(p => p.status === 'draft').length,     icon: '✏️', color: 'bg-orange' },
          { label: 'Total Questions', value: papers.reduce((s, p) => s + totalQ(p), 0),           icon: '❓', color: 'bg-purple' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card mb-20">
        <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-control" style={{ maxWidth: 200 }} placeholder="Search papers…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-control" style={{ maxWidth: 130 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {CLASS_NAMES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="form-control" style={{ maxWidth: 150 }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
            <option value="all">All Subjects</option>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-control" style={{ maxWidth: 200 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Paper Types</option>
            {PAPER_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.icon} {pt.label}</option>)}
          </select>
          <select className="form-control" style={{ maxWidth: 130 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} paper{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Title</th><th>Type</th><th>Class</th><th>Subject</th><th>Max Marks</th><th>Duration</th><th>Questions</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No papers found</td></tr>
              ) : filtered.map(p => {
                const pti = getPTInfo(p.paperType);
                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, fontSize: 13 }}>{p.title}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '2px 8px', borderRadius: 20, background: `${pti.color}18`, color: pti.color, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {pti.icon} {pti.label}
                      </span>
                    </td>
                    <td><span className="badge badge-info">{p.className}</span></td>
                    <td>{p.subject}</td>
                    <td style={{ fontWeight: 600 }}>{p.maxMarks}</td>
                    <td>{p.duration}</td>
                    <td>
                      <span className="badge badge-gray">{totalQ(p)} Qs</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>{p.sections.length} sec</span>
                    </td>
                    <td><span className={`badge ${p.status === 'published' ? 'badge-success' : 'badge-warning'}`}>{p.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => onView(p)}>View</button>
                        {canManage && <button className="btn btn-ghost btn-sm" onClick={() => onEdit(p)}>Edit</button>}
                        {canManage && p.status === 'published' && <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)' }} onClick={() => onCreateResult(p)}>Results</button>}
                        {canManage && <button className="btn btn-danger btn-sm" onClick={() => onDelete(p.id)}>✕</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Paper Viewer ─────────────────────────────────────────────────────────────
function PaperViewer({ paper, onBack }) {
  const qLabels = ['a', 'b', 'c', 'd'];
  const ptInfo  = PAPER_TYPES.find(t => t.value === (paper.paperType || 'complete')) || PAPER_TYPES[0];
  let globalQ   = 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700 }}>View Question Paper</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            <span style={{ padding: '2px 8px', borderRadius: 12, background: `${ptInfo.color}18`, color: ptInfo.color, fontWeight: 600, marginRight: 8 }}>
              {ptInfo.icon} {ptInfo.label}
            </span>
            Read-only preview
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <button className="btn btn-primary" onClick={() => window.print()}>🖨 Print</button>
        </div>
      </div>

      <div className="qp-paper">
        <div className="qp-header">
          <div className="qp-school-name">{schoolInfo.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{schoolInfo.address}</div>
          <div style={{ fontWeight: 600, fontSize: 16, marginTop: 8 }}>{paper.title}</div>
          <div className="qp-meta">
            <span>Class: <strong>{paper.className}</strong></span>
            <span>Subject: <strong>{paper.subject}</strong></span>
            <span>Academic Year: <strong>{paper.academicYear}</strong></span>
          </div>
          <div className="qp-meta" style={{ marginTop: 6 }}>
            <span>Max. Marks: <strong>{paper.maxMarks}</strong></span>
            <span>Time Allowed: <strong>{paper.duration}</strong></span>
            <span>Date: <strong>________________</strong></span>
          </div>
        </div>

        <div className="qp-instructions">
          <strong>General Instructions:</strong> {paper.instructions || 'Read all questions carefully before answering.'}
        </div>

        <div style={{ display: 'flex', gap: 32, marginBottom: 20, fontSize: 13 }}>
          <span>Name: ______________________________</span>
          <span>Roll No: ______________</span>
          <span>Section: _______</span>
        </div>

        {paper.sections.map(sec => (
          <div key={sec.id} className="qp-section">
            <div className="qp-section-title">{sec.title}</div>
            {sec.sectionInstructions && (
              <div className="qp-section-instructions">{sec.sectionInstructions}</div>
            )}
            {sec.questions.map(q => {
              globalQ++;
              return (
                <div key={q.id} className="qp-question">
                  <span className="qp-question-num">Q{globalQ}.</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ whiteSpace: 'pre-line' }}>{q.text}</div>

                    {q.type === 'MCQ' && q.options && (
                      <div className="qp-options" style={{ marginTop: 6 }}>
                        {q.options.map((opt, oi) => (
                          <div key={oi} className="qp-option">({qLabels[oi]}) {opt}</div>
                        ))}
                      </div>
                    )}

                    {q.type === 'TrueFalse' && (
                      <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                        (a) True &nbsp;&nbsp; (b) False
                      </div>
                    )}

                    {(q.type === 'Short' || q.type === 'Long') && (
                      <div style={{ marginTop: 8, borderBottom: '1px dashed var(--border)', minHeight: q.type === 'Long' ? 60 : 30 }} />
                    )}

                    {q.type === 'FillBlanks' && (
                      <div style={{ marginTop: 8, borderBottom: '1px dashed var(--border)', minHeight: 24 }} />
                    )}

                    {q.type === 'MatchFollowing' && q.pairs && (
                      <div style={{ marginTop: 10 }}>
                        <table className="match-view-table">
                          <thead>
                            <tr>
                              <th style={{ width: '50%' }}>Column A</th>
                              <th style={{ width: '50%' }}>Column B</th>
                            </tr>
                          </thead>
                          <tbody>
                            {q.pairs.map((pair, pi) => (
                              <tr key={pi}>
                                <td>{pi + 1}. {pair.left}</td>
                                <td>{String.fromCharCode(97 + pi)}) {pair.right}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                          Answer: __________________________________________
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="qp-question-marks">[{q.marks} {q.marks === 1 ? 'mark' : 'marks'}]</span>
                </div>
              );
            })}
          </div>
        ))}

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          — End of Question Paper — Total Marks: {paper.maxMarks}
        </div>
      </div>
    </div>
  );
}

// ─── Paper Editor ─────────────────────────────────────────────────────────────
function PaperEditor({ paper, paperType: paperTypeProp, onSave, onBack, currentUser }) {
  const isNew      = !paper;
  const ptValue    = paper?.paperType || paperTypeProp || 'complete';
  const ptInfo     = PAPER_TYPES.find(p => p.value === ptValue) || PAPER_TYPES[0];
  const allowedQTs = ptInfo.allowedTypes
    ? ALL_Q_TYPES.filter(t => ptInfo.allowedTypes.includes(t.value))
    : ALL_Q_TYPES;
  const defaultQType = ptInfo.allowedTypes?.[0] || 'Short';

  const sectionLabel = () => {
    if (ptValue === 'mcq')   return 'Objective Questions';
    if (ptValue === 'fill')  return 'Fill in the Blanks';
    if (ptValue === 'match') return 'Match the Following';
    return 'Section A';
  };

  const [form, setForm] = useState(() => paper ? { ...paper } : {
    title: '', examId: '', className: '', subject: '',
    academicYear: '2026-27',
    maxMarks: ptInfo.defaults?.maxMarks ?? 100,
    duration: ptInfo.defaults?.duration ?? '3 hrs',
    instructions: '',
    status: 'draft',
    paperType: ptValue,
    sections: [{ id: 1, title: sectionLabel(), sectionInstructions: '', questions: [] }],
  });

  const [errors, setErrors] = useState({});
  const sf = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const addSection = () => {
    const newId  = (form.sections[form.sections.length - 1]?.id || 0) + 1;
    const letter = String.fromCharCode(64 + form.sections.length + 1);
    const title  = ptValue === 'mcq'   ? `Section ${letter} – Objective`    :
                   ptValue === 'fill'  ? `Fill in the Blanks – Part ${letter}` :
                   ptValue === 'match' ? `Match the Following – Part ${letter}` :
                   `Section ${letter}`;
    setForm(f => ({ ...f, sections: [...f.sections, { id: newId, title, sectionInstructions: '', questions: [] }] }));
  };

  const removeSection  = (sid)              => setForm(f => ({ ...f, sections: f.sections.filter(s => s.id !== sid) }));
  const updateSection  = (sid, field, val)  => setForm(f => ({ ...f, sections: f.sections.map(s => s.id === sid ? { ...s, [field]: val } : s) }));

  const addQuestion = (sid) => {
    const sec    = form.sections.find(s => s.id === sid);
    const newQId = (sec.questions[sec.questions.length - 1]?.id || 0) + 1;
    let newQ;
    if (defaultQType === 'MatchFollowing') {
      newQ = {
        id: newQId, type: 'MatchFollowing', text: 'Match the following:', marks: 5,
        pairs: [{ id: 1, left: '', right: '' }, { id: 2, left: '', right: '' }, { id: 3, left: '', right: '' }, { id: 4, left: '', right: '' }],
        answer: '',
      };
    } else if (defaultQType === 'MCQ') {
      newQ = { id: newQId, type: 'MCQ', text: '', marks: 1, options: ['', '', '', ''], answer: '' };
    } else {
      newQ = { id: newQId, type: defaultQType, text: '', marks: 1, answer: '' };
    }
    updateSection(sid, 'questions', [...sec.questions, newQ]);
  };

  const removeQuestion = (sid, qid) => {
    const sec = form.sections.find(s => s.id === sid);
    updateSection(sid, 'questions', sec.questions.filter(q => q.id !== qid));
  };

  const updateQuestion = (sid, qid, field, val) => {
    const sec     = form.sections.find(s => s.id === sid);
    const updated = sec.questions.map(q => {
      if (q.id !== qid) return q;
      if (field === 'type' && val === 'MatchFollowing' && !q.pairs) {
        return { ...q, type: val, pairs: [{ id: 1, left: '', right: '' }, { id: 2, left: '', right: '' }, { id: 3, left: '', right: '' }, { id: 4, left: '', right: '' }] };
      }
      if (field === 'type' && val === 'MCQ' && !q.options) {
        return { ...q, type: val, options: ['', '', '', ''] };
      }
      return { ...q, [field]: val };
    });
    updateSection(sid, 'questions', updated);
  };

  const updateOption = (sid, qid, oi, val) => {
    const sec     = form.sections.find(s => s.id === sid);
    const updated = sec.questions.map(q => {
      if (q.id !== qid) return q;
      const opts = [...(q.options || ['', '', '', ''])];
      opts[oi] = val;
      return { ...q, options: opts };
    });
    updateSection(sid, 'questions', updated);
  };

  const addPair = (sid, qid) => {
    const sec    = form.sections.find(s => s.id === sid);
    const q      = sec.questions.find(qq => qq.id === qid);
    const pairId = (q.pairs[q.pairs.length - 1]?.id || 0) + 1;
    updateSection(sid, 'questions', sec.questions.map(qq =>
      qq.id === qid ? { ...qq, pairs: [...qq.pairs, { id: pairId, left: '', right: '' }] } : qq
    ));
  };

  const removePair = (sid, qid, pairId) => {
    const sec = form.sections.find(s => s.id === sid);
    updateSection(sid, 'questions', sec.questions.map(q =>
      q.id === qid ? { ...q, pairs: q.pairs.filter(p => p.id !== pairId) } : q
    ));
  };

  const updatePair = (sid, qid, pairId, field, val) => {
    const sec = form.sections.find(s => s.id === sid);
    updateSection(sid, 'questions', sec.questions.map(q =>
      q.id === qid ? { ...q, pairs: q.pairs.map(p => p.id === pairId ? { ...p, [field]: val } : p) } : q
    ));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())    e.title     = 'Title is required';
    if (!form.className)       e.className = 'Class is required';
    if (!form.subject)         e.subject   = 'Subject is required';
    if (!form.maxMarks)        e.maxMarks  = 'Max marks required';
    if (!form.duration.trim()) e.duration  = 'Duration is required';
    if (!form.sections.length) e.sections  = 'Add at least one section';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const doSave = (status) => {
    if (!validate()) return;
    const now = new Date().toISOString().slice(0, 10);
    onSave({ ...form, status, maxMarks: Number(form.maxMarks), createdBy: currentUser?.name || 'Unknown', createdDate: isNew ? now : form.createdDate });
  };

  const addBtnLabel = defaultQType === 'MatchFollowing' ? '+ Add Matching Set' :
                      defaultQType === 'FillBlanks'     ? '+ Add Fill Blank Question' : '+ Add Question';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{isNew ? 'Create Question Paper' : 'Edit Question Paper'}</h1>
          <p>
            <span style={{ padding: '2px 10px', borderRadius: 12, background: `${ptInfo.color}18`, color: ptInfo.color, fontWeight: 700, marginRight: 8, fontSize: 12 }}>
              {ptInfo.icon} {ptInfo.label}
            </span>
            {isNew ? 'Step 2 of 2 — Fill in paper details and add questions' : `Editing: ${paper.title}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
          <button className="btn btn-ghost" onClick={() => doSave('draft')}>Save as Draft</button>
          <button className="btn btn-primary" onClick={() => doSave('published')}>Publish Paper</button>
        </div>
      </div>

      {/* Paper Information */}
      <div className="card mb-20">
        <div className="card-header"><div className="card-title">Paper Information</div></div>
        <div className="card-body">
          <div className="reg-grid-2" style={{ marginBottom: 16 }}>
            <div className="reg-form-group">
              <label className="reg-label required">Paper Title</label>
              <input className={`form-control${errors.title ? ' input-error' : ''}`} value={form.title} onChange={e => sf('title', e.target.value)} placeholder="e.g. Unit Test 1 – Mathematics" />
              {errors.title && <span className="reg-field-error">{errors.title}</span>}
            </div>
            <div className="reg-form-group">
              <label className="reg-label">Link to Exam (optional)</label>
              <select className="form-control" value={form.examId} onChange={e => sf('examId', e.target.value)}>
                <option value="">None</option>
                {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name} – {ex.subject} ({ex.class})</option>)}
              </select>
            </div>
            <div className="reg-form-group">
              <label className="reg-label required">Class</label>
              <select className={`form-control${errors.className ? ' input-error' : ''}`} value={form.className} onChange={e => sf('className', e.target.value)}>
                <option value="">Select class</option>
                {CLASS_NAMES.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.className && <span className="reg-field-error">{errors.className}</span>}
            </div>
            <div className="reg-form-group">
              <label className="reg-label required">Subject</label>
              <select className={`form-control${errors.subject ? ' input-error' : ''}`} value={form.subject} onChange={e => sf('subject', e.target.value)}>
                <option value="">Select subject</option>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
              {errors.subject && <span className="reg-field-error">{errors.subject}</span>}
            </div>
            <div className="reg-form-group">
              <label className="reg-label">Academic Year</label>
              <input className="form-control" value={form.academicYear} onChange={e => sf('academicYear', e.target.value)} placeholder="e.g. 2026-27" />
            </div>
            <div className="reg-form-group">
              <label className="reg-label required">Duration</label>
              <input className={`form-control${errors.duration ? ' input-error' : ''}`} value={form.duration} onChange={e => sf('duration', e.target.value)} placeholder="e.g. 3 hrs" />
              {errors.duration && <span className="reg-field-error">{errors.duration}</span>}
            </div>
            <div className="reg-form-group">
              <label className="reg-label required">Max Marks</label>
              <input type="number" className={`form-control${errors.maxMarks ? ' input-error' : ''}`} value={form.maxMarks} onChange={e => sf('maxMarks', e.target.value)} min="1" />
              {errors.maxMarks && <span className="reg-field-error">{errors.maxMarks}</span>}
            </div>
            <div className="reg-form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="reg-label">General Instructions</label>
              <textarea className="form-control" rows={2} value={form.instructions} onChange={e => sf('instructions', e.target.value)} placeholder="Instructions for students appearing in this exam…" />
            </div>
          </div>
        </div>
      </div>

      {/* Sections & Questions */}
      {form.sections.map((sec, si) => (
        <div key={sec.id} className="card mb-20">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <span className="badge badge-info" style={{ flexShrink: 0 }}>Section {si + 1}</span>
              <input
                className="form-control"
                style={{ fontWeight: 600, maxWidth: 340 }}
                value={sec.title}
                onChange={e => updateSection(sec.id, 'title', e.target.value)}
                placeholder="Section title"
              />
            </div>
            <button className="btn btn-danger btn-sm" onClick={() => removeSection(sec.id)} disabled={form.sections.length === 1}>Remove Section</button>
          </div>
          <div className="card-body">
            <div style={{ marginBottom: 16 }}>
              <label className="reg-label">Section Instructions (optional)</label>
              <input
                className="form-control"
                value={sec.sectionInstructions}
                onChange={e => updateSection(sec.id, 'sectionInstructions', e.target.value)}
                placeholder={
                  ptValue === 'mcq'   ? 'e.g. Choose the correct answer. (1 mark each)' :
                  ptValue === 'fill'  ? 'e.g. Fill in the blanks with appropriate words.' :
                  ptValue === 'match' ? 'e.g. Match the items in Column A with Column B.' :
                  'e.g. Answer all questions.'
                }
              />
            </div>

            {sec.questions.map((q, qi) => (
              <div key={q.id} className="qp-editor-question">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-secondary)' }}>Q{qi + 1}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => removeQuestion(sec.id, q.id)}>Remove</button>
                </div>

                {/* ── Match the Following editor ── */}
                {q.type === 'MatchFollowing' ? (
                  <div>
                    <div className="reg-grid-2" style={{ marginBottom: 12 }}>
                      <div className="reg-form-group">
                        <label className="reg-label">Question Header Text</label>
                        <input className="form-control" value={q.text} onChange={e => updateQuestion(sec.id, q.id, 'text', e.target.value)} placeholder="e.g. Match the following:" />
                      </div>
                      <div className="reg-form-group">
                        <label className="reg-label required">Total Marks</label>
                        <input type="number" className="form-control" value={q.marks} onChange={e => updateQuestion(sec.id, q.id, 'marks', Number(e.target.value))} min="1" />
                      </div>
                    </div>

                    <div className="match-editor-wrap">
                      <div className="match-editor-header-row">
                        <div className="match-col-label">Column A</div>
                        <div className="match-col-label">Column B</div>
                        <div style={{ width: 52 }}></div>
                      </div>
                      {q.pairs?.map((pair, pi) => (
                        <div key={pair.id} className="match-editor-row">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ minWidth: 22, fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>{pi + 1}.</span>
                            <input className="form-control" value={pair.left} onChange={e => updatePair(sec.id, q.id, pair.id, 'left', e.target.value)} placeholder="Term / Item" />
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ minWidth: 22, fontWeight: 700, fontSize: 13, color: 'var(--text-muted)' }}>{String.fromCharCode(97 + pi)}.</span>
                            <input className="form-control" value={pair.right} onChange={e => updatePair(sec.id, q.id, pair.id, 'right', e.target.value)} placeholder="Definition / Description" />
                          </div>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--danger)', width: 44 }}
                            onClick={() => removePair(sec.id, q.id, pair.id)}
                            disabled={q.pairs.length <= 2}
                          >✕</button>
                        </div>
                      ))}
                      <button className="btn btn-ghost btn-sm" style={{ marginTop: 6 }} onClick={() => addPair(sec.id, q.id)}>
                        + Add Pair
                      </button>
                    </div>

                    <div className="reg-form-group" style={{ marginTop: 12 }}>
                      <label className="reg-label">Answer Key (optional, for teacher reference)</label>
                      <input className="form-control" value={q.answer} onChange={e => updateQuestion(sec.id, q.id, 'answer', e.target.value)} placeholder="e.g. 1-b, 2-a, 3-d, 4-c" />
                    </div>
                  </div>
                ) : (
                  /* ── All other question types ── */
                  <div>
                    <div className="reg-grid-3" style={{ marginBottom: 12 }}>
                      <div className="reg-form-group" style={{ gridColumn: '1 / 3' }}>
                        <label className="reg-label required">
                          Question Text
                          {q.type === 'FillBlanks' && (
                            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6, fontSize: 12 }}>
                              (use ______ to mark each blank)
                            </span>
                          )}
                        </label>
                        <textarea
                          className="form-control"
                          rows={2}
                          value={q.text}
                          onChange={e => updateQuestion(sec.id, q.id, 'text', e.target.value)}
                          placeholder={q.type === 'FillBlanks' ? 'e.g. The capital of India is ______.' : 'Enter question text here…'}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="reg-form-group">
                          <label className="reg-label required">Type</label>
                          {allowedQTs.length === 1 ? (
                            <div className="form-control" style={{ background: 'var(--bg-app)', color: 'var(--text-secondary)', cursor: 'default', fontWeight: 600 }}>
                              {allowedQTs[0].label}
                            </div>
                          ) : (
                            <select className="form-control" value={q.type} onChange={e => updateQuestion(sec.id, q.id, 'type', e.target.value)}>
                              {allowedQTs.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                          )}
                        </div>
                        <div className="reg-form-group">
                          <label className="reg-label required">Marks</label>
                          <input type="number" className="form-control" value={q.marks} onChange={e => updateQuestion(sec.id, q.id, 'marks', Number(e.target.value))} min="1" />
                        </div>
                      </div>
                    </div>

                    {/* MCQ options */}
                    {q.type === 'MCQ' && (
                      <div style={{ marginBottom: 12 }}>
                        <label className="reg-label">Options</label>
                        <div className="reg-grid-2" style={{ marginTop: 6 }}>
                          {[0, 1, 2, 3].map(oi => (
                            <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontWeight: 600, fontSize: 13, minWidth: 20, color: 'var(--text-muted)' }}>{String.fromCharCode(97 + oi)})</span>
                              <input className="form-control" value={q.options?.[oi] || ''} onChange={e => updateOption(sec.id, q.id, oi, e.target.value)} placeholder={`Option ${oi + 1}`} />
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 8 }}>
                          <label className="reg-label">Correct Answer</label>
                          <input className="form-control" style={{ maxWidth: 240 }} value={q.answer} onChange={e => updateQuestion(sec.id, q.id, 'answer', e.target.value)} placeholder="Type the correct option text" />
                        </div>
                      </div>
                    )}

                    {/* Model answer for non-MCQ */}
                    {q.type !== 'MCQ' && (
                      <div>
                        <label className="reg-label">
                          {q.type === 'FillBlanks'  ? 'Correct Answer(s)' :
                           q.type === 'TrueFalse'   ? 'Correct Answer' :
                           'Model Answer / Marking Scheme (optional)'}
                        </label>
                        <textarea
                          className="form-control"
                          rows={q.type === 'Long' ? 3 : 2}
                          value={q.answer}
                          onChange={e => updateQuestion(sec.id, q.id, 'answer', e.target.value)}
                          placeholder={
                            q.type === 'FillBlanks' ? 'Enter the correct word(s) for the blank(s)' :
                            q.type === 'TrueFalse'  ? 'True or False' :
                            'Model answer or key points for marking…'
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => addQuestion(sec.id)}>
              {addBtnLabel}
            </button>
          </div>
        </div>
      ))}

      <button className="btn btn-ghost" onClick={addSection}>+ Add Section</button>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onBack}>Cancel</button>
        <button className="btn btn-ghost" onClick={() => doSave('draft')}>Save as Draft</button>
        <button className="btn btn-primary" onClick={() => doSave('published')}>Publish Paper</button>
      </div>
    </div>
  );
}

// ─── Results Entry ────────────────────────────────────────────────────────────
function ResultsEntry({ paper, existingResults, onSave, onBack }) {
  const classStudents = users.filter(u => u.role === 'student' && u.class === paper.className);
  const initMarks = () => {
    const m = {};
    classStudents.forEach(s => {
      const existing = existingResults.find(r => r.studentId === s.id && r.subject === paper.subject);
      m[s.id] = existing ? String(existing.marksObtained) : '';
    });
    return m;
  };
  const [marks, setMarks] = useState(initMarks);
  const [saved, setSaved] = useState(false);

  const setMark = (sid, val) => {
    const n = Number(val);
    if (val === '' || (n >= 0 && n <= paper.maxMarks)) setMarks(m => ({ ...m, [sid]: val }));
  };

  const handleSave = () => {
    const newResults = classStudents
      .filter(s => marks[s.id] !== '')
      .map(s => {
        const mo  = Number(marks[s.id]);
        const pct = Math.round((mo / paper.maxMarks) * 100);
        return { studentId: s.id, examId: paper.examId || null, subject: paper.subject, marksObtained: mo, maxMarks: paper.maxMarks, percentage: pct, grade: gradeFromPct(pct), remarks: remarkFromPct(pct), paperId: paper.id };
      });
    onSave(newResults);
    setSaved(true);
    setTimeout(() => { setSaved(false); onBack(); }, 1500);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Enter Results</h1>
          <p>{paper.title} · Class {paper.className} · Max Marks: {paper.maxMarks}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onBack}>← Back</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Results</button>
        </div>
      </div>

      {saved && <div className="alert-success mb-20"><span>✅</span> Results saved successfully!</div>}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Marks Entry – {paper.subject}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Max: {paper.maxMarks} | Enter marks for each student below</div>
        </div>
        <div className="table-wrapper">
          <table className="results-table">
            <thead>
              <tr><th>#</th><th>Student</th><th>Roll No</th><th>Marks Obtained (/{paper.maxMarks})</th><th>Percentage</th><th>Grade</th><th>Remarks</th></tr>
            </thead>
            <tbody>
              {classStudents.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No students found for class {paper.className}</td></tr>
              ) : classStudents.map((s, i) => {
                const mo    = marks[s.id] !== '' ? Number(marks[s.id]) : null;
                const pct   = mo !== null ? Math.round((mo / paper.maxMarks) * 100) : null;
                const grade = pct !== null ? gradeFromPct(pct) : '—';
                return (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="avatar avatar-sm role-student">{s.avatar}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Class {s.class}</div>
                        </div>
                      </div>
                    </td>
                    <td>{s.rollNo}</td>
                    <td>
                      <input type="number" className="marks-input" value={marks[s.id]} onChange={e => setMark(s.id, e.target.value)} min="0" max={paper.maxMarks} placeholder="—" />
                    </td>
                    <td style={{ fontWeight: pct !== null ? 600 : 400, color: pct !== null ? (pct >= 33 ? 'var(--success)' : 'var(--danger)') : 'var(--text-muted)' }}>
                      {pct !== null ? `${pct}%` : '—'}
                    </td>
                    <td>
                      {grade !== '—' ? <span className={`badge ${grade === 'F' ? 'badge-danger' : grade.startsWith('A') ? 'badge-success' : 'badge-warning'}`}>{grade}</span> : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct !== null ? remarkFromPct(pct) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleSave}>💾 Save Results</button>
        </div>
      </div>
    </div>
  );
}

// ─── Results Viewer ───────────────────────────────────────────────────────────
function ResultsViewer({ allResults, allPapers }) {
  const [filterPaper, setFilterPaper] = useState('all');
  const [filterClass, setFilterClass] = useState('all');

  const filtered = allResults.filter(r => {
    const mp      = filterPaper === 'all' || String(r.paperId) === filterPaper;
    const student = users.find(u => u.id === r.studentId);
    const mc      = filterClass === 'all' || student?.class === filterClass;
    return mp && mc;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left"><h1>Results Report</h1><p>View all exam results by paper and class</p></div>
      </div>

      <div className="stat-grid mb-20" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
        {[
          { label: 'Total Results', value: allResults.length,                                    icon: '📊', color: 'bg-blue'   },
          { label: 'Passed',        value: allResults.filter(r => r.grade !== 'F').length,        icon: '✅', color: 'bg-green'  },
          { label: 'Failed',        value: allResults.filter(r => r.grade === 'F').length,        icon: '❌', color: 'bg-red'    },
          { label: 'Distinctions',  value: allResults.filter(r => r.percentage >= 75).length,     icon: '🏆', color: 'bg-purple' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-info"><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="card mb-20">
        <div className="card-body" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="form-control" style={{ maxWidth: 280 }} value={filterPaper} onChange={e => setFilterPaper(e.target.value)}>
            <option value="all">All Papers</option>
            {allPapers.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <select className="form-control" style={{ maxWidth: 160 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
            <option value="all">All Classes</option>
            {CLASS_NAMES.map(c => <option key={c}>{c}</option>)}
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Student</th><th>Class</th><th>Subject</th><th>Paper</th><th>Marks</th><th>Percentage</th><th>Grade</th><th>Remarks</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No results found</td></tr>
              ) : filtered.map((r, i) => {
                const student = users.find(u => u.id === r.studentId);
                const pap     = allPapers.find(p => p.id === r.paperId);
                return (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="avatar avatar-sm role-student">{student?.avatar}</span>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{student?.name || `Student #${r.studentId}`}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Roll: {student?.rollNo}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{student?.class}</span></td>
                    <td>{r.subject}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pap?.title || '—'}</td>
                    <td style={{ fontWeight: 600 }}>{r.marksObtained} / {r.maxMarks}</td>
                    <td style={{ fontWeight: 600, color: r.percentage >= 33 ? 'var(--success)' : 'var(--danger)' }}>{r.percentage}%</td>
                    <td><span className={`badge ${r.grade === 'F' ? 'badge-danger' : r.grade?.startsWith('A') ? 'badge-success' : 'badge-warning'}`}>{r.grade}</span></td>
                    <td style={{ fontSize: 12 }}>{r.remarks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────
export default function QuestionPaperManagement({ defaultView = 'list' }) {
  const { currentUser } = useAuth();
  const [papers, setPapers]           = useState(initialPapers);
  const [results, setResults]         = useState(initialResults);
  const [view, setView]               = useState(defaultView);
  const [selected, setSelected]       = useState(null);
  const [newPaperType, setNewPaperType] = useState(null);

  const handleSavePaper = (paperData) => {
    if (paperData.id) {
      setPapers(prev => prev.map(p => p.id === paperData.id ? paperData : p));
    } else {
      const newId = Math.max(...papers.map(p => p.id), 0) + 1;
      setPapers(prev => [...prev, { ...paperData, id: newId }]);
    }
    setView('list');
    setNewPaperType(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this question paper? This cannot be undone.')) {
      setPapers(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveResults = (newResults) => {
    setResults(prev => {
      const filtered = prev.filter(r => !newResults.some(nr => nr.studentId === r.studentId && nr.subject === r.subject && nr.paperId === r.paperId));
      return [...filtered, ...newResults];
    });
  };

  if (view === 'typePicker') {
    return (
      <PaperTypePicker
        onSelect={(pt) => { setNewPaperType(pt); setView('edit'); }}
        onBack={() => setView('list')}
      />
    );
  }
  if (view === 'view' && selected) {
    return <PaperViewer paper={selected} onBack={() => setView('list')} />;
  }
  if (view === 'edit') {
    return (
      <PaperEditor
        paper={selected}
        paperType={selected ? (selected.paperType || 'complete') : (newPaperType?.value || 'complete')}
        onSave={handleSavePaper}
        onBack={() => { setView('list'); setNewPaperType(null); }}
        currentUser={currentUser}
      />
    );
  }
  if (view === 'results' && selected) {
    return <ResultsEntry paper={selected} existingResults={results} onSave={handleSaveResults} onBack={() => setView('list')} />;
  }
  if (view === 'resultView') {
    return (
      <div>
        <div className="page-header">
          <div className="page-header-left"><h1>Results Management</h1></div>
          <button className="btn btn-ghost" onClick={() => setView('list')}>← Back to Papers</button>
        </div>
        <ResultsViewer allResults={results} allPapers={papers} />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${view === 'list' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('list')}>
          📄 Question Papers
        </button>
        <button className={`btn ${view === 'resultView' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setView('resultView')}>
          🏆 Results Report
        </button>
      </div>

      <PaperList
        papers={papers}
        currentUser={currentUser}
        onView={p => { setSelected(p); setView('view'); }}
        onEdit={p => { setSelected(p); setView(p === null ? 'typePicker' : 'edit'); }}
        onDelete={handleDelete}
        onCreateResult={p => { setSelected(p); setView('results'); }}
      />
    </div>
  );
}
