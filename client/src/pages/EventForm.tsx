// client/src/pages/EventForm.tsx
// Bu fayl Admin üçün həm YENİ tədbir yaratmaq, həm də MÖVCUD tədbiri redaktə etmək üçün qəhvəyi tonlu formadır.

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  useCreateEventMutation, 
  useUpdateEventMutation, 
  useGetEventByIdQuery 
} from '../api/apiSlice';
import { Calendar, MapPin, Users, FileText, ArrowLeft, Save, Clock } from 'lucide-react';

export const EventForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const eventId = Number(id);

  const navigate = useNavigate();

  const { data: existingEvent, isLoading: isLoadingEvent } = useGetEventByIdQuery(eventId, {
    skip: !isEditMode,
  });

  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: 50,
    category: 'Konfranslar',
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
    status: 'Gələcəkdə' as 'Gələcəkdə' | 'Davam edir' | 'Bitib',
    registration_deadline: '',
  });

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (existingEvent) {
      setFormData({
        title: existingEvent.title,
        description: existingEvent.description,
        date: existingEvent.date,
        location: existingEvent.location,
        capacity: existingEvent.capacity,
        category: existingEvent.category || 'Konfranslar',
        image_url: existingEvent.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
        status: (existingEvent.status as any) || 'Gələcəkdə',
        registration_deadline: existingEvent.registration_deadline || '',
      });
    }
  }, [existingEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      if (isEditMode) {
        await updateEvent({ id: eventId, data: formData }).unwrap();
      } else {
        await createEvent(formData).unwrap();
      }
      navigate('/admin');
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Əməliyyat zamanı xəta baş verdi.');
    }
  };

  if (isEditMode && isLoadingEvent) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/admin"
        className="inline-flex items-center space-x-2 text-secondary hover:text-primary mb-6 text-sm font-medium transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Admin Panelə Qayıt</span>
      </Link>

      <div className="bg-white border border-borderBeige rounded-3xl p-8 shadow-xl">
        <h1 className="text-2xl font-extrabold text-primary mb-2">
          {isEditMode ? 'Tədbiri Redaktə Et' : 'Yeni Tədbir Əlavə Et'}
        </h1>
        <p className="text-secondary text-sm mb-8">
          Tədbir haqqında bütün detalları aşağıdakı formaya daxil edin.
        </p>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Tədbirin Başlığı
            </label>
            <div className="relative">
              <FileText className="w-5 h-5 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Məs: Karyera və İnkişaf Forumu"
                className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-11 pr-4 py-3 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition text-sm font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                Kateqoriya
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-cream/40 border border-borderBeige rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-accent text-sm font-medium"
              >
                <option value="Konfranslar">Konfranslar</option>
                <option value="Seminarlar">Seminarlar</option>
                <option value="Festivallar">Festivallar</option>
                <option value="İdman">İdman</option>
                <option value="Digər">Digər</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full bg-cream/40 border border-borderBeige rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-accent text-sm font-medium"
              >
                <option value="Gələcəkdə">● Gələcəkdə</option>
                <option value="Davam edir">● Davam edir</option>
                <option value="Bitib">● Bitib</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Şəkil URL-i (Poster)
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-cream/40 border border-borderBeige rounded-xl px-4 py-3 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                Tarix və Saat
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  placeholder="Məs: 2026-11-20 15:00"
                  className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-11 pr-4 py-3 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
                Son Qeydiyyat Tarixi
              </label>
              <div className="relative">
                <Clock className="w-5 h-5 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.registration_deadline}
                  onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                  placeholder="Məs: 2026-11-19 23:59 (Boşsa tədbir tarixi götürülür)"
                  className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-11 pr-4 py-3 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Tutum (Maksimum Yer)
            </label>
            <div className="relative">
              <Users className="w-5 h-5 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                required
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-11 pr-4 py-3 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Məkan
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Məs: Bakı, Landmark Plaza"
                className="w-full bg-cream/40 border border-borderBeige rounded-xl pl-11 pr-4 py-3 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">
              Ətraflı Təsvir
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tədbir haqqında ətraflı məlumat..."
              className="w-full bg-cream/40 border border-borderBeige rounded-xl p-3.5 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-sm shadow-md shadow-primary/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isEditMode ? 'Dəyişiklikləri Yadda Saxla' : 'Tədbiri Yarat'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
