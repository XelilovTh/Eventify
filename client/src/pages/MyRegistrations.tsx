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
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-secondary text-sm font-medium">Yüklənir...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-secondary hover:text-primary mb-2 text-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ana səhifə</span>
          </Link>
          <h1 className="text-2xl font-bold text-primary">Qeydiyyatlarım</h1>
          <p className="text-secondary text-xs sm:text-sm mt-0.5">Qeydiyyatdan keçdiyiniz tədbirlər</p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-borderBeige text-primary rounded-xl self-start sm:self-auto">
          Cəmi: {myEvents?.length || 0}
        </span>
      </div>

      {myEvents && myEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myEvents.map((ev) => (
            <div
              key={ev.id}
              className="bg-white border border-borderBeige rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="flex items-start space-x-3.5">
                <img
                  src={ev.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80'}
                  alt={ev.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=300&q=80';
                  }}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />

                <div className="space-y-1 flex-1 min-w-0">
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    Qeydiyyat təsdiqlənib
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-primary truncate">{ev.title}</h3>

                  <div className="space-y-0.5 text-xs text-secondary">
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

              <div className="mt-4 pt-3 border-t border-borderBeige/60 flex items-center justify-between">
                <span className="text-[11px] text-secondary/70">
                  {ev.registered_at ? `Tarix: ${ev.registered_at.slice(0, 10)}` : ''}
                </span>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/events/${ev.id}`}
                    className="px-3 py-1.5 bg-cream hover:bg-borderBeige/50 text-primary font-semibold text-xs rounded-xl transition inline-flex items-center space-x-1"
                  >
                    <span>Ətraflı</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={() => setSelectedEventToCancel({ id: ev.id, title: ev.title })}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
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
        <div className="bg-white border border-borderBeige rounded-2xl py-12 px-4 text-center max-w-md mx-auto">
          <Ticket className="w-10 h-10 text-secondary/30 mx-auto mb-2" />
          <h3 className="text-base font-bold text-primary">Qeydiyyatınız yoxdur</h3>
          <p className="text-secondary text-xs mt-1 mb-4">
            Maraqlandığınız tədbirlərə yazıla bilərsiniz.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <span>Tədbirlərə bax</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      <ConfirmModal
        isOpen={selectedEventToCancel !== null}
        title="Qeydiyyatı ləğv et"
        message={`"${selectedEventToCancel?.title}" tədbirinə olan qeydiyyatınızı ləğv etmək istəyirsiniz?`}
        confirmText="Ləğv et"
        cancelText="Geri"
        isDestructive={true}
        onConfirm={confirmCancelReg}
        onClose={() => setSelectedEventToCancel(null)}
      />
    </div>
  );
};
