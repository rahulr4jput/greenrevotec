import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaLeaf, FaTractor, FaFlask, FaRobot, FaUsers, FaChartLine, FaHandshake, FaMicrochip, FaTimes, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import type { IconType } from 'react-icons';
import './Services.css';

interface Service {
    id: string;
    IconComponent: IconType;
    title: string;
    description: string;
    gradient: string;
    tag: string;
    image: string;
    thumbnail?: string;
    iconName?: string;
    isActive?: boolean;
    bulletPoints?: string[];
    additionalImages?: string[];
    contentBlocks?: { image: string; title: string; description: string }[];
}

const AVAILABLE_ICONS: Record<string, IconType> = {
    FaLeaf, FaTractor, FaFlask, FaRobot, FaUsers, FaChartLine, FaHandshake, FaMicrochip
};


const ServiceImageCarousel: React.FC<{ mainImage: string; additionalImages?: string[]; title: string }> = ({ mainImage, additionalImages = [], title }) => {
    const allImages = [mainImage, ...additionalImages];
    const [idx, setIdx] = useState(0);

    if (allImages.length <= 1) {
        return <img src={mainImage} alt={title} />;
    }

    const next = () => setIdx((prev) => (prev + 1) % allImages.length);
    const prev = () => setIdx((prev) => (prev - 1 + allImages.length) % allImages.length);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={idx}
                        src={allImages[idx]}
                        alt={`${title} ${idx}`}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '16px' }}
                    />
                </AnimatePresence>

                <button onClick={prev} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button onClick={next} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.3)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>

            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
                {allImages.map((_, i) => (
                    <div
                        key={i}
                        onClick={() => setIdx(i)}
                        style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: i === idx ? '#fff' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

const Services: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [showMobileBullets, setShowMobileBullets] = useState(false);

    // Form State (Same as Contact.tsx)
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [captchaError, setCaptchaError] = useState('');

    const generateCaptcha = () => {
        setNum1(Math.floor(Math.random() * 10) + 1);
        setNum2(Math.floor(Math.random() * 10) + 1);
        setCaptchaAnswer('');
        setCaptchaError('');
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) return;

        if (parseInt(captchaAnswer) !== (num1 + num2)) {
            setCaptchaError('Incorrect answer.');
            generateCaptcha();
            return;
        }

        const leadRecord = {
            ...form,
            subject: `Inquiry for ${selectedService.title}`,
            type: 'Service',
            productName: selectedService.title,
            source: 'Service Modal Quote'
        };

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadRecord)
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    setShowQuoteForm(false);
                    setSelectedService(null);
                    setForm({ name: '', email: '', phone: '', message: '' });
                }, 3000);
            }
        } catch (error) {
            console.error('Error submitting service lead:', error);
        }
    };

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/services');
                if (res.ok) {
                    const data = await res.json();
                    const activeOnly = data.filter((s: any) => s.isActive !== false);
                    const hydrated = activeOnly.map((s: any) => ({
                        ...s,
                        IconComponent: AVAILABLE_ICONS[s.iconName] || FaHandshake
                    }));
                    setServices(hydrated);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        };

        fetchServices();
        generateCaptcha();
    }, []);

    useEffect(() => {
        if (services.length === 0) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % services.length);
            setShowMobileBullets(false); // Reset on auto-slide
        }, 8000); // Increased time a bit
        return () => clearInterval(timer);
    }, [services.length]);

    const handleTabClick = (idx: number) => {
        setActiveIndex(idx);
        setShowMobileBullets(false); // Reset on manual click
    };


    return (
        <section className="section services" id="services">
            <div className="container">
                <motion.div
                    className="section-header centered"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="section-label">Our Services</div>
                    <h2 className="section-title">
                        Comprehensive <span>GreenRevotec Services</span>
                    </h2>
                    <p className="section-subtitle">
                        From soil analysis to market access, we offer end-to-end services that cover
                        every critical touchpoint in the modern farming value chain.
                    </p>
                </motion.div>

                {services.length === 0 ? (
                    <motion.div
                        className="no-services-placeholder"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '24px',
                            border: '1px dashed rgba(255,255,255,0.1)'
                        }}
                    >
                        <p style={{ color: 'var(--color-primary)', fontSize: '1.2rem', marginBottom: '10px' }}>
                            New services coming soon!
                        </p>
                        <p style={{ opacity: 0.7 }}>
                            We are currently updating our service portfolio to bring you the best agricultural solutions.
                        </p>
                    </motion.div>
                ) : (
                    <div className="services-tabs">
                        {services.map((service, i) => {
                            const Icon = service.IconComponent;
                            return (
                                <button
                                    key={i}
                                    className={`service-tab ${i === activeIndex ? 'active' : ''}`}
                                    onClick={() => handleTabClick(i)}
                                >
                                    <Icon className="tab-icon" />
                                    <span>{service.title}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {services.length > 0 && (
                    <div className="services-carousel">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex}
                                className="service-slide"
                                initial={{ opacity: 0, scale: 0.98, x: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.98, x: -20 }}
                                transition={{ duration: 0.4, ease: 'easeOut' as any }}
                            >
                                <img
                                    src={services[activeIndex].image}
                                    alt={services[activeIndex].title}
                                    className="service-slide-image"
                                />
                                <div className="service-slide-overlay">
                                    <div className="service-tag">{services[activeIndex].tag}</div>
                                    <h3 className="service-slide-title">{services[activeIndex].title}</h3>

                                    {/* Bullet Points with Mobile Toggle */}
                                    {services[activeIndex].bulletPoints && services[activeIndex].bulletPoints.length > 0 && (
                                        <div className="service-slide-bullets-container">
                                            <button
                                                className="mobile-bullet-toggle"
                                                onClick={() => setShowMobileBullets(!showMobileBullets)}
                                            >
                                                {showMobileBullets ? "Hide Features" : "Show Features"}
                                                {showMobileBullets ? <FaChevronUp /> : <FaChevronDown />}
                                            </button>

                                            <div className={`service-slide-bullets ${showMobileBullets ? 'mobile-visible' : 'mobile-hidden'}`}>
                                                {services[activeIndex].bulletPoints.map((point, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        className="service-bullet-pill glass-card"
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                    >
                                                        <span className="bullet-dot"></span>
                                                        {point}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* <p className="service-slide-desc">{services[activeIndex].description}</p> */}
                                    <RouterLink
                                        to={`/services/${services[activeIndex].id}`}
                                        className="btn btn-primary btn-sm"
                                    >
                                        View More
                                    </RouterLink>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}

                <motion.div
                    className="view-all-services"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginTop: '60px' }}
                >
                    <RouterLink to="/services" className="btn btn-outline btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        Show All Services <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </RouterLink>
                </motion.div>
            </div>

            {/* Service Details Modal */}
            <AnimatePresence>
                {selectedService && (
                    <motion.div
                        className="service-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedService(null)}
                    >
                        <motion.div
                            className="service-modal-content"
                            initial={{ scale: 0.9, y: 30, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 30, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="service-modal-close" onClick={() => setSelectedService(null)}>
                                <FaTimes />
                            </button>

                            <div className="service-modal-grid">
                                <div className="service-modal-left">
                                    <div className="service-modal-icon-wrap" style={{
                                        background: selectedService.gradient,
                                        width: '60px', height: '60px', borderRadius: '16px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '28px', marginBottom: '24px',
                                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                    }}>
                                        {selectedService.iconName === 'Custom' && selectedService.iconName ? (
                                            <img src={(selectedService as any).customIcon} alt="Custom Icon" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                                        ) : (
                                            <selectedService.IconComponent />
                                        )}
                                    </div>
                                    <AnimatePresence mode="wait">
                                        {!showQuoteForm ? (
                                            <motion.div
                                                key="details"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}
                                            >
                                                <span className="service-tag">{selectedService.tag}</span>
                                                <h2 className="service-modal-title">{selectedService.title}</h2>
                                                <div className="service-modal-divider" style={{ background: selectedService.gradient }}></div>

                                                {selectedService.bulletPoints && selectedService.bulletPoints.length > 0 && (
                                                    <ul className="service-modal-bullets" style={{
                                                        padding: 0,
                                                        margin: '20px 0',
                                                        listStyle: 'none',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: '12px'
                                                    }}>
                                                        {selectedService.bulletPoints.map((point, idx) => (
                                                            <li key={idx} style={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                gap: '10px',
                                                                color: '#4b5563',
                                                                fontSize: '0.95rem',
                                                                lineHeight: '1.5'
                                                            }}>
                                                                <div style={{
                                                                    marginTop: '6px',
                                                                    width: '6px',
                                                                    height: '6px',
                                                                    borderRadius: '50%',
                                                                    background: selectedService.gradient,
                                                                    flexShrink: 0
                                                                }}></div>
                                                                {point}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}

                                                <p className="service-modal-desc">{selectedService.description}</p>

                                                {/* Enhanced A+ Content Modules */}
                                                {selectedService.contentBlocks && selectedService.contentBlocks.length > 0 && (
                                                    <div className="service-content-modules" style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
                                                        {selectedService.contentBlocks.map((block, idx) => (
                                                            <div key={idx} className={`content-module ${idx % 2 !== 0 ? 'reverse' : ''}`} style={{
                                                                display: 'flex',
                                                                gap: '30px',
                                                                flexDirection: idx % 2 !== 0 ? 'row-reverse' : 'row',
                                                                alignItems: 'center',
                                                                flexWrap: 'wrap'
                                                            }}>
                                                                <div className="module-image" style={{ flex: 1, minWidth: '220px' }}>
                                                                    <img src={block.image} alt={block.title} style={{ width: '100%', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                                                </div>
                                                                <div className="module-text" style={{ flex: 1.2, minWidth: '220px' }}>
                                                                    <h3 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '10px' }}>{block.title}</h3>
                                                                    <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '0.9rem' }}>{block.description}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <button
                                                    className="btn btn-primary"
                                                    style={{ marginTop: '30px', alignSelf: 'flex-start' }}
                                                    onClick={() => {
                                                        setShowQuoteForm(true);
                                                        generateCaptcha();
                                                    }}
                                                >
                                                    Get a Quote
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="form"
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="modal-quote-form"
                                                style={{ width: '100%' }}
                                            >
                                                <h3 style={{ marginBottom: '15px', fontSize: '1.25rem' }}>Request Quote for {selectedService.title}</h3>

                                                {submitted ? (
                                                    <div style={{ padding: '40px 20px', textAlign: 'center', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #cef7e2' }}>
                                                        <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
                                                        <h4 style={{ color: '#065f46', marginBottom: '5px' }}>Request Received!</h4>
                                                        <p style={{ color: '#065f46', fontSize: '0.9rem' }}>We'll contact you shortly regarding <strong>{selectedService.title}</strong>.</p>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                            <div className="form-group" style={{ margin: 0 }}>
                                                                <input type="text" name="name" value={form.name} onChange={handleFormChange} placeholder="Full Name" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                                            </div>
                                                            <div className="form-group" style={{ margin: 0 }}>
                                                                <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} placeholder="Phone" required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                                            </div>
                                                        </div>
                                                        <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="Email Address" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                                                        <textarea name="message" value={form.message} onChange={handleFormChange} placeholder="Tell us about your requirements..." rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', resize: 'none' }}></textarea>

                                                        <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                            <label style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '5px' }}>Security Check: {num1} + {num2} = ?</label>
                                                            <input
                                                                type="number"
                                                                value={captchaAnswer}
                                                                onChange={(e) => setCaptchaAnswer(e.target.value)}
                                                                placeholder="Sum"
                                                                required
                                                                style={{ width: '80px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }}
                                                            />
                                                            {captchaError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginLeft: '10px' }}>{captchaError}</span>}
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Submit Request</button>
                                                            <button type="button" className="btn" style={{ background: '#f3f4f6', color: '#374151' }} onClick={() => setShowQuoteForm(false)}>Back</button>
                                                        </div>
                                                    </form>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <div className="service-modal-right">
                                    <ServiceImageCarousel
                                        mainImage={selectedService.image}
                                        additionalImages={selectedService.additionalImages}
                                        title={selectedService.title}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Services;
