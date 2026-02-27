import React, { useState, useEffect } from 'react';
import {
    FaSave, FaPlus, FaTrash, FaPencilAlt, FaTimes, FaArrowUp, FaArrowDown,
    FaEye, FaEyeSlash, FaRocket, FaLeaf, FaFlask, FaTractor, FaSatellite,
    FaMicroscope, FaHandshake, FaChartBar, FaShieldAlt, FaCheckCircle
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Reason {
    id: string;
    iconName: string;
    title: string;
    description: string;
    color: string;
    isActive: boolean;
}

interface Stat {
    id: string;
    label: string;
    value: string;
    suffix: string;
    iconName: string;
    color: string;
    isActive: boolean;
}

const DEFAULT_REASONS: Reason[] = [
    { id: 'reason-0', iconName: 'FaLeaf', title: 'Certified Organic', description: 'Meeting global organic standards for peak safety.', color: '#25b565', isActive: true },
    { id: 'reason-1', iconName: 'FaMicroscope', title: 'R&D Driven', description: 'Solutions developed in world-class research labs.', color: '#84cc16', isActive: true },
    { id: 'reason-2', iconName: 'FaTractor', title: 'End-to-End Support', description: 'Dedicated guidance from planting to harvest.', color: '#f5a623', isActive: true },
    { id: 'reason-3', iconName: 'FaSatellite', title: 'Smart GreenRevotec', description: 'Using AI and IoT for data-driven decisions.', color: '#38bdf8', isActive: true }
];

const DEFAULT_STATS: Stat[] = [
    { id: 'stat-0', label: 'Happy Farmers', value: '50', suffix: 'K+', iconName: 'FaHandshake', color: '#25b565', isActive: true },
    { id: 'stat-1', label: 'Yield Increase', value: '40', suffix: '%', iconName: 'FaChartBar', color: '#38bdf8', isActive: true },
    { id: 'stat-2', label: 'Network Spread', value: '15', suffix: '+States', iconName: 'FaSatellite', color: '#f5a623', isActive: true }
];

const ICON_MAP: Record<string, any> = {
    FaLeaf, FaFlask, FaTractor, FaSatellite, FaMicroscope, FaHandshake,
    FaChartBar, FaShieldAlt, FaCheckCircle, FaRocket
};

const WhyChooseUsManagement: React.FC = () => {
    const [header, setHeader] = useState({
        label: 'Why Green Revotec',
        title: 'Pioneering Sustainable Modern Agriculture',
        subtitle: "We don't just sell products; we deliver a complete ecosystem for the modern farmer. Our solutions are designed to boost yields while preserving soil health for generations to come."
    });

    const [reasons, setReasons] = useState<Reason[]>([]);
    const [stats, setStats] = useState<Stat[]>([]);
    const [features, setFeatures] = useState<string[]>(['Direct Farmer Connection', 'Real-time Crop Advisories', 'Climate-Resilient Strategies']);
    const [newFeature, setNewFeature] = useState('');

    const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
    const [editingReason, setEditingReason] = useState<Reason | null>(null);
    const [reasonForm, setReasonForm] = useState({
        iconName: 'FaLeaf',
        title: '',
        description: '',
        color: '#25b565',
        isActive: true
    });

    const [isStatModalOpen, setIsStatModalOpen] = useState(false);
    const [editingStat, setEditingStat] = useState<Stat | null>(null);
    const [statForm, setStatForm] = useState({
        label: '',
        value: '',
        suffix: '',
        iconName: 'FaHandshake',
        color: '#25b565',
        isActive: true
    });

    const [isSectionVisible, setIsSectionVisible] = useState(true);

    const fetchWhyChooseUsConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_why_choose_us');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setHeader(data.header || {
                        label: 'Why Green Revotec',
                        title: 'Pioneering Sustainable Modern Agriculture',
                        subtitle: "We don't just sell products; we deliver a complete ecosystem for the modern farmer. Our solutions are designed to boost yields while preserving soil health for generations to come."
                    });
                    setReasons(data.reasons || DEFAULT_REASONS);
                    setStats(data.stats || DEFAULT_STATS);
                    setFeatures(data.features || ['Direct Farmer Connection', 'Real-time Crop Advisories', 'Climate-Resilient Strategies']);
                    setIsSectionVisible(data.sectionVisible !== false);
                    localStorage.setItem('admin_why_choose_us', JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch Why Choose Us config:", error);
        }

        // Fallback
        const consolidated = localStorage.getItem('admin_why_choose_us');
        if (consolidated) {
            const data = JSON.parse(consolidated);
            setHeader(data.header || header);
            setReasons(data.reasons || DEFAULT_REASONS);
            setStats(data.stats || DEFAULT_STATS);
            setFeatures(data.features || features);
            setIsSectionVisible(data.sectionVisible !== false);
        } else {
            // Legacy/Default
            setHeader({
                label: 'Why Green Revotec',
                title: 'Pioneering Sustainable Modern Agriculture',
                subtitle: "We don't just sell products; we deliver a complete ecosystem for the modern farmer. Our solutions are designed to boost yields while preserving soil health for generations to come."
            });
            setReasons(DEFAULT_REASONS);
            setStats(DEFAULT_STATS);
            setFeatures(['Direct Farmer Connection', 'Real-time Crop Advisories', 'Climate-Resilient Strategies']);
        }
    };

    useEffect(() => {
        fetchWhyChooseUsConfig();
    }, []);

    const saveWhyChooseUsConfig = async (updatedData: any) => {
        const fullConfig = {
            header,
            reasons,
            stats,
            features,
            sectionVisible: isSectionVisible,
            ...updatedData
        };

        try {
            const response = await fetch('/api/settings/admin_why_choose_us', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: fullConfig })
            });

            if (response.ok) {
                localStorage.setItem('admin_why_choose_us', JSON.stringify(fullConfig));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            console.error("Error saving Why Choose Us config:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const handleHeaderSave = async () => {
        await saveWhyChooseUsConfig({ header });
        toast.success("Header content updated!");
    };

    const handleSaveReason = async (e: React.FormEvent) => {
        e.preventDefault();
        let updated;
        if (editingReason) {
            updated = reasons.map(r => r.id === editingReason.id ? { ...r, ...reasonForm } : r);
            toast.success("Reason updated!");
        } else {
            const newReason = { id: `reason-${Date.now()}`, ...reasonForm };
            updated = [...reasons, newReason];
            toast.success("Reason added!");
        }
        setReasons(updated);
        await saveWhyChooseUsConfig({ reasons: updated });
        setIsReasonModalOpen(false);
        setEditingReason(null);
    };

    const handleSaveStat = async (e: React.FormEvent) => {
        e.preventDefault();
        let updated;
        if (editingStat) {
            updated = stats.map(s => s.id === editingStat.id ? { ...s, ...statForm } : s);
            toast.success("Stat updated!");
        } else {
            const newStat = { id: `stat-${Date.now()}`, ...statForm };
            updated = [...stats, newStat];
            toast.success("Stat added!");
        }
        setStats(updated);
        await saveWhyChooseUsConfig({ stats: updated });
        setIsStatModalOpen(false);
        setEditingStat(null);
    };

    const handleAddFeature = async () => {
        if (!newFeature.trim()) return;
        const updated = [...features, newFeature.trim()];
        setFeatures(updated);
        await saveWhyChooseUsConfig({ features: updated });
        setNewFeature('');
        toast.success("Feature added!");
    };

    const removeFeature = async (index: number) => {
        const updated = features.filter((_, i) => i !== index);
        setFeatures(updated);
        await saveWhyChooseUsConfig({ features: updated });
    };

    const toggleSectionVisibility = async () => {
        const newValue = !isSectionVisible;
        setIsSectionVisible(newValue);
        await saveWhyChooseUsConfig({ sectionVisible: newValue });
        toast.info(`Section is now ${newValue ? 'Visible' : 'Hidden'}.`);
    };

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Why Green Revotec Management</h1>
                    <p className="admin-page-subtitle">Manage reasons, statistics, and text content for the homepage value proposition.</p>
                </div>
            </div>

            {/* Header Content Section */}
            <div className="category-form-card" style={{ marginBottom: '32px', padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaRocket style={{ color: 'var(--color-primary)' }} /> Section Header & Text
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                    <div className="category-form-group">
                        <label>Section Label</label>
                        <input
                            type="text"
                            className="category-form-input"
                            value={header.label}
                            onChange={(e) => setHeader({ ...header, label: e.target.value })}
                        />
                    </div>
                    <div className="category-form-group">
                        <label>Main Title</label>
                        <input
                            type="text"
                            className="category-form-input"
                            value={header.title}
                            onChange={(e) => setHeader({ ...header, title: e.target.value })}
                        />
                    </div>
                </div>
                <div className="category-form-group">
                    <label>Subtitle Paragraph</label>
                    <textarea
                        className="category-form-input"
                        rows={3}
                        value={header.subtitle}
                        onChange={(e) => setHeader({ ...header, subtitle: e.target.value })}
                    />
                </div>
                <button className="btn-save" onClick={handleHeaderSave}><FaSave /> Save Header Text</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
                {/* Reasons Cards Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaShieldAlt style={{ color: 'var(--color-primary)' }} /> Value Cards (Reasons)
                        </h3>
                        <button className="btn-save" onClick={() => { setEditingReason(null); setReasonForm({ iconName: 'FaLeaf', title: '', description: '', color: '#25b565', isActive: true }); setIsReasonModalOpen(true); }}>
                            <FaPlus /> Add Reason
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {reasons.map((reason, idx) => {
                            const Icon = ICON_MAP[reason.iconName] || FaLeaf;
                            return (
                                <motion.div key={reason.id} className="category-form-card" style={{ padding: '16px', position: 'relative', border: reason.isActive ? '1px solid #e5e7eb' : '1px dashed #d1d5db' }}>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', background: `${reason.color}18`, color: reason.color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Icon size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{reason.title}</h4>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#666', lineHeight: '1.4' }}>{reason.description}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-save" style={{ flex: 1, padding: '6px', fontSize: '0.75rem', background: '#f9fafb', color: '#333', boxShadow: 'none', border: '1px solid #ddd' }} onClick={() => { setEditingReason(reason); setReasonForm({ iconName: reason.iconName, title: reason.title, description: reason.description, color: reason.color, isActive: reason.isActive }); setIsReasonModalOpen(true); }}>
                                            <FaPencilAlt /> Edit
                                        </button>
                                        <button className="btn-icon" style={{ background: reason.isActive ? '#ecfdf5' : '#f3f4f6', color: reason.isActive ? '#10b981' : '#9ca3af' }} onClick={async () => { const updated = reasons.map(r => r.id === reason.id ? { ...r, isActive: !r.isActive } : r); setReasons(updated); await saveWhyChooseUsConfig({ reasons: updated }); }}>
                                            {reason.isActive ? <FaEye /> : <FaEyeSlash />}
                                        </button>
                                        <button className="btn-icon delete" onClick={async () => { if (window.confirm("Delete this reason card?")) { const updated = reasons.filter(r => r.id !== reason.id); setReasons(updated); await saveWhyChooseUsConfig({ reasons: updated }); toast.info("Reason deleted."); } }}>
                                            <FaTrash />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Stats & Features Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Stats Management */}
                    <div className="category-form-card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaChartBar style={{ color: 'var(--color-primary)' }} /> Section Stats
                            </h3>
                            <button className="btn-save" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => { setEditingStat(null); setStatForm({ label: '', value: '', suffix: '', iconName: 'FaHandshake', color: '#25b565', isActive: true }); setIsStatModalOpen(true); }}>
                                <FaPlus /> Add
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {stats.map(stat => (
                                <div key={stat.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #eee' }}>
                                    <div style={{ fontWeight: 800, color: stat.color, minWidth: '60px' }}>{stat.value}{stat.suffix}</div>
                                    <div style={{ flex: 1, fontSize: '0.85rem' }}>{stat.label}</div>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#666' }} onClick={() => { setEditingStat(stat); setStatForm({ ...stat }); setIsStatModalOpen(true); }}><FaPencilAlt size={12} /></button>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={async () => { if (window.confirm("Delete stat?")) { const updated = stats.filter(s => s.id !== stat.id); setStats(updated); await saveWhyChooseUsConfig({ stats: updated }); toast.info("Stat deleted."); } }}><FaTrash size={12} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features List Management */}
                    <div className="category-form-card" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '15px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaCheckCircle style={{ color: 'var(--color-primary)' }} /> Bullet Features
                        </h3>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                            <input
                                type="text"
                                className="category-form-input"
                                placeholder="Add feature..."
                                style={{ marginBottom: 0 }}
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                            />
                            <button className="btn-save" onClick={handleAddFeature}><FaPlus /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {features.map((feat, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#f3f4f6', borderRadius: '6px', fontSize: '0.85rem' }}>
                                    <FaCheckCircle color="#25b565" size={12} />
                                    <span style={{ flex: 1 }}>{feat}</span>
                                    <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }} onClick={() => removeFeature(i)}><FaTrash size={12} /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Reason Modal */}
            <AnimatePresence>
                {isReasonModalOpen && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ maxWidth: '500px', width: '90%' }}>
                            <div className="modal-header">
                                <h3>{editingReason ? 'Edit Reason Card' : 'Add New Reason'}</h3>
                                <button className="btn-close" onClick={() => setIsReasonModalOpen(false)}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSaveReason} style={{ padding: '24px' }}>
                                <div className="category-form-group">
                                    <label>Title *</label>
                                    <input type="text" className="category-form-input" value={reasonForm.title} onChange={(e) => setReasonForm({ ...reasonForm, title: e.target.value })} required />
                                </div>
                                <div className="category-form-group">
                                    <label>Description *</label>
                                    <textarea className="category-form-input" rows={2} value={reasonForm.description} onChange={(e) => setReasonForm({ ...reasonForm, description: e.target.value })} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="category-form-group">
                                        <label>Theme Color</label>
                                        <input type="color" className="category-form-input" style={{ height: '45px', padding: '5px' }} value={reasonForm.color} onChange={(e) => setReasonForm({ ...reasonForm, color: e.target.value })} />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Icon</label>
                                        <select className="category-form-input" value={reasonForm.iconName} onChange={(e) => setReasonForm({ ...reasonForm, iconName: e.target.value })}>
                                            {Object.keys(ICON_MAP).map(key => <option key={key} value={key}>{key}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-actions" style={{ marginTop: '20px' }}>
                                    <button type="button" className="btn-cancel" onClick={() => setIsReasonModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Stat Modal */}
            <AnimatePresence>
                {isStatModalOpen && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ maxWidth: '450px', width: '90%' }}>
                            <div className="modal-header">
                                <h3>{editingStat ? 'Edit Stat' : 'Add New Stat'}</h3>
                                <button className="btn-close" onClick={() => setIsStatModalOpen(false)}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSaveStat} style={{ padding: '24px' }}>
                                <div className="category-form-group">
                                    <label>Label Title *</label>
                                    <input type="text" className="category-form-input" value={statForm.label} onChange={(e) => setStatForm({ ...statForm, label: e.target.value })} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="category-form-group">
                                        <label>Value (Number) *</label>
                                        <input type="text" className="category-form-input" value={statForm.value} onChange={(e) => setStatForm({ ...statForm, value: e.target.value })} required />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Suffix (e.g. K+, %)</label>
                                        <input type="text" className="category-form-input" value={statForm.suffix} onChange={(e) => setStatForm({ ...statForm, suffix: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div className="category-form-group">
                                        <label>Theme Color</label>
                                        <input type="color" className="category-form-input" style={{ height: '45px', padding: '5px' }} value={statForm.color} onChange={(e) => setStatForm({ ...statForm, color: e.target.value })} />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Icon</label>
                                        <select className="category-form-input" value={statForm.iconName} onChange={(e) => setStatForm({ ...statForm, iconName: e.target.value })}>
                                            {Object.keys(ICON_MAP).map(key => <option key={key} value={key}>{key}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-actions" style={{ marginTop: '20px' }}>
                                    <button type="button" className="btn-cancel" onClick={() => setIsStatModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WhyChooseUsManagement;
