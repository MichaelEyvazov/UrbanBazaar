import React, { useEffect, useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import { LinkContainer } from 'react-router-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { getError } from '../utils';

export default function Sidebar({ open, onClose }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get('/api/products/categories');
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);

  const wrapperClass = open
    ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
    : 'side-navbar d-flex justify-content-between flex-wrap flex-column';

  return (
    <div className={wrapperClass}>
      <Nav className="flex-column text-white w-100 p-2">
        <Nav.Item>
          <strong>Categories</strong>
        </Nav.Item>
        {categories.map((category) => (
          <Nav.Item key={category}>
            <LinkContainer
              to={{ pathname: '/search', search: `category=${category}` }}
              onClick={onClose}
            >
              <Nav.Link>{category}</Nav.Link>
            </LinkContainer>
          </Nav.Item>
        ))}
      </Nav>
    </div>
  );
}