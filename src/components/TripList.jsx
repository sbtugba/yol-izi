import { ArrowUpRight, MapPin, Pencil, Trash2 } from 'lucide-react';

export default function TripList({ trips, selectedId, onSelect, onEdit, onDelete, dateLabel }) {
  return trips.map((trip) => (
    <div key={trip.id} className={`trip-row ${selectedId === trip.id ? 'selected' : ''}`}>
      <button
        type="button"
        className="trip-select"
        onClick={() => onSelect(trip)}
        aria-label={`${trip.city} gezi detaylarını aç`}
      >
        <span className="trip-icon">
          <MapPin size={17} />
        </span>
        <span className="trip-summary">
          <strong>{trip.city}</strong>
          <small>
            {trip.country} · {dateLabel(trip.date)}
          </small>
        </span>
        <ArrowUpRight size={15} />
      </button>
      <div className="trip-row-actions">
        <button
          type="button"
          onClick={() => onEdit(trip)}
          aria-label={`${trip.city} gezisini düzenle`}
        >
          <Pencil size={13} />
          Düzenle
        </button>
        <button
          type="button"
          onClick={() => onDelete(trip)}
          aria-label={`${trip.city} gezisini sil`}
        >
          <Trash2 size={13} />
          Sil
        </button>
      </div>
    </div>
  ));
}
