import React, { useState, useContext } from 'react';
import Container from 'react-bootstrap/Container';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { Store } from '../Store';

export default function Layout({ children }) {
  const { state } = useContext(Store);
  const { fullBox } = state;
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

  const containerClass = sidebarIsOpen
    ? fullBox
      ? 'site-container active-cont d-flex flex-column full-box'
      : 'site-container active-cont d-flex flex-column'
    : fullBox
    ? 'site-container d-flex flex-column full-box'
    : 'site-container d-flex flex-column';

  return (
    <div className={containerClass}>
      <ToastContainer position="bottom-center" limit={1} />
      <Header onToggleSidebar={() => setSidebarIsOpen(!sidebarIsOpen)} />
      <Sidebar open={sidebarIsOpen} onClose={() => setSidebarIsOpen(false)} />
      <main>
        <Container className="mt-3">{children}</Container>
      </main>
      <Footer />
    </div>
  );
}