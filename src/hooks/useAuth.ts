import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutSuccess,
  setToken,
  clearError,
} from '@/lib/redux/authSlice';
import { login, register } from '@/lib/api/auth';
import { RegisterRequest, TokenResponse } from '@/lib/types/auth';

/**
 * Custom hook for authentication
 * Provides access to auth state and actions
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const handleLogin = async (email: string, password: string) => {
    dispatch(loginStart());
    try {
      const response: TokenResponse = await login(email, password);
      dispatch(loginSuccess(response));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch(loginFailure(errorMessage));
      throw error;
    }
  };

  const handleRegister = async (userData: RegisterRequest) => {
    dispatch(loginStart());
    try {
      // Register user
      await register(userData);

      // Auto-login after registration
      const loginResponse: TokenResponse = await login(userData.email, userData.password);
      dispatch(loginSuccess(loginResponse));
      return loginResponse;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch(loginFailure(errorMessage));
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logoutSuccess());
  };

  const handleSetToken = (token: string | null) => {
    dispatch(setToken(token));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    // State
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,

    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    setToken: handleSetToken,
    clearError: handleClearError,
  };
};
