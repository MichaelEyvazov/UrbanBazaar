import React from 'react';

export default function SellerInfo({ seller, inline = false }) {
  if (!seller) return <span className="text-muted" style={{ fontSize: 15, margin: 10}}>UrbanBazaar</span>;

  const content = (
    <>
      Sold by <strong>{seller.name || 'Seller'}</strong>
    </>
  );

  return inline ? (
    <span className="text-muted" >
      {content}
    </span>
  ) : (
    <div className="text-muted mb-1">
      {content}
    </div>
  );
}
