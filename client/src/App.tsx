import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './app/hooks';
import { useGetMeQuery } from './api/apiSlice';
import { logout, updateUser } from './features/auth/authSlice';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute';
import { EventsList } from './pages/EventsList';
import { EventDetail } from './pages/EventDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { EventForm } from './pages/EventForm';
import { Profile } from './pages/Profile';
import { Favorites } from './pages/Favorites';
import { MyRegistrations } from './pages/MyRegistrations';

function AuthVerifier() {
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();
  const { data, error } = useGetMeQuery(undefined, {
    skip: !token,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (data?.user) {
      dispatch(updateUser(data.user));
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (error) {
      dispatch(logout());
    }
  }, [error, dispatch]);

  return null;
}

function App() {
  return (
    <div className="min-h-screen bg-cream text-primary flex flex-col font-sans selection:bg-accent selection:text-white">
      <AuthVerifier />
      <ScrollToTop />
      <Navbar />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/favorites" element={<Favorites />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-registrations"
            element={
              <ProtectedRoute>
                <MyRegistrations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <ProtectedRoute adminOnly>
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/edit/:id"
            element={
              <ProtectedRoute adminOnly>
                <EventForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <ProtectedRoute adminOnly>
                <EventForm />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
