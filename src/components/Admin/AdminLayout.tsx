import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
    // Double-check authentication just in case
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="admin-main-content">
                <div className="admin-header">
                    <h2>Admin Dashboard</h2>
                    <div className="admin-user-profile">
                        <span>Admin</span>
                        <div className="avatar">A</div>
                    </div>
                </div>
                <div className="admin-content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
