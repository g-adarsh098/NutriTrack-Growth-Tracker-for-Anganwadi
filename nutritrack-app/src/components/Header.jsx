export default function Header({ searchVal, statusFilter, onSearch, onFilter, onAdd, filteredCount, totalCount }) {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h1>Growth Measurements</h1>
        <p className="subtitle">
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> records
        </p>
      </div>

      <div className="controls-bar">
        <input
          id="searchInput"
          className="input"
          type="text"
          placeholder="🔍  Search name or ID…"
          value={searchVal}
          onChange={(e) => onSearch(e.target.value)}
        />

        <select
          id="statusFilter"
          className="select"
          value={statusFilter}
          onChange={(e) => onFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Normal">✅  Normal</option>
          <option value="Underweight">⚠️  Underweight</option>
          <option value="MAM">🔴  MAM</option>
          <option value="SAM">🚨  SAM</option>
        </select>

        <button id="addRecordBtn" className="btn-primary" onClick={onAdd}>
          + Add / Update Record
        </button>
      </div>
    </div>
  );
}
