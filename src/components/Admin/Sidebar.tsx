import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    FaCog, FaUsers, FaSignOutAlt, FaLeaf,
    FaBoxOpen, FaHandshake, FaChevronDown, FaChevronUp, FaBriefcase, FaChevronLeft
} from 'react-icons/fa';
import './AdminLayout.css';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
    const navigate = useNavigate();
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [logoConfig, setLogoConfig] = useState<{ url: string, show: boolean, siteName: string }>({ url: '/logo.png', show: true, siteName: 'GreenRevotec' });

    // Load sidebar logo & site name
    useEffect(() => {
        const fetchLogo = () => {
            const stored = localStorage.getItem('admin_site_identity');
            if (stored) {
                try {
                    const config = JSON.parse(stored);
                    setLogoConfig({
                        url: config.adminSidebarLogo?.url || '/logo.png',
                        show: config.adminSidebarLogo?.show !== false,
                        siteName: config.siteName || 'GreenRevotec'
                    });
                } catch (e) {
                    console.error("Error parsing sidebar logo config", e);
                }
            }
        };

        fetchLogo();
        window.addEventListener('storage', fetchLogo);
        return () => window.removeEventListener('storage', fetchLogo);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAdminAuthenticated');
        navigate('/admin/login');
    };

    const toggleMenu = (menu: string) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className="admin-sidebar-overlay" onClick={onClose}></div>}

            <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header" style={{ justifyContent: 'center', position: 'relative' }}>
                    {logoConfig.show && logoConfig.url ? (
                        <img src={logoConfig.url} alt="Logo" className="sidebar-logo-img" style={{ maxWidth: '200px', maxHeight: '50px', objectFit: 'contain' }} />
                    ) : (
                        <FaLeaf className="sidebar-logo-icon" style={{ fontSize: '2rem', margin: 0 }} />
                    )}

                    {/* Mobile Close Button */}
                    <button className="mobile-sidebar-close" onClick={onClose}>
                        <FaChevronLeft />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul className="admin-nav-list">
                        <li className="admin-nav-item">
                            <NavLink
                                to="/admin/leads"
                                className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}
                            >
                                <FaUsers className="admin-nav-icon" />
                                <span>Leads</span>
                            </NavLink>
                        </li>

                        {/* Products Accordion */}
                        <li className="admin-nav-item">
                            <div
                                className={`admin-nav-link accordion-toggle ${openMenu === 'products' ? 'open' : ''}`}
                                onClick={() => toggleMenu('products')}
                            >
                                <div className="accordion-label">
                                    <FaBoxOpen className="admin-nav-icon" />
                                    <span>Products</span>
                                </div>
                                {openMenu === 'products' ? <FaChevronUp className="chevron-icon" /> : <FaChevronDown className="chevron-icon" />}
                            </div>
                            <ul className={`admin-submenu-list ${openMenu === 'products' ? 'expanded' : ''}`}>
                                <li>
                                    <NavLink to="/admin/products/all" className={({ isActive }) => isActive ? 'admin-submenu-link active' : 'admin-submenu-link'}>
                                        All Products
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/products/categories" className={({ isActive }) => isActive ? 'admin-submenu-link active' : 'admin-submenu-link'}>
                                        Add Product Categories
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/products/crops" className={({ isActive }) => isActive ? 'admin-submenu-link active' : 'admin-submenu-link'}>
                                        Create Crop Name
                                    </NavLink>
                                </li>
                            </ul>
                        </li>

                        {/* Services Accordion */}
                        <li className="admin-nav-item">
                            <div
                                className={`admin-nav-link accordion-toggle ${openMenu === 'services' ? 'open' : ''}`}
                                onClick={() => toggleMenu('services')}
                            >
                                <div className="accordion-label">
                                    <FaHandshake className="admin-nav-icon" />
                                    <span>Services</span>
                                </div>
                                {openMenu === 'services' ? <FaChevronUp className="chevron-icon" /> : <FaChevronDown className="chevron-icon" />}
                            </div>
                            <ul className={`admin-submenu-list ${openMenu === 'services' ? 'expanded' : ''}`}>
                                <li>
                                    <NavLink to="/admin/services/all" className={({ isActive }) => isActive ? 'admin-submenu-link active' : 'admin-submenu-link'}>
                                        All Services
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/services/categories" className={({ isActive }) => isActive ? 'admin-submenu-link active' : 'admin-submenu-link'}>
                                        Add Service Categories
                                    </NavLink>
                                </li>
                            </ul>
                        </li>

                        {/* Careers Accordion */}
                        <li className="admin-nav-item">
                            <div
                                className={`admin-nav-link accordion-toggle ${openMenu === 'careers' ? 'open' : ''}`}
                                onClick={() => toggleMenu('careers')}
                            >
                                <div className="accordion-label">
                                    <FaBriefcase className="admin-nav-icon" />
                                    <span>Careers</span>
                                </div>
                                {openMenu === 'careers' ? <FaChevronUp className="chevron-icon" /> : <FaChevronDown className="chevron-icon" />}
                            </div>
                            <ul className={`admin-submenu-list ${openMenu === 'careers' ? 'expanded' : ''}`}>
                                <li>
                                    <NavLink to="/admin/careers/management" className={({ isActive }) => isActive ? 'admin-submenu-link active' : 'admin-submenu-link'}>
                                        Manage Job Roles
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/careers/leads" className={({ isActive }) => isActive ? 'admin-submenu-link active' : 'admin-submenu-link'}>
                                        Job Applications
                                    </NavLink>
                                </li>
                            </ul>
                        </li>

                        <li className="admin-nav-item">
                            <NavLink
                                to="/admin/settings"
                                className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}
                            >
                                <FaCog className="admin-nav-icon" />
                                <span>Settings</span>
                            </NavLink>
                        </li>
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <FaSignOutAlt className="admin-nav-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
