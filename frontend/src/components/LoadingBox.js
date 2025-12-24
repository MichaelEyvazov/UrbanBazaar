import '../styles/loading.css';

export default function LoadingBox() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 0',
      }}
    >
      <div className="loader" aria-label="Loading">
        Loading...
      </div>
    </div>
  );
}
