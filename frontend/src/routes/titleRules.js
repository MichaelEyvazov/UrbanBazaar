export const BRAND = 'UrbanBazaar';

export const titleRules = [
  // Public
  { path: '/', title: 'Home' },
  { path: '/about', title: 'About' },
  { path: '/search', title: 'Search' },
  { path: '/cart', title: 'Shopping Cart' },
  { path: '/signin', title: 'Sign In' },
  { path: '/signup', title: 'Sign Up' },
  { path: '/forget-password', title: 'Forget Password' },
  { path: '/reset-password/:token', title: 'Reset Password' },

  // Product / Orders
  { path: '/product/:slug', title: (p) => `Product ${p.slug}` },
  { path: '/order/:id', title: (p) => `Order ${p.id}` },
  { path: '/orderhistory', title: 'Order History' },

  // Checkout
  { path: '/shipping', title: 'Shipping Address' },
  { path: '/payment', title: 'Payment Method' },
  { path: '/placeorder', title: 'Preview Order' },

  // Admin
  { path: '/admin/dashboard', title: 'Admin Dashboard' },
  { path: '/admin/orders', title: 'Orders' },
  { path: '/admin/products', title: 'Products' },
  { path: '/admin/product/new', title: 'Create Product' },
  { path: '/admin/product/create', title: 'Create Product' },
  { path: '/admin/product/:id', title: (p) => `Edit Product ${p.id}` },
  { path: '/admin/users', title: 'Users' },
  { path: '/admin/user/:id', title: (p) => `Edit User ${p.id}` },

  // Seller
  { path: '/seller/products', title: 'My Products' },
  { path: '/seller/orders', title: 'My Orders' },
  { path: '/seller/product/new', title: 'Create Product' },
  { path: '/seller/product/create', title: 'Create Product' },
  { path: '/seller/product/:id', title: (p) => `Edit Product ${p.id}` },
];