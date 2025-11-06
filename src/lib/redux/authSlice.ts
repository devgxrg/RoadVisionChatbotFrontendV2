import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TokenResponse } from '@/lib/types/auth';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<TokenResponse>) => {
      state.token = action.payload.access_token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    // Logout actions
    logoutSuccess: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },

    // Set token (for persistent state)
    setToken: (state, action: PayloadAction<string | null>) => {
      if (action.payload) {
        state.token = action.payload;
        state.isAuthenticated = true;
      } else {
        state.token = null;
        state.isAuthenticated = false;
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutSuccess,
  setToken,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
