import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaLeaf, FaStar } from 'react-icons/fa';
import './Pricing.css';

const defaultPlans = [
    {
        name: 'Starter Kit',
        tag: 'For Individual Farmers',
        price: '₹4,999',
        period: '/ season',
        color: '#2ea34b',
        description: 'Perfect for small-hold farmers starting their journey with precision agriculture.',
        features: ['Basic soil test kit (15 parameters)', 'Seasonal crop nutrition plan', 'BioGrow Pro 25kg starter pack', 'OrganOil Shield 5L pack', 'WhatsApp advisory support'],
        popular: false,
        buttonText: 'Get Started'
    },
    {
        name: 'Growth Pro',
        tag: 'Most Popular',
        price: '₹14,999',
        period: '/ season',
        color: '#f5a623',
        description: 'Comprehensive solution for progressive farmers who want measurable results.',
        features: ['Advanced soil test (32 parameters)', 'AI-powered crop advisory app', 'Full season nutrient program', 'AquaSmart Drip Kit (1 acre)', 'Drone scouting (2 visits)'],
        popular: true,
        buttonText: 'Get Started'
    },
    {
        name: 'Enterprise',
        tag: 'For Agri-Businesses',
        price: 'Custom',
        period: 'pricing',
        color: '#00509d',
        description: 'Tailored solutions for FPOs, large estates, agri-corporations, and distributors.',
        features: ['Everything in Growth Pro', 'Unlimited land coverage', 'Dedicated account manager', 'Custom product formulations', 'White-label product options'],
        popular: false,
        buttonText: 'Request a Quote'
    },
];

const Pricing: React.FC = () => {
    const [annual, setAnnual] = useState(false);
    const [planList, setPlanList] = useState<any[]>([]);
    const [header, setHeader] = useState({
        label: "Pricing Plans",
        title: "Investment for <span>Growth</span>",
        subtitle: "Choose the perfect plan for your farming or business needs. Scale as you grow with GreenRevotec."
    });

    useEffect(() => {
        const loadPricing = () => {
            const consolidated = localStorage.getItem('admin_pricing_plans');
            if (consolidated) {
                const data = JSON.parse(consolidated);

                // Header
                if (data.header) setHeader(data.header);

                // Plans
                if (data.plans) {
                    const activePlans = data.plans.filter((p: any) => p.isActive).map((p: any, idx: number) => ({
                        name: p.name,
                        tag: p.isPopular ? 'Most Popular' : (idx === 0 ? 'Basic' : 'Professional'),
                        price: p.price.startsWith('₹') ? p.price : `₹${p.price}`,
                        period: p.unit,
                        color: p.isPopular ? '#f5a623' : (idx === 0 ? '#2ea34b' : '#00509d'),
                        description: p.description || 'Professional agricultural solution.',
                        features: p.features,
                        popular: p.isPopular,
                        buttonText: p.buttonText || 'Get Started'
                    }));

                    if (activePlans.length > 0) {
                        setPlanList(activePlans);
                    } else {
                        setPlanList(defaultPlans);
                    }
                }
            } else {
                // Fallback to legacy
                const stored = localStorage.getItem('admin_pricing');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const activePlans = parsed.filter((p: any) => p.isActive).map((p: any, idx: number) => ({
                        name: p.name,
                        tag: p.isPopular ? 'Most Popular' : (idx === 0 ? 'Basic' : 'Professional'),
                        price: p.price.startsWith('₹') ? p.price : `₹${p.price}`,
                        period: p.unit,
                        color: p.isPopular ? '#f5a623' : (idx === 0 ? '#2ea34b' : '#00509d'),
                        description: p.description || 'Professional agricultural solution.',
                        features: p.features,
                        popular: p.isPopular,
                        buttonText: p.buttonText || 'Get Started'
                    }));

                    if (activePlans.length > 0) {
                        setPlanList(activePlans);
                    } else {
                        setPlanList(defaultPlans);
                    }
                } else {
                    setPlanList(defaultPlans);
                }

                const storedHeader = localStorage.getItem('admin_pricing_header');
                if (storedHeader) setHeader(JSON.parse(storedHeader));
            }
        };

        loadPricing();
        window.addEventListener('storage', loadPricing);
        return () => window.removeEventListener('storage', loadPricing);
    }, []);

    return (
        <section className="section section-dark pricing" id="pricing">
            <div className="container">
                <motion.div
                    className="section-header centered"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="section-label">{header.label}</div>
                    <h2 className="section-title" dangerouslySetInnerHTML={{ __html: header.title }}></h2>
                    <p className="section-subtitle">{header.subtitle}</p>

                    {/* Toggle */}
                    <div className="pricing-toggle">
                        <span className={!annual ? 'active' : ''}>Per Season</span>
                        <button className="toggle-switch" onClick={() => setAnnual(!annual)}>
                            <div className={`toggle-knob ${annual ? 'right' : ''}`} />
                        </button>
                        <span className={annual ? 'active' : ''}>
                            Annual <span className="save-badge">Save 20%</span>
                        </span>
                    </div>
                </motion.div>

                {/* Plans */}
                <div className="pricing-grid">
                    {planList.map((plan, i) => (
                        <motion.div
                            key={i}
                            className={`pricing-card glass-card ${plan.popular ? 'popular' : ''}`}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.15, duration: 0.6 }}
                            whileHover={{ y: -8 }}
                        >
                            {plan.popular && (
                                <div className="popular-badge">
                                    <FaStar /> Most Popular
                                </div>
                            )}

                            <div className="plan-header">
                                <div style={{ color: plan.color }} className="plan-icon"><FaLeaf /></div>
                                <div className="plan-tag">{plan.tag}</div>
                                <h3 className="plan-name">{plan.name}</h3>
                                <p className="plan-desc">{plan.description}</p>
                            </div>

                            <div className="plan-price">
                                <span className="price-value" style={{ color: plan.color }}>{plan.price}</span>
                                <span className="price-period">{plan.period}</span>
                            </div>

                            <ul className="plan-features">
                                {plan.features.map((f: string, j: number) => (
                                    <li key={j}>
                                        <span className="feature-check" style={{ background: `${plan.color}20`, color: plan.color }}>
                                            <FaCheck />
                                        </span>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`plan-cta ${plan.popular ? 'popular' : ''}`}
                                style={plan.popular ? { background: `linear-gradient(135deg, ${plan.color}, #d97706)`, boxShadow: `0 8px 24px ${plan.color}40` } : { borderColor: `${plan.color}44`, color: plan.color }}
                            >
                                {plan.buttonText}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
