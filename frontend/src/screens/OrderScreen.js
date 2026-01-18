import axios from 'axios';
import React, { useContext, useEffect, useReducer } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';
import { toast } from 'react-toastify';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, order: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'PAY_REQUEST':
      return { ...state, loadingPay: true };
    case 'PAY_SUCCESS':
      return { ...state, loadingPay: false, successPay: true };
    case 'PAY_FAIL':
      return { ...state, loadingPay: false };
    case 'PAY_RESET':
      return { ...state, loadingPay: false, successPay: false };

    case 'DELIVER_REQUEST':
      return { ...state, loadingDeliver: true };
    case 'DELIVER_SUCCESS':
      return { ...state, loadingDeliver: false, successDeliver: true };
    case 'DELIVER_FAIL':
      return { ...state, loadingDeliver: false };
    case 'DELIVER_RESET':
      return { ...state, loadingDeliver: false, successDeliver: false };

    default:
      return state;
  }
}

export default function OrderScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { id: orderId } = params;

  const { state } = useContext(Store);
  const { userInfo } = state;

  const [
    { loading, error, order, successPay, loadingPay, loadingDeliver, successDeliver },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: '',
    successPay: false,
    loadingPay: false,
    loadingDeliver: false,
    successDeliver: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: Number(order?.totalPrice || 0).toFixed(2) },
          },
        ],
      })
      .then((orderID) => orderID);
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: 'PAY_REQUEST' });
  
        const { data: result } = await axios.put(
          `/api/orders/${order._id}/pay`, 
          details,
          {
            headers: { authorization: `Bearer ${userInfo.token}` }, 
          }
        );
  
        dispatch({ type: 'PAY_SUCCESS', payload: result });
        toast.success('Order is paid');
      } catch (err) {
        dispatch({ type: 'PAY_FAIL' });
        toast.error(getError(err));
      }
    });
  }
  
  function onError(err) {
    toast.error(getError(err));
  }

  useEffect(() => {
    if (!userInfo) {
      navigate('/signin');
      return;
    }

    const fetchOrder = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
    
        const { data } = await axios.get(
          `/api/orders/${orderId}`, 
          {
            headers: { authorization: `Bearer ${userInfo.token}` }, 
          }
        );
    
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    
    const loadPaypalScript = async () => {
      try {
        const { data: clientId } = await axios.get('/api/keys/paypal');
        paypalDispatch({
          type: 'resetOptions',
          value: { 'client-id': clientId || 'sb', currency: 'USD' },
        });
        paypalDispatch({ type: 'setLoadingStatus', value: 'pending' });
      } catch (err) {
        console.error('Failed to load PayPal key:', err);
        toast.error('PayPal is not available right now');
      }
    };

    if (!order?._id || successPay || successDeliver || (order?._id && order._id !== orderId)) {
      fetchOrder();
      if (successPay) dispatch({ type: 'PAY_RESET' });
      if (successDeliver) dispatch({ type: 'DELIVER_RESET' });
    } else {
      loadPaypalScript();
    }
  }, [userInfo, orderId, order?._id, successPay, successDeliver, navigate, paypalDispatch]);

  async function deliverOrderHandler() {
    try {
      dispatch({ type: 'DELIVER_REQUEST' });
  
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`, 
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` }, 
        }
      );
  
      dispatch({ type: 'DELIVER_SUCCESS', payload: data });
      toast.success('Order is delivered');
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: 'DELIVER_FAIL' });
    }
  }
  

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : (
    <div>

  <h1 className="my-3">Order {orderId}</h1>

  <Row>
    <Col md={8}>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Shipping</Card.Title>
          <Card.Text>
            <strong>Name:</strong> {order?.shippingAddress?.fullName} <br />
            <strong>Address: </strong>
            {order?.shippingAddress?.address}, {order?.shippingAddress?.city},{' '}
            {order?.shippingAddress?.postalCode}, {order?.shippingAddress?.country}
            &nbsp;
            {order?.shippingAddress?.location?.lat && (
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://maps.google.com?q=${order.shippingAddress.location.lat},${order.shippingAddress.location.lng}`}
              >
                Show On Map
              </a>
            )}
          </Card.Text>

          {order?.isDelivered ? (
            <MessageBox variant="success">Delivered at {order.deliveredAt}</MessageBox>
          ) : (
            <MessageBox variant="danger">Not Delivered</MessageBox>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Payment</Card.Title>
          <Card.Text>
            <strong>Method:</strong> {order?.paymentMethod}
          </Card.Text>
          {order?.isPaid ? (
            <MessageBox variant="success">Paid at {order.paidAt}</MessageBox>
          ) : (
            <MessageBox variant="danger">Not Paid</MessageBox>
          )}
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Items</Card.Title>
          <ListGroup variant="flush">
            {(order?.orderItems || []).map((item, idx) => (
              <ListGroup.Item
                key={item._id || item.product || `${item.slug || item.name}-${idx}`}
              >
                <Row className="align-items-center">
                  <Col md={6}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="img-fluid rounded img-thumbnail"
                      style={{ maxWidth: 60 }}
                    />{' '}
                    <Link to={`/product/${item.slug}`}>{item.name}</Link>
                  </Col>
                  <Col md={3}>
                    <span>{item.quantity}</span>
                  </Col>
                  <Col md={3}>${Number(item.price || 0).toFixed(2)}</Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </Col>

    <Col md={4}>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Order Summary</Card.Title>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <Row>
                <Col>Items</Col>
                <Col>${Number(order?.itemsPrice || 0).toFixed(2)}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col>Shipping</Col>
                <Col>${Number(order?.shippingPrice || 0).toFixed(2)}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col>Tax</Col>
                <Col>${Number(order?.taxPrice || 0).toFixed(2)}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col>
                  <strong>Order Total</strong>
                </Col>
                <Col>
                  <strong>${Number(order?.totalPrice || 0).toFixed(2)}</strong>
                </Col>
              </Row>
            </ListGroup.Item>

            {!order?.isPaid && (
              <ListGroup.Item>
                {isPending ? (
                  <LoadingBox />
                ) : (
                  <div>
                    <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                    />
                  </div>
                )}
                {loadingPay && <LoadingBox />}
              </ListGroup.Item>
            )}

            {userInfo?.isAdmin && order?.isPaid && !order?.isDelivered && (
              <ListGroup.Item>
                {loadingDeliver && <LoadingBox />}
                <div className="d-grid">
                  <Button type="button" onClick={deliverOrderHandler}>
                    Deliver Order
                  </Button>
                </div>
              </ListGroup.Item>
            )}
          </ListGroup>
        </Card.Body>
      </Card>
    </Col>
  </Row>
</div>
  );
}