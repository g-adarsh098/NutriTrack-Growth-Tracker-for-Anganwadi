export default function AppLoader({ hidden }) {
  return (
    <div className={`app-loader${hidden ? ' hidden' : ''}`} aria-hidden={hidden}>
      <div className="loader-content">
        <div className="loader-logo">
          <img src="/favicon.png" alt="NutriTrack" className="loader-favicon" />
        </div>
        <div className="loader-brand">NutriTrack</div>
        <p className="loader-tagline">Anganwadi Growth Monitor · Ministry of WCD</p>
        <div className="loader-ring" />
        <p className="loader-status">Connecting to database…</p>
      </div>
    </div>
  );
}
