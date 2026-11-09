// client/src/utils/dateUtils.ts
// Həm ISO 8601 (məs: "2026-11-15T10:00:00" və ya "2026-11-15"),
// həm də Azərbaycan dilindəki ("15 Noyabr 2026, 10:00") tarixləri tam dəqiqliklə parse edən vahid köməkçi modul.

const AZ_MONTHS: Record<string, number> = {
  yanvar: 0,
  fevral: 1,
  mart: 2,
  aprel: 3,
  may: 4,
  iyun: 5,
  iyul: 6,
  avqust: 7,
  sentyabr: 8,
  oktyabr: 9,
  noyabr: 10,
  dekabr: 11,
};

/**
 * Tarix sətrini millisaniyəyə (timestamp) çevirir
 */
export const parseAzerbaijaniDate = (dateStr?: string | null): number => {
  if (!dateStr || typeof dateStr !== 'string') return 0;

  const trimmed = dateStr.trim();
  if (!trimmed) return 0;

  // 1. Birbaşa ISO 8601 və ya standart tarix formatı yoxlanışı
  const parsedDirect = Date.parse(trimmed);
  if (!isNaN(parsedDirect)) {
    return parsedDirect;
  }

  // 2. Azərbaycan ay adları ilə format ("15 Noyabr 2026, 10:00" və ya "15 Noyabr 2026")
  const clean = trimmed.replace(/,/g, '').replace(/–/g, '-');
  const parts = clean.split(' ').filter(Boolean);

  if (parts.length >= 3) {
    const day = parseInt(parts[0], 10);
    const monthName = parts[1].toLowerCase();
    const year = parseInt(parts[2], 10);

    let hours = 23;
    let minutes = 59;
    let seconds = 59;

    if (parts[3] && parts[3].includes(':')) {
      const timeParts = parts[3].split(':');
      hours = parseInt(timeParts[0], 10) || 0;
      minutes = parseInt(timeParts[1], 10) || 0;
      seconds = timeParts[2] ? parseInt(timeParts[2], 10) || 0 : 0;
    }

    if (AZ_MONTHS[monthName] !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, AZ_MONTHS[monthName], day, hours, minutes, seconds).getTime();
    }
  }

  return 0;
};

/**
 * Tarixin artıq keçmiş (bitmiş) olduğunu yoxlayır
 */
export const isDatePassed = (dateStr?: string | null): boolean => {
  if (!dateStr) return false;
  const timestamp = parseAzerbaijaniDate(dateStr);
  if (!timestamp) return false;
  return Date.now() > timestamp;
};
