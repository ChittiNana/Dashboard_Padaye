import { useState, useMemo } from 'react';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n) { return String(n).padStart(2, '0'); }
function isoDate(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

const TYPE_COLOR = { National: 'var(--danger)', Festival: 'var(--warning)', Regional: 'var(--secondary)' };

// Reusable month-grid calendar: click a day to see that day's events (past or
// future). Fed by anything shaped like a holiday — {id, date, name/title, type, description}.
export default function EventCalendar({ events = [], title = 'Calendar' }) {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected,  setSelected]  = useState(isoDate(today));

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goToMonth = (delta) => {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  };

  const todayIso = isoDate(today);
  const selectedEvents = eventsByDate[selected] || [];

  return (
    <div className="card mb-20">
      <div className="card-header">
        <div className="card-title">{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => goToMonth(-1)}>←</button>
          <span style={{ fontWeight: 600, fontSize: 13, minWidth: 110, textAlign: 'center' }}>{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => goToMonth(1)}>→</button>
        </div>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {WEEKDAY_LABELS.map(w => (
            <div key={w} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, padding: '4px 0' }}>{w}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {cells.map((d, idx) => {
            if (d === null) return <div key={`blank-${idx}`} />;
            const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(d)}`;
            const dayEvents = eventsByDate[dateStr] || [];
            const isToday = dateStr === todayIso;
            const isSelected = dateStr === selected;
            return (
              <div
                key={dateStr}
                onClick={() => setSelected(dateStr)}
                style={{
                  cursor: 'pointer', borderRadius: 8, padding: '6px 4px', minHeight: 44, textAlign: 'center',
                  border: isSelected ? '2px solid var(--secondary)' : isToday ? '2px solid var(--success)' : '1px solid var(--border)',
                  background: isSelected ? '#ebf8ff' : 'transparent',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500 }}>{d}</div>
                {dayEvents.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                    {dayEvents.slice(0, 3).map(e => (
                      <span key={e.id} style={{ width: 5, height: 5, borderRadius: '50%', background: TYPE_COLOR[e.type] || 'var(--secondary)' }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            {new Date(selected).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          {selectedEvents.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No events on this day.</div>
          ) : (
            selectedEvents.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <span className="badge" style={{ background: TYPE_COLOR[e.type] || 'var(--secondary)', color: '#fff', flexShrink: 0 }}>{e.type || 'Event'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{e.name || e.title}</div>
                  {e.description && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.description}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
