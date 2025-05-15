
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getUnreadMessagesCount, getUserUnreadRepliesCount } from '@/services/contact-service';
import { useAuth } from './AuthContext';

interface NotificationState {
  unreadAdminMessages: number;
  unreadUserReplies: number;
}

interface NotificationContextType {
  notifications: NotificationState;
  refreshNotifications: () => Promise<void>;
  clearNotifications: (type: 'admin' | 'user') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationState>({
    unreadAdminMessages: 0,
    unreadUserReplies: 0
  });
  
  const { authState } = useAuth();
  const { user, isAdmin } = authState;

  const refreshNotifications = async () => {
    if (!user) {
      setNotifications({ unreadAdminMessages: 0, unreadUserReplies: 0 });
      return;
    }

    try {
      // Fetch notifications based on user role
      if (isAdmin) {
        const adminCount = await getUnreadMessagesCount();
        setNotifications(prev => ({ ...prev, unreadAdminMessages: adminCount }));
      }
      
      // All users can get replies
      const userCount = await getUserUnreadRepliesCount(user.id);
      setNotifications(prev => ({ ...prev, unreadUserReplies: userCount }));
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    }
  };

  const clearNotifications = (type: 'admin' | 'user') => {
    setNotifications(prev => ({
      ...prev,
      [type === 'admin' ? 'unreadAdminMessages' : 'unreadUserReplies']: 0
    }));
  };

  // Refresh notifications on auth state change or every minute
  useEffect(() => {
    if (user) {
      refreshNotifications();
      
      // Setup interval for periodic refreshes
      const intervalId = setInterval(refreshNotifications, 60000);
      return () => clearInterval(intervalId);
    }
  }, [user, isAdmin]);

  return (
    <NotificationContext.Provider value={{ notifications, refreshNotifications, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
