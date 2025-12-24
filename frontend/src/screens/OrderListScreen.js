import axios from 'axios';
import React, { useContext, useEffect, useReducer, useState } from 'react';
import { toast } from 'react-toastify';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import ConfirmModal from '../components/ConfirmModal';
import LoadingOverlay from '../components/LoadingOverlay';
import { Form } from 'react-bootstrap';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload || [] };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false, successDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};

export default function OrderListScreen({ mode = 'admin' }) {
  const navigate = useNavigate();
  const { state } = useContext(Store);
  const { userInfo } = state;

  const [
    { loading, error, orders = [], loadingDelete, successDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    orders: [],
    loadingDelete: false,
    successDelete: false,
  });

  const [confirm, setConfirm] = useState({ show: false, onYes: null, body: '' });

  const [filterStatus, setFilterStatus] = useState('all');

  const endpoint = mode === 'seller' ? '/api/orders/seller' : '/api/orders';

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [endpoint, userInfo?.token, successDelete]);

  const deleteHandler = async (order) => {
    try {
      dispatch({ type: 'DELETE_REQUEST' });
      await axios.delete(`/api/orders/${order._id}`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      toast.success('Order deleted successfully');
      dispatch({ type: 'DELETE_SUCCESS' });
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'DELETE_FAIL' });
    }
  };

  const askDelete = (order) =>
    setConfirm({
      show: true,
      body: `Delete order "${order._id}"?`,
      onYes: () => deleteHandler(order),
    });

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'paid') return !!order.isPaid;
    if (filterStatus === 'unpaid') return !order.isPaid;
    if (filterStatus === 'delivered') return !!order.isDelivered;
    if (filterStatus === 'notdelivered') return !order.isDelivered;
    return true;
  });

  return (
    <div>
      <h1 className="mb-3">{mode === 'seller' ? 'My Orders' : 'Orders'}</h1>

      <LoadingOverlay show={loadingDelete} text="Working..." />

      <ConfirmModal
        show={confirm.show}
        body={confirm.body}
        onCancel={() => setConfirm({ show: false, onYes: null, body: '' })}
        onConfirm={() => {
          confirm.onYes?.();
          setConfirm({ show: false, onYes: null, body: '' });
        }}
      />

      {/* Filter control */}
      <div className="mb-3" style={{ maxWidth: 260 }}>
        <Form.Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="delivered">Delivered</option>
          <option value="notdelivered">Not Delivered</option>
        </Form.Select>
      </div>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : filteredOrders.length === 0 ? (
        <div className="p-4 border rounded bg-light">
          <MessageBox>No orders found.</MessageBox>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th style={{ whiteSpace: 'nowrap' }}>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th style={{ width: 220 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.user ? order.user.name : 'DELETED USER'}</td>
                <td>{order.createdAt?.substring(0, 10)}</td>
                <td>{Number(order.totalPrice || 0).toFixed(2)}</td>
                <td>{order.isPaid ? order.paidAt?.substring(0, 10) : 'No'}</td>
                <td>{order.isDelivered ? order.deliveredAt?.substring(0, 10) : 'No'}</td>
                <td>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="me-2"
                  >
                    Details
                  </Button>
                  <Button
                    type="button"
                    variant="light"
                    onClick={() => askDelete(order)}
                    disabled={loadingDelete}
                  >
                    {loadingDelete ? <i className="fas fa-spinner fa-spin" /> : 'Delete'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
