import React from 'react';
import SEO from '../components/SEO';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';

export default function AboutScreen() {
  return (
    <div className="my-3">
    <SEO
    description="About UrbanBazaar – an e-commerce marketplace platform built with React, Node.js, and MongoDB."
  />

      <Card className="ub-card mb-4">
        <Card.Body>
          <h1 className="mb-2">About UrbanBazaar</h1>
          <p className="text-muted-ub mb-0">
            <strong>UrbanBazaar</strong> is a full-stack e-commerce web
            application inspired by modern marketplace platforms like Amazon.
            It allows customers to browse and purchase products, sellers to
            manage their own inventory, and administrators to control the
            system through a secure management interface.
            <br />
            The project demonstrates a real-world implementation of a scalable
            MERN (MongoDB, Express, React, Node.js) architecture, combining user
            authentication, data persistence, payment processing, and responsive
            design.
          </p>
        </Card.Body>
      </Card>

      <Row className="g-3">
        <Col md={8}>
          
          <Card className="ub-card mb-3">
            <Card.Body>
              <h4 className="mb-3">How UrbanBazaar Works</h4>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Visitors & Customers:</strong> can explore products,
                  filter by category, add items to the cart, and complete secure
                  checkout using PayPal.
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Sellers:</strong> can log in to their dashboard under
                  the <em>Seller</em> menu, where they can create, edit, and
                  delete products they own, and track orders that include their
                  items.
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>Administrators:</strong> have access to the{' '}
                  <em>Admin Dashboard</em> where they can manage users,
                  products, and orders across the platform.
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="ub-card mb-3">
            <Card.Body>
              <h4 className="mb-3">System Architecture & Integration</h4>
              <Accordion alwaysOpen>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Authentication & Roles (JWT)</Accordion.Header>
                  <Accordion.Body className="text-muted-ub">
                    The system uses JSON Web Tokens for authentication. After
                    signing in, each user receives a token which is validated on
                    every protected API call. Role-based middlewares (like{' '}
                    <code>isAdmin</code> and <code>isSeller</code>) ensure that
                    only authorized users can perform restricted actions.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1">
                  <Accordion.Header>Product Management & File Uploads</Accordion.Header>
                  <Accordion.Body className="text-muted-ub">
                    Sellers can upload product images via an integrated{' '}
                    <code>/api/upload</code> endpoint that supports both local
                    storage and cloud uploads (Cloudinary). Each product is
                    linked to its seller through the <code>seller</code> field.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                  <Accordion.Header>Payments & Email Notifications</Accordion.Header>
                  <Accordion.Body className="text-muted-ub">
                    The checkout flow uses PayPal for secure transactions.
                    After payment confirmation, an email receipt is sent to the
                    user via Brevo or Mailgun integration. Admins can also mark
                    orders as delivered or paid manually.
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3">
                  <Accordion.Header>User Experience & Design</Accordion.Header>
                  <Accordion.Body className="text-muted-ub">
                    The interface is styled using Bootstrap 5 and a custom theme
                    called <strong>Urban Blue</strong>, providing a clean and
                    modern look. The app supports dynamic content, toast
                    notifications, and persistent user preferences such as theme
                    and shopping cart via localStorage.
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Card.Body>
          </Card>

          <Card className="ub-card mb-3">
            <Card.Body>
              <h4 className="mb-3">Security & Accessibility</h4>
              <ul className="mb-0 text-muted-ub">
                <li>
                  <strong>Password Protection:</strong> Passwords are encrypted
                  using bcrypt before being stored in MongoDB.
                </li>
                <li>
                  <strong>Authorization:</strong> Sensitive routes are
                  protected via JWT tokens and server-side middleware.
                </li>
                <li>
                  <strong>Accessibility:</strong> All major components follow
                  WCAG standards; labels, color contrast, and keyboard
                  navigation are supported.
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="ub-card mb-3">
            <Card.Body>
              <h4 className="mb-3">Tech Stack</h4>
              <ul className="text-muted-ub mb-0">
                <li>Frontend: React, React Router, Bootstrap 5</li>
                <li>Backend: Node.js, Express.js</li>
                <li>Database: MongoDB (Mongoose ODM)</li>
                <li>Auth: JWT (JSON Web Token)</li>
                <li>Payments: PayPal SDK</li>
                <li>File Uploads: Multer + Cloudinary</li>
                <li>Emails: Brevo / Mailgun API</li>
                <li>Hosting: Render / Vercel / MongoDB Atlas</li>
              </ul>
            </Card.Body>
          </Card>

          <Card className="ub-card">
            <Card.Body>
              <h4 className="mb-3">Contact</h4>
              <p className="text-muted-ub mb-2">
                For support, feedback, or bug reports, please contact:
              </p>
              <ul className="mb-0">
                <li>
                  Email:{' '}
                  <a className="link-ub" href="mailto:support@urbanbazaar.dev">
                    support@urbanbazaar.dev
                  </a>
                </li>
                <li>
                  GitHub:{' '}
                  <a
                    className="link-ub"
                    href="https://github.com/MichaelEyvazov/urbanbazaar"
                    target="_blank"
                    rel="noreferrer"
                  >
                    github.com/MichaelEyvazov/urbanbazaar
                  </a>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
