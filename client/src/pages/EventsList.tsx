// client/src/pages/EventsList.tsx
// Bu fayl göndərilən mockup dizaynına 100% uyğunlaşdırılmış ana səhifədir.
// Kateqoriya filtrləri (Hamısı, Konfranslar, Seminarlar, Festivallar, İdman, Digər),
// şəkilli kartlar və status nişanları ilə tədbirləri təqdim edir.

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGetEventsQuery } from '../api/apiSlice';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ArrowRight, 
  Search, 
  X,
  LayoutGrid,
  Mic,
  GraduationCap,
  Music,
  Trophy,
  MoreHorizontal
} from 'lucide-react';

// Kateqoriya siyahısı və ikonları
const CATEGORIES = [
  { id: 'all', label: 'Hamısı', icon: LayoutGrid },
  { id: 'Konfranslar', label: 'Konfranslar', icon: Mic },
  { id: 'Seminarlar', label: 'Seminarlar', icon: GraduationCap },
  { id: 'Festivallar', label: 'Festivallar', icon: Music },
  { id: 'İdman', label: 'İdman', icon: Trophy },
  { id: 'Digər', label: 'Digər', icon: MoreHorizontal },
];

export const EventsList: React.FC = () => {
  const { data: events, isLoading, error } = useGetEventsQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // useMemo ilə effektiv filtrləmə (Kateqoriya və Axtarış)
  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events.filter((ev) => {
      // 1. Kateqoriya filtri
      const matchesCategory =
        selectedCategory === 'all' || ev.category === selectedCategory;

      // 2. Axtarış mətni (Başlıq və ya Məkanda)
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        ev.title.toLowerCase().includes(query) ||
        ev.location.toLowerCase().includes(query) ||
        ev.description.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [events, selectedCategory, searchTerm]);

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
        <p className="text-xs mt-2 text-secondary">Backend serverin işlədiyindən əmin olun.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. YUXARI AXTARIŞ SƏTRİ (Geniş və zərif) */}
      <div className="relative max-w-3xl">
        <Search className="w-5 h-5 text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tədbir axtarın..."
          className="w-full bg-cream/40 border border-borderBeige rounded-2xl pl-12 pr-10 py-3.5 text-sm text-primary placeholder:text-secondary/60 focus:outline-none focus:border-accent font-medium shadow-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. BAŞLIQ VƏ ŞƏHƏR SİLUETİ (Baku skyline banner) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
        <div>
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Tədbirlər</h1>
          <p className="text-secondary text-sm mt-1">Sizi maraqlandıran tədbirləri kəşf edin</p>
        </div>

        {/* Göstərilən nəticə sayı */}
        <span className="text-xs text-secondary font-semibold bg-white border border-borderBeige px-3.5 py-1.5 rounded-full shadow-sm">
          Göstərilir: <b className="text-primary">{filteredEvents.length}</b> tədbir
        </span>
      </div>

      {/* 3. KATEQORİYA FİLTRLƏRİ (Pills) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-full text-xs font-bold transition duration-150 whitespace-nowrap shadow-sm ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white hover:bg-cream/60 border border-borderBeige text-secondary hover:text-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. TƏDBİR KARTLARI (3 Sütunlu Grid - Mockup ilə eyni) */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const registered = event.registered_count || 0;
            const availableSeats = Math.max(0, event.capacity - registered);

            // Status rəngləri
            const status = event.status || 'Gələcəkdə';
            const statusConfig = {
              'Gələcəkdə': {
                bg: 'bg-white/95 text-emerald-800',
                dot: 'bg-emerald-500',
              },
              'Davam edir': {
                bg: 'bg-white/95 text-amber-800',
                dot: 'bg-amber-500',
              },
              'Bitib': {
                bg: 'bg-white/95 text-slate-700',
                dot: 'bg-slate-400',
              },
            }[status] || {
              bg: 'bg-white/95 text-emerald-800',
              dot: 'bg-emerald-500',
            };

            return (
              <div
                key={event.id}
                className="bg-white border border-borderBeige rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div>
                  {/* Tədbirin Şəkli və Üzərində Status Nişanı */}
                  <div className="relative h-48 w-full overflow-hidden bg-cream">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* Sağ Yuxarı Küncdə Status Nişanı */}
                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md ${statusConfig.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></span>
                        <span>{status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Tədbir Məlumatları */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-primary group-hover:text-accent transition duration-200 line-clamp-1 mb-2.5">
                      {event.title}
                    </h3>

                    {/* Tarix və Məkan (Bölücü xətlə) */}
                    <div className="flex items-center text-xs text-secondary font-medium space-x-2 truncate mb-4">
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-accent" />
                        <span>{event.date}</span>
                      </div>
                      <span className="text-borderBeige font-bold">|</span>
                      <div className="flex items-center space-x-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Alt Sətir: Boş Yer və Düymə */}
                <div className="px-5 pb-5 pt-3 border-t border-borderBeige/60 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-secondary font-semibold">
                    <Users className="w-4 h-4 text-accent" />
                    <span>{availableSeats} yer qalıb</span>
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition duration-150 shadow-sm"
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
          <Search className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary">Bu kateqoriyada tədbir tapılmadı</h3>
          <p className="text-secondary text-xs mt-1 mb-5">
            Zəhmət olmasa başqa kateqoriya seçin və ya axtarış sözünü dəyişin.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
            }}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Bütün Tədbirləri Göstər
          </button>
        </div>
      )}
    </div>
  );
};
