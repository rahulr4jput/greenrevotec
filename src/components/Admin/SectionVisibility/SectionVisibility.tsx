import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaSave, FaSync } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../AdminLayout.css';

interface SectionVisibility {
    id: string;
    label: string;
    description: string;
    isActive: boolean;
}

const DEFAULT_SECTIONS: SectionVisibility[] = [
    { id: 'hero', label: 'Home Banner', description: 'Top section with main headline', isActive: true },
    { id: 'products', label: 'Products', description: 'Product catalog and highlights', isActive: true },
    { id: 'services', label: 'Services', description: 'Core business service offerings', isActive: true },
    { id: 'projects', label: 'Our Projects', description: 'Featured project portfolio', isActive: true },
    { id: 'trusted-by', label: 'Trusted By', description: 'Partner and brand logos', isActive: false },
    { id: 'gallery', label: 'Our Gallery', description: 'Photo collection of work', isActive: true },
    { id: 'recognition', label: 'Recognition', description: 'Awards and certifications', isActive: false },
    { id: 'voice-of-customer', label: 'Voice of Customer', description: 'Client testimonials', isActive: true },
    { id: 'pricing', label: 'Pricing Plans', description: 'Service and package pricing', isActive: false },
    { id: 'why-choose-us', label: 'Why Choose Us', description: 'Unique selling points', isActive: true },
    { id: 'onboard', label: 'Onboard With Us', description: 'Partner onboarding section', isActive: false },
    { id: 'contact', label: 'Contact Us', description: 'Contact form and info', isActive: true },
    { id: 'social', label: 'Social Media', description: 'Footer social links', isActive: true },
    { id: 'footer', label: 'Footer Section', description: 'Bottom navigation and info', isActive: true },
];

const SectionVisibility: React.FC = () => {
    const [sections, setSections] = useState<SectionVisibility[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchVisibility = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/settings/admin_section_visibility');
            if (response.ok) {
                const data = await response.json();
                if (data && typeof data === 'object') {
                    const mapped = DEFAULT_SECTIONS.map(s => ({
                        ...s,
                        isActive: data[s.id] !== false
                    }));
                    setSections(mapped);
                    localStorage.setItem('admin_section_visibility', JSON.stringify(data));
                    setLoading(false);
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch visibility:", error);
        }

        // Fallback
        const stored = localStorage.getItem('admin_section_visibility');
        if (stored) {
            const data = JSON.parse(stored);
            const mapped = DEFAULT_SECTIONS.map(s => ({
                ...s,
                isActive: data[s.id] !== false
            }));
            setSections(mapped);
        } else {
            setSections(DEFAULT_SECTIONS);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVisibility();
    }, []);

    const toggleSection = (id: string) => {
        setSections(sections.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    };

    const handleSave = async () => {
        const visibilityMap: Record<string, boolean> = {};
        sections.forEach(s => {
            visibilityMap[s.id] = s.isActive;
        });

        try {
            const response = await fetch('/api/settings/admin_section_visibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: visibilityMap })
            });

            if (response.ok) {
                localStorage.setItem('admin_section_visibility', JSON.stringify(visibilityMap));
                window.dispatchEvent(new Event('storage'));
                toast.success('Visibility updated!');
            }
        } catch (error) {
            console.error("Error saving visibility:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Section Visibility Control</h1>
                    <p className="admin-page-subtitle">Enable or disable entire sections of your website with one click.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-cancel" onClick={fetchVisibility} disabled={loading}>
                        <FaSync className={loading ? 'spin' : ''} /> {loading ? 'Loading...' : 'Reset'}
                    </button>
                    <button className="btn-save" onClick={handleSave}>
                        <FaSave /> Save Changes
                    </button>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px',
                marginTop: '30px'
            }}>
                {sections.map((section) => (
                    <motion.div
                        key={section.id}
                        className={`category-form-card ${!section.isActive ? 'disabled' : ''}`}
                        style={{ margin: 0, padding: '24px', opacity: section.isActive ? 1 : 0.7 }}
                        whileHover={{ y: -5 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: section.isActive ? '#10b981' : '#ef4444',
                                    boxShadow: section.isActive ? '0 0 10px #10b981' : 'none'
                                }}></div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>{section.label}</h3>
                            </div>
                            <button
                                className={`btn-icon ${section.isActive ? '' : 'delete'}`}
                                onClick={() => toggleSection(section.id)}
                                title={section.isActive ? 'Hide Section' : 'Show Section'}
                                style={{
                                    background: section.isActive ? '#ecfdf5' : '#fef2f2',
                                    color: section.isActive ? '#10b981' : '#ef4444',
                                    border: `1px solid ${section.isActive ? '#10b98144' : '#ef444444'}`
                                }}
                            >
                                {section.isActive ? <FaEye /> : <FaEyeSlash />}
                            </button>
                        </div>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {section.description}
                        </p>
                        <div style={{
                            marginTop: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: section.isActive ? '#10b981' : '#ef4444',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            Status: {section.isActive ? 'Visible' : 'Hidden'}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{
                marginTop: '40px',
                padding: '24px',
                background: '#f9fafb',
                borderRadius: '12px',
                border: '1px dashed #d1d5db',
                color: '#6b7280',
                fontSize: '0.9rem',
                textAlign: 'center'
            }}>
                <p style={{ margin: 0 }}>Note: Some sections might still be visible in the navigation menu but will be hidden from the actual page content.</p>
            </div>
        </div>
    );
};

export default SectionVisibility;
