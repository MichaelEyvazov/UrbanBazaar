import React from 'react';
import { Link } from 'react-router-dom';

export default function SoldByBadge({ seller }) {
  if (!seller) return null;
  return (
    <div className="sold-by-badge">
      <small>
        Sold by{' '}
        <Link to={`/seller/${seller._id}`} className="seller-link">
          {seller.name}
        </Link>
      </small>
    </div>
  );
}