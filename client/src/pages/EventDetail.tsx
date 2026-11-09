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
import { Calendar, MapPin, Users, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

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

  const registeredCount = event.registered_count || 0;
  const isFull = registeredCount >= event.capacity;
  const availableSeats = Math.max(0, event.capacity - registeredCount);
  const isRegistered = regStatus?.isRegistered || false;

  const handleRegister = async () => {
    setNotification(null);
    try {
      const res = await registerForEvent(eventId).unwrap();
      setNotification({ type: 'success', message: res.message });
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.data?.message || 'Xəta baş verdi.' });
    }
  };

  const handleCancel = async () => {
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

      <div className="bg-white border border-borderBeige rounded-3xl p-8 shadow-xl">
        {/* Status və Tutum */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <span
            className={`text-xs font-bold px-3.5 py-1.5 rounded-full ${
              isFull
                ? 'bg-red-100 text-red-700'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {isFull ? 'Bütün yerlər dolub' : `${availableSeats} boş yer qalıb`}
          </span>

          <div className="text-sm text-secondary">
            Ümumi tutum: <span className="text-primary font-bold">{event.capacity} nəfər</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight mb-6">
          {event.title}
        </h1>

        {/* Tarix və Məkan bloku */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-4 bg-cream/60 border border-borderBeige rounded-2xl">
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

          {!isAuthenticated ? (
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
                onClick={handleCancel}
                disabled={isCanceling}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-sm font-semibold transition disabled:opacity-50"
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
              className="w-full sm:w-auto px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-sm shadow-md shadow-primary/20 transition disabled:opacity-50"
            >
              {isRegistering ? 'Yazılır...' : 'Tədbirə Qeydiyyatdan Keç'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
