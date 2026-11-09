// client/src/components/Footer.tsx
// Real layihə standartlarına uyğun zərif və funksional altlıq paneli (Footer).

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#24130A] text-cream border-t border-[#3B2418] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* 1. Brend və Təsvir */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5 text-white font-extrabold text-2xl tracking-tight">
              <span className="p-2 bg-accent/20 rounded-2xl text-accent border border-accent/30 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </span>
              <span>Event<span className="text-accent">ify</span></span>
            </Link>
            <p className="text-cream/70 text-xs sm:text-sm leading-relaxed max-w-sm">
              Texnologiya, biznes, incəsənət və təhsil sahəsində ən son və maraqlı tədbirləri kəşf edin, yerinizi vaxtında bron edin.
            </p>
            <div className="flex items-center space-x-4 text-xs text-cream/60 pt-2">
              <span className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>Bakı, Azərbaycan</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>info@eventify.az</span>
              </span>
            </div>
          </div>

          {/* 2. Sürətli Keçidlər */}
          <div>
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">Sürətli Keçidlər</h4>
            <ul className="space-y-2.5 text-xs text-cream/70 font-medium">
              <li>
                <Link to="/" className="hover:text-white transition">Ana səhifə</Link>
              </li>
              <li>
                <Link to="/my-registrations" className="hover:text-white transition">Mənim qeydiyyatlarım</Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-white transition">Seçilmişlər</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">Şəxsi Profil</Link>
              </li>
            </ul>
          </div>

          {/* 3. Kateqoriyalar */}
          <div>
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-4">Tədbir Növləri</h4>
            <ul className="space-y-2.5 text-xs text-cream/70 font-medium">
              <li><span className="hover:text-white cursor-pointer transition">Konfranslar</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Seminarlar</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Festivallar</span></li>
              <li><span className="hover:text-white cursor-pointer transition">İdman və Sağlamlıq</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Texnologiya</span></li>
            </ul>
          </div>
        </div>

        {/* Alt Müəlliflik Hüququ Zolağı */}
        <div className="pt-8 border-t border-cream/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-cream/60">
          <p>© {new Date().getFullYear()} Eventify. Bütün hüquqlar qorunur.</p>
          <div className="flex items-center space-x-1 text-cream/50">
            <span>Rahatlıq və sürət üçün hazırlandı</span>
            <Heart className="w-3.5 h-3.5 text-accent fill-accent ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
