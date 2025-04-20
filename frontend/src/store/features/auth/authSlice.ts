import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthTokens, AuthState } from '@/types/auth';
import { storeTokens, storeUser, clearAuthData, getStoredTokens, getStoredUser } from '@/lib/auth';

// Initialize state with values from storage (for persistence)
const initialState: AuthState = {
  user: getStoredUser(),
  tokens: getStoredTokens(),
  isAuthenticated: Boolean(getStoredTokens()?.access),
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set authentication state after successful login/register
    setAuth: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
      const { user, tokens } = action.payload;
      
      // Update state
      state.user = user;
      state.tokens = tokens;
      state.isAuthenticated = true;
      state.error = null;
      
      // Store in localStorage for persistence
      storeTokens(tokens);
      storeUser(user);
    },
    
    // Update auth tokens (e.g., after token refresh)
    setTokens: (state, action: PayloadAction<AuthTokens>) => {
      state.tokens = action.payload;
      
      // Store updated tokens
      storeTokens(action.payload);
    },
    
    // Update user profile data
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      
      // Store updated user data
      storeUser(action.payload);
    },
    
    // Start loading state (e.g., during login request)
    startLoading: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    // Authentication failure handling
    authError: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Logout action
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear persisted auth data
      clearAuthData();
    },
    
    // Clear any error messages
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Export actions
export const {
  setAuth,
  setTokens,
  setUser,
  startLoading,
  authError,
  logout,
  clearError,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;

