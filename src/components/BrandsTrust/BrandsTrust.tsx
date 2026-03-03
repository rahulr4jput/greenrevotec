import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './BrandsTrust.css';

interface Brand {
    id: string;
    name: string;
    logo: string;
    link: string;
    isActive: boolean;
}

const defaultBrands = [
    { id: '1', name: 'IFFCO', desc: "India's Largest Fertilizer Cooperative", logo: '', link: '', isActive: true },
    { id: '2', name: 'Bayer CropScience', desc: 'Global Crop Protection Leader', logo: '', link: '', isActive: true },
    { id: '3', name: 'UPL Limited', desc: "World's 5th Largest Agrochemicals", logo: '', link: '', isActive: true },
    { id: '4', name: 'Syngenta', desc: 'Global GreenRevotec Innovator', logo: '', link: '', isActive: true },
    { id: '5', name: 'BASF India', desc: 'Chemical & AgriScience Giant', logo: '', link: '', isActive: true },
    { id: '6', name: 'Coromandel International', desc: 'Integrated AgriSolutions Provider', logo: '', link: '', isActive: true },
    { id: '7', name: 'PI Industries', desc: 'Crop Protection Specialists', logo: '', link: '', isActive: true },
    { id: '8', name: 'Godrej Agrovet', desc: 'Diversified AgriSciences Leader', logo: '', link: '', isActive: true },
    { id: '9', name: 'Dhanuka Agritech', desc: 'Pesticide & Fertilizer Brand', logo: '', link: '', isActive: true },
    { id: '10', name: 'Rallis India', desc: 'TATA Group Agri Company', logo: '', link: '', isActive: true },
];

const BrandsTrust: React.FC = () => {
    const [brandList, setBrandList] = useState<any[]>([]);
    const [isVisible, setIsVisible] = useState<boolean | null>(null);
    const [header, setHeader] = useState({
        label: "Trusted By",
        title: "Brands That Trust Us",
        subtitle: "Partnered with India's and the world's most respected agricultural brands to bring you the best products and innovations."
    });
    const [stats, setStats] = useState<any[]>([
        { value: '50+', label: 'Brand Partners' },
        { value: '500+', label: 'Distributor Network' },
        { value: '22', label: 'States Covered' },
        { value: '₹500Cr+', label: 'Annual GMV' },
    ]);

    useEffect(() => {
        // Check section visibility from API (source of truth)
        const checkVisibility = async () => {
            try {
                const res = await fetch('/api/settings/admin_section_visibility');
                if (res.ok) {
                    const data = await res.json();
                    if (data && typeof data === 'object') {
                        setIsVisible(data['trusted-by'] !== false);
                        return;
                    }
                }
            } catch { }
            // Fallback to localStorage
            const raw = localStorage.getItem('admin_section_visibility');
            const data = raw ? JSON.parse(raw) : null;
            setIsVisible(data ? data['trusted-by'] !== false : true);
        };
        checkVisibility();

        const stored = localStorage.getItem('admin_brands');
        if (stored) {
            const parsed = JSON.parse(stored);
            const activeBrands = parsed.filter((b: any) => b.isActive);
            if (activeBrands.length > 0) {
                setBrandList(activeBrands);
            } else {
                setBrandList(defaultBrands);
            }
        } else {
            setBrandList(defaultBrands);
        }

        const storedHeader = localStorage.getItem('admin_brands_header');
        if (storedHeader) {
            setHeader(JSON.parse(storedHeader));
        }

        const storedStats = localStorage.getItem('admin_brands_stats');
        if (storedStats) {
            setStats(JSON.parse(storedStats));
        }

        // Re-check on storage events
        const onStorage = () => { checkVisibility(); };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    // Don't render while checking OR if hidden by admin
    if (isVisible === false) return null;

    return (
        <section className="section brands-trust" id="brands">
            <div className="container">
                <motion.div
                    className="section-header centered"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="section-label">{header.label}</div>
                    <h2 className="section-title">
                        {header.title.includes(' ') ? (
                            <>
                                {header.title.split(' ').slice(0, -1).join(' ')} <span>{header.title.split(' ').slice(-1)}</span>
                            </>
                        ) : header.title}
                    </h2>
                    <p className="section-subtitle">
                        {header.subtitle}
                    </p>
                </motion.div>

                {/* Continuous scroll ticker */}
                <div className="brands-ticker-wrap">
                    <div className="brands-ticker">
                        {[...brandList, ...brandList].map((brand, i) => (
                            <div key={i} className="brand-logo-card glass-card">
                                {brand.logo ? (
                                    <div className="brand-logo-img-wrap" style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={brand.logo} alt={brand.name} style={{ maxHeight: '100%', maxWidth: '140px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                                    </div>
                                ) : (
                                    <div className="brand-logo-text" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{brand.name}</div>
                                )}
                                <div className="brand-logo-desc">{brand.desc || 'Brand Partner'}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Row */}
                <motion.div
                    className="brands-stats"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    {stats.map((stat, i) => (
                        <div key={i} className="brands-stat">
                            <div className="brands-stat-value">{stat.value}</div>
                            <div className="brands-stat-label">{stat.label}</div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default BrandsTrust;
