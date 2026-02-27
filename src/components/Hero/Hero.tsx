import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, scroller } from 'react-scroll';
import { usePageTransition } from '../PageTransition/PageTransition';
import {
    FaPlay, FaSeedling, FaChartLine, FaShieldAlt, FaArrowDown,
    FaFlask, FaTractor, FaUsers, FaMicrochip, FaHandshake, FaLeaf,
    FaPlus, FaArrowUp
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './Hero.css';

interface StatItem {
    id: string;
    value: number;
    suffix: string;
    label: string;
    iconName: string;
    isActive: boolean;
}

const STAT_ICONS: Record<string, any> = {
    FaSeedling,
    FaChartLine,
    FaShieldAlt,
    FaPlay,
    FaHandshake,
    FaPlus,
    FaArrowUp,
    FaFlask,
    FaTractor,
    FaUsers,
    FaMicrochip,
    FaLeaf
};

const defaultStats: StatItem[] = [
    { id: '0', value: 15000, suffix: '+', label: 'Farmers Served', iconName: 'FaSeedling', isActive: true },
    { id: '1', value: 98, suffix: '%', label: 'Crop Yield Increase', iconName: 'FaChartLine', isActive: true },
    { id: '2', value: 250, suffix: '+', label: 'Agri Products', iconName: 'FaShieldAlt', isActive: true },
    { id: '3', value: 18, suffix: '+', label: 'Years Experience', iconName: 'FaPlay', isActive: true },
];

type SlideNavigateTo = 'page-products' | 'page-services' | 'section-products' | 'section-services';

interface Slide {
    id: number;
    title: string;
    highlight: string;
    subtitle: string;
    type: 'video' | 'image';
    src: string;
    navigateTo?: SlideNavigateTo;
}

const slides: Slide[] = [
    {
        id: 0,
        title: 'Empowering',
        highlight: 'Modern Farming',
        subtitle: "India's premier drone farming and agricultural technology partner. Transforming farmland with smart, data-driven solutions.",
        type: 'video',
        src: '/hero-bg.mp4',
    },
    {
        id: 1,
        title: 'High-Yield',
        highlight: 'Precision Fertilizers',
        subtitle: 'Maximize your crop production with our scientifically formulated, targeted nutrition plans designed for Indian soils.',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80',
    },
    {
        id: 2,
        title: 'Eco-Friendly',
        highlight: 'Organic Pesticides',
        subtitle: 'Protect your crops and the environment with our advanced range of bio-pesticides and natural crop protection solutions.',
        type: 'image',
        src: 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1920',
    },
    {
        id: 3,
        title: 'Advanced',
        highlight: 'Soil Diagnostics',
        subtitle: 'Data-driven soil health analysis providing actionable insights to optimize pH, nutrients, and long-term vitality.',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1920&q=80',
    },
    {
        id: 4,
        title: 'Automated',
        highlight: 'Smart Irrigation',
        subtitle: 'Conserve water and maximize efficiency with intelligent, sensor-based irrigation systems adapted to local weather patterns.',
        type: 'image',
        src: 'https://images.pexels.com/photos/15809312/pexels-photo-15809312.jpeg?auto=compress&cs=tinysrgb&w=1920',
    },
    {
        id: 5,
        title: 'Strategic',
        highlight: 'Agri-Partnerships',
        subtitle: 'Collaborating with FPOs, corporations, and distributors to build sustainable and profitable agricultural supply chains.',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1920&q=80',
    }
];

const Hero: React.FC = () => {
    const { navigateWithTransition } = usePageTransition();
    const { ref, inView } = useInView({ triggerOnce: true });
    const [heroSlides, setHeroSlides] = useState<Slide[]>([]);
    const [heroBrands, setHeroBrands] = useState<string[]>([]);
    const [isBrandsVisible, setIsBrandsVisible] = useState(true);
    const [heroStats, setHeroStats] = useState<StatItem[]>([]);
    const [isStatsVisible, setIsStatsVisible] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const loadHeroConfig = () => {
            const consolidated = localStorage.getItem('admin_hero_config');
            if (consolidated) {
                const data = JSON.parse(consolidated);

                // Slides
                if (data.slides) {
                    const activeSlides = data.slides.filter((s: any) => s.isActive).map((s: any) => ({
                        id: s.id,
                        title: s.title,
                        highlight: s.highlight,
                        subtitle: s.subtitle,
                        type: s.type,
                        src: s.src,
                        navigateTo: s.navigateTo
                    }));
                    if (activeSlides.length > 0) setHeroSlides(activeSlides);
                    else setHeroSlides(slides);
                }

                // Brands
                if (data.brands) setHeroBrands(data.brands);
                setIsBrandsVisible(data.brandsVisible !== false);

                // Stats
                if (data.stats) setHeroStats(data.stats.filter((s: any) => s.isActive));
                setIsStatsVisible(data.statsVisible !== false);
            } else {
                // Fallback to defaults
                setHeroSlides(slides);
                setHeroBrands(['IFFCO', 'Bayer', 'UPL', 'Syngenta', 'BASF']);
                setHeroStats(defaultStats);
            }
        };

        loadHeroConfig();

        const handleStorageChange = () => {
            loadHeroConfig();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Auto-advance slides
    useEffect(() => {
        if (heroSlides.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 8000); // 8 seconds per slide
        return () => clearInterval(timer);
    }, [heroSlides]);

    if (heroSlides.length === 0) return null;

    const slide = heroSlides[currentSlide];

    return (
        <section className="hero" id="hero">
            {/* Background Carousel */}
            <div className="hero-bg">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="hero-media-container"
                    >
                        {slide.type === 'video' ? (
                            <video
                                className="hero-video"
                                autoPlay
                                muted
                                loop
                                playsInline
                            >
                                <source src={slide.src} type="video/mp4" />
                            </video>
                        ) : (
                            <div
                                className="hero-image"
                                style={{ backgroundImage: `url(${slide.src})` }}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                <div className="hero-bg-gradient" />
                <div className="hero-bg-pattern dot-pattern" />
                <div className="hero-bg-orbs">
                    <div className="orb orb-1" />
                    <div className="orb orb-2" />
                    <div className="orb orb-3" />
                </div>
            </div>

            <div className="container hero-content">
                {/* Badge */}
                <motion.div
                    key={`badge-${slide.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="hero-badge"
                >
                    <span className="badge badge-green">
                        <FaSeedling /> India's #1 Agriculture Technology Partner
                    </span>
                </motion.div>

                {/* Dynamic Heading */}
                <AnimatePresence mode="wait">
                    <motion.h1
                        key={`title-${slide.id}`}
                        className="hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {slide.title} <span className="gradient-text">{slide.highlight}</span>
                        <br />
                        <span style={{ fontSize: '0.6em', opacity: 0.9 }}>Through Smart <span className="gradient-text-gold">GreenRevotec</span></span>
                    </motion.h1>
                </AnimatePresence>

                {/* Dynamic Subtitle */}
                <AnimatePresence mode="wait">
                    <motion.p
                        key={`subtitle-${slide.id}`}
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {slide.subtitle}
                    </motion.p>
                </AnimatePresence>

                {/* CTA Buttons */}
                <motion.div
                    className="hero-actions"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    {/* Dynamic Explore Button */}
                    {(() => {
                        const navTo = slide.navigateTo || 'section-products';
                        const isPageNav = navTo === 'page-products' || navTo === 'page-services';
                        const handleExplore = () => {
                            if (navTo === 'page-products') {
                                navigateWithTransition('/products');
                            } else if (navTo === 'page-services') {
                                navigateWithTransition('/services');
                            } else if (navTo === 'section-services') {
                                scroller.scrollTo('services', { smooth: true, offset: -80, duration: 600 });
                            } else {
                                scroller.scrollTo('products', { smooth: true, offset: -80, duration: 600 });
                            }
                        };
                        const label = navTo === 'page-services' || navTo === 'section-services'
                            ? 'Explore Services'
                            : 'Explore Products';
                        return (
                            <button className="btn btn-primary btn-lg" onClick={handleExplore}>
                                {label}
                                <span className="btn-arrow">→</span>
                            </button>
                        );
                    })()}
                    <Link to="contact" smooth offset={-80}>
                        <button className="btn btn-secondary btn-lg">
                            <FaPlay className="play-icon" /> Get Started
                        </button>
                    </Link>
                </motion.div>

                {/* Trust badges */}
                {isBrandsVisible && (
                    <motion.div
                        className="hero-trust"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        <span className="trust-label">Trusted by leading agri-brands:</span>
                        <div className="trust-brands">
                            {heroBrands.map((brand) => (
                                <span key={brand} className="trust-brand">{brand}</span>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Slider Nav */}
                <div className="hero-slider-nav">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>

            {/* Stats Bar */}
            {isStatsVisible && heroStats.length > 0 && (
                <motion.div
                    ref={ref}
                    className="hero-stats"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.7 }}
                >
                    <div className="container">
                        <div className="hero-stats-grid">
                            {heroStats.map((stat, i) => {
                                const Icon = STAT_ICONS[stat.iconName] || FaSeedling;
                                return (
                                    <div key={stat.id || i} className="hero-stat">
                                        <div className="hero-stat-icon"><Icon /></div>
                                        <div className="hero-stat-number">
                                            {inView && (
                                                <CountUp
                                                    end={stat.value}
                                                    suffix={stat.suffix}
                                                    duration={2.5}
                                                    delay={0.2 + i * 0.1}
                                                />
                                            )}
                                        </div>
                                        <div className="hero-stat-label">{stat.label}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Scroll Indicator */}
            <motion.div
                className="scroll-indicator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                <Link to="whychooseus" smooth offset={-80}>
                    <div className="scroll-circle">
                        <FaArrowDown />
                    </div>
                </Link>
            </motion.div>
        </section>
    );
};

export default Hero;
