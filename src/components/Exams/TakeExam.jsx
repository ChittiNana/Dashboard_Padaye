import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import * as academicsApi from '../../api/academicsApi';
import { readWithFallback, writeWithApi } from '../../api/mockFallback';
import { errorText } from '../../utils/apiError';
import { listTable, applyStartAttempt, applySubmitAttempt, deriveAttemptForStudent } from '../../data/mockStore';

function isOpenNow(content) {
  const now = new Date();
  if (content.opensAt && now < new Date(content.opensAt)) return false;
  if (content.closesAt && now > new Date(content.closesAt)) return false;
  return true;
}

/* ── Per-question answer capture ─────────────────────────────────── */
function QuestionRunner({ q, value, onChange }) {
  if (q.type === 'MCQ') {
    return (
      <div>
        {(q.options || []).map((opt, oi) => (
          <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer', fontSize: 13 }}>
            <input type="radio" name={`q-${q.id}`} checked={value === opt} onChange={() => onChange(opt)} />
            {opt}
          </label>
        ))}
      </div>
    );
  }
  if (q.type === 'TrueFalse') {
    return (
      <div style={{ display: 'flex', gap: 20 }}>
        {['True', 'False'].map(opt => (
          <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="radio" name={`q-${q.id}`} checked={value === opt} onChange={() => onChange(opt)} />
            {opt}
          </label>
        ))}
      </div>
    );
  }
  if (q.type === 'FillBlanks') {
    return <input className="form-control" style={{ maxWidth: 320 }} value={value || ''} onChange={e => onChange(e.target.value)} placeholder="Your answer…" />;
  }
  if (q.type === 'MatchFollowingShuffled') {
    const order = (q.shuffledOrder && q.shuffledOrder.length === q.pairs.length) ? q.shuffledOrder : q.pairs.map((_, i) => i);
    const picks = value || {};
    return (
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px' }}>
          <div className="match-col-label">Column A — pick a letter for each</div>
          {q.pairs.map((pair, pi) => (
            <div key={pi} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13 }}>
              <span style={{ minWidth: 18 }}>{pi + 1}.</span>
              <span style={{ flex: 1 }}>{pair.left}</span>
              <select
                className="form-control" style={{ maxWidth: 80 }}
                value={picks[pi] ?? ''}
                onChange={e => onChange({ ...picks, [pi]: e.target.value === '' ? undefined : Number(e.target.value) })}
              >
                <option value="">—</option>
                {order.map((_, ri) => <option key={ri} value={ri}>{String.fromCharCode(97 + ri)}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{ flex: '1 1 220px' }}>
          <div className="match-col-label">Column B</div>
          {order.map((pairIdx, ri) => (
            <div key={ri} style={{ padding: '5px 0', fontSize: 13 }}>{String.fromCharCode(97 + ri)}) {q.pairs[pairIdx].right}</div>
          ))}
        </div>
      </div>
    );
  }
  return <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>This question type can't be answered online.</p>;
}

/* ── Active exam-taking session ───────────────────────────────────── */
function ExamRunner({ paper, attempt, onExit, onSubmitted }) {
  const [responses, setResponses] = useState(attempt.responses || {});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const setResponse = (qid, val) => setResponses(r => ({ ...r, [qid]: val }));

  const handleSubmit = async () => {
    if (!window.confirm('Submit your answers? You cannot change them after submitting.')) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const { result, real } = await writeWithApi(
        () => academicsApi.submitExamAttempt(attempt.id, { responses }),
        () => applySubmitAttempt({ attemptId: attempt.id, paper, responses }),
        { label: 'submitExamAttempt' },
      );
      // The backend answers with a flat attempt (marksObtained/maxMarks at top level); the mock returns { attempt, result }.
      const outcome = real
        ? { attempt: result, result: { marksObtained: result?.marksObtained, maxMarks: result?.maxMarks } }
        : result;
      setSubmitting(false);
      onSubmitted(outcome);
    } catch (err) {
      setSubmitError(errorText(err, 'Failed to submit exam'));
      setSubmitting(false);
    }
  };

  let globalQ = 0;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>{paper.title}</h1>
          <p>{paper.subject} · Max Marks: {paper.content.maxMarks} · Time Allowed: {paper.content.duration}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={onExit}>Exit without submitting</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Exam'}</button>
        </div>
      </div>

      {submitError && <div className="alert alert-danger mb-20">{submitError}</div>}

      {paper.content.instructions && (
        <div className="qp-instructions mb-20"><strong>Instructions:</strong> {paper.content.instructions}</div>
      )}

      {(paper.content.sections || []).map(sec => (
        <div key={sec.id} className="card mb-20">
          <div className="card-header"><div className="card-title">{sec.title}</div></div>
          <div className="card-body">
            {sec.questions.map(q => {
              globalQ++;
              return (
                <div key={q.id} className="qp-editor-question">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>Q{globalQ}. {q.text}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>[{q.marks} {q.marks === 1 ? 'mark' : 'marks'}]</span>
                  </div>
                  <QuestionRunner q={q} value={responses[q.id]} onChange={(val) => setResponse(q.id, val)} />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Exam'}</button>
      </div>
    </div>
  );
}

/* ── Root: list of assigned online exams ──────────────────────────── */
export default function TakeExam() {
  const { currentUser } = useAuth();
  const [papers, setPapers]   = useState([]);
  const [attempts, setAttempts] = useState({});
  const [loading, setLoading] = useState(true);
  const [activePaper, setActivePaper] = useState(null);
  const [justSubmitted, setJustSubmitted] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    readWithFallback(
      () => academicsApi.listQuestionPapers(),
      () => listTable('questionPapers'),
      { label: 'listQuestionPapers' },
    ).then(all => {
      const mine = all.filter(p =>
        String(p.classId) === String(currentUser.classId)
        && p.content?.deliveryMode === 'online'
        && p.content?.status === 'published',
      );
      setPapers(mine);
      return Promise.all(mine.map(p => readWithFallback(
        () => academicsApi.getMyAttempt(p.id), // 204 -> null (no attempt yet)
        () => deriveAttemptForStudent(p.id, currentUser.id),
        { label: 'getMyAttempt' },
      ).catch(() => null))).then(list => {
        const a = {};
        mine.forEach((p, i) => { a[p.id] = list[i] || null; });
        setAttempts(a);
      });
    }).catch(err => setError(errorText(err, 'Failed to load exams')))
      .finally(() => setLoading(false));
  }, [currentUser.classId, currentUser.id]);

  useEffect(() => { load(); }, [load]);

  const start = async (paper) => {
    setError('');
    try {
      const { result: attempt } = await writeWithApi(
        () => academicsApi.startExamAttempt({ paperId: paper.id, examId: paper.examId }),
        () => applyStartAttempt({ paperId: paper.id, examId: paper.examId, studentId: currentUser.id }),
        { label: 'startExamAttempt' },
      );
      setAttempts(a => ({ ...a, [paper.id]: attempt }));
      setJustSubmitted(null);
      setActivePaper(paper);
    } catch (err) {
      setError(errorText(err, 'Failed to start exam'));
    }
  };

  if (activePaper) {
    return (
      <ExamRunner
        paper={activePaper}
        attempt={attempts[activePaper.id]}
        onExit={() => setActivePaper(null)}
        onSubmitted={(outcome) => {
          setAttempts(a => ({ ...a, [activePaper.id]: outcome.attempt }));
          setJustSubmitted({ paperId: activePaper.id, ...outcome.result });
          setActivePaper(null);
          load(); // refresh attempts from the server
        }}
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Take Exam</h1>
          <p>Online exams assigned to your class</p>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-20">{error}</div>}

      {justSubmitted && (
        <div className="alert-success mb-20">
          <span>✅</span> Exam submitted! You scored {justSubmitted.marksObtained} / {justSubmitted.maxMarks}.
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</p>
      ) : papers.length === 0 ? (
        <div className="card"><div className="card-body" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No online exams assigned right now.</div></div>
      ) : (
        <div className="dashboard-grid grid-3">
          {papers.map(p => {
            const attempt = attempts[p.id];
            const open = isOpenNow(p.content);
            return (
              <div key={p.id} className="card">
                <div className="card-body">
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
                    {p.subject} · Max {p.content.maxMarks} · {p.content.duration}
                  </div>
                  {attempt?.status?.toLowerCase() === 'submitted' ? (
                    <span className="badge badge-success">Submitted — {attempt.marksObtained}/{attempt.maxMarks}</span>
                  ) : !open ? (
                    <span className="badge badge-gray">Not open right now</span>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => start(p)}>
                      {attempt?.status?.toLowerCase() === 'in_progress' ? 'Resume' : 'Start Exam'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
