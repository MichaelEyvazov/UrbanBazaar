import React, { useContext, useEffect, useReducer, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { toast } from 'react-toastify';

import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Rating from '../components/Rating';
import SellerInfo from '../components/SellerInfo';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, product: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function ProductScreen() {
  const navigate = useNavigate();
  const params = useParams();
  const { slug } = params;

  const [{ loading, error, product }, dispatch] = useReducer(reducer, {
    product: null,
    loading: true,
    error: '',
  });

  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { userInfo, cart } = state;

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [loadingReview, setLoadingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(`/api/products/slug/${slug}`);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
        setQty(1);
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [slug]);

  const addToCartHandler = async () => {
    const existItem = cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + qty : qty;
    if (quantity > product.countInStock) {
      toast.error('Sorry. Product is out of stock');
      return;
    }
    ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    navigate('/cart');
  };

  const submitReviewHandler = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      toast.error('Please select rating and enter a comment.');
      return;
    }
    try {
      setLoadingReview(true);
      const { data } = await axios.post(
        `/api/products/${product._id}/reviews`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      const newReviews = [...(product.reviews || []), data.review];
      const updated = {
        ...product,
        reviews: newReviews,
        numReviews: data.numReviews,
        rating: data.rating,
      };
      dispatch({ type: 'FETCH_SUCCESS', payload: updated });
      setRating('');
      setComment('');
      toast.success('Review submitted');
    } catch (err) {
      toast.error(getError(err));
    } finally {
      setLoadingReview(false);
    }
  };

  return loading ? (
    <LoadingBox />
  ) : error ? (
    <MessageBox variant="danger">{error}</MessageBox>
  ) : !product ? (
    <MessageBox>Product not found</MessageBox>
  ) : (
    <div>
    <SEO title={product.name} />
      <Row className="mt-3">
        <Col md={5} className="mb-3">
          <img
            className="img-large"
            src={product.image}
            alt={product.name}
            style={{ width: '100%', borderRadius: 12 }}
          />
        </Col>

        <Col md={7}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h1 className="mb-1">{product.name}</h1>
              <Rating rating={product.rating || 0} numReviews={product.numReviews || 0} />
              {product.numReviews === 0 && (
                <div className="text-muted small">No reviews yet</div>
              )}
              <SellerInfo seller={product.seller} />
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Price:</strong> ${product.price}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>Description:</strong>
              <div className="text-muted">{product.description}</div>
            </ListGroup.Item>
            <ListGroup.Item>
              <Row>
                <Col>Status:</Col>
                <Col>{product.countInStock > 0 ? 'In Stock' : 'Unavailable'}</Col>
              </Row>
            </ListGroup.Item>
            <ListGroup.Item>
              {product.countInStock > 0 && (
                <div className="d-grid">
                  <Button
                    variant="primary"
                    onClick={addToCartHandler}
                    disabled={product.countInStock === 0}
                  >
                    Add to Cart
                  </Button>
                </div>
              )}
            </ListGroup.Item>
          </ListGroup>

          <div className="mt-4">
            <h4>Customer Reviews</h4>
            {(!product.reviews || product.reviews.length === 0) ? (
              <MessageBox>No reviews yet.</MessageBox>
            ) : (
              <ListGroup variant="flush" className="mb-4">
                {product.reviews.map((rev) => (
                  <ListGroup.Item key={rev._id}>
                    <strong>{rev.name}</strong>{' '}
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : ''}
                    </span>
                    <div className="mt-1">
                      <Rating rating={rev.rating} caption={`${rev.rating}/5`} />
                    </div>
                    <div>{rev.comment}</div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}

            <h5>Write a Review</h5>
            {!userInfo ? (
              <MessageBox>
                Please <a href="/signin">sign in</a> to write a review.
              </MessageBox>
            ) : (
              <Form onSubmit={submitReviewHandler}>
                <Form.Group className="mb-3" controlId="rating">
                  <Form.Label>Rating</Form.Label>
                  <Form.Select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    required
                  >
                    <option value="">Select...</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Good</option>
                    <option value="4">4 - Very Good</option>
                    <option value="5">5 - Excellent</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3" controlId="comment">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </Form.Group>
                <Button type="submit" disabled={loadingReview}>
                  {loadingReview ? <i className="fas fa-spinner fa-spin" /> : 'Submit'}
                </Button>
              </Form>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}