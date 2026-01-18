import React, { useContext } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import { Store } from '../Store';
import ThemeToggle from './ThemeToggle';
import UserAvatarCircle from '../components/UserAvatarCircle';

export default function Header({ onToggleSidebar }) {
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart, userInfo } = state;

    const signoutHandler = () => {
        ctxDispatch({ type: 'USER_SIGNOUT' });
        localStorage.removeItem('userInfo');
        localStorage.removeItem('shippingAddress');
        localStorage.removeItem('paymentMethod');
        window.location.href = '/signin';
    };

    return (
        <header>
            <Navbar bg="dark" variant="dark" expand="lg">
                <Container>
                    <Button variant="dark" onClick={onToggleSidebar}>
                        <i className="fas fa-bars" />
                    </Button>
                    <LinkContainer to="/">
                        <Navbar.Brand>UrbanBazaar</Navbar.Brand>
                    </LinkContainer>

                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <SearchBox />

                        {/* SELLER menu */}
                        {userInfo && (userInfo.isSeller) && (
                            <Nav className="ms-3">
                                <NavDropdown title="Seller" id="seller-nav-dropdown">
                                    <LinkContainer to="/seller/products">
                                        <NavDropdown.Item>My Products</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/seller/orders">
                                        <NavDropdown.Item>My Orders</NavDropdown.Item>
                                    </LinkContainer>
                                </NavDropdown>
                            </Nav>
                        )}

                        <Nav className="ms-auto">
                            <ThemeToggle />
                            <Nav className="me-3">
                                <Nav.Link as={Link} to="/about" className="nav-link">
                                    About
                                </Nav.Link>
                            </Nav>
                            <Link to="/cart" className="nav-link">
                                Cart{' '}
                                {cart.cartItems.length > 0 && (
                                    <Badge pill bg="danger">
                                        {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                                    </Badge>
                                )}
                            </Link>

                            {userInfo ? (
                                <NavDropdown
                                    id="user-nav-dropdown"
                                    title={
                                        <span className="d-inline-flex align-items-center gap-2">
                                            <UserAvatarCircle user={userInfo} size={28} />
                                            <span>{userInfo.name}</span>
                                        </span>
                                    }
                                >
                                    <LinkContainer to="/profile">
                                        <NavDropdown.Item>User Profile</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/orderhistory">
                                        <NavDropdown.Item>Order History</NavDropdown.Item>
                                    </LinkContainer>
                                    <NavDropdown.Divider />
                                    <Link className="dropdown-item" to="#signout" onClick={signoutHandler}>
                                        Sign Out
                                    </Link>
                                </NavDropdown>
                            ) : (
                                <Link className="nav-link" to="/signin">
                                    Sign In
                                </Link>
                            )}

                            {userInfo && userInfo.isAdmin && (
                                <NavDropdown title="Admin" id="admin-nav-dropdown">
                                    <LinkContainer to="/admin/dashboard">
                                        <NavDropdown.Item>Dashboard</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/admin/products">
                                        <NavDropdown.Item>Products</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/admin/orders">
                                        <NavDropdown.Item>Orders</NavDropdown.Item>
                                    </LinkContainer>
                                    <LinkContainer to="/admin/users">
                                        <NavDropdown.Item>Users</NavDropdown.Item>
                                    </LinkContainer>
                                </NavDropdown>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}