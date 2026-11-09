// client/src/pages/EventDetail.tsx
// Bu fayl seçilmiş tədbirin tam təsvirini və qeydiyyat funksionallığını təmin edir.

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  useGetEventByIdQuery, 
  useCheckIsRegisteredQuery, 
  useRegisterForEventMutation, 
  useCancelRegistrationMutation 
} from '../api/apiSlice';
import { useAppSelector } from '../app/hooks';
import { Calendar, MapPin, Users, CheckCircle, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import { ConfirmModal } from '../components/ConfirmModal';
import { isDatePassed } from '../utils/dateUtils';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const eventId = Number(id);

  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // RTK Query sorğuları
  const { data: event, isLoading, error } = useGetEventByIdQuery(eventId);
  const { data: regStatus } = useCheckIsRegisteredQuery(eventId, {
    skip: !isAuthenticated,
  });

  const [registerForEvent, { isLoading: isRegistering }] = useRegisterForEventMutation();
  const [cancelRegistration, { isLoading: isCanceling }] = useCancelRegistrationMutation();

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700">
        <p className="font-semibold">Tədbir tapılmadı.</p>
        <Link to="/" className="inline-block mt-4 text-accent hover:underline text-sm font-medium">
          Bütün tədbirlərə qayıt
        </Link>
      </div>
    );
  }

  const registeredCount = event ? (event.registered_count || 0) : 0;
  const statusLower = (event?.status || '').trim().toLowerCase();
  const isEnded = statusLower === 'bitib';
  const isOngoing = statusLower === 'davam edir';

  // Son qeydiyyat tarixi (deadline) qeydiyyat üçün tək həqiqət mənbəyidir
  const deadlineStr = event?.registration_deadline || event?.date || '';
  const isDeadlinePassed = isDatePassed(deadlineStr);

  // Qeydiyyatın bağlı olma vəziyyəti: Yalnız tədbir bitibsə və ya son qeydiyyat tarixi keçibsə bloklanır
  const isRegistrationClosed = isEnded || isDeadlinePassed;

  const isFull = event ? (registeredCount >= event.capacity) : false;
  const availableSeats = event ? Math.max(0, event.capacity - registeredCount) : 0;
  const isRegistered = regStatus?.isRegistered || false;

  const handleRegister = async () => {
    if (isRegistrationClosed) return;
    setNotification(null);
    try {
      const res = await registerForEvent(eventId).unwrap();
      setNotification({ type: 'success', message: res.message });
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.data?.message || 'Xəta baş verdi.' });
    }
  };

  const handleConfirmCancel = async () => {
    setNotification(null);
    try {
      const res = await cancelRegistration(eventId).unwrap();
      setNotification({ type: 'success', message: res.message });
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.data?.message || 'Xəta baş verdi.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Geri qayıtmaq linki */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-secondary hover:text-primary mb-6 text-sm font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Bütün Tədbirlər</span>
      </Link>

      <div className="bg-white border border-borderBeige rounded-3xl overflow-hidden shadow-xl">
        {/* Böyük Tədbir Posteri */}
        {event.image_url && (
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-cream">
            <img
              src={event.image_url}
              alt={event.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80';
              }}
              className="w-full h-full object-cover"
            />
            {event.status && (
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 text-primary shadow-md whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                  <span>{event.status}</span>
                </span>
              </div>
            )}
            {event.category && (
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary text-white shadow-md">
                  {event.category}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="p-8">
          {/* Status və Tutum */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <span
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${
              isEnded
                ? 'bg-slate-200 text-slate-700'
                : isOngoing
                ? 'bg-amber-100 text-amber-800'
                : isDeadlinePassed
                ? 'bg-rose-100 text-rose-800'
                : isFull
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {isEnded
              ? 'Tədbir artıq başa çatıb'
              : isOngoing
              ? 'Tədbir hazırda davam edir'
              : isDeadlinePassed
              ? 'Son qeydiyyat tarixi bitib'
              : isFull
              ? 'Bütün yerlər dolub'
              : `${availableSeats} boş yer qalıb`}
          </span>

          <div className="text-sm text-secondary">
            Ümumi tutum: <span className="text-primary font-bold">{event.capacity} nəfər</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight mb-6">
          {event.title}
        </h1>

        {/* Tarix, Son Qeydiyyat və Məkan bloku */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 p-4 bg-cream/60 border border-borderBeige rounded-2xl">
          <div className="flex items-center space-x-3 text-primary">
            <div className="p-2.5 bg-accent/20 text-primary rounded-xl">
              <Calendar className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-secondary uppercase font-semibold">Tarix və Saat</p>
              <p className="text-sm font-bold">{event.date}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-primary">
            <div className="p-2.5 bg-accent/20 text-primary rounded-xl">
              <Clock className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-secondary uppercase font-semibold">Son Qeydiyyat</p>
              <p className={`text-sm font-bold ${isDeadlinePassed ? 'text-red-600' : 'text-primary'}`}>
                {event.registration_deadline || event.date}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-primary">
            <div className="p-2.5 bg-accent/20 text-primary rounded-xl">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-secondary uppercase font-semibold">Məkan</p>
              <p className="text-sm font-bold truncate">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Tədbir haqqında */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-primary mb-3">Tədbir Haqqında</h2>
          <p className="text-secondary leading-relaxed whitespace-pre-line text-sm sm:text-base">
            {event.description}
          </p>
        </div>

        {/* Bildiriş mesajı */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${
              notification.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Qeydiyyat Düymələri */}
        <div className="pt-6 border-t border-borderBeige flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm text-secondary">
            <Users className="w-4 h-4 text-accent" />
            <span>Hazırda <b className="text-primary">{registeredCount}</b> nəfər qeydiyyatdan keçib</span>
          </div>

          {isEnded ? (
            <div className="flex items-center space-x-2">
              {isRegistered && (
                <span className="inline-flex items-center space-x-1.5 text-slate-600 text-xs font-bold mr-2">
                  <CheckCircle className="w-4 h-4 text-slate-500" />
                  <span>Bu tədbirdə iştirak etmisiniz</span>
                </span>
              )}
              <button
                disabled
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-200 text-slate-500 font-bold rounded-2xl text-xs cursor-not-allowed shadow-inner"
              >
                Tədbir artıq başa çatıb (Qeydiyyat bağlıdır)
              </button>
            </div>
          ) : isDeadlinePassed ? (
            <div className="flex items-center space-x-2">
              {isRegistered && (
                <span className="inline-flex items-center space-x-1.5 text-rose-700 text-xs font-bold mr-2">
                  <CheckCircle className="w-4 h-4 text-rose-600" />
                  <span>Qeydiyyatınız mövcuddur</span>
                </span>
              )}
              <button
                disabled
                className="w-full sm:w-auto px-6 py-3.5 bg-rose-100 text-rose-800 font-bold rounded-2xl text-xs cursor-not-allowed shadow-inner"
              >
                Son qeydiyyat tarixi bitib (Qeydiyyat bağlıdır)
              </button>
            </div>
          ) : !isAuthenticated ? (
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-center text-sm shadow-md shadow-primary/20 transition"
            >
              Qeydiyyat üçün Daxil Olun
            </Link>
          ) : isRegistered ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <span className="inline-flex items-center space-x-1.5 text-emerald-700 text-sm font-bold">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Qeydiyyatdan keçmisiniz</span>
              </span>
              <button
                onClick={() => setIsCancelModalOpen(true)}
                disabled={isCanceling}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
              >
                {isCanceling ? 'Ləğv edilir...' : 'Qeydiyyatı Ləğv Et'}
              </button>
            </div>
          ) : isFull ? (
            <button
              disabled
              className="w-full sm:w-auto px-6 py-3.5 bg-gray-200 text-gray-500 font-semibold rounded-xl text-sm cursor-not-allowed"
            >
              Yer qalmayıb
            </button>
          ) : (
            <button
              onClick={handleRegister}
              disabled={isRegistering}
              className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-sm shadow-md shadow-primary/20 transition disabled:opacity-50 cursor-pointer"
            >
              {isRegistering ? 'Yazılır...' : 'Tədbirə Qeydiyyatdan Keç'}
            </button>
          )}
        </div>
        </div>
      </div>

      {/* Xüsusi Təsdiq Modalı */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        title="Qeydiyyatı Ləğv Et"
        message={`"${event.title}" tədbirindən qeydiyyatınızı ləğv etmək istədiyinizdən əminsiniz?`}
        confirmText="Bəli, ləğv et"
        cancelText="Geri"
        isDestructive={true}
        onConfirm={handleConfirmCancel}
        onClose={() => setIsCancelModalOpen(false)}
      />
    </div>
  );
};
