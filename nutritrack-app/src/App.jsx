import { useState, useEffect, useMemo } from 'react';
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

  // ── Filter state ────────────────────────────────────────
  const [searchVal,    setSearchVal]    = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // ── Modal state ─────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow,   setEditRow]   = useState(null);

  // ── Full-page loader ────────────────────────────────────
  const [loaderHidden, setLoaderHidden] = useState(false);

  // ── Load data from API ──────────────────────────────────
  async function loadData() {
    setUiState('loading');
    try {
      const res = await fetch('/api/measurements');
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
  }

  useEffect(() => { loadData(); }, []);

  // ── Filtered list (memoised) ────────────────────────────
  const filtered = useMemo(() => {
    const q = searchVal.toLowerCase();
    return measurements.filter((row) => {
      const matchSearch = `${row.record_id} ${row.child_name}`.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || row.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [measurements, searchVal, statusFilter]);

  // ── Derived display state ───────────────────────────────
  const displayState = uiState === 'data'
    ? filtered.length === 0 ? 'empty-filtered' : 'data'
    : uiState;

  // ── Handlers ────────────────────────────────────────────
  const openAdd   = ()    => { setEditRow(null); setModalOpen(true); };
  const openEdit  = (row) => { setEditRow(row);  setModalOpen(true); };
  const closeModal = ()   => setModalOpen(false);
  const handleSaved = ()  => loadData();
  const resetFilters = () => { setSearchVal(''); setStatusFilter('All'); };

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
          onSearch={setSearchVal}
          onFilter={setStatusFilter}
          onAdd={openAdd}
          filteredCount={filtered.length}
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
              onRetry={loadData}
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
              message="No records match your current search or filter."
              onReset={resetFilters}
            />
          )}
          {displayState === 'data' && (
            <DataTable data={filtered} onEdit={openEdit} />
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
