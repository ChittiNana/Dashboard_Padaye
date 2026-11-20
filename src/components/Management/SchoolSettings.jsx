import { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { errorText } from '../../utils/apiError';
import { naCount } from '../../utils/display';

const FIELDS = [
  { key: 'name', label: 'School Name', required: true },
  { key: 'principalName', label: 'Principal Name', required: true },
  { key: 'established', label: 'Established (Year)', type: 'number' },
  { key: 'address', label: 'Address', span: 2 },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'website', label: 'Website' },
  { key: 'affiliation', label: 'Affiliation' },
  { key: 'motto', label: 'Motto', span: 2 },
];

export default function SchoolSettings() {
  const { schoolInfo, updateSchoolInfo } = useData();
  const [form, setForm] = useState(schoolInfo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Keep the form in sync if schoolInfo loads/changes after this screen mounts
  // (e.g. the real API call resolving after the local fallback already rendered).
  useEffect(() => { setForm(schoolInfo); }, [schoolInfo]);

  const set = (key, value) => { setForm(f => ({ ...f, [key]: value })); setSaved(false); };

  const submit = async () => {
    if (!form.name?.trim() || !form.principalName?.trim()) {
      setError('School Name and Principal Name are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // eslint-disable-next-line no-unused-vars
      const { totalStudents, totalStaff, totalClasses, ...payload } = form;
      await updateSchoolInfo(payload);
      setSaved(true);
    } catch (err) {
      setError(errorText(err, 'Failed to save school settings'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>School Settings</h1>
          <p>Identity details shown on the login screen, public pages, and printed documents</p>
          <p>Students: {naCount(schoolInfo.totalStudents)} · Staff: {naCount(schoolInfo.totalStaff)} · Classes: {naCount(schoolInfo.totalClasses)}</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-danger mb-12">{error}</div>}
          {saved && <div className="alert-success mb-12"><span>✅</span> Saved.</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {FIELDS.map(f => (
              <div key={f.key} className="form-group" style={f.span === 2 ? { gridColumn: 'span 2' } : undefined}>
                <label className="form-label">{f.label}{f.required ? ' *' : ''}</label>
                <input
                  type={f.type || 'text'}
                  className="form-control"
                  value={form[f.key] ?? ''}
                  onChange={e => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 16px' }}>
            Total Students/Staff/Classes shown on the pre-login screens are display-only numbers
            (real counts aren't available before signing in) — not editable here.
          </div>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
