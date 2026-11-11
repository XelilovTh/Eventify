import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto my-16 px-4 text-center">
      <div className="bg-white border border-borderBeige rounded-[2rem] p-10 shadow-sm">
        <div className="inline-flex p-4 bg-cream text-accent rounded-2xl mb-5">
          <Compass className="w-9 h-9" />
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary mb-3">
          Səhifə tapılmadı
        </h1>
        <p className="text-secondary text-xs sm:text-sm leading-relaxed mb-7">
          Axtardığınız səhifə mövcud deyil və ya ünvanı səhv yazılıb.
          Aşağıdakı düymə ilə ana səhifəyə qayıda bilərsiniz.
        </p>

        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana səhifəyə qayıt</span>
        </Link>
      </div>
    </div>
  );
};
