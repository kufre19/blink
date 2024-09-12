import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    // Here you might want to add additional checks, like token expiration
    return !!token;
  };

  return isAuthenticated() ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoute;