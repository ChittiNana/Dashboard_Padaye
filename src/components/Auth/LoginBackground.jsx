import { loginBackgroundRows } from '../../config/loginBackground';

// Enough tiles in one "set" that the set is wider than a large screen; the track holds the set twice and slides by
// exactly one set (-50%), so the loop is seamless.
const MIN_TILES_PER_SET = 6;

function buildSet(items) {
  if (!items.length) return [];
  const repeats = Math.ceil(MIN_TILES_PER_SET / items.length);
  return Array.from({ length: repeats }, () => items).flat();
}

function Tile({ item }) {
  return (
    <div className="login-bg-tile">
      {item.type === 'video' ? (
        <video src={item.src} poster={item.poster} muted loop autoPlay playsInline preload="metadata" />
      ) : (
        <img src={item.src} alt="" loading="lazy" draggable="false" />
      )}
    </div>
  );
}

// Decorative only (hidden from assistive tech); sits behind the login panels.
export default function LoginBackground() {
  return (
    <div className="login-bg" aria-hidden="true">
      {loginBackgroundRows.map((row, i) => {
        const set = buildSet(row.items);
        return (
          <div
            key={i}
            className={`login-bg-row${row.direction === 'right' ? ' login-bg-row--right' : ''}`}
            style={{ '--login-bg-duration': `${row.durationSeconds || 60}s` }}
          >
            <div className="login-bg-track">
              {[...set, ...set].map((item, j) => <Tile key={j} item={item} />)}
            </div>
          </div>
        );
      })}
      <div className="login-bg-overlay" />
    </div>
  );
}
