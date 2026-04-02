import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ztoken');
    if (token) {
      api.get('/users/me')
        .then(res => setUser(res.data.data))
        .catch(() => localStorage.removeItem('ztoken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/users/login', { email, password });
    localStorage.setItem('ztoken', res.data.data.token);
    setUser(res.data.data);
    return res.data.data;
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/users/register', { name, email, password, role });
    localStorage.setItem('ztoken', res.data.data.token);
    setUser(res.data.data);
    return res.data.data;
  };

  const logout = () => {
    localStorage.removeItem('ztoken');
    setUser(null);
  };

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f8fafc' }}>
      Loading...
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
