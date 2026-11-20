import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import * as notificationsApi from '../../api/notificationsApi';
import { readWithFallback } from '../../api/mockFallback';
import { deriveNotificationsForUser } from '../../data/mockStore';
import ProfileAvatar from '../Shared/ProfileAvatar';

const pageTitles = {
  dashboard:  'Dashboard',
  analytics:  'Analytics',
  staff:      'Staff Management',
  students:   'Students',
  classes:    'Classes',
  subjects:   'Subjects',
  'school-settings': 'School Settings',
  fees:       'Fees & Finance',
  exams:      'Exams',
  attendance: 'Attendance',
  holidays:   'Holiday Calendar',
  notices:    'Notices',
  messages:   'Messages',
  reports:    'Reports',
  timetable:  'Timetable',
  homework:   'Homework / Assignments',
  myclasses:  'My Classes',
  notes:      'Study Materials',
  gradebook:  'Grade Book',
  papers:     'Past Papers',
  results:    'Results',
  'take-exam': 'Take Exam',
  contact:    'Contact Teacher',
  home:       'School Information',
  calendar:   'Academic Calendar',
};

export default function Navbar({ activeTab, onToggleSidebar }) {
  const { currentUser, logout } = useAuth();
  const { announcements } = useData();
  const [showNotif, setShowNotif] = useState(false);
  const [personalNotifs, setPersonalNotifs] = useState([]);

  useEffect(() => {
    if (!currentUser?.id) { setPersonalNotifs([]); return; }
    readWithFallback(
      () => notificationsApi.listForUser(currentUser.id),
      () => deriveNotificationsForUser(currentUser.id),
      { label: 'listNotificationsForUser' },
    ).then(setPersonalNotifs);
  }, [currentUser?.id]);

  const feed = [
    ...personalNotifs.map(n => ({ id: `n-${n.id}`, icon: '💰', title: n.message, date: n.createdAt, color: 'bg-orange' })),
    ...announcements.map(a => ({ id: `a-${a.id}`, icon: '📢', title: a.title, date: a.createdAt, color: 'bg-teal' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Unread = personal notifications without readAt (absent field counts as unread) plus announcements.
  const unreadCount = personalNotifs.filter(n => n.readAt == null).length + announcements.length;

  return (
    <header className="navbar">
      <button className="navbar-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
        ☰
      </button>
      <span className="navbar-title">
        {pageTitles[activeTab] || 'Dashboard'}
      </span>

      <div className="navbar-spacer" />

      {/* Search */}
      <div className="navbar-search">
        <span className="navbar-search-icon">🔍</span>
        <input type="text" placeholder="Search…" />
      </div>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          className="navbar-icon-btn"
          onClick={() => setShowNotif(s => !s)}
          title="Notifications"
        >
          🔔
          {unreadCount > 0 && <span className="dot" />}
        </button>
        {showNotif && (
          <div style={{
            position: 'absolute', right: 0, top: '44px',
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
            width: 320, zIndex: 300, animation: 'slideUp 0.15s ease',
          }}>
            <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>
              Notifications
            </div>
            <div style={{ maxHeight: 320, overflowY: 'auto' }}>
              {feed.slice(0, 5).map(f => (
                <div key={f.id} className="notif-item" style={{ padding: '10px 16px' }}>
                  <div className={`notif-icon ${f.color}`}>
                    {f.icon}
                  </div>
                  <div className="notif-body">
                    <div className="notif-title">{f.title}</div>
                    <div className="notif-meta">{f.date ? new Date(f.date).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
              ))}
              {feed.length === 0 && (
                <div style={{ padding: '16px', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                  No notifications.
                </div>
              )}
            </div>
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <button style={{ fontSize: 12, color: 'var(--secondary)', fontWeight: 500 }}
                onClick={() => setShowNotif(false)}>
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={logout} title="Click to logout">
        <ProfileAvatar image={currentUser?.profileImage} gender={currentUser?.gender} role={currentUser?.role} size={36} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
            {currentUser?.name?.split(' ').slice(0, 2).join(' ')}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {currentUser?.role}
          </span>
        </div>
      </div>
    </header>
  );
}
