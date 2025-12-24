import React, { useContext, useEffect, useReducer, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'UPLOAD_REQUEST':
      return { ...state, loadingUpload: true };
    case 'UPLOAD_SUCCESS':
      return { ...state, loadingUpload: false };
    case 'UPLOAD_FAIL':
      return { ...state, loadingUpload: false };

    case 'SUBMIT_REQUEST':
      return { ...state, loadingSubmit: true };
    case 'SUBMIT_SUCCESS':
      return { ...state, loadingSubmit: false };
    case 'SUBMIT_FAIL':
      return { ...state, loadingSubmit: false };

    default:
      return state;
  }
};

export default function ProductEditScreen(props) {
  const navigate = useNavigate();
  const params = useParams();
  const productIdFromUrl = params.id;
  const isCreate = !productIdFromUrl;

  const { state } = useContext(Store);
  const { userInfo } = state;

  const [{ loading, error, loadingUpload, loadingSubmit }, dispatch] =
    useReducer(reducer, {
      loading: !isCreate, 
      error: '',
      loadingUpload: false,
      loadingSubmit: false,
    });

  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [images, setImages] = useState([]); 
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');

 
  useEffect(() => {
    const fetchData = async () => {
      if (isCreate) return; 
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/products/${productIdFromUrl}`);
        setName(data.name || '');
        setSlug(data.slug || '');
        setPrice(data.price ?? '');
        setImage(data.image || '');
        setImages(Array.isArray(data.images) ? data.images : []);
        setCategory(data.category || '');
        setBrand(data.brand || '');
        setCountInStock(data.countInStock ?? '');
        setDescription(data.description || '');
        dispatch({ type: 'FETCH_SUCCESS' });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [productIdFromUrl, isCreate]);

  
  const uploadFileHandler = async (e) => {
    const file = e.target.files && e.target.files[0];
    const formData = new FormData();
    if (!file) return;
    try {
      dispatch({ type: 'UPLOAD_REQUEST' });
      formData.append('file', file); 
      const { data } = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
      
      setImage(data.url || data.secure_url || data.path || image);
      dispatch({ type: 'UPLOAD_SUCCESS' });
      toast.success('Image uploaded');
    } catch (err) {
      dispatch({ type: 'UPLOAD_FAIL' });
      toast.error(getError(err));
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    if (!name || !slug) {
      toast.error('Please fill name and slug');
      return;
    }
    try {
      dispatch({ type: 'SUBMIT_REQUEST' });

      const body = {
        name,
        slug,
        price: Number(price) || 0,
        image: image || '/images/p1.jpg',
        images,
        category,
        brand,
        countInStock: Number(countInStock) || 0,
        description,
      };

      if (isCreate) {
        await axios.post('/api/products', body, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Product created');
      } else {
        await axios.put(`/api/products/${productIdFromUrl}`, body, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        toast.success('Product updated');
      }

      dispatch({ type: 'SUBMIT_SUCCESS' });

      
      if (userInfo.isSeller && !userInfo.isAdmin) {
        navigate('/seller/products');
      } else {
        navigate('/admin/products');
      }
    } catch (err) {
      dispatch({ type: 'SUBMIT_FAIL' });
      toast.error(getError(err));
    }
  };

  return (
    <div>
      <h1 className="my-3">{isCreate ? 'Create Product' : 'Edit Product'}</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <Card className="p-3">
          <Form onSubmit={submitHandler}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="slug">
                  <Form.Label>Slug</Form.Label>
                  <Form.Control
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="price">
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="category">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="brand">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="countInStock">
                  <Form.Label>Count In Stock</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="image">
                  <Form.Label>Main Image</Form.Label>
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Control
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="/images/p1.jpg or upload below"
                    />
                    <Form.Control type="file" onChange={uploadFileHandler} />
                  </div>
                  {loadingUpload && <LoadingBox className="mt-2" />}
                  {!!image && (
                    <div className="mt-2">
                      <img
                        src={image}
                        alt="preview"
                        style={{ maxWidth: 180, borderRadius: 6 }}
                      />
                    </div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid">
              <Button type="submit" disabled={loadingSubmit}>
                {loadingSubmit ? 'Saving…' : isCreate ? 'Confirm' : 'Update'}
              </Button>
            </div>
          </Form>
        </Card>
      )}
    </div>
  );
}