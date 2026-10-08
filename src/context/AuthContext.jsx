import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import * as authApi from '../api/authApi';
import * as peopleApi from '../api/peopleApi';
import { decodeToken, isExpired, setTokens, clearTokens, getAccessToken } from '../api/tokenStorage';
import { readWithFallback, writeThroughMock } from '../api/mockFallback';
import { listTable, getById, insertRecord } from '../data/mockStore';

const AuthContext = createContext(null);

const STAFF_ROLES = ['teacher', 'principal', 'headmaster', 'accountant', 'support_staff'];

function personName(record) {
  return `${record.firstName || ''} ${record.lastName || ''}`.trim();
}

function personAvatar(record) {
  return `${(record.firstName || '')[0] || ''}${(record.lastName || '')[0] || ''}`.toUpperCase();
}

function toStudentView(record) {
  return { ...record, role: 'student', name: personName(record), avatar: personAvatar(record) };
}

function toStaffView(record) {
  return {
    ...record,
    role: (record.staffRole || '').toLowerCase(),
    name: personName(record),
    avatar: personAvatar(record),
  };
}

function userFromDecodedToken(decoded) {
  if (!decoded) return null;
  const roles = decoded.roles || [];
  return {
    id: decoded.userId,
    username: decoded.username,
    roles,
    role: (roles[0] || '').toLowerCase(),
  };
}

function initialUser() {
  const decoded = decodeToken(getAccessToken());
  if (!decoded || isExpired(decoded)) return null;
  return userFromDecodedToken(decoded);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(initialUser);
  const [error, setError] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [myChildren, setMyChildren] = useState([]);

  const loadPeople = useCallback(async (user) => {
    if (!user) {
      setAllStudents([]);
      setAllStaff([]);
      setMyChildren([]);
      return;
    }
    try {
      if (['principal', 'headmaster', 'teacher'].includes(user.role)) {
        const students = await readWithFallback(
          () => peopleApi.listStudents(),
          () => listTable('students'),
          { label: 'listStudents' },
        );
        setAllStudents(students.map(toStudentView));
      } else {
        setAllStudents([]);
      }

      if (['principal', 'headmaster'].includes(user.role)) {
        const staff = await readWithFallback(
          () => peopleApi.listStaff(),
          () => listTable('staff'),
          { label: 'listStaff' },
        );
        setAllStaff(staff.map(toStaffView));
      } else {
        setAllStaff([]);
      }

      let selfPatch = null;

      if (user.role === 'student') {
        const self = await readWithFallback(
          () => peopleApi.getMyStudentRecord(),
          () => getById('students', user.id),
          { label: 'getMyStudentRecord' },
        );
        if (self) {
          selfPatch = {
            studentId: self.id,
            classId: self.classId,
            admissionNumber: self.admissionNumber,
            firstName: self.firstName,
            lastName: self.lastName,
            name: personName(self),
            avatar: personAvatar(self),
          };
        }
      } else if (STAFF_ROLES.includes(user.role)) {
        const self = await readWithFallback(
          () => peopleApi.getMyStaffRecord(),
          () => getById('staff', user.id),
          { label: 'getMyStaffRecord' },
        );
        if (self) {
          selfPatch = {
            staffId: self.id,
            staffCode: self.staffCode,
            firstName: self.firstName,
            lastName: self.lastName,
            name: personName(self),
            avatar: personAvatar(self),
            email: self.email,
            phone: self.phone,
          };
        }
      } else if (user.role === 'parent') {
        const kids = await readWithFallback(
          () => peopleApi.getChildrenForParent(user.id),
          () => listTable('students').filter((s) => String(s.parentUserId) === String(user.id)),
          { label: 'getChildrenForParent' },
        );
        setMyChildren(kids.map(toStudentView));
      }

      if (selfPatch) {
        setCurrentUser((u) => (u ? { ...u, ...selfPatch } : u));
      }
    } catch {
      // People-service data is supplementary — auth stays valid even if this fails.
    }
  }, []);

  useEffect(() => {
    loadPeople(currentUser);
    // Only rerun when identity changes, not on every currentUser field update from loadPeople itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  const login = useCallback(async (username, password) => {
    try {
      const tokens = await authApi.login(username, password);
      setTokens(tokens);
      const decoded = decodeToken(tokens.accessToken);
      setCurrentUser(userFromDecodedToken(decoded));
      setError('');
      return true;
    } catch (err) {
      const mockUser = listTable('users').find(
        (u) => u.username === username && u.password === password,
      );
      if (mockUser) {
        console.warn('[mock-fallback] login failed, using local demo account', err);
        clearTokens();
        setCurrentUser({
          id: mockUser.id,
          username: mockUser.username,
          roles: [mockUser.role.toUpperCase()],
          role: mockUser.role,
        });
        setError('');
        return true;
      }
      clearTokens();
      setCurrentUser(null);
      setError(err.message || 'Invalid username or password.');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setCurrentUser(null);
    setError('');
  }, []);

  const registerUser = useCallback((userData) => writeThroughMock(
    () => insertRecord('users', {
      username: userData.username,
      password: userData.password,
      role: userData.role.toLowerCase(),
      name: userData.fullName,
      avatar: userData.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
      email: userData.email,
      joinDate: new Date().toISOString().slice(0, 10),
    }),
    () => authApi.register(userData),
    { label: 'registerUser' },
  ), []);

  const allUsers = useMemo(() => [...allStaff, ...allStudents], [allStaff, allStudents]);

  return (
    <AuthContext.Provider value={{
      currentUser, login, logout, registerUser, error,
      allUsers, allStudents, allStaff, myChildren,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
