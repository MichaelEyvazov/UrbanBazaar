import React, { useContext, useEffect, useReducer } from 'react';
import Chart from 'react-google-charts';
import axios from 'axios';
import { Store } from '../Store';
import { getError } from '../utils';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

const initialSummary = {
  users: [{ numUsers: 0 }],
  orders: [{ numOrders: 0, totalSales: 0 }],
  dailyOrders: [],
  productCategories: [],
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        error: '',
        summary: {
          users: action.payload?.users?.length ? action.payload.users : [{ numUsers: 0 }],
          orders: action.payload?.orders?.length ? action.payload.orders : [{ numOrders: 0, totalSales: 0 }],
          dailyOrders: action.payload?.dailyOrders ?? [],
          productCategories: action.payload?.productCategories ?? [],
        },
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload, summary: initialSummary };
    default:
      return state;
  }
};

export default function DashboardScreen() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    summary: initialSummary, 
  });

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get('/api/orders/summary', {
          headers: { Authorization: `Bearer ${userInfo.token}` }, // חשוב: אדמין
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);


  const numUsers   = summary?.users?.[0]?.numUsers ?? 0;
  const numOrders  = summary?.orders?.[0]?.numOrders ?? 0;
  const totalSales = summary?.orders?.[0]?.totalSales ?? 0;

  const dailyData = (summary?.dailyOrders ?? []).map((x) => [x._id, x.sales]);
  const categoryData = (summary?.productCategories ?? []).map((x) => [x._id, x.count]);

  return (
    <div>
      <h1>Dashboard</h1>

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <>
          <Row>
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>{numUsers}</Card.Title>
                  <Card.Text>Users</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>{numOrders}</Card.Title>
                  <Card.Text>Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>${Number(totalSales).toFixed(2)}</Card.Title>
                  <Card.Text>Sales</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <div className="my-3">
            <h2>Sales</h2>
            {(summary?.dailyOrders?.length ?? 0) === 0 ? (
              <MessageBox>No Sale</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="AreaChart"
                loader={<div>Loading Chart...</div>}
                data={[['Date', 'Sales'], ...dailyData]}
              />
            )}
          </div>

          <div className="my-3">
            <h2>Categories</h2>
            {(summary?.productCategories?.length ?? 0) === 0 ? (
              <MessageBox>No Category</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="PieChart"
                loader={<div>Loading Chart...</div>}
                data={[['Category', 'Products'], ...categoryData]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
