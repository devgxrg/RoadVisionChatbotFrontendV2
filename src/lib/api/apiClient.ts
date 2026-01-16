/**
 * Centralized API Client with automatic 401 handling
 * Wraps fetch requests to handle unauthorized responses uniformly
 */

import { store } from '@/lib/redux/store';
import { logoutSuccess } from '@/lib/redux/authSlice';
import { toast } from 'sonner';
import { getTokenFromRedux } from '@/lib/api/authHelper';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public response?: Response
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Makes an authenticated API request with automatic 401 handling
 * @param url - The endpoint URL
 * @param options - Fetch options
 * @returns The response JSON
 * @throws APIError on non-ok responses
 */
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getTokenFromRedux();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Dispatch logout action to clear auth state
      store.dispatch(logoutSuccess());

      // Show error toast
      toast.error('Your session has expired. Please login again.', {
        duration: 5000,
      });

      // Throw error for caller to handle if needed
      throw new APIError(
        401,
        'Unauthorized - session expired',
        response
      );
    }

    // Handle other error responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        response.status,
        `API Error: ${response.status} ${errorText}`,
        response
      );
    }

    return response.json() as Promise<T>;
  } catch (error) {
    // Re-throw APIError instances
    if (error instanceof APIError) {
      throw error;
    }

    // Wrap other errors
    if (error instanceof Error) {
      throw new APIError(0, error.message);
    }

    throw new APIError(0, 'Unknown error occurred');
  }
}

/**
 * Makes an API request that may return empty responses (like DELETE)
 */
export async function apiRequestWithoutBody(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getTokenFromRedux();

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Dispatch logout action to clear auth state
      store.dispatch(logoutSuccess());

      // Show error toast
      toast.error('Your session has expired. Please login again.', {
        duration: 5000,
      });

      throw new APIError(
        401,
        'Unauthorized - session expired',
        response
      );
    }

    // Handle other error responses
    if (!response.ok) {
      const errorText = await response.text();
      throw new APIError(
        response.status,
        `API Error: ${response.status} ${errorText}`,
        response
      );
    }

    return response;
  } catch (error) {
    // Re-throw APIError instances
    if (error instanceof APIError) {
      throw error;
    }

    // Wrap other errors
    if (error instanceof Error) {
      throw new APIError(0, error.message);
    }

    throw new APIError(0, 'Unknown error occurred');
  }
}

