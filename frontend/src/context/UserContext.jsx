import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);

  const login = (userData) => {
    setCurrentUser(userData);
    // Load blocked users from localStorage or API
    const savedBlocked = localStorage.getItem(`blockedUsers_${userData.id}`);
    if (savedBlocked) {
      setBlockedUsers(JSON.parse(savedBlocked));
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setBlockedUsers([]);
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
      blockedUsers
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

