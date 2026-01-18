import React, { useContext } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Store } from '../Store';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

export default function SellerRoute({ children }) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  const navigate = useNavigate();

  if (!userInfo) return <Navigate to="/signin" />;

  if (userInfo.isSeller) return children;

  if (userInfo.isAdmin) {
    return (
      <div className="container small-container mt-5">
        <Alert variant="info" className="mb-4">
          <strong>Heads up!</strong> Admins should manage orders from the{' '}
          <strong>Admin Dashboard</strong>.
        </Alert>

        <Modal show centered>
          <Modal.Header>
            <Modal.Title>Admins manage orders elsewhere</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            This page is for <strong>Sellers</strong>. As an Admin, please use the Admin Orders page.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
            <Button variant="primary" onClick={() => navigate('/admin/orders')}>
              Go to Admin Orders
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  return (
    <div className="container small-container mt-5">
      <Alert variant="warning">
        <strong>Access Restricted.</strong> This page is available to Sellers only.
      </Alert>
    </div>
  );
}
