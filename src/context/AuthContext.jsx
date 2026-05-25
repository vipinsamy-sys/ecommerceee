import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Owner credentials (hardcoded for now)
const OWNER_CREDENTIALS = {
  username: 'suguna_admin',
  password: 'suguna@2026'
};

export const AuthProvider = ({ children }) => {
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(() => {
    return localStorage.getItem('suguna_owner_auth') === 'true';
  });

  const ownerLogin = (username, password) => {
    if (username === OWNER_CREDENTIALS.username && password === OWNER_CREDENTIALS.password) {
      setIsOwnerLoggedIn(true);
      localStorage.setItem('suguna_owner_auth', 'true');
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const ownerLogout = () => {
    setIsOwnerLoggedIn(false);
    localStorage.removeItem('suguna_owner_auth');
  };

  return (
    <AuthContext.Provider value={{ isOwnerLoggedIn, ownerLogin, ownerLogout }}>
      {children}
    </AuthContext.Provider>
  );
};
