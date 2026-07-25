/** Top sticky navigation bar with NutriTrack branding and live indicator */
export default function TopBar({ lastUpdated }) {
  return (
    <nav className="topbar">
      <div className="topbar-brand">
        <div className="topbar-icon">
          <img
            src="/favicon.png"
            alt="NutriTrack Logo"
            className="topbar-favicon"
          />
        </div>
        <div>
          <div className="topbar-name">NutriTrack</div>
          <div className="topbar-sub">Anganwadi Growth Monitor</div>
        </div>
      </div>
      <div className="topbar-right">
        {lastUpdated && (
          <span className="live-dot">{lastUpdated}</span>
        )}
      </div>
    </nav>
  );
}
