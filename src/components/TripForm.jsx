import { useCallback, useEffect, useRef, useState } from 'react';
import {
  X,
  Search,
  ArrowRight,
  LoaderCircle,
  Check,
  MapPin,
  Globe2,
  CalendarDays,
  Star,
  ImagePlus,
  LockKeyhole,
  NotebookPen,
} from 'lucide-react';
import { countries, findCities, uniqueCityMatch } from '../services/geocoding';
import './TripForm.css';

function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function TripForm({ trip, onClose, onSave }) {
  const dialog = useRef(null);
  const request = useRef(null);
  const submitting = useRef(false);
  const [form, setForm] = useState(() => ({
    countryCode: 'TR',
    city: '',
    date: today(),
    note: '',
    rating: 0,
    image: '',
    ...trip,
    ...(trip && !trip.countryCode
      ? { countryCode: countries.find((c) => c.name === trip.country)?.code || 'TR' }
      : {}),
  }));
  const [place, setPlace] = useState(
    trip ? { latitude: trip.lat, longitude: trip.lng, name: trip.city } : null,
  );
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const element = dialog.current;
    if (!element.open) element.showModal();
    return () => {
      request.current?.abort();
      element.close();
    };
  }, []);

  const search = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError('');
    try {
      const found = await findCities(form.city, form.countryCode, { signal: controller.signal });
      if (controller.signal.aborted) return null;
      setResults(found);
      if (!found.length)
        setError('Bu ülkede şehir bulunamadı. Şehir adını kontrol edip tekrar arayın.');
      return found;
    } catch {
      if (!controller.signal.aborted)
        setError('Konum servisine ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar arayın.');
      return null;
    } finally {
      if (request.current === controller) setBusy(false);
    }
  }, [form.city, form.countryCode]);

  useEffect(() => {
    if (place || form.city.trim().length < 1) return;
    const timer = setTimeout(() => {
      if (!submitting.current) search();
    }, 450);
    return () => clearTimeout(timer);
  }, [form.city, place, search]);

  function update(key, value) {
    setForm((old) => ({ ...old, [key]: value }));
    if (key === 'city' || key === 'countryCode') {
      request.current?.abort();
      setBusy(false);
      setPlace(null);
      setResults([]);
    }
    setError('');
  }

  function choose(result) {
    request.current?.abort();
    setBusy(false);
    setPlace(result);
    setForm((old) => ({ ...old, city: result.name }));
    setResults([]);
    setError('');
  }

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    if (!Number.isInteger(form.rating) || form.rating < 1 || form.rating > 5) {
      setError('Lütfen geziye 1–5 arasında bir yıldız puanı verin.');
      dialog.current.querySelector('input[name="trip-rating"]')?.focus();
      return;
    }
    if (form.city.trim().length < 1) {
      setError('Bir şehir adı girin.');
      return;
    }
    if (form.image && !/^https?:\/\//i.test(form.image)) {
      setError('Fotoğraf için http veya https bağlantısı girin.');
      return;
    }
    submitting.current = true;
    setSaving(true);
    try {
      let location = place;
      if (!location) {
        const found = results.length ? results : await search();
        if (!found?.length) return;
        location = uniqueCityMatch(found, form.city);
        if (!location) {
          setError(
            'Aynı adla birden fazla konum bulundu. Yukarıdaki önerilerden doğru şehri seçin.',
          );
          return;
        }
      }
      const saved = await onSave({
        ...form,
        city: location.name,
        country: countries.find((c) => c.code === form.countryCode)?.name || form.country,
        id: trip?.id || crypto.randomUUID(),
        lat: location.latitude,
        lng: location.longitude,
        note: form.note.trim(),
        image: form.image.trim(),
      });
      if (saved) onClose();
      else setError('Gezi kaydedilemedi. Tarayıcı depolama alanını kontrol edip tekrar deneyin.');
    } catch {
      setError('Gezi kaydedilemedi. Bilgileriniz formda duruyor; tekrar deneyebilirsiniz.');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="trip-dialog trip-editor"
      aria-labelledby="trip-form-title"
      aria-describedby="trip-form-description"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <form onSubmit={submit} aria-busy={saving}>
        <div className="trip-editor-heading">
          <div className="trip-editor-kicker">
            <span className="trip-editor-emblem">
              <MapPin size={21} strokeWidth={1.6} />
            </span>
            <p className="eyebrow">{trip ? 'YOLCULUĞUNU GÜNCELLE' : 'DÜNYANDA YENİ BİR İZ'}</p>
          </div>
          <button
            type="button"
            className="icon-button trip-editor-close"
            disabled={saving}
            onClick={onClose}
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
          <h2 id="trip-form-title">{trip ? 'Gezini düzenle' : 'Bir yolculuk, bir hikâye.'}</h2>
          <p id="trip-form-description">
            {trip
              ? 'Anılarına dön, hikâyenin detaylarını güncelle.'
              : 'Gittiğin bir yeri, unutmak istemediğin bir anı ekle.'}
          </p>
        </div>
        <div className="trip-editor-body">
          <fieldset disabled={saving} className="trip-fields">
            <section className="trip-editor-section" aria-labelledby="trip-location-title">
              <div className="trip-section-heading">
                <h3 id="trip-location-title">
                  <Globe2 size={14} />
                  Yolculuğun
                </h3>
              </div>
              <div className="form-grid">
                <label>
                  Ülke
                  <div className="trip-input-icon">
                    <Globe2 size={16} aria-hidden="true" />
                    <select
                      required
                      value={form.countryCode}
                      onChange={(e) => update('countryCode', e.target.value)}
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </label>
                <label>
                  Gezi tarihi
                  <div className="trip-input-icon">
                    <CalendarDays size={16} aria-hidden="true" />
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => update('date', e.target.value)}
                    />
                  </div>
                </label>
              </div>
              <label htmlFor="trip-city">Şehir</label>
              <div className="city-search-field">
                <MapPin size={16} className="city-input-icon" aria-hidden="true" />
                <input
                  id="trip-city"
                  required
                  minLength={1}
                  maxLength={100}
                  autoComplete="off"
                  placeholder="Örn. İstanbul"
                  value={form.city}
                  aria-describedby="city-help"
                  onChange={(e) => update('city', e.target.value)}
                />
                <button
                  type="button"
                  className="search-city-button"
                  disabled={busy || form.city.trim().length < 1}
                  onClick={search}
                >
                  {busy ? <LoaderCircle className="spin" size={16} /> : <Search size={16} />}Ara
                </button>
              </div>
              {busy && (
                <p className="field-help" role="status">
                  Konumlar aranıyor…
                </p>
              )}
              {results.length > 0 && (
                <div className="city-results" aria-label="Şehir önerileri">
                  {results.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      aria-label={`${r.name} ${[r.admin1, r.country].filter(Boolean).join(', ')}`}
                      onClick={() => choose(r)}
                    >
                      <MapPin size={15} />
                      <span className="city-result-copy">
                        <strong>{r.name}</strong>
                        <span>{[r.admin1, r.country].filter(Boolean).join(', ')}</span>
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  ))}
                </div>
              )}
              {place && (
                <p className="location-ok">
                  <Check size={14} /> Konum seçildi: {place.name}
                </p>
              )}
            </section>
            <section
              className="trip-editor-section trip-memory-section"
              aria-labelledby="trip-memory-title"
            >
              <div className="trip-section-heading">
                <h3 id="trip-memory-title">
                  <NotebookPen size={14} />
                  Sende kalanlar
                </h3>
                <span className="optional-badge">Not ve fotoğraf isteğe bağlı</span>
              </div>
              <label htmlFor="trip-note">Kısa not</label>
              <div className="trip-note-field">
                <textarea
                  id="trip-note"
                  rows={3}
                  maxLength={1000}
                  placeholder="Bu şehirden aklında ne kaldı?"
                  value={form.note}
                  onChange={(e) => update('note', e.target.value)}
                />
                <span className="note-count" aria-hidden="true">
                  {form.note.length} / 1000
                </span>
              </div>
              <div className="trip-extras-grid">
                <fieldset className="trip-rating">
                  <legend>Puan (zorunlu)</legend>
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <label
                        key={n}
                        className={`rating-star ${n <= form.rating ? 'is-filled' : ''}`}
                      >
                        <input
                          type="radio"
                          name="trip-rating"
                          value={n}
                          required
                          checked={form.rating === n}
                          onInvalid={() =>
                            setError('Lütfen geziye 1–5 arasında bir yıldız puanı verin.')
                          }
                          onChange={() => update('rating', n)}
                          aria-label={`${n} yıldız`}
                        />
                        <Star size={23} strokeWidth={1.5} aria-hidden="true" />
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label className="trip-photo-label">
                  Fotoğraf URL’si
                  <div className="trip-input-icon">
                    <ImagePlus size={17} aria-hidden="true" />
                    <input
                      type="url"
                      placeholder="https://…"
                      value={form.image}
                      onChange={(e) => update('image', e.target.value)}
                    />
                  </div>
                  <span className="photo-help">Anına bir kare ekle.</span>
                </label>
              </div>
            </section>
          </fieldset>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="form-actions trip-editor-footer">
          <span className="trip-privacy">
            <LockKeyhole size={13} />
            Sadece senin dünyanda.
          </span>
          <button className="primary" disabled={saving} type="submit">
            {saving ? 'Kaydediliyor…' : trip ? 'Değişiklikleri kaydet' : 'Geziyi kaydet'}
            {saving ? <LoaderCircle className="spin" size={17} /> : <ArrowRight size={17} />}
          </button>
        </div>
      </form>
    </dialog>
  );
}
