/**
 * StateMessage — reusable placeholder for loading / error / empty states
 * Props:
 *   type: 'loading' | 'error' | 'empty'
 *   message: string
 *   onRetry: function (used in 'error' state)
 *   onReset: function (used in 'empty' state)
 */
export default function StateMessage({ type, message, onRetry, onReset }) {
  if (type === 'loading') {
    return (
      <div className="state-message">
        <div className="spinner-ring" />
        <p>{message || 'Loading records from database…'}</p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="state-message">
        <span className="state-icon">⚠️</span>
        <p>{message || 'Connection failed. We could not reach the server.'}</p>
        <button id="retryBtn" className="btn-primary" onClick={onRetry}>
          Retry Loading
        </button>
      </div>
    );
  }

  if (type === 'empty') {
    return (
      <div className="state-message">
        <span className="state-icon">📭</span>
        <p>{message || 'No records found matching your search.'}</p>
        <button id="clearFiltersBtn" className="btn-secondary" onClick={onReset}>
          Clear Filters
        </button>
      </div>
    );
  }

  return null;
}
