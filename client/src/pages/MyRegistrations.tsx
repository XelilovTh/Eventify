// client/src/pages/MyRegistrations.tsx
// Bu fayl istifadəçinin qeydiyyatdan keçdiyi bütün tədbirləri göstərən müstəqil səhifədir.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  useGetMyRegistrationsQuery, 
  useCancelRegistrationMutation 
} from '../api/apiSlice';
import { ConfirmModal } from '../components/ConfirmModal';
import { 
  Calendar, 
  MapPin, 
  Trash2, 
  ArrowRight, 
  Ticket,
  ArrowLeft 
} from 'lucide-react';

export const MyRegistrations: React.FC = () => {
  const { data: myEvents, isLoading } = useGetMyRegistrationsQuery();
  const [cancelRegistration] = useCancelRegistrationMutation();

  const [selectedEventToCancel, setSelectedEventToCancel] = useState<{ id: number; title: string } | null>(null);

  const confirmCancelReg = async () => {
    if (!selectedEventToCancel) return;
    try {
      await cancelRegistration(selectedEventToCancel.id).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Başlıq */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-secondary hover:text-primary mb-3 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ana səhifəyə qayıt</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Mənim Qeydiyyatlarım</h1>
          <p className="text-secondary text-sm mt-1">İştirak edəcəyiniz aktiv tədbirlərin siyahısı</p>
        </div>

        <span className="text-xs font-bold px-4 py-2 bg-white border border-borderBeige text-primary rounded-full shadow-sm self-start sm:self-auto">
          Cəmi: {myEvents?.length || 0} Tədbir
        </span>
      </div>

      {/* Tədbirlərin Siyahısı */}
      {myEvents && myEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white border border-borderBeige rounded-[2rem] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80'}
                  alt={ev.title}
                  className="w-24 h-24 rounded-2xl object-cover flex-shrink-0"
                />

                <div className="space-y-1.5 flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                    ✓ Qeydiyyat təsdiqlənib
                  </span>
                  <h3 className="text-base font-bold text-primary truncate">{ev.title}</h3>

                  <div className="space-y-1 text-xs text-secondary font-medium">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span>{ev.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alt düymələr */}
              <div className="mt-5 pt-4 border-t border-borderBeige/60 flex items-center justify-between">
                <span className="text-[11px] text-secondary/70">
                  Qeydiyyat: {ev.registered_at}
                </span>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/events/${ev.id}`}
                    className="px-4 py-2 bg-cream hover:bg-borderBeige/50 text-primary font-bold text-xs rounded-xl transition inline-flex items-center space-x-1"
                  >
                    <span>Detallar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => setSelectedEventToCancel({ id: ev.id, title: ev.title })}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition cursor-pointer"
                    title="Qeydiyyatı ləğv et"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-borderBeige rounded-[2.5rem] py-16 px-4 text-center max-w-md mx-auto shadow-sm">
          <Ticket className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary">Hələ heç bir tədbirə yazılmamısınız</h3>
          <p className="text-secondary text-xs mt-1 mb-6">
            Maraqlı tədbirləri kəşf edin və yerinizi indidən təmin edin.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-2xl shadow-sm transition"
          >
            <span>Tədbirlərə Bax</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Xüsusi Təsdiq Modalı */}
      <ConfirmModal
        isOpen={selectedEventToCancel !== null}
        title="Qeydiyyatı Ləğv Et"
        message={`"${selectedEventToCancel?.title}" tədbirindən qeydiyyatınızı ləğv etmək istədiyinizdən əminsiniz?`}
        confirmText="Bəli, ləğv et"
        cancelText="Geri"
        isDestructive={true}
        onConfirm={confirmCancelReg}
        onClose={() => setSelectedEventToCancel(null)}
      />
    </div>
  );
};
