// client/src/pages/EventsList.tsx
// Bu fayl ana səhifədir: Real vaxt axtarışı (Search), boş yer filtri və çeşidləmə (Sort) funksionallıqları ilə
// bütün tədbirləri zərif qəhvəyi/krem tonlu kartlar şəklində nümayiş etdirir.

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetEventsQuery } from '../api/apiSlice';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowRight, 
  Search, 
  SlidersHorizontal, 
  X,
  RotateCcw
} from 'lucide-react';

export const EventsList: React.FC = () => {
  const { data: events, isLoading, error } = useGetEventsQuery();

  // Filtr və Axtarış State-ləri
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'full'>('all');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'capacity-desc'>('date-asc');

  // useMemo: Yalnız axtarış və ya filtr dəyişəndə yenidən hesablanır (Yüksək Performans!)
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events
      // 1. Mətn axtarışı (Başlıq, Məkan və ya Təsvirdə)
      .filter((ev) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        return (
          ev.title.toLowerCase().includes(query) ||
          ev.location.toLowerCase().includes(query) ||
          ev.description.toLowerCase().includes(query)
        );
      })
      // 2. Status filtri (Hamısı, Yalnız boş yer olanlar, Dolanlar)
      .filter((ev) => {
        const registered = ev.registered_count || 0;
        const isFull = registered >= ev.capacity;

        if (statusFilter === 'available') return !isFull;
        if (statusFilter === 'full') return isFull;
        return true;
      })
      // 3. Çeşidləmə (Tarix və ya Tutuma görə)
      .sort((a, b) => {
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortBy === 'capacity-desc') {
          return b.capacity - a.capacity;
        }
        return 0;
      });
  }, [events, searchTerm, statusFilter, sortBy]);

  // Bütün filtrləri sıfırlamaq funksiyası
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date-asc');
  };

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
      <div className="text-center max-w-2xl mx-auto mb-10">
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

      {/* AXTARIŞ VƏ FİLTR PANORAMASI */}
      <div className="bg-white border border-borderBeige rounded-3xl p-5 mb-10 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Mətn Axtarış Xanası */}
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tədbir adı, məkan və ya açar söz axtar..."
              className="w-full bg-cream/40 border border-borderBeige rounded-2xl pl-11 pr-10 py-3 text-sm text-primary placeholder:text-secondary/60 focus:outline-none focus:border-accent font-medium"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Tabları (Filtr) */}
          <div className="flex items-center space-x-1.5 bg-cream/60 border border-borderBeige p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Hamısı ({events?.length || 0})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'available'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Yalnız Boş Yeri Olanlar
            </button>
            <button
              onClick={() => setStatusFilter('full')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === 'full'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              Dolan Tədbirlər
            </button>
          </div>

          {/* Çeşidləmə Seçimi (Sort By) */}
          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <SlidersHorizontal className="w-4 h-4 text-secondary flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-cream/40 border border-borderBeige rounded-xl px-3 py-2 text-xs font-semibold text-primary focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="date-asc">Tarix: Ən yaxın birinci</option>
              <option value="date-desc">Tarix: Ən uzaq birinci</option>
              <option value="capacity-desc">Tutum: Ən böyük zal</option>
            </select>
          </div>
        </div>

        {/* Nəticə sayı və sıfırlama düyməsi */}
        <div className="flex items-center justify-between pt-2 border-t border-borderBeige/60 text-xs text-secondary font-medium">
          <span>
            Göstərilir: <b className="text-primary">{filteredEvents.length}</b> tədbir
            {searchTerm && ` ("${searchTerm}" axtarışı üzrə)`}
          </span>

          {(searchTerm || statusFilter !== 'all' || sortBy !== 'date-asc') && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center space-x-1 text-accent hover:text-accent-hover font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Filtri sıfırla</span>
            </button>
          )}
        </div>
      </div>

      {/* Tədbirlər Şəbəkəsi (Grid) */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
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
        <div className="bg-white border border-borderBeige rounded-3xl py-16 px-4 text-center max-w-md mx-auto shadow-sm">
          <Search className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary">Axtarışa uyğun tədbir tapılmadı</h3>
          <p className="text-secondary text-xs mt-1 mb-5">
            Daxil etdiyiniz parametrlərə uyğun heç bir nəticə mövcud deyil.
          </p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Filtrləri Sıfırla</span>
          </button>
        </div>
      )}
    </div>
  );
};
