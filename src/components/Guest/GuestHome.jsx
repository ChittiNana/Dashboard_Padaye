import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { na } from '../../utils/display';
import EventCalendar from '../Shared/EventCalendar';
import HeroSlideshow from './HeroSlideshow';
import './GuestHome.css';

const BADGE = { National: 'badge-danger', Festival: 'badge-warning', Regional: 'badge-purple' };

// What the portal offers (these describe the app's real screens, not claims about the school).
const PORTAL_FEATURES = [
  ['📅', 'Attendance', 'Teachers mark daily attendance; students and parents follow presence, absence and percentage.'],
  ['💳', 'Fees', 'View fee status and payment history, and pay securely online from the parent portal.'],
  ['📝', 'Exams & Results', 'Question papers, online exams with instant results, and report cards in one place.'],
  ['🗓️', 'Timetable', 'Class and teacher timetables, approved by the Principal and always up to date.'],
  ['📢', 'Notices & Messages', 'School notices for the right audience, plus notifications that reach you directly.'],
  ['📊', 'Reports', 'Attendance, results, fee collection and staff reports for school leadership.'],
];

// Fade/slide an element in the first time it scrolls into view.
function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') { setVisible(true); return undefined; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`gh-reveal${visible ? ' is-visible' : ''} ${className}`.trim()}
      style={{ '--gh-delay': `${delay}s` }} {...rest}>
      {children}
    </Tag>
  );
}

// Counts up to a number when it first becomes visible (shows the final value straight away if motion is reduced).
function CountUp({ value }) {
  const isNum = typeof value === 'number' && Number.isFinite(value);
  const target = isNum ? value : 0;
  const ref = useRef(null);
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const el = ref.current;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!el || reduce || typeof IntersectionObserver === 'undefined') { setShown(target); return undefined; }
    let raf;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 1200, 1);
        setShown(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [target]);
  return <span ref={ref}>{isNum ? shown.toLocaleString() : 'N/A'}</span>;
}

function goTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function GuestHome({ onLogin }) {
  const { currentUser } = useAuth();
  const { holidays, schoolInfo } = useData();
  const embedded = !!currentUser; // logged-in "guest" role renders inside the app layout: no site nav

  const upcoming = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return [...holidays].filter(h => h.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  }, [holidays]);
  const allHolidays = useMemo(() => [...holidays].sort((a, b) => a.date.localeCompare(b.date)), [holidays]);

  const website = schoolInfo.website || '';
  const websiteHref = /^https?:\/\//i.test(website) ? website : `https://${website}`;
  const stats = [
    ['👩‍🎓', schoolInfo.totalStudents, 'Students'],
    ['👔', schoolInfo.totalStaff, 'Staff Members'],
    ['🏫', schoolInfo.totalClasses, 'Classes'],
  ];
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const aboutParts = [];
  if (schoolInfo.name) {
    let first = schoolInfo.name;
    if (schoolInfo.established) first += ` has been educating students since ${schoolInfo.established}`;
    if (schoolInfo.affiliation) first += `${schoolInfo.established ? ',' : ' is'} affiliated to ${schoolInfo.affiliation}`;
    if (first !== schoolInfo.name) aboutParts.push(`${first}.`);
  }
  const live = [];
  if (isNum(schoolInfo.totalStudents)) live.push(`${schoolInfo.totalStudents.toLocaleString()} students`);
  if (isNum(schoolInfo.totalClasses)) live.push(`${schoolInfo.totalClasses.toLocaleString()} classes`);
  if (isNum(schoolInfo.totalStaff)) live.push(`${schoolInfo.totalStaff.toLocaleString()} staff members`);
  if (live.length) aboutParts.push(`Our community includes ${live.join(', ')}.`);
  const aboutText = aboutParts.join(' ');

  return (
    <div className={`gh-root${embedded ? ' gh-embedded' : ''}`}>
      {/* ── sticky navigation ── */}
      <header className="gh-nav">
        <div className="gh-wrap gh-nav-inner">
          <a className="gh-brand" href="#home" onClick={e => { e.preventDefault(); goTo('home'); }}>
            <span className="gh-brand-icon">🏫</span>
            <span className="gh-brand-name">{na(schoolInfo.name)}</span>
          </a>
          <nav className="gh-links">
            {[['about', 'About'], ['portal', 'Portal'], ['calendar', 'Calendar'], ['contact', 'Contact']].map(([id, label]) => (
              <a key={id} className="gh-link" href={`#${id}`} onClick={e => { e.preventDefault(); goTo(id); }}>{label}</a>
            ))}
            <button className="gh-btn gh-btn--sm" onClick={onLogin}>Login</button>
          </nav>
        </div>
      </header>

      {/* ── hero ── */}
      <section id="home" className="gh-hero">
        <HeroSlideshow />
        <div className="gh-hero-content">
          <div className="gh-hero-badge">{na(schoolInfo.affiliation)} · Est. {na(schoolInfo.established)}</div>
          <h1>{na(schoolInfo.name)}</h1>
          <p className="gh-hero-motto">{schoolInfo.motto ? `“${schoolInfo.motto}”` : 'N/A'}</p>
          <div className="gh-hero-actions">
            <button className="gh-btn gh-btn--primary" onClick={onLogin}>Login to Portal →</button>
            <button className="gh-btn gh-btn--ghost" onClick={() => goTo('about')}>Learn more</button>
          </div>
        </div>
        <div className="gh-scroll-hint" aria-hidden="true">⌄</div>
      </section>

      {/* ── numbers ── */}
      <div className="gh-stats">
        <div className="gh-wrap gh-stats-grid">
          {stats.map(([icon, val, label], i) => (
            <Reveal key={label} className="gh-stat" delay={i * 0.1}>
              <div className="gh-stat-icon">{icon}</div>
              <div className="gh-stat-val"><CountUp value={val} /></div>
              <div className="gh-stat-lbl">{label}</div>
            </Reveal>
          ))}
          <Reveal className="gh-stat" delay={0.3}>
            <div className="gh-stat-icon">📅</div>
            <div className="gh-stat-val">{na(schoolInfo.established)}</div>
            <div className="gh-stat-lbl">Established</div>
          </Reveal>
        </div>
      </div>

      {/* ── about ── */}
      <section id="about" className="gh-section">
        <div className="gh-wrap gh-about">
          <Reveal>
            <div className="gh-eyebrow">About us</div>
            <h2 className="gh-title">{schoolInfo.name ? `Welcome to ${schoolInfo.name}` : 'Welcome'}</h2>
            {aboutText && <p>{aboutText}</p>}
            {schoolInfo.motto && <p>Our guiding principle: <em>“{schoolInfo.motto}”</em></p>}
            <button className="gh-btn gh-btn--sm" onClick={onLogin}>Login to Portal →</button>
          </Reveal>
          <Reveal className="gh-facts" delay={0.15}>
            {[
              ['Principal', schoolInfo.principalName],
              ['Established', schoolInfo.established],
              ['Affiliation', schoolInfo.affiliation],
              ['Address', schoolInfo.address],
            ].map(([label, val]) => (
              <div key={label} className="gh-fact">
                <div className="gh-fact-lbl">{label}</div>
                <div className="gh-fact-val">{na(val)}</div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── portal features ── */}
      <section id="portal" className="gh-section gh-section--alt">
        <div className="gh-wrap">
          <Reveal className="gh-head">
            <div className="gh-eyebrow">The school portal</div>
            <h2 className="gh-title">Everything in one place</h2>
            <p className="gh-lead">Students, parents, teachers and staff sign in to the same portal to follow the school day.</p>
          </Reveal>
          <div className="gh-grid-3">
            {PORTAL_FEATURES.map(([icon, title, text], i) => (
              <Reveal key={title} className="gh-card" delay={(i % 3) * 0.1}>
                <div className="gh-card-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── holidays & calendar ── */}
      <section id="calendar" className="gh-section">
        <div className="gh-wrap">
          <Reveal className="gh-head">
            <div className="gh-eyebrow">Holiday calendar</div>
            <h2 className="gh-title">Plan ahead</h2>
            <p className="gh-lead">Upcoming holidays and school events. Pick any day on the calendar to see what is on.</p>
          </Reveal>
          <div className="gh-cal">
            <Reveal className="gh-upcoming">
              {upcoming.length === 0 && <div className="gh-empty">No upcoming holidays are scheduled.</div>}
              {upcoming.map(h => {
                const d = new Date(h.date);
                return (
                  <div key={h.id} className="gh-holiday">
                    <div className={`gh-date gh-date--${h.type}`}>
                      <div className="gh-date-day">{d.getDate()}</div>
                      <div className="gh-date-mon">{d.toLocaleDateString('en-IN', { month: 'short' })}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="gh-holiday-name">{h.name}</div>
                      {h.description && <div className="gh-holiday-desc">{h.description}</div>}
                    </div>
                    <span className={`badge ${BADGE[h.type] || 'badge-info'}`}>{h.type}</span>
                  </div>
                );
              })}
            </Reveal>
            <Reveal delay={0.15}>
              <EventCalendar events={holidays} title="Calendar" />
            </Reveal>
          </div>
          {allHolidays.length > 0 && (
            <details className="gh-all">
              <summary>View all holidays ({allHolidays.length})</summary>
              {allHolidays.map(h => (
                <div key={h.id} className="gh-all-row">
                  <span style={{ fontWeight: 600 }}>
                    {new Date(h.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span>{h.name}</span>
                  <span className={`badge ${BADGE[h.type] || 'badge-info'}`}>{h.type}</span>
                </div>
              ))}
            </details>
          )}
        </div>
      </section>

      {/* ── contact ── */}
      <section id="contact" className="gh-section gh-section--alt">
        <div className="gh-wrap">
          <Reveal className="gh-head">
            <div className="gh-eyebrow">Get in touch</div>
            <h2 className="gh-title">Contact us</h2>
          </Reveal>
          <div className="gh-grid-4">
            {[
              ['📍', 'Address', schoolInfo.address, null],
              ['📞', 'Phone', schoolInfo.phone, schoolInfo.phone ? `tel:${schoolInfo.phone.replace(/\s/g, '')}` : null],
              ['✉️', 'Email', schoolInfo.email, schoolInfo.email ? `mailto:${schoolInfo.email}` : null],
              ['🌐', 'Website', website, website ? websiteHref : null],
            ].map(([icon, label, val, href], i) => (
              <Reveal key={label} className="gh-card gh-contact" delay={i * 0.08}>
                <div className="gh-card-icon">{icon}</div>
                <h3>{label}</h3>
                {href && val ? <a href={href} target={label === 'Website' ? '_blank' : undefined} rel="noopener noreferrer">{val}</a> : <p>{na(val)}</p>}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="gh-footer">
        <strong>{na(schoolInfo.name)}</strong> · © {new Date().getFullYear()} All rights reserved.
      </footer>
    </div>
  );
}
