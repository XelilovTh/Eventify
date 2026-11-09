const AZ_MONTHS = {
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
  dekabr: 11
};

export const parseEventDate = (dateStr) => {
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

export const isDatePassed = (dateStr) => {
  if (!dateStr) return false;
  const timestamp = parseEventDate(dateStr);
  if (!timestamp) return false;
  return Date.now() > timestamp;
};
