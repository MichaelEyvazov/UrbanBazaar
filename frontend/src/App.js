import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Layout from './layout/Layout';
import AppRoutes from './routes/AppRoutes';
import { useContext, useEffect } from 'react';
import { Store } from './Store';
import './styles/index.js';

export default function App() {
  const { state } = useContext(Store);
  const { theme } = state;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = theme;
  }, [theme]);

  return (
    <BrowserRouter>
      <Layout>
        <AppRoutes />
      </Layout>
    </BrowserRouter>
  );
}