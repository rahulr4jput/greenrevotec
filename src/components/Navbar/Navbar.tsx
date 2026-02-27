import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, scrollSpy, Events } from 'react-scroll';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaSun, FaMoon, FaChevronDown, FaHandshake, FaLeaf, FaTractor, FaFlask, FaRobot, FaUsers, FaChartLine, FaMicrochip } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import './Navbar.css';

const AVAILABLE_ICONS: Record<string, IconType> = {
    FaLeaf, FaTractor, FaFlask, FaRobot, FaUsers, FaChartLine, FaHandshake, FaMicrochip
};

const Navbar: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(true);
    const [visibility, setVisibility] = useState<Record<string, boolean>>({});
    const [logoConfig, setLogoConfig] = useState<{ url: string, show: boolean, siteName: string }>({ url: '/logo.png', show: true, siteName: 'GreenRevotec' });
    const [categories, setCategories] = useState<{ name: string }[]>([]);
    const [dynamicServices, setDynamicServices] = useState<{ id: string, title: string, image: string, thumbnail?: string, tag?: string, gradient?: string, iconName?: string }[]>([]);

    const navigate = useNavigate();
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    // Dynamic Navigation Links
    const navLinks = [
        { label: 'Home', to: 'hero', visibilityKey: 'hero' },
        {
            label: 'Products',
            to: 'products',
            path: '/products',
            visibilityKey: 'products',
            subLinks: categories.length > 0 ? [
                { label: 'Show All Products', to: '/products', isRouter: true },
                ...categories.map(cat => ({
                    label: cat.name,
                    to: `/products?category=${encodeURIComponent(cat.name)}`,
                    isRouter: true
                }))
            ] : []
        },
        {
            label: 'Services',
            to: 'services',
            path: '/services',
            visibilityKey: 'services',
            subLinks: dynamicServices.length > 0 ? [
                { label: 'Show All Services', to: '/services', isRouter: true },
                ...dynamicServices.map(svc => ({
                    label: svc.title,
                    to: '/services', // Assuming we deep link later, for now just page
                    isRouter: true
                }))
            ] : []
        },
        { label: 'Projects', to: 'projects', visibilityKey: 'projects' },
        { label: 'Gallery', to: 'gallery', visibilityKey: 'gallery' },
        { label: 'Pricing', to: 'pricing', visibilityKey: 'pricing' },
        { label: 'Contact', to: 'contact', visibilityKey: 'contact' },
    ];

    // Load dynamic data (Categories & Services)
    useEffect(() => {
        const fetchNavData = async () => {
            try {
                const [catRes, svcRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/services')
                ]);

                if (catRes.ok) {
                    const data = await catRes.json();
                    setCategories(data.filter((c: any) => c.isActive !== false));
                }

                if (svcRes.ok) {
                    const data = await svcRes.json();
                    setDynamicServices(data.filter((s: any) => s.isActive !== false));
                }
            } catch (error) {
                console.error('Error fetching nav data:', error);
            }
        };

        fetchNavData();
    }, []);

    // Load site identity (Logo & Name)
    useEffect(() => {
        const fetchLogo = () => {
            const stored = localStorage.getItem('admin_site_identity');
            if (stored) {
                try {
                    const config = JSON.parse(stored);
                    setLogoConfig({
                        url: config.logo?.url || '/logo.png',
                        show: config.logo?.show !== false,
                        siteName: config.siteName || 'GreenRevotec'
                    });
                } catch (e) {
                    console.error("Error parsing logo config", e);
                }
            }
        };

        fetchLogo();
        window.addEventListener('storage', fetchLogo);
        return () => window.removeEventListener('storage', fetchLogo);
    }, []);

    // Navigate to homepage + scroll, or just scroll if already on homepage
    const scrollToSection = (sectionId: string) => {
        setMenuOpen(false);
        if (isHomePage) {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            navigate('/', { state: { scrollTo: sectionId } });
        }
    };

    // Load visibility settings
    useEffect(() => {
        const storedVisibility = localStorage.getItem('admin_section_visibility');
        if (storedVisibility) {
            setVisibility(JSON.parse(storedVisibility));
        }

        const handleStorageChange = () => {
            const updated = localStorage.getItem('admin_section_visibility');
            if (updated) setVisibility(JSON.parse(updated));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Helper to check visibility (default true)
    const isVisible = (key: string) => visibility[key] !== false;

    // Initialize theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light') {
            setIsDarkTheme(false);
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, []);

    // Toggle Theme Handler
    const toggleTheme = () => {
        setIsDarkTheme(!isDarkTheme);
        if (isDarkTheme) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        }
    };

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll);

        // Fix for react-scroll spyCallbacks error: 
        // Update spy after a short delay to ensure DOM updated
        const timer = setTimeout(() => {
            scrollSpy.update();
        }, 100);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, [location.pathname]);

    return (
        <motion.nav
            className={`navbar ${scrolled ? 'scrolled' : ''}`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' as any }}
        >
            <div className="container navbar-inner">
                <RouterLink to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
                    {logoConfig.show ? (
                        <img src={logoConfig.url} alt={logoConfig.siteName} className="logo-img" />
                    ) : (
                        <span className="logo-text">{logoConfig.siteName}</span>
                    )}
                </RouterLink>

                {/* Desktop Nav */}
                <ul className="navbar-links" key={isHomePage ? 'home' : 'subpage'}>
                    {navLinks.filter(link => isVisible(link.visibilityKey)).map((link) => (
                        <li key={link.to} className={link.subLinks && link.subLinks.length > 0 ? 'has-submenu' : ''}>
                            <div className="nav-item-wrapper">
                                {link.path ? (
                                    <RouterLink to={link.path} className={`nav-link ${(location.pathname === link.path) ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
                                        {link.label}
                                        {link.subLinks && link.subLinks.length > 0 && <FaChevronDown className="submenu-chevron" />}
                                    </RouterLink>
                                ) : isHomePage ? (
                                    <Link
                                        to={link.to}
                                        smooth
                                        offset={-80}
                                        spy
                                        activeClass="active"
                                        className="nav-link"
                                    >
                                        {link.label}
                                        {link.subLinks && link.subLinks.length > 0 && <FaChevronDown className="submenu-chevron" />}
                                    </Link>
                                ) : (
                                    <span className="nav-link" style={{ cursor: 'pointer' }} onClick={() => scrollToSection(link.to)}>
                                        {link.label}
                                        {link.subLinks && link.subLinks.length > 0 && <FaChevronDown className="submenu-chevron" />}
                                    </span>
                                )}

                                {link.subLinks && link.subLinks.length > 0 && (
                                    <div className={`submenu-dropdown ${link.label === 'Services' ? 'mega-menu' : ''}`}>
                                        <div className="submenu-inner">
                                            {link.label === 'Services' ? (
                                                <div className="mega-menu-grid">
                                                    {dynamicServices.map((svc: any, idx) => (
                                                        <RouterLink
                                                            key={idx}
                                                            to={`/services/${svc.id}`}
                                                            className="mega-menu-item"
                                                            onClick={() => setMenuOpen(false)}
                                                        >
                                                            <div className="mega-thumb">
                                                                <img src={svc.thumbnail || svc.image} alt={svc.title} />
                                                            </div>
                                                            <div className="mega-info">
                                                                <span className="mega-title">{svc.title}</span>
                                                            </div>
                                                        </RouterLink>
                                                    ))}
                                                    <RouterLink to="/services" className="mega-view-all" onClick={() => setMenuOpen(false)}>
                                                        View All Services <FaChevronDown style={{ transform: 'rotate(-90deg)', marginLeft: '8px' }} />
                                                    </RouterLink>
                                                </div>
                                            ) : (
                                                link.subLinks.map((sub: any, idx) => (
                                                    sub.isRouter ? (
                                                        <RouterLink key={idx} to={sub.to} className="submenu-link">{sub.label}</RouterLink>
                                                    ) : isHomePage ? (
                                                        <Link key={idx} to={sub.to} smooth offset={-80} className="submenu-link">{sub.label}</Link>
                                                    ) : (
                                                        <span key={idx} className="submenu-link" style={{ cursor: 'pointer' }} onClick={() => scrollToSection(sub.to)}>{sub.label}</span>
                                                    )
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Actions (Theme + CTA) */}
                <div className="navbar-actions">
                    <button
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                    >
                        {isDarkTheme ? <FaSun /> : <FaMoon />}
                    </button>

                    {isVisible('onboarding') && (
                        <div className="navbar-cta">
                            {isHomePage ? (
                                <Link to="onboard" smooth offset={-80} className="btn btn-primary">Onboard With Us</Link>
                            ) : (
                                <span className="btn btn-primary" style={{ cursor: 'pointer' }} onClick={() => scrollToSection('onboard')}>Onboard With Us</span>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="mobile-toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className="mobile-menu"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ul>
                            {navLinks.filter(link => isVisible(link.visibilityKey)).map((link) => (
                                <li key={link.to} className="mobile-nav-item">
                                    <div className="mobile-nav-header">
                                        {link.path ? (
                                            <RouterLink
                                                to={link.path}
                                                className={`mobile-nav-link ${(location.pathname === link.path) ? 'active' : ''}`}
                                                onClick={() => !(link.subLinks && link.subLinks.length > 0) && setMenuOpen(false)}
                                            >
                                                {link.label}
                                            </RouterLink>
                                        ) : isHomePage ? (
                                            <Link
                                                to={link.to}
                                                smooth
                                                offset={-80}
                                                className="mobile-nav-link"
                                                onClick={() => !(link.subLinks && link.subLinks.length > 0) && setMenuOpen(false)}
                                            >
                                                {link.label}
                                            </Link>
                                        ) : (
                                            <span className="mobile-nav-link" style={{ cursor: 'pointer' }} onClick={() => !(link.subLinks && link.subLinks.length > 0) && scrollToSection(link.to)}>
                                                {link.label}
                                            </span>
                                        )}
                                        {link.subLinks && link.subLinks.length > 0 && (
                                            <button
                                                className="mobile-submenu-toggle"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const target = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                                                    if (target) {
                                                        const isExpanded = target.style.height === 'auto' || target.style.height === 'max-content';
                                                        target.style.height = isExpanded ? '0' : 'max-content';
                                                        target.style.opacity = isExpanded ? '0' : '1';
                                                        e.currentTarget.style.transform = isExpanded ? 'rotate(0)' : 'rotate(180deg)';
                                                    }
                                                }}
                                            >
                                                <FaChevronDown />
                                            </button>
                                        )}
                                    </div>
                                    {link.subLinks && link.subLinks.length > 0 && (
                                        <div className="mobile-submenu" style={{ height: '0', opacity: '0', overflow: 'hidden', transition: 'all 0.3s ease' }}>
                                            {link.subLinks.map((sub: any, idx) => (
                                                sub.isRouter ? (
                                                    <RouterLink key={idx} to={sub.to} className="mobile-submenu-link" onClick={() => setMenuOpen(false)}>{sub.label}</RouterLink>
                                                ) : isHomePage ? (
                                                    <Link key={idx} to={sub.to} smooth offset={-80} className="mobile-submenu-link" onClick={() => setMenuOpen(false)}>{sub.label}</Link>
                                                ) : (
                                                    <span key={idx} className="mobile-submenu-link" style={{ cursor: 'pointer' }} onClick={() => scrollToSection(sub.to)}>{sub.label}</span>
                                                )
                                            ))}
                                        </div>
                                    )}
                                </li>
                            ))}
                            <li>
                                <div className="mobile-actions-row">
                                    <button
                                        className="theme-toggle mobile"
                                        onClick={toggleTheme}
                                        aria-label="Toggle Theme"
                                    >
                                        {isDarkTheme ? <FaSun /> : <FaMoon />}
                                        <span style={{ marginLeft: '10px' }}>
                                            {isDarkTheme ? 'Light Mode' : 'Dark Mode'}
                                        </span>
                                    </button>
                                </div>
                            </li>
                            {isVisible('onboarding') && (
                                <li>
                                    {isHomePage ? (
                                        <Link to="onboard" smooth offset={-80} className="btn btn-primary mobile-cta" onClick={() => setMenuOpen(false)}>Onboard With Us</Link>
                                    ) : (
                                        <span className="btn btn-primary mobile-cta" style={{ cursor: 'pointer' }} onClick={() => scrollToSection('onboard')}>Onboard With Us</span>
                                    )}
                                </li>
                            )}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
