import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);

  const login = (userData, token) => {
    setCurrentUser(userData);
    if (token) {
      localStorage.setItem('token', token);
    }
    // Load blocked users from localStorage or API
    const savedBlocked = localStorage.getItem(`blockedUsers_${userData.id}`);
    if (savedBlocked) {
      setBlockedUsers(JSON.parse(savedBlocked));
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      const { logout: logoutApi } = await import('../services/auth');
      await logoutApi();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and storage regardless of API call result
      setCurrentUser(null);
      setBlockedUsers([]);
      localStorage.removeItem('token');
    }
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const { getCurrentUser } = await import('../services/auth');
      const response = await getCurrentUser();
      setCurrentUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      return null;
    }
  };

  const updateProfile = (updates) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updates
    }));
  };

  const blockUser = (userId) => {
    if (!currentUser) return;

    const updated = [...blockedUsers, userId];
    setBlockedUsers(updated);
    // Save to localStorage
    localStorage.setItem(`blockedUsers_${currentUser.id}`, JSON.stringify(updated));
  };

  const unblockUser = (userId) => {
    if (!currentUser) return;

    const updated = blockedUsers.filter(id => id !== userId);
    setBlockedUsers(updated);
    // Save to localStorage
    localStorage.setItem(`blockedUsers_${currentUser.id}`, JSON.stringify(updated));
  };

  const isUserBlocked = (userId) => {
    return blockedUsers.includes(userId);
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      login,
      logout,
      updateProfile,
      blockUser,
      unblockUser,
      isUserBlocked,
      blockedUsers,
      checkAuth
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

