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
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}
