import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { RootState } from '@/lib/redux/store';

/**
 * Hook to monitor for 401 errors and handle session expiration
 * Shows a toast when session expires and redirects to login
 * Note: Tokens now persist for 30 days and only expire on explicit logout
 */
export function useSessionExpiration() {
  const navigate = useNavigate();
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    // Only handle explicit logout or 401 errors from backend
    // Tokens persist for 30 days, no automatic expiration
    if (!token && !isAuthenticated) {
      const wasAuthenticated = sessionStorage.getItem('wasAuthenticated');
      const wasExplicitLogout = sessionStorage.getItem('explicitLogout');
      
      // Only show expiration message if it wasn't an explicit logout
      if (wasAuthenticated === 'true' && wasExplicitLogout !== 'true') {
        toast.error('Your session has expired. Please login again.', {
          duration: 5000,
        });
        sessionStorage.removeItem('wasAuthenticated');
        navigate('/auth');
      }
      // Clear the explicit logout flag
      sessionStorage.removeItem('explicitLogout');
    } else if (token && isAuthenticated) {
      // Mark that user was authenticated
      sessionStorage.setItem('wasAuthenticated', 'true');
    }
  }, [token, isAuthenticated, navigate]);
}
