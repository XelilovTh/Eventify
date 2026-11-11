import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginMutation } from '../api/apiSlice';
import { useAppDispatch } from '../app/hooks';
import { setCredentials } from '../features/auth/authSlice';
import { Mail, Lock, AlertCircle, LogIn } from 'lucide-react';
import { AZ_VALIDATION_MESSAGES, azValidationProps, emailMessage } from '../utils/validation';

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
      setErrorMessage(err?.data?.message || 'Giriş zamanı xəta baş verdi.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-borderBeige rounded-2xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-cream text-accent rounded-xl mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-primary">Daxil ol</h2>
          <p className="text-secondary text-xs sm:text-sm mt-1">Hesabınıza daxil olun</p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2.5 text-red-700 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-primary mb-1.5">
              E-poçt
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@domain.com"
                {...azValidationProps(emailMessage)}
                className="w-full bg-cream/30 border border-borderBeige rounded-xl pl-10 pr-4 py-2.5 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-primary mb-1.5">
              Şifrə
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                {...azValidationProps(AZ_VALIDATION_MESSAGES.required)}
                className="w-full bg-cream/30 border border-borderBeige rounded-xl pl-10 pr-4 py-2.5 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition duration-150 shadow-sm disabled:opacity-50 text-sm"
          >
            {isLoading ? 'Yoxlanılır...' : 'Daxil ol'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs sm:text-sm text-secondary">
          Hesabınız yoxdur?{' '}
          <Link to="/register" className="text-accent hover:underline font-semibold">
            Qeydiyyat
          </Link>
        </p>
      </div>
    </div>
  );
};
