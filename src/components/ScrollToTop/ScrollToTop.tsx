import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowUp, FaSun, FaMoon } from 'react-icons/fa';
import './ScrollToTop.css';

const ScrollToTop: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Sync with current theme
        const saved = localStorage.getItem('theme');
        setIsDark(saved !== 'light');

        const handleScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleScrollTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    const btnVariants = {
        initial: { opacity: 0, scale: 0.5, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.5, y: 20 },
    };
    const spring = { type: 'spring' as const, stiffness: 300, damping: 25 };

    return (
        <div className="float-btn-group">
            {/* Theme Toggle — always visible */}
            <motion.button
                className="float-btn theme-float"
                onClick={toggleTheme}
                variants={btnVariants}
                initial="initial"
                animate="animate"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                transition={spring}
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

            {/* Scroll To Top — only when scrolled down */}
            <AnimatePresence>
                {visible && (
                    <motion.button
                        className="float-btn scroll-to-top"
                        onClick={handleScrollTop}
                        variants={btnVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={spring}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Scroll to top"
                    >
                        <FaArrowUp />
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ScrollToTop;
