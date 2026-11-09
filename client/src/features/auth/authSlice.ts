// client/src/features/auth/authSlice.ts
// Bu fayl daxil olmuş istifadəçinin məlumatlarını (user) və JWT tokenini 
// Redux state-ində və brauzerin localStorage-ində idarə edən slice-dır.

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthState, User } from '../../types';

// Brauzer yenilənəndə məlumatın itməməsi üçün localStorage-dən ilkin vəziyyəti oxuyuruq
const savedToken = localStorage.getItem('eventify_token');
const savedUser = localStorage.getItem('eventify_user');

const initialState: AuthState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Uğurlu login və ya qeydiyyat zamanı işə düşür
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;

      // Brauzerin yaddaşına da yazırıq ki, səhifə yenilənəndə sistemdən atmasın
      localStorage.setItem('eventify_token', action.payload.token);
      localStorage.setItem('eventify_user', JSON.stringify(action.payload.user));
    },

    // Profil yenilənəndə istifadəçi məlumatını yeniləmək
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('eventify_user', JSON.stringify(action.payload));
    },

    // Çıxış (Logout) zamanı həm Redux-dan, həm yaddaşdan təmizləyirik
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      localStorage.removeItem('eventify_token');
      localStorage.removeItem('eventify_user');
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
