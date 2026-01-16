/**
 * Authentication API calls for Ceigall AI Platform
 */

import { API_BASE_URL } from '@/lib/config/api';
import { LoginRequest, RegisterRequest, TokenResponse, User } from '@/lib/types/auth';

/**
 * Login user and get access token
 */
export async function login(email: string, password: string): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Login failed' }));
    throw new Error(error.detail || 'Login failed');
  }

  return response.json();
}

/**
 * Register a new user
 */
export async function register(userData: RegisterRequest): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(error.detail || 'Registration failed');
  }

  return response.json();
}

/**
 * Get current user profile using token
 * Note: This endpoint doesn't exist in the OpenAPI spec yet
 * We'll need to add it to the backend
 */
export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

/**
 * Store token in localStorage
 * Uses 'token' key to match other API modules (analyze.ts, tenderiq.ts, dms.ts, etc.)
 */
export function storeToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * Get token from localStorage
 * Uses 'token' key to match other API modules (analyze.ts, tenderiq.ts, dms.ts, etc.)
 */
export function getToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Remove token from localStorage
 * Uses 'token' key to match other API modules (analyze.ts, tenderiq.ts, dms.ts, etc.)
 */
export function removeToken(): void {
  localStorage.removeItem('token');
}

/**
 * Logout user and invalidate token on backend
 */
export async function logout(token: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Logout API call failed:', error);
    // Continue with local logout even if API call fails
  }
  
  // Mark this as an explicit logout
  sessionStorage.setItem('explicitLogout', 'true');
  removeToken();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Get user preferences
 */
export async function getUserPreferences(): Promise<{ auto_analyze_on_wishlist: boolean }> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/auth/preferences`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user preferences');
  }

  return response.json();
}

/**
 * Update auto-analyze on wishlist preference
 */
export async function updateAutoAnalyzePreference(enabled: boolean): Promise<{ auto_analyze_on_wishlist: boolean; message: string }> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/auth/preferences/auto-analyze?enabled=${enabled}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to update preferences');
  }

  return response.json();
}
