import { useState, useEffect } from 'react';

const EMPTY_FORM = {
  record_id:  '',
  child_name: '',
  age_months: '',
  weight_kg:  '',
  height_cm:  '',
};

/**
 * MeasurementModal — controlled form for adding or editing a measurement.
 * Props:
 *   isOpen: bool
 *   editRow: object | null  (null → add mode, object → edit mode)
 *   onClose: function
 *   onSaved: function       (called after successful save to refresh table)
 */
export default function MeasurementModal({ isOpen, editRow, onClose, onSaved }) {
  const [form, setForm]       = useState(EMPTY_FORM);
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);

  // Pre-fill form when editing an existing row
  useEffect(() => {
    if (editRow) {
      setForm({
        record_id:  editRow.record_id  ?? '',
        child_name: editRow.child_name ?? '',
        age_months: editRow.age_months ?? '',
        weight_kg:  editRow.weight_kg  ?? '',
        height_cm:  editRow.height_cm  ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError('');
  }, [editRow, isOpen]);

  if (!isOpen) return null;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      record_id:  form.record_id,
      child_name: form.child_name,
      age_months: parseInt(form.age_months),
      weight_kg:  parseFloat(form.weight_kg) || null,
      height_cm:  parseFloat(form.height_cm) || null,
    };

    try {
      const res = await fetch('/api/measurements', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(`❌ Invalid Data: ${result.error}`);
      } else {
        onClose();
        onSaved();
      }
    } catch {
      setError('❌ Network Error: Could not save to server. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Submit Measurement</h2>
        <p className="modal-subtitle">
          {editRow ? `Editing record ${editRow.record_id}` : 'Add a new growth measurement'}
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="record_id">Record ID</label>
            <input
              id="record_id"
              name="record_id"
              className="input"
              required
              placeholder="e.g. REC021"
              value={form.record_id}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="child_name">Child Name</label>
            <input
              id="child_name"
              name="child_name"
              className="input"
              required
              value={form.child_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="age_months">Age (Months)</label>
            <input
              id="age_months"
              name="age_months"
              type="number"
              min="0"
              max="72"
              className="input"
              required
              value={form.age_months}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="weight_kg">Weight (kg)</label>
            <input
              id="weight_kg"
              name="weight_kg"
              type="number"
              step="0.1"
              className="input"
              value={form.weight_kg}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="height_cm">Height (cm)</label>
            <input
              id="height_cm"
              name="height_cm"
              type="number"
              step="0.1"
              className="input"
              value={form.height_cm}
              onChange={handleChange}
            />
          </div>

          <div className="modal-actions">
            <button type="button" id="cancelBtn" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" id="saveBtn" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
