/**
 * StatsBar — summary cards showing record counts by status
 * Props:
 *   measurements: array of all (unfiltered) measurement objects
 */
export default function StatsBar({ measurements }) {
  const total  = measurements.length;
  const normal = measurements.filter(r => r.status === 'Normal').length;
  const uw     = measurements.filter(r => r.status === 'Underweight').length;
  const mam    = measurements.filter(r => r.status === 'MAM').length;
  const sam    = measurements.filter(r => r.status === 'SAM').length;

  const cards = [
    { cls: 'total',  icon: '📋', value: total,  label: 'Total Records'  },
    { cls: 'normal', icon: '✅', value: normal, label: 'Normal'         },
    { cls: 'uw',     icon: '⚠️', value: uw,     label: 'Underweight'   },
    { cls: 'mam',    icon: '🔴', value: mam,    label: 'MAM'           },
    { cls: 'sam',    icon: '🚨', value: sam,    label: 'SAM (Critical)' },
  ];

  return (
    <div className="stats-row">
      {cards.map(({ cls, icon, value, label }) => (
        <div key={cls} className={`stat-card ${cls}`}>
          <span className="stat-icon">{icon}</span>
          <div className="stat-value">{value}</div>
          <div className="stat-label">{label}</div>
        </div>
      ))}
    </div>
  );
}
