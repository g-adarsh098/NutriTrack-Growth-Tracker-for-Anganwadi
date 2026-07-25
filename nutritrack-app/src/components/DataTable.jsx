const BADGE_MAP = {
  Normal:      { cls: 'badge-normal',      label: 'Normal'      },
  Underweight: { cls: 'badge-underweight', label: 'Underweight' },
  MAM:         { cls: 'badge-mam',         label: 'MAM'         },
  SAM:         { cls: 'badge-sam',         label: 'SAM'         },
};

export default function DataTable({ data, onEdit }) {
  return (
    <>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Child Name</th>
              <th>Age (mo)</th>
              <th>Weight (kg)</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const badge = BADGE_MAP[row.status] ?? { cls: '', label: row.status };
              return (
                <tr key={row.record_id}>
                  <td className="record-id" data-label="Record ID">{row.record_id}</td>
                  <td className="child-name" data-label="Child Name">{row.child_name}</td>
                  <td className="age-cell"   data-label="Age (mo)">{row.age_months}</td>
                  <td className="weight-cell" data-label="Weight (kg)">
                    {row.weight_kg != null ? `${row.weight_kg} kg` : '—'}
                  </td>
                  <td data-label="Status">
                    <span className={`badge ${badge.cls}`}>
                      <span className="badge-dot" />
                      {badge.label}
                    </span>
                  </td>
                  <td data-label="Action">
                    <button
                      className="btn-icon"
                      onClick={() => onEdit(row)}
                      id={`edit-${row.record_id}`}
                    >
                      ✏️ Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <span>{data.length} record{data.length !== 1 ? 's' : ''} displayed</span>
        <span>NutriTrack · Anganwadi Growth Monitor</span>
      </div>
    </>
  );
}
