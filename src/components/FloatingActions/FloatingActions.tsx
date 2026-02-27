import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp, FaQuoteRight, FaPhone, FaTimes } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import './FloatingActions.css';

const FloatingActions: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [showContactMenu, setShowContactMenu] = useState(false);
    const [contactPhones, setContactPhones] = useState<string[]>([]);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
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
        <AnimatePresence>
            {visible && (
                <div className="floating-actions-container">

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

                    {/* Get a Quote / Contact Toggle Button */}
                    <motion.button
                        className={`floating-btn quote-btn ${showContactMenu ? 'active' : ''}`}
                        onClick={() => setShowContactMenu(prev => !prev)}
                        initial={{ opacity: 0, scale: 0.5, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
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

                    {/* Scroll to Top Button */}
                    <motion.button
                        className="floating-btn scroll-btn"
                        onClick={scrollToTop}
                        initial={{ opacity: 0, scale: 0.5, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Scroll to top"
                    >
                        <FaArrowUp />
                    </motion.button>

                    {/* Backdrop to close popup */}
                    {showContactMenu && (
                        <div className="floating-contact-backdrop" onClick={() => setShowContactMenu(false)} />
                    )}
                </div>
            )}
        </AnimatePresence>
    );
};

export default FloatingActions;
