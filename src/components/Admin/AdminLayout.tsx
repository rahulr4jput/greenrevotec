import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Double-check authentication just in case
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

    const navigate = useNavigate();
    const location = useLocation();

    // Session Management Hooks
    useEffect(() => {
        if (!isAuthenticated) return;

        const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes
        let interval: NodeJS.Timeout;

        const handleLogout = () => {
            localStorage.removeItem('isAdminAuthenticated');
            localStorage.removeItem('adminSessionExpiry');
            navigate('/admin/login', { replace: true });
        };

        const checkSession = () => {
            const expiry = localStorage.getItem('adminSessionExpiry');
            if (!expiry || Date.now() > parseInt(expiry, 10)) {
                handleLogout();
            }
        };

        // Throttle localStorage writes to once every 10 seconds max
        let lastUpdate = Date.now();
        const extendSession = () => {
            if (Date.now() - lastUpdate > 10000) {
                localStorage.setItem('adminSessionExpiry', (Date.now() + SESSION_TIMEOUT_MS).toString());
                lastUpdate = Date.now();
            }
        };

        // Initial check
        checkSession();

        // Background expiry watcher (checks every minute)
        interval = setInterval(checkSession, 60000);

        // Activity listeners to keep session alive
        const activityEvents = ['mousedown', 'keydown', 'touchstart'];
        activityEvents.forEach(e => window.addEventListener(e, extendSession));

        return () => {
            clearInterval(interval);
            activityEvents.forEach(e => window.removeEventListener(e, extendSession));
        };
    }, [isAuthenticated, location.pathname, navigate]);

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
