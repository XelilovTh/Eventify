import React from 'react';
import { Link } from 'react-router-dom';
import { useGetEventsQuery } from '../api/apiSlice';
import { useFavorites } from '../hooks/useFavorites';
import { Calendar, MapPin, Users, ArrowRight, Heart, ArrowLeft } from 'lucide-react';
import { EventImage } from '../components/EventImage';

export const Favorites: React.FC = () => {
  const { data: events, isLoading } = useGetEventsQuery();
  const { favorites, removeFavorite } = useFavorites();

  const favoriteEvents = events?.filter((ev) => favorites.includes(ev.id)) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-secondary text-sm font-medium">Yüklənir...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-secondary hover:text-primary mb-2 text-xs transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ana səhifə</span>
          </Link>
          <h1 className="text-2xl font-bold text-primary">Seçilmişlər</h1>
          <p className="text-secondary text-xs sm:text-sm mt-0.5">Yadda saxladığınız tədbirlər</p>
        </div>

        <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-borderBeige text-primary rounded-xl">
          {favoriteEvents.length} tədbir
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
                className="bg-white border border-borderBeige rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden bg-cream">
                    <EventImage
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeFavorite(event.id)}
                      className="absolute top-3 right-3 p-2 bg-white/95 rounded-xl text-red-600 hover:bg-white transition"
                      title="Seçilmişlərdən sil"
                    >
                      <Heart className="w-4 h-4 fill-red-600" />
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="text-base font-bold text-primary mb-2 line-clamp-1">{event.title}</h3>
                    <div className="space-y-1 text-xs text-secondary">
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
                  <div className="flex items-center space-x-1.5 text-xs text-secondary">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span>{availableSeats} / {event.capacity} yer</span>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-xl transition shadow-sm"
                  >
                    <span>Ətraflı</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-borderBeige rounded-2xl py-12 px-4 text-center max-w-md mx-auto">
          <Heart className="w-10 h-10 text-secondary/30 mx-auto mb-2" />
          <h3 className="text-base font-bold text-primary">Seçilmiş tədbir yoxdur</h3>
          <p className="text-secondary text-xs mt-1 mb-4">
            Bəyəndiyiniz tədbirləri ürək ikonuna vuraraq bura əlavə edə bilərsiniz.
          </p>
          <Link
            to="/"
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Tədbirlərə bax
          </Link>
        </div>
      )}
    </div>
  );
};
