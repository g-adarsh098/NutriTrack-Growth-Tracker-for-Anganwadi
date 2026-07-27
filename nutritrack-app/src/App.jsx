import { useState, useEffect, useCallback, useRef } from 'react';
import AppLoader        from './components/AppLoader.jsx';
import TopBar           from './components/TopBar.jsx';
import Header           from './components/Header.jsx';
import StatsBar         from './components/StatsBar.jsx';
import DataTable        from './components/DataTable.jsx';
import StateMessage     from './components/StateMessage.jsx';
import MeasurementModal from './components/MeasurementModal.jsx';

export default function App() {
  // ── Data state ──────────────────────────────────────────
  const [measurements, setMeasurements] = useState([]);
  const [uiState,      setUiState]      = useState('loading');
  const [lastUpdated,  setLastUpdated]  = useState('');

  // ── Search / filter state (controlled inputs) ───────────
  const [searchVal,    setSearchVal]    = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // ── Modal state ─────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow,   setEditRow]   = useState(null);

  // ── Full-page loader ────────────────────────────────────
  const [loaderHidden, setLoaderHidden] = useState(false);

  // ── Debounce timer ref ──────────────────────────────────
  const debounceRef = useRef(null);

  // ── Core fetch — asks the SERVER for only matching rows ─
  // q and status are forwarded as query params so the DB runs
  // the WHERE clause; nothing is loaded and hidden in the browser.
  const fetchFromServer = useCallback(async (q, status) => {
    setUiState('loading');

    const params = new URLSearchParams();
    if (q && q.trim())    params.set('q', q.trim());
    if (status !== 'All') params.set('status', status);

    try {
      const res = await fetch(`/api/measurements?${params.toString()}`);
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();

      setLoaderHidden(true);
      setMeasurements(data);
      setLastUpdated(new Date().toLocaleTimeString());
      setUiState(data.length === 0 ? 'empty' : 'data');
    } catch {
      setLoaderHidden(true);
      setUiState('error');
    }
  }, []);

  // Initial load — no filters
  useEffect(() => { fetchFromServer('', 'All'); }, [fetchFromServer]);

  // ── Debounced search handler ────────────────────────────
  // Waits 350 ms after the user stops typing before hitting
  // the server, so we don't fire a request on every keystroke.
  const handleSearch = useCallback((val) => {
    setSearchVal(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchFromServer(val, statusFilter);
    }, 350);
  }, [fetchFromServer, statusFilter]);

  // Status dropdown fires immediately (no debounce needed)
  const handleFilter = useCallback((val) => {
    setStatusFilter(val);
    clearTimeout(debounceRef.current);
    fetchFromServer(searchVal, val);
  }, [fetchFromServer, searchVal]);

  // ── Derived display state ───────────────────────────────
  const displayState = uiState === 'empty' && (searchVal || statusFilter !== 'All')
    ? 'empty-filtered'
    : uiState;

  // ── Handlers ────────────────────────────────────────────
  const openAdd     = ()    => { setEditRow(null); setModalOpen(true); };
  const openEdit    = (row) => { setEditRow(row);  setModalOpen(true); };
  const closeModal  = ()    => setModalOpen(false);
  const handleSaved = ()    => fetchFromServer(searchVal, statusFilter);

  const resetFilters = () => {
    setSearchVal('');
    setStatusFilter('All');
    fetchFromServer('', 'All');
  };

  return (
    <>
      <AppLoader hidden={loaderHidden} />

      {/* Sticky top nav bar */}
      <TopBar lastUpdated={lastUpdated} />

      <div className="app-shell">
        {/* Stats cards — only show when data is loaded */}
        {uiState === 'data' && (
          <StatsBar measurements={measurements} />
        )}

        {/* Section label */}
        {uiState === 'data' && (
          <div className="section-label">Records</div>
        )}

        {/* Page header with search / filter */}
        <Header
          searchVal={searchVal}
          statusFilter={statusFilter}
          onSearch={handleSearch}
          onFilter={handleFilter}
          onAdd={openAdd}
          filteredCount={measurements.length}
          totalCount={measurements.length}
        />

        {/* Main content card */}
        <div className="table-card">
          {displayState === 'loading' && (
            <StateMessage type="loading" />
          )}
          {displayState === 'error' && (
            <StateMessage
              type="error"
              message="Connection failed. Could not reach the server."
              onRetry={() => fetchFromServer(searchVal, statusFilter)}
            />
          )}
          {displayState === 'empty' && (
            <StateMessage
              type="empty"
              message="The database is empty. Add a new record to get started."
              onReset={resetFilters}
            />
          )}
          {displayState === 'empty-filtered' && (
            <StateMessage
              type="empty"
              message={searchVal
                ? `No records found matching "${searchVal}". Try a different search term.`
                : 'No records match the selected filter.'}
              onReset={resetFilters}
            />
          )}
          {displayState === 'data' && (
            <DataTable data={measurements} onEdit={openEdit} />
          )}
        </div>
      </div>

      <MeasurementModal
        isOpen={modalOpen}
        editRow={editRow}
        onClose={closeModal}
        onSaved={handleSaved}
      />
    </>
  );
}
