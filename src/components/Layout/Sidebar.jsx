import { useAuth } from '../../context/AuthContext';

const navConfig = {
  principal: [
    { section: 'Overview', items: [
      { id: 'dashboard',       icon: '🏠', label: 'Dashboard'          },
      { id: 'analytics',       icon: '📊', label: 'Analytics'          },
    ]},
    { section: 'Management', items: [
      { id: 'registration',    icon: '👤', label: 'User Management'    },
      { id: 'staff',           icon: '👔', label: 'Staff'              },
      { id: 'students',        icon: '👩‍🎓', label: 'All Students'    },
      { id: 'classes',         icon: '🏫', label: 'Classes'            },
      { id: 'fees',            icon: '💰', label: 'Fees & Finance'     },
    ]},
    { section: 'Academic', items: [
      { id: 'exams',           icon: '📋', label: 'Exam Management'    },
      { id: 'question-papers', icon: '📝', label: 'Question Papers'    },
      { id: 'attendance',      icon: '✅', label: 'Attendance'         },
      { id: 'holidays',        icon: '🗓', label: 'Holiday Calendar'   },
    ]},
    { section: 'Communication', items: [
      { id: 'notices',         icon: '📢', label: 'Notices',  badge: '2' },
      { id: 'messages',        icon: '💬', label: 'Messages', badge: '3' },
      { id: 'reports',         icon: '📈', label: 'Reports'             },
    ]},
  ],
  headmaster: [
    { section: 'Overview', items: [
      { id: 'dashboard',       icon: '🏠', label: 'Dashboard'          },
    ]},
    { section: 'Academic', items: [
      { id: 'classes',         icon: '🏫', label: 'Class Management'   },
      { id: 'timetable',       icon: '🕐', label: 'Timetable'          },
      { id: 'exams',           icon: '📋', label: 'Exams'              },
      { id: 'question-papers', icon: '📝', label: 'Question Papers'    },
      { id: 'attendance',      icon: '✅', label: 'Attendance'         },
      { id: 'homework',        icon: '📚', label: 'Homework'           },
    ]},
    { section: 'Staff', items: [
      { id: 'registration',    icon: '👤', label: 'User Management'    },
      { id: 'staff',           icon: '👔', label: 'Staff Overview'     },
      { id: 'students',        icon: '👩‍🎓', label: 'Students'        },
    ]},
    { section: 'Admin', items: [
      { id: 'holidays',        icon: '🗓', label: 'Holiday Calendar'   },
      { id: 'notices',         icon: '📢', label: 'Notices'            },
      { id: 'reports',         icon: '📈', label: 'Reports'            },
    ]},
  ],
  teacher: [
    { section: 'Overview', items: [
      { id: 'dashboard',       icon: '🏠', label: 'Dashboard'          },
    ]},
    { section: 'Teaching', items: [
      { id: 'myclasses',       icon: '🏫', label: 'My Classes'         },
      { id: 'timetable',       icon: '🕐', label: 'Timetable'          },
      { id: 'attendance',      icon: '✅', label: 'Mark Attendance'    },
      { id: 'notes',           icon: '📚', label: 'Upload Notes'       },
      { id: 'homework',        icon: '📝', label: 'Assignments'        },
    ]},
    { section: 'Assessment', items: [
      { id: 'exams',           icon: '📋', label: 'Exams'              },
      { id: 'question-papers', icon: '📄', label: 'Question Papers'    },
      { id: 'gradebook',       icon: '📊', label: 'Grade Book'         },
    ]},
    { section: 'Other', items: [
      { id: 'holidays',        icon: '🗓', label: 'Holidays'           },
      { id: 'messages',        icon: '💬', label: 'Messages', badge: '2' },
    ]},
  ],
  accountant: [
    { section: 'Overview', items: [
      { id: 'dashboard',       icon: '🏠', label: 'Dashboard'          },
    ]},
    { section: 'Finance', items: [
      { id: 'fees',            icon: '💰', label: 'Fees & Accounts'    },
    ]},
    { section: 'Other', items: [
      { id: 'notices',         icon: '📢', label: 'Notices'            },
    ]},
  ],
  support_staff: [
    { section: 'Overview', items: [
      { id: 'dashboard',       icon: '🏠', label: 'Dashboard'          },
    ]},
    { section: 'Info', items: [
      { id: 'notices',         icon: '📢', label: 'Notices'            },
      { id: 'holidays',        icon: '🗓', label: 'Holiday Calendar'   },
    ]},
  ],
  student: [
    { section: 'Overview', items: [
      { id: 'dashboard',   icon: '🏠', label: 'Dashboard'       },
    ]},
    { section: 'Academics', items: [
      { id: 'timetable',   icon: '🕐', label: 'Timetable'       },
      { id: 'notes',       icon: '📚', label: 'Study Materials' },
      { id: 'homework',    icon: '📝', label: 'Homework'        },
    ]},
    { section: 'Exams', items: [
      { id: 'exams',       icon: '📋', label: 'Exam Schedule'   },
      { id: 'papers',      icon: '📄', label: 'Past Papers'     },
      { id: 'results',     icon: '🏆', label: 'My Results'      },
    ]},
    { section: 'Records', items: [
      { id: 'attendance',  icon: '✅', label: 'My Attendance'   },
      { id: 'holidays',    icon: '🗓', label: 'Holiday List'    },
      { id: 'notices',     icon: '📢', label: 'Notices'         },
    ]},
  ],
  parent: [
    { section: 'Overview', items: [
      { id: 'dashboard',   icon: '🏠', label: 'Dashboard'       },
    ]},
    { section: "My Child's Progress", items: [
      { id: 'attendance',  icon: '✅', label: 'Attendance'      },
      { id: 'results',     icon: '🏆', label: 'Exam Results'    },
      { id: 'homework',    icon: '📝', label: 'Homework'        },
      { id: 'fees',        icon: '💰', label: 'Fee Status'      },
    ]},
    { section: 'Communication', items: [
      { id: 'contact',     icon: '📞', label: 'Contact Teacher' },
      { id: 'messages',    icon: '💬', label: 'Messages', badge: '1' },
      { id: 'notices',     icon: '📢', label: 'School Notices'  },
    ]},
    { section: 'Calendar', items: [
      { id: 'holidays',    icon: '🗓', label: 'Academic Calendar'},
    ]},
  ],
  guest: [
    { section: 'Public', items: [
      { id: 'home',        icon: '🏠', label: 'School Info'     },
      { id: 'notices',     icon: '📢', label: 'Public Notices'  },
      { id: 'calendar',    icon: '🗓', label: 'Calendar'        },
    ]},
  ],
};

export default function Sidebar({ activeTab, onTabChange, collapsed, onCollapse }) {
  const { currentUser, logout } = useAuth();
  const role = currentUser?.role || 'guest';
  const sections = navConfig[role] || navConfig.guest;
  const avatarRole = ['accountant', 'support_staff'].includes(role) ? 'teacher' : role;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🏫</div>
        {!collapsed && (
          <div className="sidebar-logo-text">
            Greenwood
            <small>School Portal</small>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {sections.map(sec => (
          <div key={sec.section}>
            <div className="sidebar-section-label">{sec.section}</div>
            {sec.items.map(item => (
              <div
                key={item.id}
                className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{item.label}</span>
                {item.badge && (
                  <span className="sidebar-badge">{item.badge}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user-card" onClick={logout}>
          <span className={`avatar avatar-sm role-${avatarRole}`}>
            {currentUser?.avatar?.slice(0, 2) || 'GU'}
          </span>
          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser?.name || 'Guest'}
              </div>
              <div style={{ fontSize: 10, color: '#718096', textTransform: 'capitalize' }}>
                {role} · Logout
              </div>
            </div>
          )}
          {!collapsed && <span style={{ color: '#718096', fontSize: 14 }}>→</span>}
        </div>
      </div>
    </aside>
  );
}
