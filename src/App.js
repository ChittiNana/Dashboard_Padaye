import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import PrincipalDashboard  from './components/Principal/PrincipalDashboard';
import HeadmasterDashboard from './components/Headmaster/HeadmasterDashboard';
import TeacherDashboard    from './components/Teacher/TeacherDashboard';
import StudentDashboard    from './components/Student/StudentDashboard';
import ParentDashboard     from './components/Parent/ParentDashboard';
import GuestHome           from './components/Guest/GuestHome';
import StaffPortal         from './components/Staff/StaffPortal';

const defaultTab = {
  principal:    'dashboard',
  headmaster:   'dashboard',
  teacher:      'dashboard',
  student:      'dashboard',
  parent:       'dashboard',
  accountant:   'dashboard',
  support_staff:'dashboard',
  guest:        'home',
};

function AppContent() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(
    currentUser ? (defaultTab[currentUser.role] ?? 'dashboard') : 'home'
  );
  const [showLogin, setShowLogin] = useState(!!currentUser);

  if (!currentUser) {
    if (showLogin) return <Login />;
    return <GuestHome onLogin={() => setShowLogin(true)} />;
  }

  const handleTabChange = (tab) => setActiveTab(tab);

  const dashboards = {
    principal:    <PrincipalDashboard  activeTab={activeTab} />,
    headmaster:   <HeadmasterDashboard activeTab={activeTab} />,
    teacher:      <TeacherDashboard    activeTab={activeTab} />,
    student:      <StudentDashboard    activeTab={activeTab} />,
    parent:       <ParentDashboard     activeTab={activeTab} />,
    accountant:   <StaffPortal         activeTab={activeTab} />,
    support_staff:<StaffPortal         activeTab={activeTab} />,
    guest:        <GuestHome onLogin={() => {}} />,
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      {dashboards[currentUser.role] || dashboards.guest}
    </Layout>
  );
}

function AppContentWrapper() {
  const { currentUser } = useAuth();
  return <AppContent key={currentUser?.id ?? 'guest'} />;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContentWrapper />
      </DataProvider>
    </AuthProvider>
  );
}
