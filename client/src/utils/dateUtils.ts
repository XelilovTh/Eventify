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

export const parseAzerbaijaniDate = (dateStr?: string | null): number => {
  if (!dateStr || typeof dateStr !== 'string') return 0;

  const trimmed = dateStr.trim();
  if (!trimmed) return 0;

  const parsedDirect = Date.parse(trimmed);
  if (!isNaN(parsedDirect)) {
    return parsedDirect;
  }

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

export const isDatePassed = (dateStr?: string | null): boolean => {
  if (!dateStr) return false;
  const timestamp = parseAzerbaijaniDate(dateStr);
  if (!timestamp) return false;
  return Date.now() > timestamp;
};

const AZ_MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'
];

export const formatToAzerbaijaniDate = (input?: string | Date | number | null): string => {
  if (!input) return '';
  const ts = typeof input === 'number' ? input : (parseAzerbaijaniDate(String(input)) || Date.parse(String(input)));
  if (!ts || isNaN(ts)) return String(input);
  const d = new Date(ts);
  const day = d.getDate();
  const month = AZ_MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}`;
};

export const toDateTimeLocalValue = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const ts = parseAzerbaijaniDate(dateStr) || Date.parse(dateStr);
  if (!ts || isNaN(ts)) return '';
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
