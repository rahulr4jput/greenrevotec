import React from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaLeaf, FaAtom, FaCogs, FaGlobe, FaAward } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import './Speciality.css';

interface Speciality {
    number: string;
    title: string;
    description: string;
    features: string[];
    IconComponent: IconType;
}

const specialities: Speciality[] = [
    {
        number: '01',
        title: 'Proprietary BioFormulation Technology',
        description: 'Our patented BioFormula technology combines beneficial microorganisms with plant extracts to create self-sustaining soil ecosystems that naturally boost crop productivity.',
        features: ['Patent-protected formulations', '800% microbiome enhancement', 'Multi-crop compatibility'],
        IconComponent: FaAtom as IconType,
    },
    {
        number: '02',
        title: 'Nano-Nutrient Delivery Systems',
        description: 'Breakthrough nano-encapsulation technology ensures nutrients reach plant cells with 3x higher absorption rates, reducing fertilizer wastage significantly.',
        features: ['3x higher absorption', 'Reduced input costs by 35%', 'Zero soil toxicity'],
        IconComponent: FaCogs as IconType,
    },
    {
        number: '03',
        title: 'Climate-Adaptive Crop Solutions',
        description: 'AI and satellite data-powered crop advisory that adapts recommendations in real-time to rainfall, temperature, and market demand fluctuations.',
        features: ['Satellite data integration', 'Real-time weather sync', 'AI-driven crop planning'],
        IconComponent: FaGlobe as IconType,
    },
    {
        number: '04',
        title: 'Multi-Awarded Research Team',
        description: 'Our 140+ agricultural scientists and agronomists have won national and international recognitions for breakthrough research in crop sciences and sustainability.',
        features: ['50+ industry awards', '140+ agri-scientists', 'ICAR & NABARD Certified'],
        IconComponent: FaAward as IconType,
    },
];

const Speciality: React.FC = () => {
    return (
        <section className="section section-dark speciality" id="speciality">
            <div className="container">
                <motion.div
                    className="section-header centered"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="section-label">Our Speciality</div>
                    <h2 className="section-title">
                        What Makes Us <span>Truly Different</span>
                    </h2>
                    <p className="section-subtitle">
                        Our unique proprietary technologies and scientific innovations set us apart from
                        conventional agrochemical companies.
                    </p>
                </motion.div>

                <div className="speciality-list">
                    {specialities.map((item, i) => {
                        const Icon = item.IconComponent;
                        return (
                            <motion.div
                                key={i}
                                className={`speciality-item ${i % 2 === 1 ? 'reverse' : ''}`}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: 0.1 }}
                            >
                                {/* Visual Side */}
                                <div className="speciality-visual">
                                    <div className="speciality-visual-card glass-card">
                                        <div className="speciality-number">{item.number}</div>
                                        <div className="speciality-main-icon"><Icon /></div>
                                        <div className="speciality-glow" />
                                    </div>
                                </div>

                                {/* Content Side */}
                                <div className="speciality-content">
                                    <div className="speciality-tag">
                                        <FaLeaf /> Core Differentiator
                                    </div>
                                    <h3 className="speciality-title">{item.title}</h3>
                                    <p className="speciality-desc">{item.description}</p>
                                    <ul className="speciality-features">
                                        {item.features.map((f, j) => (
                                            <li key={j}>
                                                <span className="check-icon"><FaCheck /></span>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Speciality;
