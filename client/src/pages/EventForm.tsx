import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  useCreateEventMutation, 
  useUpdateEventMutation, 
  useGetEventByIdQuery 
} from '../api/apiSlice';
import { Calendar, MapPin, Users, FileText, ArrowLeft, Save, Clock } from 'lucide-react';
import { EVENT_CATEGORIES } from '../types';
import type { EventStatus } from '../types';
import { formatToAzerbaijaniDate, toDateTimeLocalValue } from '../utils/dateUtils';

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
    image_url: '',
    status: 'Gələcəkdə' as EventStatus,
    registration_deadline: '',
  });

  const [dateLocal, setDateLocal] = useState('');
  const [deadlineLocal, setDeadlineLocal] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loadedEventId, setLoadedEventId] = useState<number | null>(null);

  if (existingEvent && loadedEventId !== existingEvent.id) {
    setLoadedEventId(existingEvent.id);
    setFormData({
      title: existingEvent.title,
      description: existingEvent.description,
      date: existingEvent.date,
      location: existingEvent.location,
      capacity: existingEvent.capacity,
      category: existingEvent.category || 'Konfranslar',
      image_url: existingEvent.image_url || '',
      status: existingEvent.status || 'Gələcəkdə',
      registration_deadline: existingEvent.registration_deadline || '',
    });
    setDateLocal(toDateTimeLocalValue(existingEvent.date));
    setDeadlineLocal(toDateTimeLocalValue(existingEvent.registration_deadline));
  }

  const handleDateChange = (val: string) => {
    setDateLocal(val);
    const formatted = formatToAzerbaijaniDate(val);
    setFormData((prev) => ({ ...prev, date: formatted }));
  };

  const handleDeadlineChange = (val: string) => {
    setDeadlineLocal(val);
    const formatted = val ? formatToAzerbaijaniDate(val) : '';
    setFormData((prev) => ({ ...prev, registration_deadline: formatted }));
  };

  const setQuickDeadline = (hoursBefore: number) => {
    if (!dateLocal) return;
    const d = new Date(dateLocal);
    d.setHours(d.getHours() - hoursBefore);
    const pad = (n: number) => String(n).padStart(2, '0');
    const val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    handleDeadlineChange(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.capacity <= 0) {
      setErrorMessage('Tutum ən azı 1 olmalıdır.');
      return;
    }

    if (!formData.date) {
      setErrorMessage('Tədbirin tarix və saatını seçin.');
      return;
    }

    if (dateLocal && deadlineLocal && deadlineLocal > dateLocal) {
      setErrorMessage('Son qeydiyyat tarixi tədbir tarixindən sonraya təyin edilə bilməz.');
      return;
    }

    try {
      if (isEditMode) {
        await updateEvent({ id: eventId, data: formData }).unwrap();
      } else {
        await createEvent(formData).unwrap();
      }
      navigate('/admin');
    } catch (err: any) {
      setErrorMessage(err?.data?.message || 'Xəta baş verdi.');
    }
  };

  if (isEditMode && isLoadingEvent) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-secondary text-sm">Yüklənir...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/admin"
        className="inline-flex items-center space-x-1.5 text-secondary hover:text-primary mb-4 text-xs font-medium transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Admin panel</span>
      </Link>

      <div className="bg-white border border-borderBeige rounded-2xl p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-bold text-primary mb-1">
          {isEditMode ? 'Tədbiri redaktə et' : 'Yeni tədbir'}
        </h1>
        <p className="text-secondary text-xs mb-6">
          Tədbir məlumatlarını daxil edin.
        </p>

        {errorMessage && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">
              Başlıq
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Tədbirin adı"
                className="w-full bg-cream/30 border border-borderBeige rounded-xl pl-10 pr-4 py-2.5 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">
                Kateqoriya
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-cream/30 border border-borderBeige rounded-xl px-3 py-2.5 text-primary focus:outline-none focus:border-accent text-sm"
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                className="w-full bg-cream/30 border border-borderBeige rounded-xl px-3 py-2.5 text-primary focus:outline-none focus:border-accent text-sm"
              >
                <option value="Gələcəkdə">Gələcəkdə</option>
                <option value="Davam edir">Davam edir</option>
                <option value="Bitib">Bitib</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">
              Şəkil URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://..."
              className="w-full bg-cream/30 border border-borderBeige rounded-xl px-3.5 py-2.5 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">
                Tarix və Saat
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="datetime-local"
                  required
                  value={dateLocal}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full bg-cream/30 border border-borderBeige rounded-xl pl-10 pr-4 py-2.5 text-primary focus:outline-none focus:border-accent text-sm cursor-pointer"
                />
              </div>
              {formData.date && (
                <p className="text-[11px] text-accent font-semibold mt-1 truncate">
                  Seçildi: {formData.date}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-1.5">
                Son Qeydiyyat Tarixi
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="datetime-local"
                  value={deadlineLocal}
                  max={dateLocal || undefined}
                  onChange={(e) => handleDeadlineChange(e.target.value)}
                  className="w-full bg-cream/30 border border-borderBeige rounded-xl pl-10 pr-4 py-2.5 text-primary focus:outline-none focus:border-accent text-sm cursor-pointer"
                />
              </div>
              {dateLocal && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-secondary">Tez seç:</span>
                  <button
                    type="button"
                    onClick={() => setQuickDeadline(0)}
                    className="text-[10px] px-2 py-0.5 bg-cream hover:bg-borderBeige/60 text-secondary hover:text-primary rounded-md transition cursor-pointer"
                  >
                    Eyni vaxt
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDeadline(2)}
                    className="text-[10px] px-2 py-0.5 bg-cream hover:bg-borderBeige/60 text-secondary hover:text-primary rounded-md transition cursor-pointer"
                  >
                    2 saat əvvəl
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDeadline(24)}
                    className="text-[10px] px-2 py-0.5 bg-cream hover:bg-borderBeige/60 text-secondary hover:text-primary rounded-md transition cursor-pointer"
                  >
                    1 gün əvvəl
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">
              Tutum (Nəfər)
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                required
                min={1}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full bg-cream/30 border border-borderBeige rounded-xl pl-10 pr-4 py-2.5 text-primary focus:outline-none focus:border-accent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">
              Məkan
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Məsələn: Bakı Konqres Mərkəzi"
                className="w-full bg-cream/30 border border-borderBeige rounded-xl pl-10 pr-4 py-2.5 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-primary mb-1.5">
              Təsvir
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tədbir haqqında məlumat..."
              className="w-full bg-cream/30 border border-borderBeige rounded-xl p-3 text-primary placeholder:text-secondary/50 focus:outline-none focus:border-accent text-sm"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <Link
              to="/admin"
              className="px-4 py-2 bg-cream text-secondary hover:text-primary rounded-xl text-xs font-medium transition"
            >
              Ləğv et
            </Link>

            <button
              type="submit"
              disabled={isCreating || isUpdating}
              className="px-5 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isCreating || isUpdating ? 'Saxlanılır...' : 'Yadda saxla'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
