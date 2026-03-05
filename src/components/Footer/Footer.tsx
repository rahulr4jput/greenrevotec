import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-scroll';
import {
    FaPhone, FaEnvelope, FaMapMarkerAlt,
    FaWhatsapp, FaLinkedin, FaFacebook, FaInstagram, FaTwitter, FaYoutube,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import './Footer.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FooterLink {
    label: string;
    href: string;
}

interface FooterSection {
    id: string;
    title: string;
    links: FooterLink[];
    isActive: boolean;
}

interface FooterConfig {
    tagline: string;
    phone: string;
    email: string;
    address: string;
    copyrightText: string;
    certifications: string[];
    bottomLinks: FooterLink[];
    sections: FooterSection[];
}

interface SocialLink {
    IconComponent: IconType;
    href: string;
    color: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultConfig: FooterConfig = {
    tagline: "Empowering India's farmers through innovation, science, and sustainable agriculture technology.",
    phone: '+91 94548 80810',
    email: 'info@greenrevotec.com',
    address: '26, Bsnl Exchange Road Chhibramau, Kannauj, Uttar Pradesh- 209721',
    copyrightText: '© {year} Green Revotec. All rights reserved.',
    certifications: ['ISO 9001:2015', 'ICAR Certified', 'NABARD Approved'],
    bottomLinks: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms of Service', href: '/terms-of-service' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
        { label: 'Sitemap', href: '#' },
    ],
    sections: [
        {
            id: 'company', title: 'Company', isActive: true,
            links: [
                { label: 'About Us', href: '/about' }, { label: 'Our Team', href: '#' },
                { label: 'Careers', href: 'careers' }, { label: 'Press & Media', href: '#' },
                { label: 'Corporate Responsibility', href: '#' },
            ],
        },
        {
            id: 'products', title: 'Products', isActive: true,
            links: [
                { label: 'Fertilizers', href: '#' }, { label: 'Pesticides & Herbicides', href: '#' },
                { label: 'Organic Solutions', href: '#' }, { label: 'Irrigation Systems', href: '#' },
                { label: 'Soil Testing Kits', href: '#' }, { label: 'Drip & Sprinkler', href: '#' },
            ],
        },
        {
            id: 'services', title: 'Services', isActive: true,
            links: [
                { label: 'Crop Advisory', href: '#' }, { label: 'Soil Analysis', href: '#' },
                { label: 'Drone Survey', href: '#' }, { label: 'Smart Irrigation', href: '#' },
                { label: 'Farmer Training', href: '#' },
            ],
        },
        {
            id: 'partner', title: 'Partner With Us', isActive: false,
            links: [
                { label: 'Distributor Program', href: '#' }, { label: 'Retailer Signup', href: '#' },
                { label: 'FPO Partnership', href: '#' }, { label: 'Corporate Tie-Up', href: '#' },
                { label: 'Strategic Alliance', href: '#' }, { label: 'CSR Programs', href: '#' },
            ],
        },
    ],
};


const ICON_MAP: Record<string, IconType> = {
    WhatsApp: FaWhatsapp as IconType,
    Whatsapp: FaWhatsapp as IconType,
    LinkedIn: FaLinkedin as IconType,
    Facebook: FaFacebook as IconType,
    Instagram: FaInstagram as IconType,
    Twitter: FaTwitter as IconType,
    YouTube: FaYoutube as IconType,
};

// ─── Component ────────────────────────────────────────────────────────────────

const defaultSocialLinks: SocialLink[] = [
    { IconComponent: FaWhatsapp as IconType, href: '#', color: '#25D366' },
    { IconComponent: FaLinkedin as IconType, href: '#', color: '#0A66C2' },
    { IconComponent: FaFacebook as IconType, href: '#', color: '#1877F2' },
    { IconComponent: FaInstagram as IconType, href: '#', color: '#E1306C' },
    { IconComponent: FaTwitter as IconType, href: '#', color: '#1DA1F2' },
    { IconComponent: FaYoutube as IconType, href: '#', color: '#FF0000' },
];

// ─── Component ────────────────────────────────────────────────────────────────

const Footer: React.FC = () => {
    const [config, setConfig] = React.useState<FooterConfig>(defaultConfig);
    const [siteIdentity, setSiteIdentity] = React.useState<{ siteName: string, tagline: string, logoUrl: string }>({ siteName: 'GreenRevotec', tagline: '', logoUrl: '/logo.png' });
    const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>([]);
    const [dynamicCategories, setDynamicCategories] = React.useState<{ name: string }[]>([]);
    const [dynamicServices, setDynamicServices] = React.useState<{ title: string }[]>([]);
    const currentYear = new Date().getFullYear();

    // ── Newsletter ──────────────────────────────────────────────────────────
    const [email, setEmail] = useState('');
    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [showPopup, setShowPopup] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim();
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return;
        setSubStatus('loading');
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Newsletter Subscriber',
                    email: trimmed,
                    phone: '',
                    message: 'Subscribed via footer newsletter form.',
                    subject: 'Newsletter Subscription',
                    type: 'Newsletter',
                    source: 'Footer'
                })
            });
            if (res.ok) {
                setSubStatus('success');
                setShowPopup(true);
                setEmail('');
            } else {
                setSubStatus('error');
            }
        } catch {
            setSubStatus('error');
        }
    };

    const loadSocials = () => {
        const stored = localStorage.getItem('admin_social_links');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (Array.isArray(data)) {
                    const mapped: SocialLink[] = data
                        .filter((s: any) => s.isActive !== false)
                        .map((s: any) => ({
                            IconComponent: ICON_MAP[s.platform] || FaWhatsapp as IconType,
                            href: s.href || '#',
                            color: s.color || '#25D366',
                        }));
                    setSocialLinks(mapped.length > 0 ? mapped : defaultSocialLinks);
                } else {
                    setSocialLinks(defaultSocialLinks);
                }
            } catch (e) {
                setSocialLinks(defaultSocialLinks);
            }
        } else {
            setSocialLinks(defaultSocialLinks);
        }
    };

    const fetchConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_footer_config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setConfig({ ...defaultConfig, ...data });
                    localStorage.setItem('admin_footer_config', JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch Footer config:", error);
        }

        const stored = localStorage.getItem('admin_footer_config');
        if (stored) {
            try {
                setConfig({ ...defaultConfig, ...JSON.parse(stored) });
            } catch (e) {
                console.error("Error parsing stored footer config", e);
            }
        } else {
            setConfig(defaultConfig);
        }
    };

    const fetchIdentity = () => {
        const stored = localStorage.getItem('admin_site_identity');
        if (stored) {
            try {
                const config = JSON.parse(stored);
                setSiteIdentity({
                    siteName: config.siteName || 'GreenRevotec',
                    tagline: config.tagline || '',
                    logoUrl: config.logo?.url || '/logo.png'
                });
            } catch (e) {
                console.error("Error parsing site identity", e);
            }
        }
    };

    const fetchDynamicData = async () => {
        try {
            const [catRes, svcRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/services')
            ]);

            if (catRes.ok) {
                const data = await catRes.json();
                setDynamicCategories(data.filter((c: any) => c.isActive !== false));
            }

            if (svcRes.ok) {
                const data = await svcRes.json();
                setDynamicServices(data.filter((s: any) => s.isActive !== false));
            }
        } catch (error) {
            console.error('Error fetching footer dynamic data:', error);
        }
    };

    React.useEffect(() => {
        loadSocials();
        fetchConfig();
        fetchIdentity();
        fetchDynamicData();

        const handleStorage = () => {
            loadSocials();
            fetchConfig();
            fetchIdentity();
            fetchDynamicData();
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    // Enrich sections with dynamic data
    const enrichedSections = config.sections.map(section => {
        if (section.id === 'products' && dynamicCategories.length > 0) {
            return {
                ...section,
                links: dynamicCategories.map(cat => ({
                    label: cat.name,
                    href: `/products?category=${encodeURIComponent(cat.name)}`
                }))
            };
        }
        if (section.id === 'services' && dynamicServices.length > 0) {
            return {
                ...section,
                links: dynamicServices.map(svc => ({
                    label: svc.title,
                    href: '/services'
                }))
            };
        }
        return section;
    });

    const activeSections = enrichedSections.filter(s => s.isActive);

    return (
        <>
            <footer className="footer" id="footer">
                <div className="footer-main">
                    <div className="container">
                        <div className="footer-grid">
                            <div className="footer-brand">
                                <div className="footer-logo">
                                    <img src={siteIdentity.logoUrl} alt={siteIdentity.siteName} className="footer-logo-img" />
                                </div>
                                <p className="footer-tagline">{siteIdentity.tagline || config.tagline}</p>

                                <div className="footer-contact-info">
                                    <a href={`tel:${config.phone.replace(/\s/g, '')}`} className="footer-contact-item">
                                        <FaPhone /> {config.phone}
                                    </a>
                                    <a href={`mailto:${config.email}`} className="footer-contact-item">
                                        <FaEnvelope /> {config.email}
                                    </a>
                                    <div className="footer-contact-item">
                                        <FaMapMarkerAlt /> {config.address}
                                    </div>
                                </div>

                                {config.certifications.length > 0 && (
                                    <div className="footer-certs">
                                        {config.certifications.map((cert, i) => (
                                            <span key={i} className="cert-badge">{cert}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="footer-social">
                                    {socialLinks.map((link, i) => {
                                        const Icon = link.IconComponent;
                                        return (
                                            <a
                                                key={i}
                                                href={link.href}
                                                className="footer-social-link"
                                                style={{ color: link.color, background: `${link.color}18`, border: `1px solid ${link.color}33` }}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <Icon />
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>

                            {activeSections.map(section => (
                                <div key={section.id} className="footer-nav-column">
                                    <h4 className="footer-nav-title">{section.title}</h4>
                                    <ul className="footer-nav-list">
                                        {section.links.map((link, i) => (
                                            <li key={i}>
                                                <a href={link.href} className="footer-nav-link">{link.label}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="footer-newsletter">
                    <div className="container">
                        <div className="newsletter-inner">
                            <div className="newsletter-text">
                                <h4>Stay Ahead in Agriculture</h4>
                                <p>Get monthly crop advisories, product updates, and agri-market insights.</p>
                            </div>
                            <form className="newsletter-form" onSubmit={handleSubscribe}>
                                <input
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    disabled={subStatus === 'loading'}
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={subStatus === 'loading'}
                                >
                                    {subStatus === 'loading' ? 'Subscribing...' : 'Subscribe Now'}
                                </button>
                            </form>
                            {subStatus === 'error' && (
                                <p className="newsletter-error">Something went wrong. Please try again.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="container">
                        <div className="footer-bottom-inner">
                            <p className="footer-copy">
                                {(config.copyrightText || '© {year} Green Revotec Private Limited. All rights reserved.').replace('{year}', currentYear.toString())}
                            </p>
                            {config.bottomLinks.length > 0 && (
                                <div className="footer-bottom-links">
                                    {config.bottomLinks.map((bl, i) => (
                                        <a key={i} href={bl.href}>{bl.label}</a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── Subscribe Success Popup ── */}
            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        className="subscribe-popup-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setShowPopup(false); setSubStatus('idle'); }}
                    >
                        <motion.div
                            className="subscribe-popup"
                            initial={{ scale: 0.78, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="subscribe-popup-icon">🌱</div>
                            <h3 className="subscribe-popup-title">You're In!</h3>
                            <p className="subscribe-popup-msg">
                                You've successfully subscribed to all the latest updates from{' '}
                                <strong>GreenRevotec</strong>. Expect crop advisories,
                                product launches &amp; agri-insights straight to your inbox.
                            </p>
                            <button
                                className="subscribe-popup-close btn btn-primary"
                                onClick={() => { setShowPopup(false); setSubStatus('idle'); }}
                            >
                                Got it! 🌿
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Footer;

