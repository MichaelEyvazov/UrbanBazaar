import React from 'react';

export default function Rating({ rating, numReviews, caption }) {
  return (
    <div className="rating d-flex align-items-center">
      <span className="me-2">
        {'★'.repeat(Math.round(rating))}{' '}
        {'☆'.repeat(5 - Math.round(rating))}
      </span>
      {caption ? (
        <span>{caption}</span>
      ) : numReviews !== undefined ? (
        <span>{numReviews} reviews</span>
      ) : null}
    </div>
  );
}