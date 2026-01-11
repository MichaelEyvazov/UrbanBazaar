import React, { useEffect, useReducer } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Rating from '../components/Rating';
import MessageBox from '../components/MessageBox';
import Button from 'react-bootstrap/Button';


const PAGE_SIZE = 6;
const prices = [
  { name: 'Any', value: 'all' },
  { name: '$1 to $50', value: '1-50' },
  { name: '$51 to $200', value: '51-200' },
  { name: '$201 to $1000', value: '201-1000' },
];

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST': return { ...state, loading: true };
    case 'FETCH_SUCCESS': return { ...state, loading: false, ...action.payload };
    case 'FETCH_FAIL': return { ...state, loading: false, error: action.payload };
    case 'CATS_SUCCESS': return { ...state, categories: action.payload };
    default: return state;
  }
};

export default function SearchScreen() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sp = new URLSearchParams(search);

  const query = sp.get('query') || 'all';
  const category = sp.get('category') || 'all';
  const price = sp.get('price') || 'all';
  const rating = sp.get('rating') || 'all';
  const order = sp.get('order') || 'newest';
  const page = Number(sp.get('page') || 1);

  const [{ loading, error, products = [], countProducts = 0, pages = 0, categories = [] }, dispatch] =
    useReducer(reducer, { loading: true, products: [], categories: [] });

  const getFilterUrl = (filter) => {
    const f = {
      query,
      category,
      price,
      rating,
      order,
      page,
      ...filter,
    };
    const params = new URLSearchParams();
    if (f.query && f.query !== 'all') params.set('query', f.query);
    if (f.category && f.category !== 'all') params.set('category', f.category);
    if (f.price && f.price !== 'all') params.set('price', f.price);
    if (f.rating && f.rating !== 'all') params.set('rating', f.rating);
    if (f.order && f.order !== 'newest') params.set('order', f.order);
    if (f.page && f.page !== 1) params.set('page', f.page);
    return `/search?${params.toString()}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(
          `/api/products/search?query=${query}&category=${category}&price=${price}&rating=${rating}&order=${order}&page=${page}&pageSize=${PAGE_SIZE}`
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products/categories');
        dispatch({ type: 'CATS_SUCCESS', payload: data });
      } catch (e) {  }
    };
    fetchCategories();
    fetchData();
  }, [query, category, price, rating, order, page]);

  return (
    <div className="row">
      <div className="col-md-3">
        <h5>Department</h5>
        <ul className="list-unstyled">
          <li><Link className={category === 'all' ? 'fw-bold' : ''} to={getFilterUrl({ category: 'all', page: 1 })}>Any</Link></li>
          {categories.map((c) => (
            <li key={c}><Link className={category === c ? 'fw-bold' : ''} to={getFilterUrl({ category: c, page: 1 })}>{c}</Link></li>
          ))}
        </ul>

        <h5>Price</h5>
        <ul className="list-unstyled">
          {prices.map((p) => (
            <li key={p.value}><Link className={price === p.value ? 'fw-bold' : ''} to={getFilterUrl({ price: p.value, page: 1 })}>{p.name}</Link></li>
          ))}
        </ul>

        <h5>Avg. Customer Review</h5>
        <ul className="list-unstyled">
          <select
            value={rating || 'all'}
            onChange={(e) => navigate(getFilterUrl({ rating: e.target.value }))}
            className="form-select"
          >
            <option value="all">Any rating</option>
            <option value="4">4★ & up</option>
            <option value="3">3★ & up</option>
            <option value="2">2★ & up</option>
            <option value="1">1★ & up</option>
          </select>
        </ul>
      </div>

      <div className="col-md-9">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div><strong>{countProducts}</strong> Results</div>
          <div>
            Sort by:{' '}
            <select
              value={order}
              onChange={(e) => navigate(getFilterUrl({ order: e.target.value, page: 1 }))}
              className="form-select d-inline-block w-auto"
            >
              <option value="newest">Newest</option>
              <option value="lowest">Price: Low to High</option>
              <option value="highest">Price: High to Low</option>
              <option value="toprated">Top Rated</option>
            </select>
            <Button
              variant="outline-secondary"
              size="sm"
              className="ms-2"
              onClick={() => navigate('/search')}
            >
              Clear filters
            </Button>
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-4 border rounded bg-light">
            <MessageBox variant="danger">No products match your filters. Try clearing filters.</MessageBox>
          </div>
        ) : (
          <div>
            <div className="row g-3">
              {products.map((p) => (
                <div className="col-sm-6 col-lg-4" key={p._id}>
                  <div className="card h-100">
                    <img src={p.image} className="card-img-top" alt={p.name} />
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title">{p.name}</h6>
                      <div className="mb-2"><Rating rating={p.rating} /> ({p.numReviews || 0})</div>
                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <span className="fw-bold">${p.price}</span>
                        <Link className="btn btn-sm btn-outline-primary" to={`/product/${p.slug}`}>Details</Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <nav className="mt-3">
              <ul className="pagination">
                {[...Array(pages).keys()].map((x) => (
                  <li key={x + 1} className={`page-item ${Number(page) === x + 1 ? 'active' : ''}`}>
                    <Link className="page-link" to={getFilterUrl({ page: x + 1 })}>{x + 1}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );

}