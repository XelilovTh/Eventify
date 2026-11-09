// client/src/utils/dateUtils.ts
// Azərbaycan dilindəki tarixləri (məs: "15 Noyabr 2026, 10:00") və standart tarixləri
// dəqiq millisaniyəyə çevirən və vaxtın bitib-bitmədiyini yoxlayan köməkçi funksiyalar.

export const parseAzerbaijaniDate = (dateStr?: string | null): number => {
  if (!dateStr) return 0;

  const months: { [key: string]: number } = {
    yanvar: 0, fevral: 1, mart: 2, aprel: 3, may: 4, iyun: 5,
    iyul: 6, avqust: 7, sentyabr: 8, oktyabr: 9, noyabr: 10, dekabr: 11
  };

  const parsedDirect = Date.parse(dateStr);
  if (!isNaN(parsedDirect)) return parsedDirect;

  const clean = dateStr.replace(/,/g, '').replace(/–/g, '-');
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);
    let hours = 23;
    let minutes = 59;
    if (parts[3] && parts[3].includes(':')) {
      const timeParts = parts[3].split(':');
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
    }

    if (months[monthName] !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, months[monthName], day, hours, minutes).getTime();
    }
  }
  return 0;
};

// Verilən tarixin cari andan əvvəl (yəni bitmiş) olub-olmadığını yoxlayır
export const isDatePassed = (dateStr?: string | null): boolean => {
  if (!dateStr) return false;
  const timestamp = parseAzerbaijaniDate(dateStr);
  if (!timestamp) return false;
  return Date.now() > timestamp;
};
