import { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  Plus,
  ArrowUpRight,
  Search,
  X,
  Pencil,
  Trash2,
  Globe2,
  Minus,
  LocateFixed,
  MousePointer2,
} from 'lucide-react';
import GlobeView, { GlobeBoundary } from './components/GlobeView';
import TripForm from './components/TripForm';
import TripList from './components/TripList';
import DeleteTripDialog from './components/DeleteTripDialog';
import { KEY, readTrips, saveTrips } from './services/storage';

const dateLabel = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function App() {
  const [initial] = useState(() => {
    try {
      return { trips: readTrips(), error: '' };
    } catch {
      return {
        trips: [],
        error:
          'Kayıtlı geziler okunamadı. Verilerin korunması için kayıt işlemleri kapatıldı. Tarayıcı depolama ayarlarını kontrol edin.',
      };
    }
  });
  const [trips, setTrips] = useState(initial.trips);
  const [error, setError] = useState(initial.error);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [query, setQuery] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [notice, setNotice] = useState('');
  const globe = useRef();

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(''), 3_000);
    return () => clearTimeout(timeout);
  }, [notice, trips]);

  useEffect(() => {
    if (!selected) return;
    const timeout = setTimeout(() => setSelected(null), 20_000);
    return () => clearTimeout(timeout);
  }, [selected]);

  useEffect(() => {
    function syncTrips(event) {
      if (event.key !== KEY && event.key !== null) return;
      try {
        const latest = readTrips();
        setTrips(latest);
        setSelected((current) => latest.find((trip) => trip.id === current?.id) || null);
        setError('');
      } catch {
        setError('Başka bir sekmeden gelen gezi kayıtları okunamadı.');
      }
    }

    window.addEventListener('storage', syncTrips);
    return () => window.removeEventListener('storage', syncTrips);
  }, []);

  function readLatestTrips() {
    try {
      return readTrips();
    } catch {
      setError('Kayıtlı geziler okunamadı. Verilerin korunması için kayıt işlemleri kapatıldı.');
      return null;
    }
  }

  function persist(next) {
    if (initial.error) return false;
    try {
      saveTrips(next);
      setTrips(next);
      setError('');
      return true;
    } catch {
      setError('Kayıt yapılamadı. Tarayıcı depolama alanı dolu veya erişim kapalı olabilir.');
      return false;
    }
  }

  function save(trip) {
    const latest = readLatestTrips();
    if (!latest) return false;
    const exists = latest.some((t) => t.id === trip.id);
    const next = exists ? latest.map((t) => (t.id === trip.id ? trip : t)) : [...latest, trip];
    if (!persist(next)) return false;
    setSelected(trip);
    setQuery('');
    setNotice(exists ? `${trip.city} gezisi güncellendi.` : `${trip.city} gezisi eklendi.`);
    return true;
  }

  function remove(trip) {
    const latest = readLatestTrips();
    if (!latest || !persist(latest.filter((t) => t.id !== trip.id))) return false;
    if (selected?.id === trip.id) setSelected(null);
    setDeleting(null);
    setNotice(`${trip.city} gezisi silindi.`);
    return true;
  }

  function select(trip) {
    setSelected({ ...trip });
  }

  function zoom(multiplier) {
    if (!globe.current) return;
    const pov = globe.current.pointOfView();
    globe.current.pointOfView(
      { ...pov, altitude: Math.max(0.4, Math.min(4, pov.altitude * multiplier)) },
      400,
    );
  }

  const filtered = trips
    .filter((t) =>
      `${t.city} ${t.country}`.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr')),
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="app">
      <header>
        <a href="./" className="brand">
          <span className="brand-icon">
            <MapPin size={23} />
          </span>
          yol-izi<span className="brand-dot">.</span>
        </a>
        <span className="header-note">Her yolculuk bir iz bırakır.</span>
        <button className="primary" onClick={() => setForm({})} disabled={!!initial.error}>
          <Plus size={18} />
          Gezi ekle
        </button>
      </header>
      <main>
        <section className="intro">
          <h1>
            Gittiğin yerler.
            <br />
            <em>Kalan anılar.</em>
          </h1>
          <p>
            Dünyayı keşfet. Anılarını biriktir.
            <br />
            Her yolculuğunla bu dünya biraz daha senin.
          </p>
        </section>
        <div className="globe-stage">
          <GlobeBoundary>
            <GlobeView trips={trips} selected={selected} onSelect={select} globeRef={globe} />
          </GlobeBoundary>
        </div>
        <aside className="journeys">
          <div className="section-heading">
            <h2>Yolculuklarım</h2>
            <span>{trips.length.toString().padStart(2, '0')}</span>
          </div>
          {trips.length > 0 && (
            <div className="list-search">
              <Search size={15} />
              <input
                aria-label="Gezilerde ara"
                placeholder="Bir şehir bul…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
          <div className="trip-list">
            {!trips.length ? (
              <div className="empty">
                <span className="empty-icon">
                  <Globe2 size={26} />
                </span>
                <h3>Hikâyen burada başlıyor</h3>
                <p>
                  İlk gezini ekle, dünyanda
                  <br />
                  ilk izini bırak.
                </p>
                <button
                  className="text-button"
                  onClick={() => setForm({})}
                  disabled={!!initial.error}
                >
                  İlk gezimi ekle <ArrowUpRight size={16} />
                </button>
              </div>
            ) : filtered.length ? (
              <TripList
                trips={filtered}
                selectedId={selected?.id}
                onSelect={select}
                onEdit={setForm}
                onDelete={setDeleting}
                dateLabel={dateLabel}
              />
            ) : (
              <p className="muted">Bu aramayla eşleşen gezi yok.</p>
            )}
          </div>
        </aside>
        <p className="local-note">
          <span /> Anıların bu tarayıcıda saklanır
        </p>
        {selected && (
          <article className="detail" key={selected.id}>
            {selected.image && /^https?:\/\//i.test(selected.image) && (
              <img
                key={selected.image}
                src={selected.image}
                alt={`${selected.city} gezisi`}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div className="detail-content">
              <button
                className="close-detail icon-button"
                onClick={() => setSelected(null)}
                aria-label="Detayları kapat"
              >
                <X size={18} />
              </button>
              <p className="eyebrow">BİR YOLCULUK HİKÂYESİ</p>
              <h2>{selected.city}</h2>
              <p className="muted">
                {selected.country} <span> / </span> {dateLabel(selected.date)}
              </p>
              {selected.rating > 0 && (
                <p className="stars" aria-label={`${selected.rating} / 5 puan`}>
                  {'★'.repeat(selected.rating)}
                  <span>{'★'.repeat(5 - selected.rating)}</span>
                </p>
              )}
              <p className="trip-note">{selected.note || 'Bazı anılar kelimelere sığmaz.'}</p>
              <div className="detail-actions">
                <button onClick={() => setForm(selected)}>
                  <Pencil size={14} />
                  Düzenle
                </button>
                <button onClick={() => setDeleting(selected)}>
                  <Trash2 size={14} />
                  Sil
                </button>
              </div>
            </div>
          </article>
        )}
        <div className="globe-controls">
          <button aria-label="Yakınlaştır" onClick={() => zoom(0.8)}>
            <Plus size={18} />
          </button>
          <button aria-label="Uzaklaştır" onClick={() => zoom(1.25)}>
            <Minus size={18} />
          </button>
          <span />
          <button
            aria-label="Dünyayı ortala"
            onClick={() => globe.current?.pointOfView({ lat: 26, lng: 30, altitude: 1.65 }, 900)}
          >
            <LocateFixed size={18} />
          </button>
        </div>
        <div className="globe-hint">
          <MousePointer2 size={14} /> Döndürmek için sürükle <span>·</span> Yakınlaşmak için kaydır
        </div>
      </main>
      <footer>
        <span>Bir sonraki anın nerede?</span>
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Konum verileri: Open-Meteo / GeoNames <ArrowUpRight size={12} />
        </a>
      </footer>
      {notice && !error && (
        <div className="toast toast-success" role="status">
          {notice}
          <button aria-label="Bildirimi kapat" onClick={() => setNotice('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {error && (
        <div className="toast" role="alert">
          {error}
          <button aria-label="Uyarıyı kapat" onClick={() => setError('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {form && (
        <TripForm
          key={form.id || 'new'}
          trip={form.id ? form : null}
          onClose={() => setForm(null)}
          onSave={save}
        />
      )}
      {deleting && (
        <DeleteTripDialog trip={deleting} onClose={() => setDeleting(null)} onDelete={remove} />
      )}
    </div>
  );
}
