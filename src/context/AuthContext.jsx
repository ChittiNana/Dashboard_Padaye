import { createContext, useContext, useState, useCallback } from 'react';
import { users } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');

  const login = useCallback((username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setError('');
      return true;
    }
    setError('Invalid username or password.');
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setError('');
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
