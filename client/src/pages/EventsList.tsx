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
  Palette,
  Laptop,
  MoreHorizontal,
  Heart
} from 'lucide-react';
import { parseAzerbaijaniDate } from '../utils/dateUtils';
import { useFavorites } from '../hooks/useFavorites';
import type { StatusFilter, DateSortOrder } from '../types';

const CATEGORIES = [
  { id: 'all', label: 'Hamısı', icon: LayoutGrid },
  { id: 'Konfranslar', label: 'Konfranslar', icon: Mic },
  { id: 'Seminarlar', label: 'Seminarlar', icon: GraduationCap },
  { id: 'Festivallar', label: 'Festivallar', icon: Music },
  { id: 'İdman', label: 'İdman', icon: Trophy },
  { id: 'İncəsənət', label: 'İncəsənət', icon: Palette },
  { id: 'Texnologiya', label: 'Texnologiya', icon: Laptop },
  { id: 'Digər', label: 'Digər', icon: MoreHorizontal },
];

export const EventsList: React.FC = () => {
  const { data: events, isLoading, error } = useGetEventsQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Gələcəkdə');
  const [sortByDate, setSortByDate] = useState<DateSortOrder>('asc');

  const { isFavorite, toggleFavorite } = useFavorites();

  const scrollToEvents = (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById('events-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredEvents = useMemo(() => {
    if (!events) return [];

    return events
      .filter((ev) => {
        const matchesCategory =
          selectedCategory === 'all' || ev.category === selectedCategory;

        const query = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !query ||
          ev.title.toLowerCase().includes(query) ||
          ev.location.toLowerCase().includes(query) ||
          ev.description.toLowerCase().includes(query);

        const evStatus = ev.status || 'Gələcəkdə';
        const matchesStatus = statusFilter === 'all' || evStatus === statusFilter;

        return matchesCategory && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = parseAzerbaijaniDate(a.date);
        const timeB = parseAzerbaijaniDate(b.date);
        if (sortByDate === 'asc') {
          return timeA - timeB;
        } else {
          return timeB - timeA;
        }
      });
  }, [events, selectedCategory, searchTerm, statusFilter, sortByDate]);

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
      <div className="relative overflow-hidden rounded-[2.5rem] text-white shadow-xl min-h-[300px] flex items-center bg-[#24130A]">
        <div className="absolute inset-0 pointer-events-none">
          <img
            src="/baku-banner.jpg"
            alt="Bakı"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#24130A]/95 via-[#24130A]/70 to-transparent"></div>
        </div>

        <div className="relative z-10 p-8 sm:p-12 max-w-xl space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Şəhərdəki tədbirləri <br />
            <span className="text-[#C49A6C]">Eventify</span> ilə tapın
          </h1>
          <p className="text-cream/90 text-sm sm:text-base leading-relaxed">
            Konfranslar, seminarlar, festivallar və görüşlər bir yerdə.
          </p>
          <div className="pt-2">
            <button
              onClick={scrollToEvents}
              className="inline-flex items-center space-x-2 px-6 py-3.5 bg-[#C49A6C] hover:bg-[#B58957] text-[#24130A] font-bold rounded-2xl text-xs sm:text-sm shadow-lg transition duration-200 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Tədbirlərə bax</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:flex-1">
          <Search className="w-5 h-5 text-secondary absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tədbir və ya məkan axtar..."
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

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="appearance-none bg-white border border-borderBeige rounded-2xl pl-4 pr-8 py-3 text-xs font-bold text-secondary hover:text-primary focus:outline-none focus:border-accent cursor-pointer shadow-sm"
            >
              <option value="Gələcəkdə">Gələcəkdə</option>
              <option value="Davam edir">Davam edir</option>
              <option value="Bitib">Bitib</option>
              <option value="all">Bütün statuslar</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={sortByDate}
              onChange={(e) => setSortByDate(e.target.value as DateSortOrder)}
              className="appearance-none bg-white border border-borderBeige rounded-2xl pl-9 pr-8 py-3 text-xs font-bold text-secondary hover:text-primary focus:outline-none focus:border-accent cursor-pointer shadow-sm"
            >
              <option value="asc">Tarixə görə (Yaxın)</option>
              <option value="desc">Tarixə görə (Uzaq)</option>
            </select>
            <Calendar className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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

      <div id="events-section" className="pt-4">
        <h2 className="text-2xl font-extrabold text-primary tracking-tight">Tədbirlər</h2>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const registered = event.registered_count || 0;
            const availableSeats = Math.max(0, event.capacity - registered);
            const isFav = isFavorite(event.id);

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
                className="bg-white border border-borderBeige rounded-[2rem] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-cream">
                    <img
                      src={event.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80'}
                      alt={event.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    <div className="absolute top-3 right-3">
                      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap ${statusConfig.bg}`}>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusConfig.dot}`}></span>
                        <span>{status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-bold text-primary group-hover:text-accent transition duration-200 line-clamp-1 mb-3">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5 text-xs text-secondary font-medium mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-accent flex-shrink-0" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-3 border-t border-borderBeige/60 flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-xs text-secondary font-bold">
                    <Users className="w-4 h-4 text-accent" />
                    <span>{availableSeats} / {event.capacity} yer</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleFavorite(event.id);
                      }}
                      className={`p-2.5 rounded-2xl border transition duration-150 ${
                        isFav
                          ? 'bg-red-50 border-red-200 text-red-600'
                          : 'bg-cream/40 border-borderBeige text-secondary hover:text-red-500'
                      }`}
                      title={isFav ? 'Seçilmişlərdən çıxar' : 'Seçilmişlərə əlavə et'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-red-600' : ''}`} />
                    </button>

                    <Link
                      to={`/events/${event.id}`}
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-2xl transition duration-150 shadow-sm"
                    >
                      <span>Ətraflı</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-borderBeige rounded-3xl py-16 px-4 text-center max-w-md mx-auto shadow-sm">
          <Search className="w-12 h-12 text-secondary/30 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-primary">Tədbir tapılmadı</h3>
          <p className="text-secondary text-xs mt-1 mb-5">
            Axtarış sözünü dəyişin və ya başqa kateqoriya seçin.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Bütün tədbirlər
          </button>
        </div>
      )}
    </div>
  );
};
