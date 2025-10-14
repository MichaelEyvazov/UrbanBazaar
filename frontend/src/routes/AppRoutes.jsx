import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import SellerRoute from '../components/SellerRoute';
import AboutScreen from './screens/AboutScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductScreen from '../screens/ProductScreen';
import CartScreen from '../screens/CartScreen';
import SigninScreen from '../screens/SigninScreen';
import SignupScreen from '../screens/SignupScreen';
import ShippingAddressScreen from '../screens/ShippingAddressScreen';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import PlaceOrderScreen from '../screens/PlaceOrderScreen';
import OrderScreen from '../screens/OrderScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import OrderListScreen from '../screens/OrderListScreen';
import ProductListScreen from '../screens/ProductListScreen';
import ProductEditScreen from '../screens/ProductEditScreen';
import UserListScreen from '../screens/UserListScreen';
import UserEditScreen from '../screens/UserEditScreen';
import SearchScreen from '../screens/SearchScreen';
import MapScreen from '../screens/MapScreen';
import ForgetPasswordScreen from '../screens/ForgetPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<HomeScreen />} />
            <Route path="/product/:slug" element={<ProductScreen />} />
            <Route path="/cart" element={<CartScreen />} />
            <Route path="/search" element={<SearchScreen />} />
            <Route path="/signin" element={<SigninScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            <Route path="/forget-password" element={<ForgetPasswordScreen />} />
            <Route path="/reset-password/:token" element={<ResetPasswordScreen />} />
            <Route path="/about" element={<AboutScreen />} />

            {/* Protected */}
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfileScreen />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/map"
                element={
                    <ProtectedRoute>
                        <MapScreen />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/order/:id"
                element={
                    <ProtectedRoute>
                        <OrderScreen />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/orderhistory"
                element={
                    <ProtectedRoute>
                        <OrderHistoryScreen />
                    </ProtectedRoute>
                }
            />
            <Route path="/shipping" element={<ShippingAddressScreen />} />
            <Route path="/payment" element={<PaymentMethodScreen />} />
            <Route path="/placeorder" element={<PlaceOrderScreen />} />

            {/* Admin */}
            <Route
                path="/admin/dashboard"
                element={
                    <AdminRoute>
                        <DashboardScreen />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/orders"
                element={
                    <AdminRoute>
                        <OrderListScreen mode="admin" />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/products"
                element={
                    <AdminRoute>
                        <ProductListScreen mode="admin" />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/product/create"
                element={
                    <AdminRoute>
                        <ProductEditScreen />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/product/new"
                element={
                    <AdminRoute>
                        <ProductEditScreen mode="create" />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/product/:id"
                element={
                    <AdminRoute>
                        <ProductEditScreen />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/users"
                element={
                    <AdminRoute>
                        <UserListScreen />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/user/:id"
                element={
                    <AdminRoute>
                        <UserEditScreen />
                    </AdminRoute>
                }
            />

            {/* Seller */}
            <Route
                path="/seller/products"
                element={
                    <SellerRoute>
                        <ProductListScreen mode="seller" />
                    </SellerRoute>
                }
            />

            <Route
                path="/seller/product/new"
                element={
                    <SellerRoute>
                        <ProductEditScreen mode="create" />
                    </SellerRoute>
                }
            />
            <Route
                path="/seller/product/create"
                element={
                    <SellerRoute>
                        <ProductEditScreen />
                    </SellerRoute>
                }
            />

            <Route
                path="/seller/orders"
                element={
                    <SellerRoute>
                        <OrderListScreen mode="seller" />
                    </SellerRoute>
                }
            />
            <Route
                path="/seller/product/:id"
                element={
                    <SellerRoute>
                        <ProductEditScreen />
                    </SellerRoute>
                }
            />
        </Routes>
    );
}