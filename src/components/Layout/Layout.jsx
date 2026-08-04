import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ activeTab, onTabChange, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        collapsed={collapsed}
        onCollapse={setCollapsed}
      />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar
          activeTab={activeTab}
          onToggleSidebar={() => setCollapsed(c => !c)}
        />
        <main className="page-content fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
