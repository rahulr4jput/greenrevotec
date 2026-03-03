import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Double-check authentication just in case
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="admin-layout">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <main className="admin-main-content">
                <div className="admin-header">
                    <div className="mobile-header-left">
                        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
                            <FaBars />
                        </button>
                        <h2>Admin Dashboard</h2>
                    </div>
                    <div className="admin-user-profile">
                        <span className="admin-user-name">Admin</span>
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
