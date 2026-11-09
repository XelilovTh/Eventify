// client/src/pages/Login.tsx
// Bu fayl istifadəçilərin və Adminin sistemə daxil olması üçün qəhvəyi tonlu zərif giriş formasıdır.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../api/apiSlice';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));

      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Giriş zamanı xəta baş verdi. Məlumatları yoxlayın.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-borderBeige rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-accent/20 text-primary rounded-2xl mb-3 shadow-sm">
            <LogIn className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Xoş gəlmisiniz</h2>
          <p className="text-secondary text-sm mt-1">Hesabınıza daxil olun</p>
        </div>

        {/* Xəta bildirişi */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              E-poçt Ünvanı
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nümunə@mail.com"
                className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-11 pr-4 py-3 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Şifrə
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-11 pr-4 py-3 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition text-sm font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition duration-200 shadow-md shadow-primary/25 disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Daxil olunur...' : 'Daxil ol'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-secondary">
          Hesabınız yoxdur?{' '}
          <Link to="/register" className="text-accent hover:text-accent-hover font-bold">
            Qeydiyyatdan keçin
          </Link>
        </p>
      </div>
    </div>
  );
};
