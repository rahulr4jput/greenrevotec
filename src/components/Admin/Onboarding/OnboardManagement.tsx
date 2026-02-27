import React, { useState, useEffect } from 'react';
import { FaSave, FaRocket, FaImage, FaLink, FaPlus, FaTrash, FaPencilAlt, FaTimes, FaGripVertical, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PartnerCard {
    id: string;
    iconName: string;
    title: string;
    description: string;
    benefits: string[];
    color: string;
}

interface OnboardConfig {
    title: string;
    subtitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    backgroundImage: string;
    cards: PartnerCard[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultCards: PartnerCard[] = [
    {
        id: 'dist', iconName: 'FaUserTie', title: 'Become a Distributor',
        description: 'Join our growing network of 500+ distributors. Exclusive zone rights, credit facility, marketing support, and top commissions await.',
        benefits: ['Exclusive territory rights', 'Credit line up to ₹25 lakhs', 'Co-branded marketing support', 'Dedicated area manager'],
        color: '#25b565',
    },
    {
        id: 'farmer', iconName: 'FaTractor', title: 'Farmer Partnership',
        description: 'Get priority access to premium products, subsidized rates, expert agronomy advisory, and direct market linkage for your produce.',
        benefits: ['Subsidized product pricing', 'Free soil testing', 'Expert farm advisory', 'Market linkage support'],
        color: '#f5a623',
    },
    {
        id: 'retailer', iconName: 'FaStore', title: 'Become a Retailer',
        description: "Stock India's fastest-growing agri-input brand. Retail store partnership with display support, fast restocking, and attractive margins.",
        benefits: ['High margin products', 'In-store display support', 'Farmer referral bonus', 'Training & certification'],
        color: '#38bdf8',
    },
    {
        id: 'corp', iconName: 'FaHandshake', title: 'Corporate Collaboration',
        description: 'Co-develop products, access our R&D pipeline, and tap into our farmer network for agri-corporate partnerships and CSR programs.',
        benefits: ['Joint product development', 'Research collaborations', 'CSR program access', 'Technology licensing'],
        color: '#e879f9',
    },
];

const defaultConfig: OnboardConfig = {
    title: "Ready to Join India's <span>GreenRevotec</span> Revolution?",
    subtitle: "TRANSFORMING AGRICULTURE TOGETHER",
    description: "Be part of the movement that's bringing sustainable technology and premium inputs to every corner of India. Let's grow together.",
    buttonText: "Schedule a Call",
    buttonLink: "#contact",
    backgroundImage: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    cards: defaultCards,
};

const STORAGE_KEY = 'admin_onboard_config';
const uid = () => Math.random().toString(36).slice(2, 9);

const iconOptions = [
    'FaUserTie', 'FaTractor', 'FaStore', 'FaHandshake', 'FaLeaf', 'FaSeedling',
    'FaRocket', 'FaGlobeAmericas', 'FaTruck', 'FaWarehouse', 'FaIndustry',
    'FaUsers', 'FaBriefcase', 'FaCertificate', 'FaChartLine', 'FaCogs',
];

const colorOptions = ['#25b565', '#f5a623', '#38bdf8', '#e879f9', '#ef4444', '#06b6d4', '#8b5cf6', '#f97316', '#14b8a6', '#ec4899'];

// ─── Component ────────────────────────────────────────────────────────────────

const OnboardManagement: React.FC = () => {
    const [config, setConfig] = useState<OnboardConfig>(defaultConfig);
    const [isSectionVisible, setIsSectionVisible] = useState(true);
    const [activeTab, setActiveTab] = useState<'banner' | 'cards'>('banner');

    // Card modal
    const [cardModal, setCardModal] = useState<{ open: boolean; mode: 'add' | 'edit'; cardId?: string }>({ open: false, mode: 'add' });
    const [cardForm, setCardForm] = useState<PartnerCard>({ id: '', iconName: 'FaUserTie', title: '', description: '', benefits: [''], color: '#25b565' });

    const fetchOnboardConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_join_revolution');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setConfig({ ...defaultConfig, ...data, cards: data.cards || defaultCards });
                    setIsSectionVisible(data.sectionVisible !== false);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch Onboard config:", error);
        }

        // Fallback
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            setConfig({ ...defaultConfig, ...parsed, cards: parsed.cards || defaultCards });
            setIsSectionVisible(parsed.sectionVisible !== false);
        }
    };

    useEffect(() => {
        fetchOnboardConfig();
    }, []);

    const saveOnboardConfig = async (updatedData: Partial<OnboardConfig> & { sectionVisible?: boolean }) => {
        const fullConfig = {
            ...config,
            sectionVisible: isSectionVisible,
            ...updatedData
        };

        try {
            const response = await fetch('/api/settings/admin_join_revolution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: fullConfig })
            });

            if (response.ok) {
                setConfig(fullConfig);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(fullConfig));
                window.dispatchEvent(new Event('storage'));
                toast.success('Onboard section updated!');
            }
        } catch (error) {
            console.error("Error saving Onboard config:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const saveBanner = async (e: React.FormEvent) => {
        e.preventDefault();
        await saveOnboardConfig(config);
    };

    const toggleSectionVisibility = async () => {
        const newValue = !isSectionVisible;
        setIsSectionVisible(newValue);
        await saveOnboardConfig({ sectionVisible: newValue });
        toast.info(`Section is now ${newValue ? 'Visible' : 'Hidden'}.`);
    };

    // ── Card CRUD ─────────────────────────────────────────────────────────────
    const openAddCard = () => {
        setCardForm({ id: uid(), iconName: 'FaUserTie', title: '', description: '', benefits: [''], color: '#25b565' });
        setCardModal({ open: true, mode: 'add' });
    };

    const openEditCard = (card: PartnerCard) => {
        setCardForm({ ...card, benefits: [...card.benefits] });
        setCardModal({ open: true, mode: 'edit', cardId: card.id });
    };

    const saveCard = async () => {
        if (!cardForm.title.trim()) { toast.error('Title is required'); return; }
        const cleanBenefits = cardForm.benefits.filter(b => b.trim());
        if (cleanBenefits.length === 0) { toast.error('Add at least one benefit'); return; }
        const updatedCard = { ...cardForm, benefits: cleanBenefits };

        let cards: PartnerCard[];
        if (cardModal.mode === 'add') {
            cards = [...config.cards, updatedCard];
        } else {
            cards = config.cards.map(c => c.id === cardModal.cardId ? updatedCard : c);
        }
        await saveOnboardConfig({ ...config, cards });
        setCardModal({ open: false, mode: 'add' });
    };

    const deleteCard = async (id: string) => {
        if (!window.confirm('Delete this card?')) return;
        await saveOnboardConfig({ ...config, cards: config.cards.filter(c => c.id !== id) });
    };

    const moveCard = async (idx: number, dir: -1 | 1) => {
        const cards = [...config.cards];
        const newIdx = idx + dir;
        if (newIdx < 0 || newIdx >= cards.length) return;
        [cards[idx], cards[newIdx]] = [cards[newIdx], cards[idx]];
        await saveOnboardConfig({ ...config, cards });
    };

    // Benefit helpers
    const addBenefit = () => setCardForm(f => ({ ...f, benefits: [...f.benefits, ''] }));
    const updateBenefit = (idx: number, val: string) => setCardForm(f => ({ ...f, benefits: f.benefits.map((b, i) => i === idx ? val : b) }));
    const removeBenefit = (idx: number) => setCardForm(f => ({ ...f, benefits: f.benefits.filter((_, i) => i !== idx) }));

    // ─── Styles ───────────────────────────────────────────────────────────────
    const cardStyle: React.CSSProperties = {
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12,
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    };
    const cardHeader: React.CSSProperties = {
        display: 'flex', alignItems: 'center', padding: '14px 18px', gap: 12,
        borderBottom: '1px solid #f3f4f6', background: '#f9fafb',
    };
    const iconBtnStyle: React.CSSProperties = {
        background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px',
        borderRadius: 6, display: 'flex', alignItems: 'center', color: '#6b7280',
    };
    const inputStyle: React.CSSProperties = {
        width: '100%', padding: '10px 14px', background: '#fff',
        border: '1.5px solid #d1d5db', borderRadius: 8, color: '#111827',
        fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
    };
    const labelStyle: React.CSSProperties = {
        display: 'block', color: '#374151', fontSize: '0.82rem',
        fontWeight: 600, marginBottom: 6,
    };

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />

            {/* Header */}
            <div className="admin-page-header" style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="admin-page-title">Onboard With Us</h1>
                    <p className="admin-page-subtitle">Manage the CTA banner, partner cards, and section content.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: isSectionVisible ? '#ecfdf5' : '#fef2f2', border: `1px solid ${isSectionVisible ? '#10b981' : '#ef4444'}`, borderRadius: 8, cursor: 'pointer' }} onClick={toggleSectionVisibility}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSectionVisible ? '#047857' : '#b91c1c' }}>{isSectionVisible ? 'VISIBLE' : 'HIDDEN'}</span>
                    <div style={{ width: 36, height: 20, background: isSectionVisible ? '#10b981' : '#ef4444', borderRadius: 10, position: 'relative', transition: '0.3s' }}>
                        <div style={{ width: 14, height: 14, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: isSectionVisible ? 19 : 3, transition: '0.3s' }} />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {(['banner', 'cards'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '8px 20px', borderRadius: 8, border: '1px solid',
                        borderColor: activeTab === tab ? '#2ea34b' : '#d1d5db',
                        background: activeTab === tab ? '#ecfdf5' : '#fff',
                        color: activeTab === tab ? '#166534' : '#374151',
                        fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', textTransform: 'capitalize',
                    }}>
                        {tab === 'banner' ? 'Banner & CTA' : `Partner Cards (${config.cards.length})`}
                    </button>
                ))}
            </div>

            {/* ── Tab: Banner ──────────────────────────────────────────── */}
            {activeTab === 'banner' && (
                <div className="category-form-card" style={{ maxWidth: 1000, margin: '0 auto', padding: 0 }}>
                    <div style={{ padding: 24, borderBottom: '1px solid #f3f4f6', background: '#f9fafb', borderRadius: '12px 12px 0 0' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.1rem' }}>
                            <FaRocket style={{ color: 'var(--color-primary)' }} /> Banner Configuration
                        </h3>
                    </div>
                    <div style={{ padding: 32 }}>
                        <form onSubmit={saveBanner}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div className="category-form-group">
                                        <label>Banner Label (Overline)</label>
                                        <input type="text" name="subtitle" className="category-form-input" value={config.subtitle} onChange={handleChange} placeholder="TRANSFORMING AGRICULTURE TOGETHER" />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Banner Heading * (use &lt;span&gt; for highlight)</label>
                                        <input type="text" name="title" className="category-form-input" value={config.title} onChange={handleChange} required />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Description Paragraph *</label>
                                        <textarea name="description" className="category-form-input" value={config.description} onChange={handleChange} rows={4} required />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div className="category-form-group">
                                        <label><FaLink /> Button Text</label>
                                        <input type="text" name="buttonText" className="category-form-input" value={config.buttonText} onChange={handleChange} />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Button Link</label>
                                        <input type="text" name="buttonLink" className="category-form-input" value={config.buttonLink} onChange={handleChange} />
                                    </div>
                                    <div className="category-form-group">
                                        <label><FaImage /> Background Image URL</label>
                                        <input type="text" name="backgroundImage" className="category-form-input" value={config.backgroundImage} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            {/* Live Preview */}
                            <div style={{ marginTop: 40 }}>
                                <h4 style={{ marginBottom: 15, fontSize: '0.9rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1 }}>Live Preview</h4>
                                <div style={{ borderRadius: 20, overflow: 'hidden', position: 'relative', minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a140f' }}>
                                    <img src={config.backgroundImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0, opacity: 0.4 }} />
                                    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff', padding: 40, maxWidth: 700 }}>
                                        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: 3, color: '#2ea34b', fontWeight: 'bold', marginBottom: 15 }}>{config.subtitle}</div>
                                        <h2 style={{ fontSize: '2rem', marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: config.title }} />
                                        <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.6 }}>{config.description}</p>
                                        <button type="button" className="btn btn-primary" style={{ padding: '10px 26px', pointerEvents: 'none' }}>{config.buttonText}</button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
                                <button type="submit" className="btn-save" style={{ padding: '12px 32px' }}><FaSave /> Save Banner</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Tab: Partner Cards ───────────────────────────────────── */}
            {activeTab === 'cards' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ color: '#111827', fontSize: '1.1rem', margin: 0 }}>Partner Cards ({config.cards.length})</h3>
                        <button onClick={openAddCard} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#2ea34b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
                            <FaPlus /> Add Card
                        </button>
                    </div>

                    <div style={{ display: 'grid', gap: 14 }}>
                        {config.cards.map((card, idx) => (
                            <div key={card.id} style={cardStyle}>
                                <div style={cardHeader}>
                                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${card.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, fontWeight: 700, fontSize: '0.9rem' }}>
                                        {card.iconName.replace('Fa', '').charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <span style={{ fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{card.title}</span>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{card.benefits.length} benefits • {card.iconName}</div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 8, borderRadius: 8, padding: '2px', background: '#f3f4f6' }}>
                                        <button disabled={idx === 0} onClick={() => moveCard(idx, -1)} style={{ ...iconBtnStyle, opacity: idx === 0 ? 0.3 : 1 }}><FaArrowUp style={{ fontSize: 12 }} /></button>
                                        <button disabled={idx === config.cards.length - 1} onClick={() => moveCard(idx, 1)} style={{ ...iconBtnStyle, opacity: idx === config.cards.length - 1 ? 0.3 : 1 }}><FaArrowDown style={{ fontSize: 12 }} /></button>
                                    </div>
                                    <button onClick={() => openEditCard(card)} style={iconBtnStyle}><FaPencilAlt style={{ color: '#374151' }} /></button>
                                    <button onClick={() => deleteCard(card.id)} style={iconBtnStyle}><FaTrash style={{ color: '#ef4444' }} /></button>
                                </div>
                                {/* Benefits preview */}
                                <div style={{ padding: '10px 18px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {card.benefits.map((b, i) => (
                                        <span key={i} style={{ fontSize: '0.78rem', padding: '3px 10px', background: `${card.color}12`, color: card.color, borderRadius: 50, fontWeight: 500 }}>✓ {b}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Modal: Card ──────────────────────────────────────────── */}
            {cardModal.open && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                        {/* Modal Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #f3f4f6' }}>
                            <h3 style={{ color: '#111827', margin: 0 }}>{cardModal.mode === 'add' ? 'Add Partner Card' : 'Edit Partner Card'}</h3>
                            <button onClick={() => setCardModal({ open: false, mode: 'add' })} style={iconBtnStyle}><FaTimes /></button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '20px 24px', display: 'grid', gap: 16 }}>
                            <div>
                                <label style={labelStyle}>Card Title *</label>
                                <input value={cardForm.title} onChange={e => setCardForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="e.g., Become a Distributor" autoFocus />
                            </div>
                            <div>
                                <label style={labelStyle}>Description *</label>
                                <textarea value={cardForm.description} onChange={e => setCardForm(f => ({ ...f, description: e.target.value }))} style={{ ...inputStyle, minHeight: 80 }} placeholder="Describe this partnership..." />
                            </div>

                            {/* Icon Selector */}
                            <div>
                                <label style={labelStyle}>Icon</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {iconOptions.map(icon => (
                                        <button key={icon} type="button" onClick={() => setCardForm(f => ({ ...f, iconName: icon }))} style={{
                                            padding: '6px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600,
                                            border: cardForm.iconName === icon ? '2px solid #2ea34b' : '1px solid #e5e7eb',
                                            background: cardForm.iconName === icon ? '#ecfdf5' : '#fff',
                                            color: cardForm.iconName === icon ? '#166534' : '#374151',
                                            cursor: 'pointer',
                                        }}>
                                            {icon.replace('Fa', '')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selector */}
                            <div>
                                <label style={labelStyle}>Card Color</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {colorOptions.map(c => (
                                        <button key={c} type="button" onClick={() => setCardForm(f => ({ ...f, color: c }))} style={{
                                            width: 32, height: 32, borderRadius: 8, background: c,
                                            border: cardForm.color === c ? '3px solid #111827' : '2px solid transparent',
                                            cursor: 'pointer',
                                        }} />
                                    ))}
                                </div>
                            </div>

                            {/* Benefits */}
                            <div>
                                <label style={labelStyle}>Benefits</label>
                                <div style={{ display: 'grid', gap: 8 }}>
                                    {cardForm.benefits.map((b, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: 8 }}>
                                            <input value={b} onChange={e => updateBenefit(idx, e.target.value)} style={{ ...inputStyle, flex: 1 }} placeholder={`Benefit ${idx + 1}`} />
                                            {cardForm.benefits.length > 1 && (
                                                <button type="button" onClick={() => removeBenefit(idx)} style={{ ...iconBtnStyle, color: '#ef4444' }}><FaTimes /></button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={addBenefit} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontSize: '0.82rem', width: 'fit-content' }}>
                                        <FaPlus /> Add Benefit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px', borderTop: '1px solid #f3f4f6' }}>
                            <button onClick={() => setCardModal({ open: false, mode: 'add' })} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: 8, fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem' }}>Cancel</button>
                            <button onClick={saveCard} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#2ea34b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}><FaSave /> Save Card</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnboardManagement;
