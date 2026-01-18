import React from 'react';
import { Route } from 'react-router-dom';

import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import SellerRoute from '../components/SellerRoute';

import * as S from '../screens';

export const PublicRoutes = (
  <>
    <Route path="/" element={<S.HomeScreen />} />
    <Route path="/about" element={<S.AboutScreen />} />
    <Route path="/search" element={<S.SearchScreen />} />
    <Route path="/product/:slug" element={<S.ProductScreen />} />
    <Route path="/cart" element={<S.CartScreen />} />
    <Route path="/signin" element={<S.SigninScreen />} />
    <Route path="/signup" element={<S.SignupScreen />} />
    <Route path="/forget-password" element={<S.ForgetPasswordScreen />} />
    <Route path="/reset-password/:token" element={<S.ResetPasswordScreen />} />
  </>
);

export const ProtectedRoutes = (
  <>
    <Route path="/profile" element={<ProtectedRoute><S.ProfileScreen /></ProtectedRoute>} />
    <Route path="/map" element={<ProtectedRoute><S.MapScreen /></ProtectedRoute>} />
    <Route path="/order/:id" element={<ProtectedRoute><S.OrderScreen /></ProtectedRoute>} />
    <Route path="/orderhistory" element={<ProtectedRoute><S.OrderHistoryScreen /></ProtectedRoute>} />
    <Route path="/shipping" element={<S.ShippingAddressScreen />} />
    <Route path="/payment" element={<S.PaymentMethodScreen />} />
    <Route path="/placeorder" element={<S.PlaceOrderScreen />} />
  </>
);

export const AdminRoutes = (
  <>
    <Route path="/admin/dashboard" element={<AdminRoute><S.DashboardScreen /></AdminRoute>} />
    <Route path="/admin/orders" element={<AdminRoute><S.OrderListScreen mode="admin" /></AdminRoute>} />
    <Route path="/admin/products" element={<AdminRoute><S.ProductListScreen mode="admin" /></AdminRoute>} />
    <Route path="/admin/product/new" element={<AdminRoute><S.ProductEditScreen mode="create" /></AdminRoute>} />
    <Route path="/admin/product/:id" element={<AdminRoute><S.ProductEditScreen /></AdminRoute>} />
    <Route path="/admin/users" element={<AdminRoute><S.UserListScreen /></AdminRoute>} />
    <Route path="/admin/user/:id" element={<AdminRoute><S.UserEditScreen /></AdminRoute>} />
  </>
);

export const SellerRoutes = (
  <>
    <Route path="/seller/products" element={<SellerRoute><S.ProductListScreen mode="seller" /></SellerRoute>} />
    <Route path="/seller/orders" element={<SellerRoute><S.OrderListScreen mode="seller" /></SellerRoute>} />
    <Route path="/seller/product/new" element={<SellerRoute><S.ProductEditScreen mode="create" /></SellerRoute>} />
    <Route path="/seller/product/:id" element={<SellerRoute><S.ProductEditScreen /></SellerRoute>} />
  </>
);
