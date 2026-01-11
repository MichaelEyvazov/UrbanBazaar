import React, { useContext, useEffect, useReducer, useState, useCallback} from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import ConfirmModal from '../components/ConfirmModal';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        products: action.payload.products || action.payload,
        page: action.payload.page || 1,
        pages: action.payload.pages || 1,
        error: '',
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true };
    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };
    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };
    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};

export default function ProductListScreen({ mode = 'admin' }) {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);
  const page = sp.get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  const [
    { loading, error, products = [], pages = 1, loadingDelete, successDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
    products: [],
    pages: 1,
  });

  const [confirm, setConfirm] = useState({ show: false, body: '', busy: false, onConfirm: null });

  const basePath = mode === 'seller' ? '/seller' : '/admin';
  const listPath = mode === 'seller' ? '/api/products/mine' : `/api/products/admin?page=${page}`;
  const editBasePath = `${basePath}/product`;

  const fetchData = useCallback(async () => {
    try {
      dispatch({ type: 'FETCH_REQUEST' });
      const { data } = await axios.get(listPath, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
    }
  }, [listPath, userInfo?.token]);

  useEffect(() => {
  if (!userInfo) return;
  if (successDelete) {
    dispatch({ type: 'DELETE_RESET' });
  }
  fetchData();
}, [userInfo, successDelete, fetchData]);

  const createHandler = () => {
    setConfirm({
      show: true,
      body: 'Create a new product?',
      confirmText: 'Go to Form',
      onConfirm: () => {
        setConfirm({ show: false });
        navigate(`${editBasePath}/create`);
      },
      onCancel: () => setConfirm({ show: false }),
    });
  };

  const askDelete = (product) =>
    setConfirm({
      show: true,
      body: `Delete product "${product.name}"?`,
      confirmText: 'Delete',
      onConfirm: async () => {
        try {
          setConfirm((c) => ({ ...c, busy: true }));
          dispatch({ type: 'DELETE_REQUEST' });
          await axios.delete(`/api/products/${product._id}`, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });
          toast.success('Product deleted successfully');
          dispatch({ type: 'DELETE_SUCCESS' });
        } catch (err) {
          toast.error(getError(err));
          dispatch({ type: 'DELETE_FAIL' });
        } finally {
          setConfirm({ show: false, body: '', onConfirm: null, busy: false });
        }
      },
      onCancel: () => setConfirm({ show: false, body: '', onConfirm: null }),
    });

  return (
    <div>
      <Row className="align-items-center">
        <Col><h1>{mode === 'seller' ? 'My Products' : 'Products'}</h1></Col>
        <Col className="text-end">
          <Button type="button" onClick={createHandler}>
            Create Product
          </Button>
        </Col>
      </Row>

      <ConfirmModal
        show={confirm.show}
        body={confirm.body}
        confirmText={confirm.confirmText || 'Confirm'}
        onConfirm={confirm.onConfirm}
        onCancel={confirm.onCancel}
        busy={!!confirm.busy}
      />

      {loadingDelete && <LoadingBox />}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : products.length === 0 ? (
        <MessageBox>No products found</MessageBox>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th style={{ minWidth: 160 }}>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th style={{ width: 220 }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p._id}</td>
                  <td>{p.name}</td>
                  <td>{p.price}</td>
                  <td>{p.category}</td>
                  <td>{p.brand}</td>
                  <td>
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => navigate(`${editBasePath}/${p._id}`)}
                    >
                      Edit
                    </Button>{' '}
                    <Button
                      type="button"
                      variant="light"
                      onClick={() => askDelete(p)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pages > 1 && (
            <div>
              {[...Array(pages).keys()].map((x) => (
                <Link
                  className={x + 1 === Number(page) ? 'btn text-bold' : 'btn'}
                  key={x + 1}
                  to={`${basePath}/products?page=${x + 1}`}
                >
                  {x + 1}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
