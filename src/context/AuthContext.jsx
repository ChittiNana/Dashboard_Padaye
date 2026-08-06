import { createContext, useContext, useState, useCallback } from 'react';
import { users as initialUsers } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState(initialUsers);

  const login = useCallback((username, password) => {
    const user = allUsers.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setError('');
      return true;
    }
    setError('Invalid username or password.');
    return false;
  }, [allUsers]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setError('');
  }, []);

  const registerUser = useCallback((userData) => {
    const newId = Math.max(...allUsers.map(u => u.id)) + 1;
    const newUser = { ...userData, id: newId };
    setAllUsers(prev => [...prev, newUser]);
    return newUser;
  }, [allUsers]);

  return (
    <AuthContext.Provider value={{ currentUser, allUsers, login, logout, registerUser, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
