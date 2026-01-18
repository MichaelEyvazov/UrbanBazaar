import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundScreen() {
  return (
    <div className="text-center py-5">
      <h1 className="display-5">404</h1>
      <p className="text-muted">The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="btn btn-primary mt-2">Back to Home</Link>
    </div>
  );
}
