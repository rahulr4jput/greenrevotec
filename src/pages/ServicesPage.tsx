import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO/SEO';
import { usePageReady } from '../components/PageTransition/PageTransition';
import {
    FaLeaf, FaTractor, FaFlask, FaRobot, FaUsers, FaChartLine, FaHandshake, FaMicrochip,
    FaChevronLeft, FaChevronRight, FaCheckCircle, FaQuoteRight, FaQuoteLeft,
    FaUser, FaPhone, FaEnvelope, FaPen, FaRocket, FaArrowRight
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import BottomNav from '../components/BottomNav/BottomNav';
import './ServicesPage.css';

interface Service {
    id: string;
    title: string;
    description: string;
    gradient: string;
    tag: string;
    image: string;
    thumbnail?: string;
    iconName: string;
    isActive: boolean;
    bulletPoints: string[];
    additionalImages: string[];
    contentBlocks?: { image: string; title: string; description: string }[];
    serviceCategory?: string;
}

const AVAILABLE_ICONS: Record<string, IconType> = {
    FaLeaf, FaTractor, FaFlask, FaRobot, FaUsers, FaChartLine, FaHandshake, FaMicrochip
};

const ServicesPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const reportPageReady = usePageReady();
    const [services, setServices] = useState<Service[]>([]);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Form State
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch('/api/services');
                if (res.ok) {
                    const data = await res.json();
                    const activeServices = data.filter((s: Service) => s.isActive !== false);
                    setServices(activeServices);

                    // Initial selection logic
                    if (id) {
                        const target = activeServices.find((s: Service) => s.id === id);
                        if (target) {
                            setSelectedService(target);
                        } else if (activeServices.length > 0) {
                            setSelectedService(activeServices[0]);
                        }
                    } else if (activeServices.length > 0) {
                        setSelectedService(activeServices[0]);
                    }

                    // Focus on top of the page when navigating to a service
                    window.scrollTo(0, 0);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            } finally {
                setLoading(false);
                reportPageReady();
            }
        };
        fetchServices();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle route ID changes when already on the page
    useEffect(() => {
        if (services.length > 0) {
            const targetId = id || services[0]?.id;
            const target = services.find(s => s.id === targetId) || services[0];
            if (target && target.id !== selectedService?.id) {
                setSelectedService(target);
                setCurrentImageIdx(0);
                setSubmitted(false);
                // Snap to top instantly to prevent layout thrashing on mobile
                window.scrollTo(0, 0);
            }
        }
    }, [id, services]);

    const handleServiceSelect = (service: Service) => {
        setSelectedService(service);
        setCurrentImageIdx(0);
        setSubmitted(false);
    };

    const nextImage = () => {
        if (!selectedService) return;
        const allImages = [selectedService.image, ...selectedService.additionalImages];
        setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        if (!selectedService) return;
        const allImages = [selectedService.image, ...selectedService.additionalImages];
        setCurrentImageIdx((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedService) return;

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    subject: `Service Inquiry: ${selectedService.title}`,
                    productName: selectedService.title,
                    type: 'Service',
                    source: 'Dedicated Services Page'
                })
            });

            if (res.ok) {
                setSubmitted(true);
                setForm({ name: '', email: '', phone: '', message: '' });
            }
        } catch (error) {
            console.error('Error submitting service lead:', error);
        }
    };

    if (loading) return <div className="services-page-loading">Loading Services...</div>;
    const allSelectedImages = selectedService ? [selectedService.image, ...selectedService.additionalImages] : [];

    const uniqueCategories = ['All', ...Array.from(new Set(services.map(s => s.serviceCategory || 'Other')))];
    const filteredServices = services.filter(s => selectedCategory === 'All' || (s.serviceCategory || 'Other') === selectedCategory);

    return (
        <div className="services-page">
            <SEO
                title={selectedService ? `${selectedService.title} | GreenRevotec Services` : "Our Services | GreenRevotec"}
                description={selectedService ? selectedService.description : "Explore GreenRevotec's range of professional agricultural services, including smart irrigation, consulting, and sustainable farming solutions."}
                keywords={`GreenRevotec services, ${selectedService?.title || "irrigation solutions"}, agricultural consultancy`}
            />
            <div className="services-container container">

                {/* Left Sidebar: Service Selector */}
                <aside className={`services-sidebar ${isSidebarOpen ? 'show' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Our Services</h3>
                        <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>×</button>
                    </div>

                    <div className="service-category-filter">
                        <select
                            className="category-select"
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                // Optional: auto-select first service in category
                                const firstInCategory = services.find(s => e.target.value === 'All' || (s.serviceCategory || 'Other') === e.target.value);
                                if (firstInCategory) handleServiceSelect(firstInCategory);
                            }}
                        >
                            {uniqueCategories.map(cat => (
                                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="services-list">
                        {filteredServices.map((service) => {
                            const Icon = AVAILABLE_ICONS[service.iconName] || FaHandshake;
                            return (
                                <motion.div
                                    key={service.id}
                                    className={`service-list-item ${selectedService?.id === service.id ? 'active' : ''}`}
                                    onClick={() => {
                                        handleServiceSelect(service);
                                        setIsSidebarOpen(false);
                                    }}
                                    whileHover={{ x: 5 }}
                                >
                                    <div className="item-thumbnail">
                                        <img src={service.thumbnail || service.image} alt={service.title} />
                                        <div className="item-icon-overlay" style={{ background: service.gradient }}>
                                            <Icon />
                                        </div>
                                    </div>
                                    <span className="item-title">{service.title}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </aside>

                {/* Right Main: Service Details */}
                <main className="services-main">
                    <AnimatePresence mode="wait">
                        {selectedService ? (
                            <motion.section
                                key={selectedService.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                                className="service-detail-content"
                            >
                                <div className="detail-layout">
                                    {/* Carousel */}
                                    <div className="detail-carousel">
                                        <div className="main-image-wrap">
                                            <AnimatePresence mode="wait">
                                                <motion.img
                                                    key={currentImageIdx}
                                                    src={allSelectedImages[currentImageIdx]}
                                                    alt={selectedService.title}
                                                    initial={{ opacity: 0, scale: 1.05 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    transition={{ duration: 0.3 }}
                                                />
                                            </AnimatePresence>

                                            {allSelectedImages.length > 1 && (
                                                <>
                                                    <button className="nav-btn prev" onClick={prevImage}><FaChevronLeft /></button>
                                                    <button className="nav-btn next" onClick={nextImage}><FaChevronRight /></button>
                                                </>
                                            )}
                                        </div>
                                        {allSelectedImages.length > 1 && (
                                            <div className="carousel-thumbs">
                                                {allSelectedImages.map((img, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`thumb ${currentImageIdx === idx ? 'active' : ''}`}
                                                        onClick={() => setCurrentImageIdx(idx)}
                                                    >
                                                        <img src={img} alt="thumbnail" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info & Form */}
                                    <div className="detail-info">
                                        <div className="info-header">
                                            <span className="tag" style={{ background: `${selectedService.gradient.split(',')[0].replace('linear-gradient(135deg, ', '')}22`, color: selectedService.gradient.split(',')[0].replace('linear-gradient(135deg, ', '') }}>
                                                {selectedService.tag}
                                            </span>
                                            <h2>{selectedService.title}</h2>
                                            <div className="gradient-line" style={{ background: selectedService.gradient }}></div>
                                        </div>

                                        <div className="info-body">
                                            <p className="description">{selectedService.description}</p>

                                            {selectedService.bulletPoints.length > 0 && (
                                                <ul className="bullet-points">
                                                    {selectedService.bulletPoints.map((point, i) => (
                                                        <li key={i}>
                                                            <FaCheckCircle className="check-icon" style={{ color: selectedService.gradient.split(',')[0].includes('#') ? selectedService.gradient.split(',')[0].replace('linear-gradient(135deg, ', '') : '#1a8c4e' }} />
                                                            {point}
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                            <div className="info-actions">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => document.getElementById('service-request-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                                                >
                                                    Request a Quote <FaArrowRight style={{ marginLeft: '8px' }} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* A+ Content Section */}
                                {selectedService.contentBlocks && selectedService.contentBlocks.length > 0 && (
                                    <div className="a-plus-content-section">
                                        {selectedService.contentBlocks.map((block, index) => (
                                            <motion.div
                                                key={index}
                                                className={`a-plus-block ${index % 2 === 1 ? 'reverse' : ''}`}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                            >
                                                <div className="block-image">
                                                    <img src={block.image} alt={block.title} />
                                                </div>
                                                <div className="block-text">
                                                    <h3>{block.title}</h3>
                                                    <div className="block-line" style={{ background: selectedService.gradient }}></div>
                                                    <p>{block.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                <div className="lead-form-box" id="service-request-form">
                                    <div className="form-header">
                                        <FaQuoteRight className="header-icon" />
                                        <h3>Request This Service</h3>
                                    </div>

                                    {submitted ? (
                                        <div className="success-msg">
                                            <motion.div
                                                className="success-check"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                            >
                                                <FaCheckCircle />
                                            </motion.div>
                                            <h4>Inquiry Sent Successfully!</h4>
                                            <p>Our team will get back to you within 24 hours.</p>
                                            <button onClick={() => setSubmitted(false)} className="btn btn-outline">Send Another</button>
                                        </div>
                                    ) : (
                                        <form className="service-lead-form" onSubmit={handleFormSubmit}>
                                            <div className="form-row">
                                                <div className="gr-form-group">
                                                    <div className="gr-input-wrapper">
                                                        <FaUser className="input-icon" />
                                                        <input
                                                            className="gr-input"
                                                            type="text"
                                                            placeholder="Full Name"
                                                            required
                                                            value={form.name}
                                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="gr-form-group">
                                                    <div className="gr-input-wrapper">
                                                        <FaPhone className="input-icon" />
                                                        <input
                                                            className="gr-input"
                                                            type="tel"
                                                            placeholder="Phone Number"
                                                            required
                                                            value={form.phone}
                                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="gr-form-group">
                                                <div className="gr-input-wrapper">
                                                    <FaEnvelope className="input-icon" />
                                                    <input
                                                        className="gr-input"
                                                        type="email"
                                                        placeholder="Email Address"
                                                        value={form.email}
                                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="gr-form-group">
                                                <div className="gr-input-wrapper">
                                                    <FaPen className="input-icon" style={{ top: '24px', transform: 'none' }} />
                                                    <textarea
                                                        className="gr-textarea with-icon"
                                                        placeholder="Additional Requirements / Message"
                                                        rows={3}
                                                        value={form.message}
                                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <button type="submit" className="btn btn-primary btn-lg w-full">
                                                Send Inquiry <FaRocket style={{ marginLeft: '10px' }} />
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </motion.section>
                        ) : (
                            <div className="no-service-selected">
                                <h3>Select a service to see details</h3>
                            </div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
            <BottomNav
                actions={[
                    {
                        icon: <FaLeaf />,
                        label: 'Services',
                        onClick: () => setIsSidebarOpen(true)
                    },
                    {
                        icon: <FaQuoteLeft />,
                        label: 'Get Quote',
                        onClick: () => {
                            document.getElementById('service-request-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }
                ]}
            />
        </div>
    );
};

export default ServicesPage;
