// client/src/app/store.ts
// Bu fayl tətbiqin mərkəzi Redux Store-unu konfiqurasiya edir.
// Auth reducer-i və RTK Query api reducer-ini burada birləşdiririk.

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { apiSlice } from '../api/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  // RTK Query keşləmə və sorğu idarəsi üçün middleware əlavə edirik
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// TypeScript üçün Store tipləri (Təqdimatda vacib sual!)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
