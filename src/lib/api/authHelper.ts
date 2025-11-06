/**
 * Authentication Helper
 * Provides a way for API modules to get the current token from Redux
 * This is a workaround for getting Redux state in non-component code
 */

import { store } from '@/lib/redux/store';

/**
 * Get the current auth token from Redux store
 * This is used by API modules to retrieve the token for requests
 */
export function getTokenFromRedux(): string | null {
  const state = store.getState();
  return state.auth.token;
}

/**
 * Get authorization headers with token from Redux
 */
export function getAuthHeaders(): { Authorization: string; 'Content-Type': string } {
  const token = getTokenFromRedux();
  return {
    'Authorization': `Bearer ${token || ''}`,
    'Content-Type': 'application/json',
  };
}
