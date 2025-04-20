import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types/auth';

// Initialize auth state from localStorage if available
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  // Try to get stored token and refresh token
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const userJson = localStorage.getItem('user');
  let user: User | null = null;

  try {
    if (userJson) {
      user = JSON.parse(userJson);
    }
  } catch (e) {
    console.error('Error parsing stored user data', e);
    localStorage.removeItem('user');
  }

  return {
    user,
    token,
    refreshToken,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
  };
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    // Set credentials after successful login/register
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; refresh: string }>
    ) => {
      const { user, token, refresh } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refresh;
      state.isAuthenticated = true;
      state.error = null;

      // Store tokens and user data for persistence
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refresh);
      localStorage.setItem('user', JSON.stringify(user));
    },

    // Update token (e.g., after refresh)
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },

    // Update user data
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear auth state on logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear stored data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
  },
});

// Export actions
export const {
  setCredentials,
  setToken,
  setUser,
  setLoading,
  setError,
  logout,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

