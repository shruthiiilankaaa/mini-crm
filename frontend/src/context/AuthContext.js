import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('crm_user')) || null
  );

  const login = (userData) => {
    localStorage.setItem('crm_user', JSON.stringify(userData));
    localStorage.setItem('crm_token', userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('crm_user');
    localStorage.removeItem('crm_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);