import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import * as authApi from '../api/authApi';
import * as peopleApi from '../api/peopleApi';
import { decodeToken, isExpired, setTokens, clearTokens, getAccessToken, getRefreshToken } from '../api/tokenStorage';
import { readWithFallback, writeWithApi } from '../api/mockFallback';
import { listTable, getById, insertRecord, nextStaffCode, nextAdmissionNumber, toUsersApiShape } from '../data/mockStore';

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
      // Backend allows GET /api/students only for PRINCIPAL/HEADMASTER/TEACHER (accountant would get 403).
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
            gender: self.gender,
            profileImage: self.profileImage,
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
            subject: self.subject,
            gender: self.gender,
            profileImage: self.profileImage,
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

      // Gender/profile photo live only in the mock `users` table today (no
      // backend concept for either yet) — merge them in regardless of role so
      // every role's own avatar (Sidebar, Navbar) can show it, including
      // parent/guest which have no student/staff self-record to patch from above.
      const ownUserRecord = getById('users', user.id);
      if (ownUserRecord) {
        selfPatch = {
          ...selfPatch,
          gender: selfPatch?.gender ?? ownUserRecord.gender,
          profileImage: selfPatch?.profileImage ?? ownUserRecord.profileImage,
        };
      }

      if (selfPatch) {
        setCurrentUser((u) => (u ? { ...u, ...selfPatch } : u));
      }
    } catch (err) {
      // An expired session must send the user back to login instead of leaving them on mock data.
      if (err && err.name === 'AuthError') {
        clearTokens();
        setCurrentUser(null);
        setError('');
      }
      // Anything else: people-service data is supplementary — auth stays valid even if this fails.
    }
  }, []);

  // Expired access token + valid refresh token on app start: try one silent refresh before giving up.
  useEffect(() => {
    if (currentUser) return undefined;
    const refreshToken = getRefreshToken();
    const decoded = decodeToken(getAccessToken());
    if (!refreshToken || !decoded || !isExpired(decoded)) return undefined;
    let cancelled = false;
    authApi.refresh(refreshToken)
      .then((tokens) => {
        if (cancelled) return;
        setTokens(tokens);
        setCurrentUser(userFromDecodedToken(decodeToken(tokens.accessToken)));
      })
      .catch(() => { if (!cancelled) clearTokens(); });
    return () => { cancelled = true; };
    // Startup only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const registerUser = useCallback(async (userData) => {
    const role = userData.role.toLowerCase();
    const [firstName, ...rest] = userData.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;
    // Generated once so the real call and the offline fallback use the same code.
    const staffCode = userData.staffCode || nextStaffCode();
    const admissionNumber = userData.admissionNumber || nextAdmissionNumber();
    // IT manager registering a Principal: backend only lets PRINCIPAL/HEADMASTER create staff records,
    // so register the auth user only.
    const skipStaffRecord = currentUser?.role === 'it_manager' && role === 'principal';

    const { result, real } = await writeWithApi(
      async () => {
        const user = await authApi.register(userData);
        let studentId;
        if (STAFF_ROLES.includes(role) && !skipStaffRecord) {
          const staff = await peopleApi.createStaff({
            userId: user.id,
            firstName,
            lastName,
            staffCode,
            staffRole: role.toUpperCase(),
            email: userData.email,
            phone: userData.phone,
            address: userData.address,
            subject: userData.subject || undefined,
          });
          if (staff) setAllStaff((prev) => [...prev, toStaffView(staff)]);
        } else if (role === 'student') {
          const student = await peopleApi.createStudent({
            userId: user.id,
            firstName,
            lastName,
            admissionNumber,
            classId: userData.classId,
            dateOfBirth: userData.dateOfBirth,
            gender: userData.gender,
            guardianName: userData.guardianName,
            guardianPhone: userData.guardianPhone,
            address: userData.address,
          });
          studentId = student?.id ?? user.id;
          if (student) setAllStudents((prev) => [...prev, toStudentView(student)]);
          if (userData.parentUserId) {
            await peopleApi.linkParentToStudent(userData.parentUserId, {
              studentId,
              relationship: userData.relationship || 'Guardian',
            });
          }
        }
        return { ...user, studentId };
      },
      () => {
        const user = insertRecord('users', {
          username: userData.username,
          password: userData.password,
          role,
          name: userData.fullName,
          avatar: userData.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
          email: userData.email,
          gender: userData.gender || '',
          profileImage: userData.profileImage || null,
          joinDate: new Date().toISOString().slice(0, 10),
        });

        // Registering an auth user is only half the job — the Staff/Student
        // tabs read from separate directory records that must be created too.
        if (STAFF_ROLES.includes(role)) {
          // `id` matches `user.id` on purpose (same convention the seed data uses) so this
          // person's own later self-lookup (getById('staff', user.id)) finds this record.
          const staff = insertRecord('staff', {
            id: user.id,
            userId: user.id,
            firstName,
            lastName,
            staffCode,
            staffRole: role.toUpperCase(),
            email: userData.email,
            phone: userData.phone || '',
            address: userData.address || '',
            subject: userData.subject || undefined,
            gender: userData.gender || '',
            profileImage: userData.profileImage || null,
            active: true,
          });
          setAllStaff((prev) => [...prev, toStaffView(staff)]);
        } else if (role === 'student') {
          const student = insertRecord('students', {
            id: user.id,
            userId: user.id,
            firstName,
            lastName,
            admissionNumber,
            classId: userData.classId || null,
            dateOfBirth: userData.dateOfBirth || null,
            gender: userData.gender || '',
            guardianName: userData.guardianName || '',
            guardianPhone: userData.guardianPhone || '',
            address: userData.address || '',
            parentUserId: userData.parentUserId || null,
            profileImage: userData.profileImage || null,
            active: true,
          });
          setAllStudents((prev) => [...prev, toStudentView(student)]);
        }

        return toUsersApiShape(user);
      },
      { label: 'registerUser' },
    );
    return { ...result, real };
  }, [currentUser?.role]);

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
