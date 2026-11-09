// client/src/App.tsx
// Bu fayl tətbiqin əsas marşrutlaşdırma (routing) mərkəzidir.
// Krem fon, tünd qəhvəyi əsas mətn və isti bej vurğuları ilə səhifələri birləşdirir.

import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
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

function App() {
  return (
    <div className="min-h-screen bg-cream text-primary flex flex-col font-sans selection:bg-accent selection:text-white">
      {/* Ümumi Naviqasiya Paneli */}
      <Navbar />

      {/* Səhifə Məzmunu */}
      <main className="flex-grow">
        <Routes>
          {/* Hər kəs üçün açıq səhifələr */}
          <Route path="/" element={<EventsList />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/favorites" element={<Favorites />} />

          {/* Daxil olmuş istifadəçi üçün qorunan Profil və Qeydiyyatlar səhifələri */}
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

          {/* Yalnız Admin üçün qorunan səhifələr (Protected Routes) */}
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

          {/* Naməlum ünvanlar avtomatik ana səhifəyə yönləndirilir */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Sadə Footer */}
      <footer className="border-t border-borderBeige py-6 text-center text-xs text-secondary/80">
        © 2026 Eventify — Tədbir İdarəetmə Sistemi. Bütün hüquqlar qorunur.
      </footer>
    </div>
  );
}

export default App;
