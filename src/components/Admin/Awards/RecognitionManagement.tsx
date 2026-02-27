import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaSave, FaTimes, FaSearch, FaAward, FaTrophy, FaMedal, FaPencilAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Recognition {
    id: string;
    title: string;
    year: string;
    description: string;
    organization: string;
    iconType: 'award' | 'trophy' | 'medal';
    isActive: boolean;
}

interface SectionHeader {
    label: string;
    title: string;
    subtitle: string;
}

const RECOGNITION_SEEDS: Recognition[] = [
    { id: 'award-1', title: 'Best GreenRevotec Company of the Year', year: '2024', organization: 'India Agriculture Awards 2024', description: 'Recognized for outstanding contribution to the agriculture sector and innovative farming solutions.', iconType: 'trophy', isActive: true },
    { id: 'award-2', title: 'Excellence in Organic Farming Innovation', year: '2024', organization: 'FICCI Agriculture Summit', description: 'Awarded for pioneering methods in organic compost units and sustainable practices.', iconType: 'award', isActive: true },
    { id: 'award-3', title: 'Top 50 AgriStartup — India', year: '2023', organization: 'YourStory GreenRevotec 50 List', description: 'Featured among the most promising agriculture-tech startups in India.', iconType: 'award', isActive: true },
    { id: 'award-4', title: 'Sustainable Farming Champion', year: '2023', organization: 'CII Sustainability Awards', description: 'National recognition for promoting climate-resilient farming and resource conservation.', iconType: 'medal', isActive: true },
    { id: 'award-5', title: 'Green Innovation Excellence Award', year: '2023', organization: 'Ministry of Agriculture, India', description: 'Prestigious award for developing eco-friendly irrigation and soil health systems.', iconType: 'award', isActive: true },
    { id: 'award-6', title: 'Asia Pacific GreenRevotec Pioneer', year: '2022', organization: 'Asia Agriculture Leaders Forum', description: 'Recognized as a leading innovator in precision farming across the Asia-Pacific region.', iconType: 'award', isActive: true },
    { id: 'award-7', title: 'Best Farmer Welfare Initiative', year: '2022', organization: 'NABARD National Recognition', description: 'Awarded for impactful programs targeting small and marginal farmers.', iconType: 'award', isActive: true },
    { id: 'award-8', title: 'R&D Innovation in Agriculture', year: '2022', organization: 'ICAR Technology Awards', description: 'Recognition for scientific excellence in developing next-generation agricultural tools.', iconType: 'trophy', isActive: true },
];

const RecognitionManagement: React.FC = () => {
    const [list, setList] = useState<Recognition[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSectionVisible, setIsSectionVisible] = useState(true);

    // Header State
    const [header, setHeader] = useState<SectionHeader>({
        label: "Recognition",
        title: "Awards & <span>Achievements</span>",
        subtitle: "GreenRevotec's journey is marked by excellence and commitment to the agricultural community."
    });

    // Form State
    const [title, setTitle] = useState('');
    const [year, setYear] = useState('');
    const [description, setDescription] = useState('');
    const [organization, setOrganization] = useState('');
    const [iconType, setIconType] = useState<'award' | 'trophy' | 'medal'>('award');
    const [isActive, setIsActive] = useState(true);

    const fetchRecognitionConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_recognition_config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setList(data.list || RECOGNITION_SEEDS);
                    setHeader(data.header || {
                        label: "Recognition",
                        title: "Awards & <span>Achievements</span>",
                        subtitle: "GreenRevotec's journey is marked by excellence and commitment to the agricultural community."
                    });
                    setIsSectionVisible(data.sectionVisible !== false);
                    localStorage.setItem('admin_recognition_config', JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch recognition config:", error);
        }

        // Fallback
        const consolidated = localStorage.getItem('admin_recognition_config');
        if (consolidated) {
            const data = JSON.parse(consolidated);
            setList(data.list || RECOGNITION_SEEDS);
            setHeader(data.header || header);
            setIsSectionVisible(data.sectionVisible !== false);
        } else {
            // Check legacy keys
            const oldList = localStorage.getItem('admin_recognition');
            if (oldList) setList(JSON.parse(oldList));
            else setList(RECOGNITION_SEEDS);

            const oldHeader = localStorage.getItem('admin_recognition_header');
            if (oldHeader) setHeader(JSON.parse(oldHeader));
        }
    };

    useEffect(() => {
        fetchRecognitionConfig();
    }, []);

    const saveRecognitionConfig = async (updatedData: any) => {
        const fullConfig = {
            list,
            header,
            sectionVisible: isSectionVisible,
            ...updatedData
        };

        try {
            const response = await fetch('/api/settings/admin_recognition_config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: fullConfig })
            });

            if (response.ok) {
                localStorage.setItem('admin_recognition_config', JSON.stringify(fullConfig));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            console.error("Error saving recognition config:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const saveHeader = async () => {
        await saveRecognitionConfig({ header });
        toast.success("Section header updated!");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            toast.error("Title and description are required.");
            return;
        }

        const newItem: Recognition = {
            id: editingId || Date.now().toString(),
            title,
            year,
            description,
            organization,
            iconType,
            isActive
        };

        let updatedList;
        if (editingId) {
            updatedList = list.map(item => item.id === editingId ? newItem : item);
            toast.success("Recognition updated!");
        } else {
            updatedList = [newItem, ...list];
            toast.success("New recognition added!");
        }

        setList(updatedList);
        await saveRecognitionConfig({ list: updatedList });
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this recognition?")) {
            const updated = list.filter(item => item.id !== id);
            setList(updated);
            await saveRecognitionConfig({ list: updated });
            toast.error("Deleted.");
        }
    };

    const toggleSectionVisibility = async () => {
        const newValue = !isSectionVisible;
        setIsSectionVisible(newValue);
        await saveRecognitionConfig({ sectionVisible: newValue });
        toast.info(`Recognition section is now ${newValue ? 'Visible' : 'Hidden'}.`);
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setYear('');
        setDescription('');
        setOrganization('');
        setIconType('award');
        setIsActive(true);
        setIsModalOpen(false);
    };

    const openEdit = (item: Recognition) => {
        setEditingId(item.id);
        setTitle(item.title);
        setYear(item.year);
        setDescription(item.description);
        setOrganization(item.organization);
        setIconType(item.iconType);
        setIsActive(item.isActive);
        setIsModalOpen(true);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'trophy': return <FaTrophy />;
            case 'medal': return <FaMedal />;
            default: return <FaAward />;
        }
    };

    const filtered = list.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.organization.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeItems = list.filter(i => i.isActive).slice(0, 4);

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="admin-page-title">Recognition & Awards</h1>
                    <p className="admin-page-subtitle">Manage achievements and section headers.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isSectionVisible ? '#ecfdf5' : '#fef2f2', border: `1px solid ${isSectionVisible ? '#10b981' : '#ef4444'}`, borderRadius: '8px', cursor: 'pointer' }} onClick={toggleSectionVisibility}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSectionVisible ? '#047857' : '#b91c1c' }}>{isSectionVisible ? 'VISIBLE' : 'HIDDEN'} ON HOME</span>
                        <div style={{ width: '36px', height: '20px', background: isSectionVisible ? '#10b981' : '#ef4444', borderRadius: '10px', position: 'relative', transition: '0.3s' }}>
                            <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isSectionVisible ? '19px' : '3px', transition: '0.3s' }}></div>
                        </div>
                    </div>
                    <div style={{ position: 'relative', width: '250px' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search recognition..."
                            className="category-form-input"
                            style={{ paddingLeft: '40px', marginBottom: 0 }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn-save" onClick={() => { resetForm(); setIsModalOpen(true); }} style={{ margin: 0 }}>
                        <FaPlus /> Add Achievement
                    </button>
                </div>
            </div>

            {/* Section Header Editor */}
            <div className="category-form-card" style={{ marginBottom: '32px', padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaTrophy style={{ color: 'var(--color-primary)' }} /> Section Header Settings
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', overflowX: 'auto' }}>
                        {activeItems.length > 0 ? (
                            activeItems.map((item) => (
                                <div key={item.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(37, 181, 101, 0.2)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '12px' }}>
                                        {getIcon(item.iconType)}
                                    </div>
                                    <div style={{ color: 'var(--color-primary-light)', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: '4px' }}>{item.year}</div>
                                    <h4 style={{ color: 'white', fontSize: '0.9rem', margin: '0 0 8px' }}>{item.title}</h4>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: 0 }}>{item.organization}</p>
                                </div>
                            ))
                        ) : (
                            <div style={{ gridColumn: 'span 4', textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px' }}>Add active achievements to see preview.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="category-table-card">
                <table className="custom-category-table">
                    <thead>
                        <tr>
                            <th>Achievement</th>
                            <th>Details</th>
                            <th>Year</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No achievements recorded yet.</td></tr>
                            ) : (
                                filtered.map(item => (
                                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(37, 181, 101, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                    {getIcon(item.iconType)}
                                                </div>
                                                <div>
                                                    <strong style={{ display: 'block' }}>{item.title}</strong>
                                                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.organization}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '300px' }}>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.4' }}>{item.description}</p>
                                        </td>
                                        <td><span className="category-badge">{item.year}</span></td>
                                        <td>
                                            <button className={`status-toggle ${item.isActive ? 'active' : 'inactive'}`} onClick={() => {
                                                const updated = list.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i);
                                                setList(updated);
                                                saveRecognitionConfig({ list: updated });
                                            }}>
                                                {item.isActive ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="action-buttons">
                                                <button className="btn-icon edit" onClick={() => openEdit(item)}><FaPencilAlt /></button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(item.id)}><FaTrash /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div className="modal-header">
                                <h3>{editingId ? 'Edit Achievement' : 'Add Achievement'}</h3>
                                <button className="btn-close" onClick={resetForm}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ padding: '24px' }}>
                                <div className="category-form-group">
                                    <label>Achievement Title *</label>
                                    <input type="text" className="category-form-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Best Agricultural Innovation" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="category-form-group">
                                        <label>Organization / Awarder</label>
                                        <input type="text" className="category-form-input" value={organization} onChange={e => setOrganization(e.target.value)} placeholder="e.g. Ministry of Agriculture" />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Year</label>
                                        <input type="text" className="category-form-input" value={year} onChange={e => setYear(e.target.value)} placeholder="e.g. 2024" />
                                    </div>
                                </div>
                                <div className="category-form-group">
                                    <label>Icon Type</label>
                                    <select className="category-form-input" value={iconType} onChange={e => setIconType(e.target.value as any)}>
                                        <option value="award">Standard Award</option>
                                        <option value="trophy">Trophy</option>
                                        <option value="medal">Medal</option>
                                    </select>
                                </div>
                                <div className="category-form-group">
                                    <label>Description *</label>
                                    <textarea className="category-form-input" value={description} onChange={e => setDescription(e.target.value)} required rows={4} placeholder="Briefly describe the achievement..." />
                                </div>
                                <div className="category-form-group">
                                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                        <span>Visible on achievements page</span>
                                    </label>
                                </div>
                                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save Achievement</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RecognitionManagement;
