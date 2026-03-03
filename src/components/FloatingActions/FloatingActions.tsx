import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp, FaQuoteRight, FaPhone, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './FloatingActions.css';

const FloatingActions: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [showContactMenu, setShowContactMenu] = useState(false);
    const [contactPhones, setContactPhones] = useState<string[]>([]);
    const [isDark, setIsDark] = useState(true);
    const [nearFooter, setNearFooter] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Sync theme state with localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        setIsDark(saved !== 'light');
    }, []);

    const toggleTheme = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        if (newDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > 400);
            // Detect if footer is in viewport area
            const footer = document.querySelector('footer') as HTMLElement | null;
            if (footer) {
                const footerTop = footer.getBoundingClientRect().top;
                setNearFooter(footerTop < window.innerHeight + 120);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch phone numbers from admin contact settings
    useEffect(() => {
        fetch('/api/settings/admin_contact_config')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.info) {
                    const phoneEntry = data.info.find((item: any) => item.type === 'phone');
                    if (phoneEntry?.lines?.length) {
                        setContactPhones(phoneEntry.lines);
                    }
                }
            })
            .catch(() => { });
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10, scale: 0.8 },
        visible: (i: number) => ({
            opacity: 1, y: 0, scale: 1,
            transition: { delay: i * 0.07, type: 'spring', stiffness: 300, damping: 22 }
        }),
        exit: { opacity: 0, y: 10, scale: 0.8, transition: { duration: 0.15 } }
    };

    return (
        <motion.div className={`floating-actions-container${nearFooter ? ' near-footer' : ''}`} layout transition={{ type: 'spring', stiffness: 140, damping: 18 }}>

            {/* Theme Toggle — always visible */}
            <motion.button
                layout
                className="floating-btn theme-btn"
                onClick={toggleTheme}
                initial={{ opacity: 0, scale: 0.5, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Toggle theme"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={isDark ? 'sun' : 'moon'}
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isDark ? <FaSun /> : <FaMoon />}
                    </motion.span>
                </AnimatePresence>
            </motion.button>

            {/* Scroll-dependent buttons — each slides in/out individually */}
            <AnimatePresence mode="popLayout">
                {visible && (
                    <motion.button
                        key="get-in-touch"
                        layout
                        className={`floating-btn quote-btn ${showContactMenu ? 'active' : ''}`}
                        onClick={() => setShowContactMenu(prev => !prev)}
                        initial={{ opacity: 0, scale: 0.5, x: 40 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: 40 }}
                        transition={{ type: 'spring', stiffness: 140, damping: 18, delay: 0.08 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Get in Touch"
                    >
                        <AnimatePresence mode="wait">
                            {showContactMenu ? (
                                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                    <FaTimes />
                                </motion.span>
                            ) : (
                                <motion.span key="quote" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                    <FaQuoteRight />
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <span className="btn-text">Get in Touch</span>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
                {visible && (
                    <motion.button
                        key="scroll-top"
                        layout
                        className="floating-btn scroll-btn"
                        onClick={scrollToTop}
                        initial={{ opacity: 0, scale: 0.5, x: 40 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: 40 }}
                        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Scroll to top"
                    >
                        <FaArrowUp />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Contact Popup Menu */}
            <AnimatePresence>
                {showContactMenu && (
                    <div className="floating-contact-menu">
                        <motion.a
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.07, type: 'spring' as const, stiffness: 300, damping: 22 } }}
                            exit={{ opacity: 0, y: 10, scale: 0.8 }}
                            href={contactPhones[0] ? `https://wa.me/${contactPhones[0].replace(/[^0-9]/g, '')}` : 'https://wa.me/'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="floating-contact-btn whatsapp"
                            onClick={() => setShowContactMenu(false)}
                        >
                            <FaWhatsapp />
                            <span>WhatsApp</span>
                        </motion.a>
                        <motion.a
                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0, type: 'spring' as const, stiffness: 300, damping: 22 } }}
                            exit={{ opacity: 0, y: 10, scale: 0.8 }}
                            href={contactPhones[1] ? `tel:${contactPhones[1].replace(/[^0-9+]/g, '')}` : 'tel:'}
                            className="floating-contact-btn phone"
                            onClick={() => setShowContactMenu(false)}
                        >
                            <FaPhone />
                            <span>Call Us</span>
                        </motion.a>
                    </div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            {showContactMenu && (
                <div className="floating-contact-backdrop" onClick={() => setShowContactMenu(false)} />
            )}
        </motion.div>
    );
};

export default FloatingActions;



