import { useEffect, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteTripDialog({ trip, onClose, onDelete }) {
  const dialog = useRef(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="trip-dialog delete-dialog"
      aria-labelledby="delete-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <h2 id="delete-title">{trip.city} gezisi silinsin mi?</h2>
      <p className="muted">Bu gezi listenden ve dünyandan kaldırılacak.</p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="form-actions">
        <button type="button" className="secondary" autoFocus onClick={onClose}>
          Vazgeç
        </button>
        <button
          type="button"
          className="danger-button"
          onClick={() => {
            if (!onDelete(trip))
              setError('Gezi silinemedi. Tarayıcı depolama ayarlarını kontrol edin.');
          }}
        >
          <Trash2 size={15} />
          Geziyi sil
        </button>
      </div>
    </dialog>
  );
}
