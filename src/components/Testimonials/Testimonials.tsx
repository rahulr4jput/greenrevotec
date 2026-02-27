import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './Testimonials.css';

const defaultTestimonials = [
    {
        name: 'Ramesh Kumar',
        role: 'Wheat Farmer, Punjab',
        text: 'Green Revotec\'s BioGrow Pro fertilizer has transformed my yields. I saw a 35% increase in production this season alone. Their soil advisory service helped identify exactly what nutrients my fields were missing. Highly recommend!',
        rating: 5,
        tag: 'Wheat Farmer',
        color: '#25b565',
    },
    {
        name: 'Suresh Patil',
        role: 'Distributor & FPO Head, Maharashtra',
        text: 'As a distributor partner, Green Revotec provides unmatched support — from credit facilities to training on product application. My sales have grown 3x in two years and farmers in my network are extremely satisfied.',
        rating: 5,
        tag: 'Distributor Partner',
        color: '#f5a623',
    },
    {
        name: 'Anitha Reddy',
        role: 'Organic Farmer, Andhra Pradesh',
        text: 'I transitioned to organic farming with Green Revotec\'s guidance. Their organic input kit and certification support helped me earn 60% more per quintal by accessing premium markets. Life-changing experience!',
        rating: 5,
        tag: 'Organic Farmer',
        color: '#84cc16',
    },
];

const Testimonials: React.FC = () => {
    const [current, setCurrent] = useState(0);
    const [testimonialList, setTestimonialList] = useState<any[]>([]);
    const [header, setHeader] = useState({
        label: "Voice of Customer",
        title: "What Our <span>Partners Say</span>",
        subtitle: "Real stories from farmers and partners who have experienced the GreenRevotec revolution firsthand."
    });

    useEffect(() => {
        const loadTestimonials = () => {
            const consolidated = localStorage.getItem('admin_testimonials_config');
            if (consolidated) {
                const data = JSON.parse(consolidated);

                // Header
                if (data.header) setHeader(data.header);

                // List
                if (data.list) {
                    const activeTestimonials = data.list.filter((t: any) => t.isActive).map((t: any) => ({
                        id: t.id,
                        name: t.author,
                        role: t.role,
                        text: t.content,
                        rating: t.rating,
                        avatar: t.avatar,
                        tag: t.role.split(',')[0],
                        color: t.id ? (['#25b565', '#f5a623', '#84cc16', '#38bdf8', '#e879f9'][parseInt(t.id.slice(-1)) % 5] || '#25b565') : '#25b565',
                        isActive: t.isActive,
                    }));

                    if (activeTestimonials.length > 0) {
                        setTestimonialList(activeTestimonials);
                    } else {
                        setTestimonialList(defaultTestimonials);
                    }
                }
            } else {
                // Fallback to legacy
                const stored = localStorage.getItem('admin_testimonials');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const activeTestimonials = parsed.filter((t: any) => t.isActive).map((t: any) => ({
                        id: t.id,
                        name: t.author,
                        role: t.role,
                        text: t.content,
                        rating: t.rating,
                        avatar: t.avatar,
                        tag: t.role.split(',')[0],
                        color: t.id ? (['#25b565', '#f5a623', '#84cc16', '#38bdf8', '#e879f9'][parseInt(t.id.slice(-1)) % 5] || '#25b565') : '#25b565',
                        isActive: t.isActive,
                    }));

                    if (activeTestimonials.length > 0) {
                        setTestimonialList(activeTestimonials);
                    } else {
                        setTestimonialList(defaultTestimonials);
                    }
                } else {
                    setTestimonialList(defaultTestimonials);
                }

                const storedHeader = localStorage.getItem('admin_testimonials_header');
                if (storedHeader) setHeader(JSON.parse(storedHeader));
            }
        };

        loadTestimonials();
        window.addEventListener('storage', loadTestimonials);
        return () => window.removeEventListener('storage', loadTestimonials);
    }, []);

    const prev = () => setCurrent((c) => (c === 0 ? testimonialList.length - 1 : c - 1));
    const next = () => setCurrent((c) => (c === testimonialList.length - 1 ? 0 : c + 1));

    if (testimonialList.length === 0) return null;

    const t = testimonialList[current] || defaultTestimonials[0];

    return (
        <section className="section section-dark testimonials" id="testimonials">
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

                {/* Main Testimonials Grid */}
                <div className="testimonial-grid-wrap">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            className="testimonials-grid"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Card 1 */}
                            {[0, 1].map((offset) => {
                                const index = (current + offset) % testimonialList.length;
                                const t = testimonialList[index];
                                if (offset === 1 && testimonialList.length < 2) return null;

                                return (
                                    <div key={t.id || index} className={`testimonial-card-item ${offset === 1 ? 'desktop-only' : ''}`}>
                                        <div className="testimonial-main glass-card">
                                            <div className="testimonial-quote-icon" style={{ color: t.color }}>
                                                <FaQuoteLeft />
                                            </div>
                                            <div className="testimonial-rating">
                                                {Array.from({ length: t.rating }).map((_, i) => (
                                                    <FaStar key={i} className="star" />
                                                ))}
                                            </div>
                                            <p className="testimonial-text">"{t.text}"</p>
                                            <div className="testimonial-author">
                                                <div
                                                    className="testimonial-avatar"
                                                    style={{ background: `${t.color}22`, color: t.color, border: `2px solid ${t.color}44` }}
                                                >
                                                    {t.avatar ? <img src={t.avatar} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : t.name.charAt(0)}
                                                </div>
                                                <div className="testimonial-author-info">
                                                    <div className="testimonial-name">{t.name}</div>
                                                    <div className="testimonial-role">{t.role}</div>
                                                </div>
                                                <div
                                                    className="testimonial-tag"
                                                    style={{ background: `${t.color}18`, color: t.color, border: `1px solid ${t.color}33` }}
                                                >
                                                    {t.tag}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {/* Controls */}
                    <div className="testimonial-controls">
                        <button className="testimonial-btn" onClick={prev}><FaChevronLeft /></button>
                        <div className="testimonial-dots">
                            {testimonialList.map((_, i) => (
                                <button
                                    key={i}
                                    className={`testimonial-dot ${i === current ? 'active' : ''}`}
                                    onClick={() => setCurrent(i)}
                                />
                            ))}
                        </div>
                        <button className="testimonial-btn" onClick={next}><FaChevronRight /></button>
                    </div>
                </div>

                {/* Thumbnail List */}
                <div className="testimonial-thumbs">
                    {testimonialList.map((tmpl, i) => (
                        <motion.button
                            key={i}
                            className={`testimonial-thumb ${i === current ? 'active' : ''}`}
                            onClick={() => setCurrent(i)}
                            style={i === current ? { borderColor: tmpl.color, background: `${tmpl.color}15` } : {}}
                            whileHover={{ scale: 1.03 }}
                        >
                            <div
                                className="thumb-avatar"
                                style={{ background: `${tmpl.color}22`, color: tmpl.color }}
                            >
                                {tmpl.avatar ? <img src={tmpl.avatar} alt={tmpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : tmpl.name.charAt(0)}
                            </div>
                            <div className="thumb-info">
                                <div className="thumb-name">{tmpl.name}</div>
                                <div className="thumb-role">{tmpl.role}</div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
