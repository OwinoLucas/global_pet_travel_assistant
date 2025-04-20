import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { api } from './api';
import authReducer from './features/auth/authSlice';

// Create a makeStore function
export const makeStore = () => {
  const store = configureStore({
    reducer: {
      // API reducer
      [api.reducerPath]: api.reducer,
      
      // Feature reducers
      auth: authReducer,
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of RTK Query.
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // RTK Query uses Redux Thunk internally
        serializableCheck: {
          // Ignore these action types for serializability checks
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'auth/setCredentials'],
        },
      }).concat(api.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  // Enable refetchOnFocus and refetchOnReconnect behaviors
  setupListeners(store.dispatch);
  
  return store;
};

// For use in server-side code where needed
export const store = makeStore();

// Infer types
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
