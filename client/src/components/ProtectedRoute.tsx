// client/src/components/ProtectedRoute.tsx
// Bu komponent icazəsiz istifadəçilərin qorunan səhifələrə (xüsusən Admin Panelə)
// daxil olmasının qarşısını alır və onları avtomatik Login səhifəsinə yönləndirir.

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean; // Yalnız Admin üçün qoruma
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // 1. İstifadəçi ümumiyyətlə daxil olmayıbsa -> Giriş səhifəsinə yönləndir
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Əgər səhifə yalnız Admin üçündürsə və istifadəçi admin deyilsə -> Ana səhifəyə yönləndir
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Hər şey qaydasındadırsa, səhifəni göstər
  return <>{children}</>;
};
