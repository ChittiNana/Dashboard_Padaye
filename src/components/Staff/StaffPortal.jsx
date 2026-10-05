import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { schoolInfo } from '../../data/mockData';
import FeeManagement from '../Management/FeeManagement';

function Dashboard({ user }) {
  const { announcements } = useData();
  const roleLabel = user.role === 'support_staff'
    ? 'Support Staff'
    : user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Welcome, {user.name} 👋</h1>
          <p>Role: {roleLabel}</p>
        </div>
        <span className="badge badge-info">{schoolInfo.name}</span>
      </div>

      <div className="stat-grid mb-20">
        <div className="stat-card">
          <div className="stat-icon bg-blue">🏫</div>
          <div className="stat-info">
            <div className="stat-value">{schoolInfo.totalStudents}</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green">👔</div>
          <div className="stat-info">
            <div className="stat-value">{schoolInfo.totalStaff}</div>
            <div className="stat-label">Total Staff</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple">🏫</div>
          <div className="stat-info">
            <div className="stat-value">{schoolInfo.totalClasses}</div>
            <div className="stat-label">Classes</div>
          </div>
        </div>
        {user.staffCode && (
          <div className="stat-card">
            <div className="stat-icon bg-orange">🪪</div>
            <div className="stat-info">
              <div className="stat-value">{user.staffCode}</div>
              <div className="stat-label">Staff Code</div>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-grid grid-2">
        {/* Profile card */}
        <div className="card">
          <div className="card-header"><div className="card-title">My Profile</div></div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <span className="avatar avatar-lg role-teacher" style={{ width: 56, height: 56, fontSize: 20 }}>
                {user.avatar?.slice(0, 2)}
              </span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{user.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{roleLabel}</div>
              </div>
            </div>
            {[
              ['Email',      user.email],
              ['Phone',      user.phone],
              ['Staff Code', user.staffCode],
            ].filter(([,v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 12, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 110 }}>{k}</span>
                <span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent notices */}
        <div className="card">
          <div className="card-header"><div className="card-title">Recent Notices</div></div>
          <div className="card-body" style={{ padding: '8px 0' }}>
            {announcements.slice(0, 5).map(a => (
              <div key={a.id} style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                  <span style={{ fontSize: 14 }}>📢</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


function NoticesView() {
  const { announcements } = useData();
  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>School Notices</h1></div></div>
      <div style={{ display: 'grid', gap: 12 }}>
        {announcements.map(a => (
          <div key={a.id} className="card">
            <div className="card-body" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>📢</span>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{a.title}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{a.body}</p>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HolidaysView() {
  const { holidays } = useData();
  return (
    <div>
      <div className="page-header"><div className="page-header-left"><h1>Holiday Calendar</h1></div></div>
      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Date</th><th>Holiday</th><th>Type</th><th>Description</th></tr></thead>
            <tbody>
              {holidays.map(h => (
                <tr key={h.id}>
                  <td>{new Date(h.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</td>
                  <td style={{ fontWeight: 600 }}>{h.name}</td>
                  <td><span className={`badge badge-${h.type === 'National' ? 'danger' : h.type === 'Festival' ? 'warning' : 'info'}`}>{h.type}</span></td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{h.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function StaffPortal({ activeTab }) {
  const { currentUser } = useAuth();
  const views = {
    dashboard: <Dashboard user={currentUser} />,
    fees:      <FeeManagement />,
    notices:   <NoticesView />,
    holidays:  <HolidaysView />,
  };
  return views[activeTab] || <Dashboard user={currentUser} />;
}
