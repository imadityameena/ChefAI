import { differenceInCalendarDays, parseISO } from 'date-fns';

// "1.50" -> "1.5", "2.00" -> "2", null -> ""
export const formatQuantity = (qty) => {
  if (qty === null || qty === undefined || qty === '') return '';
  const num = Number(qty);
  if (Number.isNaN(num)) return String(qty);
  return String(Math.round(num * 100) / 100);
};

// 95 -> "1 h 35 min", 30 -> "30 min"
export const formatMinutes = (minutes) => {
  const total = Number(minutes) || 0;
  if (total <= 0) return '—';
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
};

// Dates from the API can be "2026-10-23" or a full ISO timestamp.
// Read only the calendar date so the day never shifts with timezones.
export const toLocalDate = (value) => {
  if (!value) return null;
  return parseISO(String(value).slice(0, 10));
};

// Describe an expiry date relative to today.
export const expiryStatus = (value) => {
  const date = toLocalDate(value);
  if (!date) return null;
  const days = differenceInCalendarDays(date, new Date());
  if (days < 0) return { tone: 'danger', label: days === -1 ? 'Expired yesterday' : `Expired ${-days} days ago`, days };
  if (days === 0) return { tone: 'danger', label: 'Expires today', days };
  if (days === 1) return { tone: 'amber', label: 'Expires tomorrow', days };
  if (days <= 7) return { tone: 'amber', label: `Expires in ${days} days`, days };
  return { tone: 'neutral', label: null, days };
};

export const errorMessage = (error, fallback) =>
  error?.response?.data?.message || fallback;

export const firstName = (name) => (name || '').trim().split(/\s+/)[0] || '';

export const greeting = (date = new Date()) => {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};
