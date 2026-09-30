// Keep the established key so existing trips remain available after the rename.
export const KEY = 'pinora.trips.v1';

const MAXIMUM_LENGTHS = {
  id: 128,
  city: 100,
  country: 100,
  note: 1000,
  image: 2048,
};

function hasValidText(value, maximumLength, { allowEmpty = false } = {}) {
  return (
    typeof value === 'string' &&
    value.length <= maximumLength &&
    (allowEmpty || value.trim().length > 0)
  );
}

function hasSafeImageUrl(value) {
  if (!hasValidText(value, MAXIMUM_LENGTHS.image, { allowEmpty: true })) return false;
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validTrip(t) {
  return (
    t &&
    hasValidText(t.id, MAXIMUM_LENGTHS.id) &&
    hasValidText(t.city, MAXIMUM_LENGTHS.city) &&
    hasValidText(t.country, MAXIMUM_LENGTHS.country) &&
    typeof t.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(t.date) &&
    Number.isFinite(Date.parse(t.date)) &&
    Number.isFinite(t.lat) &&
    Math.abs(t.lat) <= 90 &&
    Number.isFinite(t.lng) &&
    Math.abs(t.lng) <= 180 &&
    hasValidText(t.note, MAXIMUM_LENGTHS.note, { allowEmpty: true }) &&
    hasSafeImageUrl(t.image) &&
    Number.isInteger(t.rating) &&
    t.rating >= 0 &&
    t.rating <= 5
  );
}
export function readTrips(storage = localStorage) {
  const raw = storage.getItem(KEY);
  if (!raw) return [];
  const trips = JSON.parse(raw);
  if (!Array.isArray(trips) || !trips.every(validTrip))
    throw new Error('Kayıtlı geziler okunamadı. Mevcut verileriniz korunuyor.');
  return trips;
}
export function saveTrips(trips, storage = localStorage) {
  storage.setItem(KEY, JSON.stringify(trips));
}
