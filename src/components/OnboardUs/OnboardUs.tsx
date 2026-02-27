import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FaUserTie, FaHandshake, FaTractor, FaStore, FaArrowRight, FaLeaf,
    FaSeedling, FaRocket, FaGlobeAmericas, FaTruck, FaWarehouse, FaIndustry,
    FaUsers, FaBriefcase, FaCertificate, FaChartLine, FaCogs
} from 'react-icons/fa';
import { Link } from 'react-scroll';
import type { IconType } from 'react-icons';
import './OnboardUs.css';

const iconMap: Record<string, IconType> = {
    FaUserTie, FaHandshake, FaTractor, FaStore, FaLeaf, FaSeedling,
    FaRocket, FaGlobeAmericas, FaTruck, FaWarehouse, FaIndustry,
    FaUsers, FaBriefcase, FaCertificate, FaChartLine, FaCogs,
};

interface PartnerCard {
    id: string;
    iconName: string;
    title: string;
    description: string;
    benefits: string[];
    color: string;
}

interface OnboardConfig {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    backgroundImage: string;
    cards?: PartnerCard[];
}

const defaultCards: PartnerCard[] = [
    {
        id: 'dist', iconName: 'FaUserTie', title: 'Become a Distributor',
        description: 'Join our growing network of 500+ distributors. Exclusive zone rights, credit facility, marketing support, and top commissions await.',
        benefits: ['Exclusive territory rights', 'Credit line up to ₹25 lakhs', 'Co-branded marketing support', 'Dedicated area manager'],
        color: '#25b565',
    },
    {
        id: 'farmer', iconName: 'FaTractor', title: 'Farmer Partnership',
        description: 'Get priority access to premium products, subsidized rates, expert agronomy advisory, and direct market linkage for your produce.',
        benefits: ['Subsidized product pricing', 'Free soil testing', 'Expert farm advisory', 'Market linkage support'],
        color: '#f5a623',
    },
    {
        id: 'retailer', iconName: 'FaStore', title: 'Become a Retailer',
        description: "Stock India's fastest-growing agri-input brand. Retail store partnership with display support, fast restocking, and attractive margins.",
        benefits: ['High margin products', 'In-store display support', 'Farmer referral bonus', 'Training & certification'],
        color: '#38bdf8',
    },
    {
        id: 'corp', iconName: 'FaHandshake', title: 'Corporate Collaboration',
        description: 'Co-develop products, access our R&D pipeline, and tap into our farmer network for agri-corporate partnerships and CSR programs.',
        benefits: ['Joint product development', 'Research collaborations', 'CSR program access', 'Technology licensing'],
        color: '#e879f9',
    },
];

const OnboardUs: React.FC = () => {
    const [config, setConfig] = useState<OnboardConfig>({
        title: "Ready to Join India's GreenRevotec Revolution?",
        subtitle: "TRANSFORMING AGRICULTURE TOGETHER",
        description: "Whether you're a farmer, distributor, retailer, or agri-corporate — there's a partnership model designed specifically for you.",
        buttonText: "Schedule a Call",
        buttonLink: "#contact",
        backgroundImage: ""
    });
    const [cards, setCards] = useState<PartnerCard[]>(defaultCards);

    useEffect(() => {
        const loadData = () => {
            const stored = localStorage.getItem('admin_onboard_config');
            if (stored) {
                const parsed = JSON.parse(stored);
                setConfig(parsed);
                setCards(parsed.cards && parsed.cards.length > 0 ? parsed.cards : defaultCards);
            }
        };
        loadData();
        window.addEventListener('storage', loadData);
        return () => window.removeEventListener('storage', loadData);
    }, []);

    return (
        <section className="section section-dark onboard" id="onboard" style={config.backgroundImage ? { backgroundImage: `linear-gradient(rgba(10, 20, 15, 0.9), rgba(10, 20, 15, 0.9)), url(${config.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
            <div className="container">
                {/* Top Banner */}
                <motion.div
                    className="onboard-banner"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <div className="onboard-banner-icon"><FaLeaf /></div>
                    <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '3px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '12px' }}>{config.subtitle}</div>
                    <h2 className="onboard-banner-title" dangerouslySetInnerHTML={{ __html: config.title }}></h2>
                    <p className="onboard-banner-subtitle">
                        {config.description}
                    </p>
                </motion.div>

                {/* Partner Cards — dynamic from admin */}
                <div className="onboard-grid">
                    {cards.map((card, i) => {
                        const Icon = iconMap[card.iconName] || FaLeaf;
                        return (
                            <motion.div
                                key={card.id}
                                className="onboard-card glass-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12, duration: 0.6 }}
                                whileHover={{ y: -8 }}
                            >
                                <div
                                    className="onboard-icon"
                                    style={{ color: card.color, background: `${card.color}18` }}
                                >
                                    <Icon />
                                </div>
                                <h3 className="onboard-title">{card.title}</h3>
                                <p className="onboard-desc">{card.description}</p>

                                <ul className="onboard-benefits">
                                    {card.benefits.map((b, j) => (
                                        <li key={j} style={{ color: card.color }}>
                                            <span>✓</span> <span className="benefit-text">{b}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className="onboard-cta"
                                    style={{ background: `${card.color}20`, border: `1px solid ${card.color}40`, color: card.color }}
                                >
                                    Apply Now <FaArrowRight />
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    className="onboard-cta-bar"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <div className="onboard-cta-text">
                        <h3>Not sure which partnership suits you?</h3>
                        <p>Let our team guide you to the most profitable fit for your profile.</p>
                    </div>
                    <Link to={config.buttonLink.replace('#', '') || 'contact'} smooth offset={-80}>
                        <button className="btn btn-primary btn-lg">
                            {config.buttonText} <FaArrowRight />
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default OnboardUs;
