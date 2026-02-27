import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './PageTransition.css';

// ─── Context ─────────────────────────────────────────────────────────────────

interface PageTransitionContextValue {
    navigateWithTransition: (to: string) => void;
    reportPageReady: () => void;
    isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextValue>({
    navigateWithTransition: () => { },
    reportPageReady: () => { },
    isTransitioning: false,
});

export const usePageTransition = () => useContext(PageTransitionContext);
export const usePageReady = () => useContext(PageTransitionContext).reportPageReady;

// ─── Taglines ─────────────────────────────────────────────────────────────────

const TAGLINES = [
    'On the Way to a Greener Tomorrow',
    'Growing a Better Future, Together',
    'Where Tradition Meets Smart Farming',
    'Nourishing Fields, Empowering Farmers',
];

// ─── Provider ─────────────────────────────────────────────────────────────────

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);
    const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearSafety = () => {
        if (safetyTimer.current) {
            clearTimeout(safetyTimer.current);
            safetyTimer.current = null;
        }
    };

    const dismissLoader = useCallback(() => {
        clearSafety();
        setIsExiting(true);
        setTimeout(() => {
            setIsTransitioning(false);
            setIsExiting(false);
        }, 700); // allow exit animation to finish
    }, []);

    const reportPageReady = useCallback(() => {
        if (isTransitioning) {
            // Small pause so user sees the loading screen briefly before dismissing
            setTimeout(dismissLoader, 400);
        }
    }, [isTransitioning, dismissLoader]);

    const navigateWithTransition = useCallback((to: string) => {
        setIsExiting(false);
        setIsTransitioning(true);

        // Navigate immediately — loading screen covers the page while it loads
        setTimeout(() => {
            navigate(to);
        }, 80); // tiny delay so the loader paints first

        // Safety valve: dismiss after 6s even if page never calls reportPageReady
        safetyTimer.current = setTimeout(dismissLoader, 6000);
    }, [navigate, dismissLoader]);

    // Cleanup on unmount
    useEffect(() => () => clearSafety(), []);

    return (
        <PageTransitionContext.Provider value={{ navigateWithTransition, reportPageReady, isTransitioning }}>
            {children}

            <AnimatePresence>
                {isTransitioning && (
                    <motion.div
                        className="pt-loader"
                        key="pt-loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { duration: 0.25 } }}
                        exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
                    >
                        {/* Background particles */}
                        <div className="pt-particles" aria-hidden="true">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className={`pt-particle pt-particle-${i + 1}`} />
                            ))}
                        </div>

                        {/* Center Content */}
                        <div className="pt-loader-body">
                            {/* Logo */}
                            <motion.div
                                className="pt-logo-wrap"
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
                            >
                                <img src="/logo.png" alt="GreenRevotec" className="pt-logo-img" />
                            </motion.div>

                            {/* Tagline */}
                            <motion.p
                                className="pt-tagline"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                {tagline}
                            </motion.p>

                            {/* Animated Growing Stem */}
                            <motion.div
                                className="pt-stem-wrap"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.55 }}
                            >
                                <div className="pt-stem">
                                    <div className="pt-stem-fill" />
                                </div>
                                <div className="pt-dots">
                                    <span /><span /><span />
                                </div>
                            </motion.div>

                            {/* Sub-label */}
                            <motion.span
                                className="pt-sub"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                Modernizing Agriculture for a Greener Tomorrow
                            </motion.span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageTransitionContext.Provider>
    );
};
