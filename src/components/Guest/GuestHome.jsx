import { useState } from 'react';
import { schoolInfo } from '../../data/mockData';
import { useData } from '../../context/DataContext';

export default function GuestHome({ onLogin }) {
  const { holidays } = useData();
  const badgeColors = { National:'badge-danger', Festival:'badge-warning', Regional:'badge-purple' };
  const [tab, setTab] = useState('about');

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* School Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1928, #1e3a5f)',
        borderRadius: 16, padding: 40, marginBottom: 24,
        color: '#fff', textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🏫</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{schoolInfo.name}</h1>
        <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 20 }}>
          {schoolInfo.affiliation} · Est. {schoolInfo.established}
        </p>
        <p style={{ fontStyle:'italic', fontSize: 16, opacity: 0.9, marginBottom: 28 }}>
          "{schoolInfo.motto}"
        </p>
        <div style={{ display:'flex', justifyContent:'center', gap: 40, flexWrap:'wrap', marginBottom: 28 }}>
          {[['👩‍🎓', schoolInfo.totalStudents.toLocaleString(), 'Students'],
            ['👔', schoolInfo.totalStaff, 'Staff Members'],
            ['🏫', schoolInfo.totalClasses, 'Classes'],
            ['📅', schoolInfo.established, 'Est.'],
          ].map(([icon, val, label]) => (
            <div key={label} style={{ textAlign:'center' }}>
              <div style={{ fontSize: 20 }}>{icon}</div>
              <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{val}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
            </div>
          ))}
        </div>
        <button
          onClick={onLogin}
          style={{
            background: '#fff', color: '#1e3a5f', border: 'none', borderRadius: 8,
            padding: '12px 32px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >
          Login to Portal →
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['about','holidays'].map(t => (
          <div key={t} className={`tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)} style={{ textTransform:'capitalize' }}>{t}</div>
        ))}
      </div>

      {tab === 'about' && (
        <div className="dashboard-grid grid-2">
          <div className="card">
            <div className="card-header"><div className="card-title">Contact Information</div></div>
            <div className="card-body">
              {[
                ['📍', 'Address', schoolInfo.address],
                ['📞', 'Phone',   schoolInfo.phone],
                ['✉️', 'Email',   schoolInfo.email],
                ['🌐', 'Website', schoolInfo.website],
                ['🎓', 'Principal', schoolInfo.principalName],
              ].map(([icon, label, val]) => (
                <div key={label} style={{ display:'flex', gap:10, marginBottom:12 }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
                    <div style={{ fontSize:13, fontWeight:500, marginTop:2 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Portal Access Guide</div></div>
            <div className="card-body">
              {[
                { role:'Principal',  icon:'👑', desc:'Full school oversight and administration',           color:'bg-red'    },
                { role:'Headmaster', icon:'🎓', desc:'Academic management and staff coordination',        color:'bg-purple' },
                { role:'Teacher',    icon:'👨‍🏫', desc:'Class management, attendance, and grades',        color:'bg-blue'   },
                { role:'Student',    icon:'📚', desc:'Timetable, notes, homework, exams, results',       color:'bg-green'  },
                { role:'Parent',     icon:'👨‍👩‍👧', desc:'Monitor child\'s progress, fees, and contact teachers', color:'bg-orange' },
              ].map(r => (
                <div key={r.role} style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12, padding:'8px 10px', background:'var(--bg-app)', borderRadius:8 }}>
                  <div className={`stat-icon ${r.color}`} style={{ width:36, height:36, fontSize:16 }}>{r.icon}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:13 }}>{r.role}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                </div>
              ))}
              <button className="btn btn-primary w-full" style={{ marginTop:8 }} onClick={onLogin}>
                Sign In to Portal
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'holidays' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Date</th><th>Holiday</th><th>Type</th><th>Description</th></tr></thead>
              <tbody>
                {holidays.map(h => (
                  <tr key={h.id}>
                    <td style={{fontWeight:500}}>
                      {new Date(h.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </td>
                    <td style={{fontWeight:600}}>{h.name}</td>
                    <td><span className={`badge ${badgeColors[h.type]}`}>{h.type}</span></td>
                    <td style={{fontSize:12,color:'var(--text-secondary)'}}>{h.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
