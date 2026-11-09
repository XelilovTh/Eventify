// client/src/pages/Favorites.tsx
// Bu fayl istifadəçinin bəyəndiyi (ürək ikonuna kliklədiyi) seçilmiş tədbirləri göstərir.

import React from 'react';
import { Link } from 'react-router-dom';
import { useGetEventsQuery } from '../api/apiSlice';
import { useFavorites } from '../hooks/useFavorites';
import { Calendar, MapPin, Users, ArrowRight, Heart, ArrowLeft } from 'lucide-react';

export const Favorites: React.FC = () => {
  const { data: events, isLoading } = useGetEventsQuery();
  const { favorites, removeFavorite } = useFavorites();

  const favoriteEvents = events?.filter((ev) => favorites.includes(ev.id)) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-secondary hover:text-primary mb-3 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Bütün Tədbirlər</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Seçilmiş Tədbirlər</h1>
          <p className="text-secondary text-sm mt-1">Bəyəndiyiniz və yadda saxladığınız tədbirlər</p>
        </div>

        <span className="text-xs font-bold px-4 py-2 bg-white border border-borderBeige text-primary rounded-full shadow-sm">
          {favoriteEvents.length} Tədbir
        </span>
      </div>

      {favoriteEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteEvents.map((event) => {
            const registered = event.registered_count || 0;
            const availableSeats = Math.max(0, event.capacity - registered);

            return (
              <div
                key={event.id}
                className="bg-white border border-borderBeige rounded-[2rem] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-cream">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80'}
                      alt={event.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80';
                      }}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFavorite(event.id)}
                      className="absolute top-3 right-3 p-2.5 bg-white/95 rounded-2xl text-red-600 shadow-md hover:bg-white transition"
                      title="Seçilmişlərdən sil"
                    >
                      <Heart className="w-4 h-4 fill-red-600" />
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-primary mb-2 line-clamp-1">{event.title}</h3>
                    <div className="space-y-1 text-xs text-secondary font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-accent" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-borderBeige/60 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-secondary font-bold">
                    <Users className="w-4 h-4 text-accent" />
                    <span>{availableSeats} / {event.capacity} yer</span>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    <span>Ətraflı bax</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-borderBeige rounded-3xl py-16 px-4 text-center max-w-md mx-auto shadow-sm">
          <Heart className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary">Seçilmiş tədbiriniz yoxdur</h3>
          <p className="text-secondary text-xs mt-1 mb-5">
            Tədbir kartlarındakı ürək işarəsinə klikləyərək bəyəndiyiniz tədbirləri bura əlavə edə bilərsiniz.
          </p>
          <Link
            to="/"
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Tədbirlərə Bax
          </Link>
        </div>
      )}
    </div>
  );
};
