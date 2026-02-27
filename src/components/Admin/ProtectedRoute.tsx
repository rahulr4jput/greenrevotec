import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check if user is authenticated via localStorage (mock session)
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

    // If authorized, return an outlet that will render child elements
    // If not, return element that will navigate to login page
    return isAuthenticated ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
