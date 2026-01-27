'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string; // "assignment", "review", "submission", "system", "invitation"
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

interface UseNotificationsOptions {
  /** Polling interval in milliseconds (default: 30000 = 30 seconds) */
  pollingInterval?: number;
  /** Maximum number of notifications to fetch (default: 20) */
  limit?: number;
  /** Whether to auto-start polling (default: true) */
  autoStart?: boolean;
  /** Only fetch unread notifications (default: false) */
  unreadOnly?: boolean;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  /** Manually refresh notifications */
  refresh: () => Promise<void>;
  /** Mark a single notification as read */
  markAsRead: (id: string) => Promise<void>;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;
  /** Delete a notification */
  deleteNotification: (id: string) => Promise<void>;
  /** Delete all read notifications */
  deleteAllRead: () => Promise<void>;
  /** Start polling */
  startPolling: () => void;
  /** Stop polling */
  stopPolling: () => void;
  /** Whether polling is active */
  isPolling: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    pollingInterval = 30000, // 30 seconds default
    limit = 20,
    autoStart = true,
    unreadOnly = false,
  } = options;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('limit', limit.toString());
      if (unreadOnly) params.set('unread', 'true');

      const response = await fetch(`/api/notifications?${params.toString()}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, stop polling
          stopPolling();
          return;
        }
        throw new Error('Failed to fetch notifications');
      }

      const data: NotificationsResponse = await response.json();
      
      if (isMountedRef.current) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [limit, unreadOnly]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return; // Already polling
    
    setIsPolling(true);
    pollingIntervalRef.current = setInterval(() => {
      fetchNotifications(false); // Don't show loading on poll
    }, pollingInterval);
  }, [fetchNotifications, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (!response.ok) throw new Error('Failed to mark notification as read');

      // Optimistic update
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Refresh to get correct state
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read' }),
      });

      if (!response.ok) throw new Error('Failed to mark all as read');

      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete notification');

      // Optimistic update
      setNotifications(prev => {
        const notification = prev.find(n => n.id === id);
        if (notification && !notification.isRead) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n.id !== id);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  // Delete all read notifications
  const deleteAllRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications?read=true', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete read notifications');

      // Optimistic update
      setNotifications(prev => prev.filter(n => !n.isRead));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      fetchNotifications(false);
    }
  }, [fetchNotifications]);

  // Refresh manually
  const refresh = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  // Initial fetch and setup polling
  useEffect(() => {
    isMountedRef.current = true;
    fetchNotifications(true);
    
    if (autoStart) {
      startPolling();
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [fetchNotifications, autoStart, startPolling, stopPolling]);

  // Handle visibility change - pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (autoStart) {
        fetchNotifications(false); // Fetch immediately when tab becomes visible
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autoStart, fetchNotifications, startPolling, stopPolling]);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    startPolling,
    stopPolling,
    isPolling,
  };
}
