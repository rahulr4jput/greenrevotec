import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock,
    FaWhatsapp, FaLinkedin, FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaGlobe,
    FaUser, FaTag, FaPen, FaCalculator, FaRocket, FaHammer, FaShoppingBasket, FaSearch, FaTimesCircle, FaChevronDown
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import './Contact.css';

interface SocialLink {
    IconComponent: IconType;
    href: string;
    color: string;
    label: string;
}

interface ContactInfo {
    IconComponent: IconType;
    title: string;
    lines: string[];
    color: string;
}

const Contact: React.FC = () => {
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [inquiryTypes, setInquiryTypes] = useState<{ label: string, value: string }[]>([
        { label: 'General Inquiry', value: 'general' },
        { label: 'Product Information', value: 'product' },
        { label: 'Service Inquiry', value: 'service' },
        { label: 'Distributorship', value: 'distribution' },
        { label: 'Corporate Partnership', value: 'corporate' },
    ]);
    const [contactInfoItems, setContactInfoItems] = useState<ContactInfo[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', subject: '', message: '',
        type: 'general'
    });
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // Captcha State
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [captchaError, setCaptchaError] = useState('');

    // Generate random numbers for captcha
    const generateCaptcha = () => {
        setNum1(Math.floor(Math.random() * 10) + 1);
        setNum2(Math.floor(Math.random() * 10) + 1);
        setCaptchaAnswer('');
        setCaptchaError('');
    };

    React.useEffect(() => {
        generateCaptcha();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchContactConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_contact_config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    const mapped = (data.info || []).map((item: any) => {
                        let icon = FaPhone;
                        if (item.type === 'email') icon = FaEnvelope;
                        if (item.type === 'address') icon = FaMapMarkerAlt;
                        if (item.type === 'hours') icon = FaClock;

                        return {
                            IconComponent: icon as IconType,
                            title: item.title,
                            lines: item.lines,
                            color: item.color
                        };
                    });
                    setContactInfoItems(mapped);
                    setInquiryTypes(data.inquiryTypes || []);
                    localStorage.setItem('admin_contact_info', JSON.stringify(data.info));
                    localStorage.setItem('admin_inquiry_types', JSON.stringify(data.inquiryTypes));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch Contact config:", error);
        }

        // Fallback
        const stored = localStorage.getItem('admin_contact_info');
        if (stored) {
            const parsed = JSON.parse(stored);
            const mapped = parsed.map((item: any) => {
                let icon = FaPhone;
                if (item.type === 'email') icon = FaEnvelope;
                if (item.type === 'address') icon = FaMapMarkerAlt;
                if (item.type === 'hours') icon = FaClock;
                return { IconComponent: icon as IconType, title: item.title, lines: item.lines, color: item.color };
            });
            setContactInfoItems(mapped);
        }

        const storedInquiries = localStorage.getItem('admin_inquiry_types');
        if (storedInquiries) setInquiryTypes(JSON.parse(storedInquiries));
    };

    const loadSocials = async () => {
        try {
            const response = await fetch('/api/settings/admin_social_links');
            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data)) {
                    const mapped = data.filter((s: any) => s.isActive).map((s: any) => {
                        let icon = FaGlobe;
                        if (s.platform === 'WhatsApp') icon = FaWhatsapp;
                        if (s.platform === 'LinkedIn') icon = FaLinkedin;
                        if (s.platform === 'Facebook') icon = FaFacebook;
                        if (s.platform === 'Instagram') icon = FaInstagram;
                        if (s.platform === 'Twitter') icon = FaTwitter;
                        if (s.platform === 'YouTube') icon = FaYoutube;

                        return { IconComponent: icon as IconType, href: s.href || '#', color: s.color, label: s.platform };
                    });
                    setSocialLinks(mapped);
                    localStorage.setItem('admin_social_links', JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch Social links:", error);
        }

        const storedSocials = localStorage.getItem('admin_social_links');
        if (storedSocials) {
            const parsed = JSON.parse(storedSocials);
            const mapped = parsed.filter((s: any) => s.isActive).map((s: any) => {
                let icon = FaGlobe;
                if (s.platform === 'WhatsApp') icon = FaWhatsapp;
                if (s.platform === 'LinkedIn') icon = FaLinkedin;
                if (s.platform === 'Facebook') icon = FaFacebook;
                if (s.platform === 'Instagram') icon = FaInstagram;
                if (s.platform === 'Twitter') icon = FaTwitter;
                if (s.platform === 'YouTube') icon = FaYoutube;
                return { IconComponent: icon as IconType, href: s.href || '#', color: s.color, label: s.platform };
            });
            setSocialLinks(mapped);
        }
    };

    React.useEffect(() => {
        generateCaptcha();
        fetchContactConfig();
        loadSocials();

        const handleStorage = () => {
            fetchContactConfig();
            loadSocials();
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 0. Validate Captcha
        if (parseInt(captchaAnswer) !== (num1 + num2)) {
            setCaptchaError('Incorrect math answer. Please try again.');
            generateCaptcha(); // Regenerate on failure
            return;
        }

        // 1. Create a lead record
        const leadRecord = {
            ...form,
            selectedItems,
            source: 'Contact Form',
        };

        try {
            // 2. Send to Backend API
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(leadRecord),
            });

            if (!response.ok) {
                throw new Error('Failed to submit form');
            }

            // 3. Show success message and reset form
            setSubmitted(true);
            setForm({ name: '', email: '', phone: '', subject: '', message: '', type: 'general' });
            setSelectedItems([]);
            generateCaptcha(); // Regenerate for next submission
            setTimeout(() => setSubmitted(false), 4000);
        } catch (error) {
            console.error('Submission error:', error);
            alert('Something went wrong. Please try again later.');
        }
    };

    const toggleItem = (name: string) => {
        if (selectedItems.includes(name)) {
            setSelectedItems(selectedItems.filter(i => i !== name));
        } else {
            setSelectedItems([...selectedItems, name]);
        }
        setSearchQuery('');
    };

    const removeItem = (name: string) => {
        setSelectedItems(selectedItems.filter(i => i !== name));
    };

    const filteredItems = form.type.toLowerCase().includes('product')
        ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : (form.type.toLowerCase().includes('service') ? services.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())) : []);

    return (
        <section className="section contact" id="contact">
            <div className="container">
                <motion.div
                    className="section-header centered"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="section-label">Contact Us</div>
                    <h2 className="section-title">
                        Let's <span>Grow Together</span>
                    </h2>
                    <p className="section-subtitle">
                        Reach out to our team for product inquiries, partnership opportunities,
                        or any questions about transforming your farming operations.
                    </p>
                </motion.div>

                <div className="contact-grid">
                    {/* Left - Info */}
                    <motion.div
                        className="contact-info"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="contact-info-cards">
                            {contactInfoItems.map((item, i) => {
                                const Icon = item.IconComponent;
                                return (
                                    <div key={i} className="contact-info-card glass-card">
                                        <div className="contact-icon" style={{ color: item.color, background: `${item.color}18` }}>
                                            <Icon />
                                        </div>
                                        <div>
                                            <div className="contact-card-title">{item.title}</div>
                                            {item.lines.map((l, j) => (
                                                <div key={j} className="contact-card-line">{l}</div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Social */}
                        <div className="contact-social">
                            <div className="social-title">Follow Us On</div>
                            <div className="social-links">
                                {socialLinks.map((link, i) => {
                                    const Icon = link.IconComponent;
                                    return (
                                        <a
                                            key={i}
                                            href={link.href}
                                            className="social-link"
                                            style={{ color: link.color, background: `${link.color}18`, border: `1px solid ${link.color}33` }}
                                            aria-label={link.label}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Icon />
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right - Form */}
                    <motion.div
                        className="contact-form-wrap glass-card"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        {submitted ? (
                            <div className="form-success">
                                <motion.div
                                    className="success-icon-wrap"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", damping: 12 }}
                                >
                                    <FaRocket />
                                </motion.div>
                                <h3>Message Sent!</h3>
                                <p>Our team will reach out to you within 24 hours. Thank you!</p>
                                <button className="btn btn-outline" onClick={() => setSubmitted(false)}>Send Another</button>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-header-box">
                                    <h3 className="form-title">Send Us a Message</h3>
                                    <div className="title-line"></div>
                                </div>

                                <div className="gr-form-group">
                                    <label className="gr-label">Inquiry Type</label>
                                    <div className="gr-input-wrapper">
                                        <FaTag className="input-icon" />
                                        <select className="gr-select" name="type" value={form.type} onChange={handleChange}>
                                            {inquiryTypes.map((type, idx) => (
                                                <option key={idx} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {(form.type.toLowerCase().includes('product') || form.type.toLowerCase().includes('service')) && (
                                        <motion.div
                                            className="gr-form-group"
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            transition={{ duration: 0.4 }}
                                            style={{ overflow: showResults ? 'visible' : 'hidden' }}
                                        >
                                            <label className="gr-label">
                                                {form.type.toLowerCase().includes('product') ? 'Select Products' : 'Select Services'} *
                                            </label>

                                            {/* Selected Tags */}
                                            {selectedItems.length > 0 && (
                                                <div className="selected-items-tags">
                                                    {selectedItems.map((item, idx) => (
                                                        <motion.span
                                                            key={idx}
                                                            className="item-tag"
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                        >
                                                            {item}
                                                            <FaTimesCircle onClick={() => removeItem(item)} className="tag-remove" />
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="gr-input-wrapper multi-select-search" ref={dropdownRef}>
                                                {form.type.toLowerCase().includes('product') ? <FaShoppingBasket className="input-icon" /> : <FaHammer className="input-icon" />}
                                                <input
                                                    className="gr-input"
                                                    type="text"
                                                    placeholder={`Search or select ${form.type.toLowerCase().includes('product') ? 'products' : 'services'}...`}
                                                    value={searchQuery}
                                                    onChange={(e) => {
                                                        setSearchQuery(e.target.value);
                                                        setShowResults(true);
                                                    }}
                                                    onFocus={() => setShowResults(true)}
                                                />
                                                <FaChevronDown
                                                    className="search-side-icon"
                                                    style={{
                                                        transform: `translateY(-50%) rotate(${showResults ? '180deg' : '0deg'})`,
                                                        transition: 'transform 0.3s ease'
                                                    }}
                                                />

                                                <AnimatePresence>
                                                    {showResults && (
                                                        <motion.div
                                                            className="search-results-dropdown glass-card"
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                        >
                                                            {filteredItems.length > 0 ? (
                                                                filteredItems.map((item: any, idx) => {
                                                                    const name = form.type.toLowerCase().includes('product') ? item.name : item.title;
                                                                    const isSelected = selectedItems.includes(name);
                                                                    return (
                                                                        <div
                                                                            key={idx}
                                                                            className={`result-item ${isSelected ? 'selected' : ''}`}
                                                                            onClick={() => toggleItem(name)}
                                                                        >
                                                                            {name}
                                                                            {isSelected && <span className="selected-check">✓</span>}
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className="no-results">No matches found</div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {/* Hidden validation field if needed, or check in submit */}
                                            {selectedItems.length === 0 && searchQuery === '' && (
                                                <span className="selection-hint">Begin typing to find and select items</span>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="form-row">
                                    <div className="gr-form-group">
                                        <label className="gr-label">Full Name *</label>
                                        <div className="gr-input-wrapper">
                                            <FaUser className="input-icon" />
                                            <input className="gr-input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
                                        </div>
                                    </div>
                                    <div className="gr-form-group">
                                        <label className="gr-label">Phone Number *</label>
                                        <div className="gr-input-wrapper">
                                            <FaPhone className="input-icon" />
                                            <input className="gr-input" type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
                                        </div>
                                    </div>
                                </div>

                                <div className="gr-form-group">
                                    <label className="gr-label">Email Address</label>
                                    <div className="gr-input-wrapper">
                                        <FaEnvelope className="input-icon" />
                                        <input className="gr-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
                                    </div>
                                </div>

                                <div className="gr-form-group">
                                    <label className="gr-label">Subject</label>
                                    <div className="gr-input-wrapper">
                                        <FaPen className="input-icon" />
                                        <input className="gr-input" type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help you?" />
                                    </div>
                                </div>

                                <div className="gr-form-group">
                                    <label className="gr-label">Message *</label>
                                    <textarea className="gr-textarea" name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your farming needs..." rows={3} required />
                                </div>

                                <div className="gr-form-group captcha-group">
                                    <div className="captcha-label-row">
                                        <FaCalculator />
                                        <label className="gr-label">Security Check: What is {num1} + {num2}?</label>
                                    </div>
                                    <input
                                        className="gr-input no-icon"
                                        style={{ paddingLeft: '18px' }}
                                        type="number"
                                        name="captchaAnswer"
                                        value={captchaAnswer}
                                        onChange={(e) => {
                                            setCaptchaAnswer(e.target.value);
                                            setCaptchaError('');
                                        }}
                                        placeholder="Enter the sum"
                                        required
                                    />
                                    {captchaError && <div className="gr-form-status error">{captchaError}</div>}
                                </div>

                                <button type="submit" className="btn btn-primary btn-lg form-submit">
                                    Send Message <FaRocket style={{ marginLeft: '10px' }} />
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
