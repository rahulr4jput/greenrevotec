import React, { ReactElement } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
    FaLeaf, FaFlask, FaTractor, FaSatellite, FaMicroscope,
    FaHandshake, FaChartBar, FaShieldAlt, FaArrowRight, FaCheckCircle, FaRocket
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import './WhyChooseUs.css';

interface Reason {
    id: string;
    iconName: string;
    title: string;
    description: string;
    color: string;
    isActive: boolean;
}

interface Stat {
    id: string;
    label: string;
    value: string;
    suffix: string;
    iconName: string;
    color: string;
    isActive: boolean;
}

const ICON_MAP: Record<string, any> = {
    FaLeaf, FaFlask, FaTractor, FaSatellite, FaMicroscope, FaHandshake,
    FaChartBar, FaShieldAlt, FaCheckCircle, FaRocket
};

const defaultReasons: Reason[] = [
    { id: 'reason-0', iconName: 'FaLeaf', title: 'Certified Organic', description: 'Meeting global organic standards for peak safety.', color: '#25b565', isActive: true },
    { id: 'reason-1', iconName: 'FaMicroscope', title: 'R&D Driven', description: 'Solutions developed in world-class research labs.', color: '#84cc16', isActive: true },
    { id: 'reason-2', iconName: 'FaTractor', title: 'End-to-End Support', description: 'Dedicated guidance from planting to harvest.', color: '#f5a623', isActive: true },
    { id: 'reason-3', iconName: 'FaSatellite', title: 'Smart GreenRevotec', description: 'Using AI and IoT for data-driven decisions.', color: '#38bdf8', isActive: true }
];

const defaultStats: Stat[] = [
    { id: 'stat-0', label: 'Happy Farmers', value: '50', suffix: 'K+', iconName: 'FaHandshake', color: '#25b565', isActive: true },
    { id: 'stat-1', label: 'Yield Increase', value: '40', suffix: '%', iconName: 'FaChartBar', color: '#38bdf8', isActive: true },
    { id: 'stat-2', label: 'Network Spread', value: '15', suffix: '+States', iconName: 'FaSatellite', color: '#f5a623', isActive: true }
];

const StatCounter: React.FC<{ value: string; suffix: string; label: string; color: string }> = ({ value, suffix, label, color }) => {
    const [count, setCount] = React.useState(0);
    const { ref, inView } = useInView({ triggerOnce: true });

    React.useEffect(() => {
        if (inView) {
            let start = 0;
            const end = parseInt(value);
            if (start === end) return;

            let timer = setInterval(() => {
                start += 1;
                setCount(start);
                if (start === end) clearInterval(timer);
            }, 50);
            return () => clearInterval(timer);
        }
    }, [inView, value]);

    return (
        <div ref={ref} className="stat-item" style={{ '--accent-color': color } as any}>
            <div className="stat-value">
                {count}<span>{suffix}</span>
            </div>
            <div className="stat-label">{label}</div>
        </div>
    );
};

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const WhyChooseUs: React.FC = () => {
    const [header, setHeader] = React.useState({
        label: 'Why Green Revotec',
        title: 'Pioneering Sustainable Modern Agriculture',
        subtitle: "We don't just sell products; we deliver a complete ecosystem for the modern farmer. Our solutions are designed to boost yields while preserving soil health for generations to come."
    });
    const [reasons, setReasons] = React.useState<Reason[]>(defaultReasons);
    const [stats, setStats] = React.useState<Stat[]>(defaultStats);
    const [features, setFeatures] = React.useState<string[]>(['Direct Farmer Connection', 'Real-time Crop Advisories', 'Climate-Resilient Strategies']);

    React.useEffect(() => {
        const fetchContent = () => {
            const consolidated = localStorage.getItem('admin_why_choose_us');
            if (consolidated) {
                const data = JSON.parse(consolidated);
                if (data.header) setHeader(data.header);
                if (data.reasons) setReasons(data.reasons.filter((r: Reason) => r.isActive));
                if (data.stats) setStats(data.stats.filter((s: Stat) => s.isActive));
                if (data.features) setFeatures(data.features || []);
            } else {
                // Fallback to legacy
                const stored = localStorage.getItem('admin_why_choose_us');
                if (stored) {
                    const data = JSON.parse(stored);
                    if (data.header) setHeader(data.header);
                    if (data.reasons) setReasons(data.reasons.filter((r: Reason) => r.isActive));
                    if (data.stats) setStats(data.stats.filter((s: Stat) => s.isActive));
                    if (data.features) setFeatures(data.features || []);
                }
            }
        };

        fetchContent();
        window.addEventListener('storage', fetchContent);
        return () => window.removeEventListener('storage', fetchContent);
    }, []);
    return (
        <section className="section whychoose" id="whychooseus">
            <div className="container">
                <div className="whychoose-wrapper">
                    <motion.div
                        className="whychoose-content"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="section-label">{header.label}</div>
                        <h2 className="section-title">
                            {header.title.split(' ').slice(0, -2).join(' ')} <span>{header.title.split(' ').slice(-2).join(' ')}</span>
                        </h2>
                        <p className="section-subtitle" style={{ textAlign: 'left', margin: '20px 0 40px' }}>
                            {header.subtitle}
                        </p>

                        <div className="stats-container">
                            {stats.map((stat, i) => (
                                <StatCounter key={stat.id || i} {...stat} />
                            ))}
                        </div>

                        <div className="features-list">
                            {features.map((feat, i) => (
                                <div key={i} className="feature-item">
                                    <FaCheckCircle className="check-icon" />
                                    <span>{feat}</span>
                                </div>
                            ))}
                        </div>

                        <button className="btn btn-primary" style={{ padding: '15px 35px' }}>
                            Explore Our Process <FaArrowRight style={{ marginLeft: '10px' }} />
                        </button>
                    </motion.div>

                    <div className="whychoose-visual">
                        <motion.div
                            className="whychoose-grid-v2"
                            variants={containerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                        >
                            {reasons.map((reason, i) => {
                                const Icon = ICON_MAP[reason.iconName] || FaLeaf;
                                return (
                                    <motion.div
                                        key={reason.id || i}
                                        variants={itemVariants}
                                        className="reason-card-v2 glass-card"
                                        style={{ '--card-color': reason.color } as any}
                                    >
                                        <div
                                            className="reason-icon-v2"
                                            style={{ color: reason.color, background: `${reason.color}18` }}
                                        >
                                            <Icon />
                                        </div>
                                        <div className="reason-info-v2">
                                            <h3 className="reason-title-v2">{reason.title}</h3>
                                            <p className="reason-desc-v2">{reason.description}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        {/* Decorative Background Element */}
                        <div className="whychoose-blob"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
