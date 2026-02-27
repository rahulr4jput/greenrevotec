import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaAward, FaMedal, FaStar, FaLeaf, FaGlobeAsia, FaUsers, FaFlask } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import './Awards.css';

interface Award {
    IconComponent: IconType;
    title: string;
    org: string;
    year: string;
    color: string;
}

const defaultAwards: Award[] = [
    { IconComponent: FaTrophy as IconType, title: 'Best GreenRevotec Company of the Year', org: 'India Agriculture Awards 2024', year: '2024', color: '#f5a623' },
    { IconComponent: FaAward as IconType, title: 'Excellence in Organic Farming Innovation', org: 'FICCI Agriculture Summit', year: '2024', color: '#25b565' },
    { IconComponent: FaStar as IconType, title: 'Top 50 AgriStartup — India', org: 'YourStory GreenRevotec 50 List', year: '2023', color: '#38bdf8' },
    { IconComponent: FaMedal as IconType, title: 'Sustainable Farming Champion', org: 'CII Sustainability Awards', year: '2023', color: '#e879f9' },
    { IconComponent: FaLeaf as IconType, title: 'Green Innovation Excellence Award', org: 'Ministry of Agriculture, India', year: '2023', color: '#84cc16' },
    { IconComponent: FaGlobeAsia as IconType, title: 'Asia Pacific GreenRevotec Pioneer', org: 'Asia Agriculture Leaders Forum', year: '2022', color: '#f97316' },
    { IconComponent: FaUsers as IconType, title: 'Best Farmer Welfare Initiative', org: 'NABARD National Recognition', year: '2022', color: '#25b565' },
    { IconComponent: FaFlask as IconType, title: 'R&D Innovation in Agriculture', org: 'ICAR Technology Awards', year: '2022', color: '#f5a623' },
];

const getIcon = (type: string): IconType => {
    switch (type) {
        case 'trophy': return FaTrophy as IconType;
        case 'medal': return FaMedal as IconType;
        default: return FaAward as IconType;
    }
};

const getIconColor = (type: string) => {
    switch (type) {
        case 'trophy': return '#f5a623';
        case 'medal': return '#e879f9';
        default: return '#25b565';
    }
};

const Awards: React.FC = () => {
    const [awardList, setAwardList] = useState<Award[]>([]);
    const [header, setHeader] = useState({
        label: "Recognition",
        title: "Awards & <span>Achievements</span>",
        subtitle: "GreenRevotec's journey is marked by excellence and commitment to the agricultural community."
    });

    useEffect(() => {
        const loadRecognition = () => {
            const consolidated = localStorage.getItem('admin_recognition_config');
            if (consolidated) {
                const data = JSON.parse(consolidated);

                // Header
                if (data.header) setHeader(data.header);

                // List
                if (data.list) {
                    const active = data.list.filter((i: any) => i.isActive);
                    if (active.length > 0) {
                        const mapped = active.map((a: any) => ({
                            IconComponent: getIcon(a.iconType),
                            title: a.title,
                            org: a.organization,
                            year: a.year,
                            color: getIconColor(a.iconType)
                        }));
                        setAwardList(mapped);
                    } else {
                        setAwardList(defaultAwards);
                    }
                }
            } else {
                // Fallback to legacy
                const stored = localStorage.getItem('admin_recognition');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const active = parsed.filter((i: any) => i.isActive);
                    if (active.length > 0) {
                        const mapped = active.map((a: any) => ({
                            IconComponent: getIcon(a.iconType),
                            title: a.title,
                            org: a.organization,
                            year: a.year,
                            color: getIconColor(a.iconType)
                        }));
                        setAwardList(mapped);
                    } else {
                        setAwardList(defaultAwards);
                    }
                } else {
                    setAwardList(defaultAwards);
                }

                const storedHeader = localStorage.getItem('admin_recognition_header');
                if (storedHeader) setHeader(JSON.parse(storedHeader));
            }
        };

        loadRecognition();
        window.addEventListener('storage', loadRecognition);
        return () => window.removeEventListener('storage', loadRecognition);
    }, []);

    return (
        <section className="section section-dark awards" id="recognition">
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
                    <p className="section-subtitle">
                        {header.subtitle}
                    </p>
                </motion.div>

                <div className="awards-grid">
                    {awardList.map((award, i) => {
                        const Icon = award.IconComponent;
                        return (
                            <motion.div
                                key={i}
                                className="award-card glass-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.5 }}
                                whileHover={{ y: -6 }}
                            >
                                <div
                                    className="award-icon"
                                    style={{ color: award.color, background: `${award.color}18` }}
                                >
                                    <Icon />
                                </div>
                                <div className="award-year" style={{ color: award.color }}>{award.year}</div>
                                <h3 className="award-title">{award.title}</h3>
                                <p className="award-org">{award.org}</p>
                                <div className="award-line" style={{ background: award.color }} />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Awards;
