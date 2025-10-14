import React from 'react';

export default function LoadingOverlay({ show = false, text = 'Loading...' }) {
  if (!show) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        backdropFilter: 'blur(1px)',
      }}
    >
      <div
        style={{
          background: 'white',
          padding: '16px 20px',
          borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,.2)',
          fontWeight: 600,
        }}
      >
        {text}
      </div>
    </div>
  );
}
