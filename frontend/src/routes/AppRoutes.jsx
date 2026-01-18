import React from 'react';
import { Routes } from 'react-router-dom';
import { useRouteTitle } from './useRouteTitle';
import { PublicRoutes, ProtectedRoutes, AdminRoutes, SellerRoutes } from './routeGroups';

export default function AppRoutes() {
  useRouteTitle();

  return (
    <Routes>
      {PublicRoutes}
      {ProtectedRoutes}
      {AdminRoutes}
      {SellerRoutes}
    </Routes>
  );
}