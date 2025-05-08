import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import tokenService from '@/lib/token-service';

// Get timeout based on user role
const getTimeoutByRole = (role?: string): number => {
  if (!role) return 3 * 60 * 1000; // Default: 3 minutes

  switch(role?.toLowerCase()) {
    case 'admin':
      return 2 * 60 * 1000; // 2 minutes for admins (more sensitive)
    case 'editor':
      return 3 * 60 * 1000; // 3 minutes for editors
    default:
      return 5 * 60 * 1000; // 5 minutes for viewers
  }
};

// Warning time before logout (30 seconds before)
const WARNING_TIME = 30 * 1000;

// Global variables for standalone functions
let inactivityTimeout: number | null = null;
let warningTimeout: number | null = null;
let logoutCallback: (() => void) | null = null;
let userRole: string | undefined = undefined;

/**
 * Start the inactivity timer
 * @param callback Function to call when inactivity timeout is reached
 * @param role Optional user role to determine timeout duration
 */
export const startInactivityTimer = (callback: () => void, role?: string) => {
  // Store the callback and role
  logoutCallback = callback;
  userRole = role;

  // Start the timer
  resetInactivityTimer();

  // Add event listeners
  const activityEvents = [
    'mousedown', 'mousemove', 'keydown',
    'scroll', 'touchstart', 'click', 'wheel'
  ];

  activityEvents.forEach(event => {
    window.addEventListener(event, resetInactivityTimer);
  });
};

/**
 * Stop the inactivity timer and remove event listeners
 */
export const stopInactivityTimer = () => {
  // Clear timeouts
  if (inactivityTimeout) {
    window.clearTimeout(inactivityTimeout);
    inactivityTimeout = null;
  }

  if (warningTimeout) {
    window.clearTimeout(warningTimeout);
    warningTimeout = null;
  }

  // Remove event listeners
  const activityEvents = [
    'mousedown', 'mousemove', 'keydown',
    'scroll', 'touchstart', 'click', 'wheel'
  ];

  activityEvents.forEach(event => {
    window.removeEventListener(event, resetInactivityTimer);
  });

  // Clear callback
  logoutCallback = null;
};

/**
 * Reset the inactivity timer
 */
const resetInactivityTimer = () => {
  const timeout = getTimeoutByRole(userRole);

  // Clear existing timeouts
  if (inactivityTimeout) {
    window.clearTimeout(inactivityTimeout);
  }

  if (warningTimeout) {
    window.clearTimeout(warningTimeout);
  }

  // Set warning timeout
  warningTimeout = window.setTimeout(() => {
    toast.success('You will be logged out due to inactivity in 30 seconds');
  }, timeout - WARNING_TIME);

  // Set inactivity timeout
  inactivityTimeout = window.setTimeout(() => {
    // Show logout notification
    toast.success('You have been logged out due to inactivity');

    if (logoutCallback) {
      logoutCallback();
    }
  }, timeout);
};

export const useInactivityTimer = (userRole?: string) => {
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get the appropriate timeout based on user role
  const INACTIVITY_TIMEOUT = getTimeoutByRole(userRole);

  const resetTimer = () => {
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    // Set warning timer
    warningTimerRef.current = setTimeout(() => {
      toast.success('You will be logged out due to inactivity in 30 seconds');
    }, INACTIVITY_TIMEOUT - WARNING_TIME);

    // Set logout timer
    timerRef.current = setTimeout(() => {
      // Clear tokens securely
      tokenService.clearTokens();

      // Clear user info
      localStorage.removeItem('user_info');

      // Show logout notification
      toast.success('You have been logged out due to inactivity');

      // Redirect to login page
      navigate('/admin/login');
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Events to track user activity
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown',
      'scroll', 'touchstart', 'click', 'wheel'
    ];

    // Reset timer on user activity
    const handleUserActivity = () => {
      resetTimer();
    };

    // Set initial timer
    resetTimer();

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    // Cleanup
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [navigate]);

  return { resetTimer };
};
