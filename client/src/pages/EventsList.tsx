// client/src/pages/EventsList.tsx
// Bu fayl ana səhifədir və bütün mövcud tədbirləri zərif qəhvəyi/bej/ağ kartlar şəklində nümayiş etdirir.

import React from 'react';
import { Link } from 'react-router-dom';
import { useGetEventsQuery } from '../api/apiSlice';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

export const EventsList: React.FC = () => {
  const { data: events, isLoading, error } = useGetEventsQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700">
        <p className="font-semibold">Tədbirlər yüklənərkən xəta baş verdi.</p>
        <p className="text-xs mt-2 text-secondary">Backend serverin (port 5000) işlədiyindən əmin olun.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Banner / Hero Başlıq */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="px-3.5 py-1.5 bg-accent/20 text-primary text-xs font-bold uppercase tracking-wider rounded-full border border-accent/30">
          Gələcəyin Tədbirləri
        </span>
        <h1 className="text-4xl font-extrabold text-primary tracking-tight mt-4">
          Qarşıdan gələn <span className="text-accent">Tədbirlər</span>
        </h1>
        <p className="text-secondary text-base mt-3">
          Ən maraqlı texnologiya, elm və karyera tədbirlərinə qatılın və yerinizi əvvəlcədən bron edin.
        </p>
      </div>

      {/* Tədbirlər Şəbəkəsi (Grid) */}
      {events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const registered = event.registered_count || 0;
            const isFull = registered >= event.capacity;
            const availableSeats = Math.max(0, event.capacity - registered);

            return (
              <div
                key={event.id}
                className="bg-white border border-borderBeige rounded-2xl p-6 flex flex-col justify-between hover:border-accent hover:shadow-xl transition duration-300 shadow-sm group"
              >
                <div>
                  {/* Status Nişanı (Boş yer sayı və ya Dolub) */}
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isFull
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isFull ? 'Yer qalmayıb' : `${availableSeats} boş yer`}
                    </span>
                    <span className="text-xs text-secondary font-medium">
                      Tutum: {event.capacity} nəfər
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-primary group-hover:text-accent transition duration-200 line-clamp-1 mb-2">
                    {event.title}
                  </h3>

                  <p className="text-secondary text-sm line-clamp-2 mb-6">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-borderBeige">
                  <div className="flex items-center space-x-2.5 text-xs text-primary font-medium">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span>{event.date}</span>
                  </div>

                  <div className="flex items-center space-x-2.5 text-xs text-primary font-medium">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="truncate">{event.location}</span>
                  </div>

                  <div className="flex items-center space-x-2.5 text-xs text-secondary">
                    <Users className="w-4 h-4 text-accent" />
                    <span>{registered} nəfər qeydiyyatdan keçib</span>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="w-full mt-2 inline-flex items-center justify-center space-x-2 py-3 px-4 bg-cream hover:bg-primary hover:text-white text-primary font-semibold text-sm rounded-xl border border-borderBeige transition duration-200 shadow-sm"
                  >
                    <span>Ətraflı Bax</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-secondary">
          Hazırda heç bir aktiv tədbir tapılmadı.
        </div>
      )}
    </div>
  );
};
