import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaSave, FaTimes, FaSearch, FaTags, FaCheck, FaPencilAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface PricingPlan {
    id: string;
    name: string;
    price: string;
    unit: string;
    features: string[];
    isPopular: boolean;
    buttonText: string;
    isActive: boolean;
}

interface SectionHeader {
    label: string;
    title: string;
    subtitle: string;
}

const PRICING_SEEDS: PricingPlan[] = [
    {
        id: 'plan-1',
        name: 'Starter Kit',
        price: '4,999',
        unit: '/ season',
        features: ['Basic soil test kit (15 parameters)', 'Seasonal crop nutrition plan', 'BioGrow Pro 25kg starter pack', 'OrganOil Shield 5L pack', 'WhatsApp advisory support'],
        isPopular: false,
        buttonText: 'Get Started',
        isActive: true
    },
    {
        id: 'plan-2',
        name: 'Growth Pro',
        price: '14,999',
        unit: '/ season',
        features: ['Advanced soil test (32 parameters)', 'AI-powered crop advisory app', 'Full season nutrient program', 'AquaSmart Drip Kit (1 acre)', 'Drone scouting (2 visits)'],
        isPopular: true,
        buttonText: 'Get Started',
        isActive: true
    },
    {
        id: 'plan-3',
        name: 'Enterprise',
        price: 'Custom',
        unit: 'pricing',
        features: ['Everything in Growth Pro', 'Unlimited land coverage', 'Dedicated account manager', 'Custom product formulations', 'White-label product options'],
        isPopular: false,
        buttonText: 'Request a Quote',
        isActive: true
    }
];

const PricingManagement: React.FC = () => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSectionVisible, setIsSectionVisible] = useState(true);

    // Header State
    const [header, setHeader] = useState<SectionHeader>({
        label: "Pricing Plans",
        title: "Investment for <span>Growth</span>",
        subtitle: "Choose the perfect plan for your farming or business needs. Scale as you grow with GreenRevotec."
    });

    // Form State
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('/ month');
    const [features, setFeatures] = useState<string[]>(['']);
    const [isPopular, setIsPopular] = useState(false);
    const [buttonText, setButtonText] = useState('Get Started');
    const [isActive, setIsActive] = useState(true);

    const fetchPricingConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_pricing_plans');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setPlans(data.plans || PRICING_SEEDS);
                    setHeader(data.header || {
                        label: "Pricing Plans",
                        title: "Investment for <span>Growth</span>",
                        subtitle: "Choose the perfect plan for your farming or business needs. Scale as you grow with GreenRevotec."
                    });
                    setIsSectionVisible(data.sectionVisible !== false);
                    localStorage.setItem('admin_pricing_plans', JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch pricing config:", error);
        }

        // Fallback
        const consolidated = localStorage.getItem('admin_pricing_plans');
        if (consolidated) {
            const data = JSON.parse(consolidated);
            setPlans(data.plans || PRICING_SEEDS);
            setHeader(data.header || header);
            setIsSectionVisible(data.sectionVisible !== false);
        } else {
            // Check legacy keys
            const oldPlans = localStorage.getItem('admin_pricing');
            if (oldPlans) setPlans(JSON.parse(oldPlans));
            else setPlans(PRICING_SEEDS);

            const oldHeader = localStorage.getItem('admin_pricing_header');
            if (oldHeader) setHeader(JSON.parse(oldHeader));
        }
    };

    useEffect(() => {
        fetchPricingConfig();
    }, []);

    const savePricingConfig = async (updatedData: any) => {
        const fullConfig = {
            plans,
            header,
            sectionVisible: isSectionVisible,
            ...updatedData
        };

        try {
            const response = await fetch('/api/settings/admin_pricing_plans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: fullConfig })
            });

            if (response.ok) {
                localStorage.setItem('admin_pricing_plans', JSON.stringify(fullConfig));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            console.error("Error saving pricing config:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const saveHeader = async () => {
        await savePricingConfig({ header });
        toast.success("Section header updated!");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price) {
            toast.error("Plan name and price are required.");
            return;
        }

        const newItem: PricingPlan = {
            id: editingId || Date.now().toString(),
            name,
            price,
            unit,
            features: features.filter(f => f.trim() !== ''),
            isPopular,
            buttonText,
            isActive
        };

        let updatedPlans;
        if (editingId) {
            updatedPlans = plans.map(p => p.id === editingId ? newItem : p);
            toast.success("Pricing plan updated!");
        } else {
            updatedPlans = [...plans, newItem];
            toast.success("New pricing plan added!");
        }

        setPlans(updatedPlans);
        await savePricingConfig({ plans: updatedPlans });
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this pricing plan?")) {
            const updated = plans.filter(p => p.id !== id);
            setPlans(updated);
            await savePricingConfig({ plans: updated });
            toast.error("Deleted.");
        }
    };

    const toggleSectionVisibility = async () => {
        const newValue = !isSectionVisible;
        setIsSectionVisible(newValue);
        await savePricingConfig({ sectionVisible: newValue });
        toast.info(`Pricing section is now ${newValue ? 'Visible' : 'Hidden'}.`);
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setPrice('');
        setUnit('/ month');
        setFeatures(['']);
        setIsPopular(false);
        setButtonText('Get Started');
        setIsActive(true);
        setIsModalOpen(false);
    };

    const addFeature = () => setFeatures([...features, '']);
    const removeFeature = (index: number) => {
        const updated = features.filter((_, i) => i !== index);
        setFeatures(updated.length ? updated : ['']);
    };
    const updateFeature = (index: number, val: string) => {
        const updated = [...features];
        updated[index] = val;
        setFeatures(updated);
    };

    const openEdit = (plan: PricingPlan) => {
        setEditingId(plan.id);
        setName(plan.name);
        setPrice(plan.price);
        setUnit(plan.unit);
        setFeatures(plan.features.length ? plan.features : ['']);
        setIsPopular(plan.isPopular);
        setButtonText(plan.buttonText);
        setIsActive(plan.isActive);
        setIsModalOpen(true);
    };

    const activePlans = plans.filter(p => p.isActive);

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="admin-page-title">Pricing Plans</h1>
                    <p className="admin-page-subtitle">Manage service packages and section headers.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isSectionVisible ? '#ecfdf5' : '#fef2f2', border: `1px solid ${isSectionVisible ? '#10b981' : '#ef4444'}`, borderRadius: '8px', cursor: 'pointer' }} onClick={toggleSectionVisibility}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSectionVisible ? '#047857' : '#b91c1c' }}>{isSectionVisible ? 'VISIBLE' : 'HIDDEN'} ON HOME</span>
                        <div style={{ width: '36px', height: '20px', background: isSectionVisible ? '#10b981' : '#ef4444', borderRadius: '10px', position: 'relative', transition: '0.3s' }}>
                            <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isSectionVisible ? '19px' : '3px', transition: '0.3s' }}></div>
                        </div>
                    </div>
                    <button className="btn-save" onClick={() => { resetForm(); setIsModalOpen(true); }} style={{ margin: 0 }}>
                        <FaPlus /> Create New Plan
                    </button>
                </div>
            </div>

            {/* Section Header Editor */}
            <div className="category-form-card" style={{ marginBottom: '32px', padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaTags style={{ color: 'var(--color-primary)' }} /> Section Header Settings
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                    <div className="category-form-group">
                        <label>Section Label</label>
                        <input
                            type="text"
                            className="category-form-input"
                            value={header.label}
                            onChange={e => setHeader({ ...header, label: e.target.value })}
                        />
                    </div>
                    <div className="category-form-group">
                        <label>Main Title (use &lt;span&gt; for highlight)</label>
                        <input
                            type="text"
                            className="category-form-input"
                            value={header.title}
                            onChange={e => setHeader({ ...header, title: e.target.value })}
                        />
                    </div>
                </div>
                <div className="category-form-group">
                    <label>Subtitle / Description</label>
                    <textarea
                        className="category-form-input"
                        value={header.subtitle}
                        onChange={e => setHeader({ ...header, subtitle: e.target.value })}
                        rows={2}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn-save" onClick={saveHeader}><FaSave /> Update Header</button>
                </div>
            </div>

            {/* Live Preview */}
            <div className="category-form-card" style={{ marginBottom: '32px' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaSearch size={14} /> Live Homepage Preview (Draft)
                    </h3>
                </div>
                <div style={{ padding: '60px 20px', background: '#0a140f', borderRadius: '0 0 12px 12px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div style={{ color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>{header.label}</div>
                        <h2 style={{ color: 'white', fontSize: '2.2rem', margin: '15px 0' }} dangerouslySetInnerHTML={{ __html: header.title }}></h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto' }}>{header.subtitle}</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto', overflowX: 'auto' }}>
                        {activePlans.length > 0 ? (
                            activePlans.map((plan) => (
                                <div key={plan.id} style={{
                                    background: plan.isPopular ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                                    border: plan.isPopular ? '1px solid rgba(245, 166, 35, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    padding: '30px',
                                    position: 'relative',
                                    transform: plan.isPopular ? 'scale(1.03)' : 'none',
                                    zIndex: plan.isPopular ? 1 : 0
                                }}>
                                    {plan.isPopular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #f5a623, #d97706)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 'bold' }}>MOST POPULAR</div>}
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>PLAN</div>
                                    <h4 style={{ color: 'white', fontSize: '1.2rem', margin: '0 0 15px' }}>{plan.name}</h4>
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '15px 0', marginBottom: '20px' }}>
                                        <div style={{ color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>₹{plan.price} <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 'normal' }}>{plan.unit}</span></div>
                                    </div>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 25px' }}>
                                        {plan.features.map((f, i) => (
                                            <li key={i} style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                                <FaCheck size={10} style={{ color: plan.isPopular ? '#f5a623' : 'var(--color-primary)' }} /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <button style={{ width: '100%', padding: '12px', borderRadius: '8px', background: plan.isPopular ? 'var(--color-accent)' : 'transparent', border: plan.isPopular ? 'none' : '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                        {plan.buttonText}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px', gridColumn: '1 / -1' }}>Add active plans to see preview.</div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                <AnimatePresence>
                    {plans.map(plan => (
                        <motion.div
                            key={plan.id}
                            className={`category-form-card ${plan.isPopular ? 'popular-plan-admin' : ''}`}
                            style={{
                                margin: 0,
                                position: 'relative',
                                border: plan.isPopular ? '2px solid var(--color-primary)' : '1px solid #e5e7eb',
                                background: 'white'
                            }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            {plan.isPopular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>MOST POPULAR</div>}

                            <div style={{ padding: '30px 24px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                                <h3 style={{ margin: '0 0 10px', fontSize: '1.25rem', color: '#111827' }}>{plan.name}</h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                                    ₹{plan.price} <span style={{ fontSize: '1rem', color: '#6b7280', fontWeight: 'normal' }}>{plan.unit}</span>
                                </div>
                            </div>

                            <div style={{ padding: '24px' }}>
                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                                    {plan.features.map((f, i) => (
                                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '0.9rem', color: '#4b5563' }}>
                                            <FaCheck style={{ color: 'var(--color-primary)', flexShrink: 0 }} size={12} /> {f}
                                        </li>
                                    ))}
                                </ul>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <div className="action-buttons">
                                        <button className="btn-icon edit" onClick={() => openEdit(plan)}><FaPencilAlt /></button>
                                        <button className="btn-icon delete" onClick={() => handleDelete(plan.id)}><FaTrash /></button>
                                    </div>
                                    <button
                                        className={`status-toggle ${plan.isActive ? 'active' : 'inactive'}`}
                                        onClick={() => {
                                            const updated = plans.map(p => p.id === plan.id ? { ...p, isActive: !p.isActive } : p);
                                            setPlans(updated);
                                            savePricingConfig({ plans: updated });
                                        }}
                                    >
                                        {plan.isActive ? 'Active' : 'Hidden'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ maxWidth: '650px' }}>
                            <div className="modal-header">
                                <h3>{editingId ? 'Edit Pricing Plan' : 'Create New Plan'}</h3>
                                <button className="btn-close" onClick={resetForm}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px' }}>
                                    <div className="category-form-group">
                                        <label>Plan Name *</label>
                                        <input type="text" className="category-form-input" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Basic Plan" />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Price (₹) *</label>
                                        <input type="text" className="category-form-input" value={price} onChange={e => setPrice(e.target.value)} required placeholder="999" />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Unit</label>
                                        <input type="text" className="category-form-input" value={unit} onChange={e => setUnit(e.target.value)} placeholder="/ month" />
                                    </div>
                                </div>

                                <div className="category-form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <label style={{ margin: 0 }}>Plan Features</label>
                                        <button type="button" className="btn-save" style={{ padding: '4px 10px', fontSize: '0.8rem', margin: 0 }} onClick={addFeature}><FaPlus /> Add Feature</button>
                                    </div>
                                    {features.map((feature, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input
                                                type="text"
                                                className="category-form-input"
                                                style={{ marginBottom: 0 }}
                                                value={feature}
                                                onChange={e => updateFeature(index, e.target.value)}
                                                placeholder="e.g. 24/7 Support"
                                            />
                                            {features.length > 1 && (
                                                <button type="button" className="btn-icon delete" onClick={() => removeFeature(index)}><FaTrash size={12} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="category-form-group">
                                        <label>Button Text</label>
                                        <input type="text" className="category-form-input" value={buttonText} onChange={e => setButtonText(e.target.value)} />
                                    </div>
                                    <div className="category-form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input type="checkbox" checked={isPopular} onChange={e => setIsPopular(e.target.checked)} />
                                            <span>Mark as "Most Popular"</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="category-form-group">
                                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                        <span>Plan is active and visible</span>
                                    </label>
                                </div>

                                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save Pricing Plan</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PricingManagement;
