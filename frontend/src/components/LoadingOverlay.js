import '../styles/loading.css';

export default function LoadingOverlay({ show = false, text }) {
  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div className="loader" aria-label="Loading">
        Loading...
      </div>

      {text && (
        <div
          style={{
            marginTop: 16,
            color: 'white',
            fontWeight: 600,
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}
