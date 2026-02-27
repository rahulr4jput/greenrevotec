import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaSave, FaTimes, FaSearch, FaQuoteLeft, FaStar, FaUserAlt, FaPencilAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Testimonial {
    id: string;
    author: string;
    role: string;
    content: string;
    rating: number;
    avatar: string;
    isActive: boolean;
}

interface SectionHeader {
    label: string;
    title: string;
    subtitle: string;
}

const TESTIMONIAL_SEEDS: Testimonial[] = [
    {
        id: 'review-1',
        author: 'Ramesh Kumar',
        role: 'Wheat Farmer, Punjab',
        content: 'Green Revotec\'s BioGrow Pro fertilizer has transformed my yields. I saw a 35% increase in production this season alone. Their soil advisory service helped identify exactly what nutrients my fields were missing. Highly recommend!',
        rating: 5,
        avatar: '',
        isActive: true
    },
    {
        id: 'review-2',
        author: 'Suresh Patil',
        role: 'Distributor & FPO Head, Maharashtra',
        content: 'As a distributor partner, Green Revotec provides unmatched support — from credit facilities to training on product application. My sales have grown 3x in two years and farmers in my network are extremely satisfied.',
        rating: 5,
        avatar: '',
        isActive: true
    },
    {
        id: 'review-3',
        author: 'Anitha Reddy',
        role: 'Organic Farmer, Andhra Pradesh',
        content: 'I transitioned to organic farming with Green Revotec\'s guidance. Their organic input kit and certification support helped me earn 60% more per quintal by accessing premium markets. Life-changing experience!',
        rating: 5,
        avatar: '',
        isActive: true
    }
];

const TestimonialsManagement: React.FC = () => {
    const [list, setList] = useState<Testimonial[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSectionVisible, setIsSectionVisible] = useState(true);

    // Header State
    const [header, setHeader] = useState<SectionHeader>({
        label: "Voice of Customer",
        title: "What Our <span>Partners Say</span>",
        subtitle: "Real stories from farmers and partners who have experienced the GreenRevotec revolution firsthand."
    });

    // Form State
    const [author, setAuthor] = useState('');
    const [role, setRole] = useState('');
    const [content, setContent] = useState('');
    const [rating, setRating] = useState(5);
    const [avatar, setAvatar] = useState('');
    const [isActive, setIsActive] = useState(true);

    const fetchTestimonialsConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_testimonials_config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setList(data.list || TESTIMONIAL_SEEDS);
                    setHeader(data.header || {
                        label: "Voice of Customer",
                        title: "What Our <span>Partners Say</span>",
                        subtitle: "Real stories from farmers and partners who have experienced the GreenRevotec revolution firsthand."
                    });
                    setIsSectionVisible(data.sectionVisible !== false);
                    localStorage.setItem('admin_testimonials_config', JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch testimonials config:", error);
        }

        // Fallback
        const consolidated = localStorage.getItem('admin_testimonials_config');
        if (consolidated) {
            const data = JSON.parse(consolidated);
            setList(data.list || TESTIMONIAL_SEEDS);
            setHeader(data.header || header);
            setIsSectionVisible(data.sectionVisible !== false);
        } else {
            // Check legacy keys
            const oldList = localStorage.getItem('admin_testimonials');
            if (oldList) setList(JSON.parse(oldList));
            else setList(TESTIMONIAL_SEEDS);

            const oldHeader = localStorage.getItem('admin_testimonials_header');
            if (oldHeader) setHeader(JSON.parse(oldHeader));
        }
    };

    useEffect(() => {
        fetchTestimonialsConfig();
    }, []);

    const saveTestimonialsConfig = async (updatedData: any) => {
        const fullConfig = {
            list,
            header,
            sectionVisible: isSectionVisible,
            ...updatedData
        };

        try {
            const response = await fetch('/api/settings/admin_testimonials_config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: fullConfig })
            });

            if (response.ok) {
                localStorage.setItem('admin_testimonials_config', JSON.stringify(fullConfig));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            console.error("Error saving testimonials config:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const saveHeader = async () => {
        await saveTestimonialsConfig({ header });
        toast.success("Section header updated!");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!author || !content) {
            toast.error("Author name and testimonial content are required.");
            return;
        }

        const newItem: Testimonial = {
            id: editingId || Date.now().toString(),
            author,
            role,
            content,
            rating,
            avatar,
            isActive
        };

        let updatedList;
        if (editingId) {
            updatedList = list.map(item => item.id === editingId ? newItem : item);
            toast.success("Testimonial updated!");
        } else {
            updatedList = [newItem, ...list];
            toast.success("Testimonial added!");
        }

        setList(updatedList);
        await saveTestimonialsConfig({ list: updatedList });
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this testimonial?")) {
            const updated = list.filter(item => item.id !== id);
            setList(updated);
            await saveTestimonialsConfig({ list: updated });
            toast.error("Deleted.");
        }
    };

    const toggleSectionVisibility = async () => {
        const newValue = !isSectionVisible;
        setIsSectionVisible(newValue);
        await saveTestimonialsConfig({ sectionVisible: newValue });
        toast.info(`Testimonials section is now ${newValue ? 'Visible' : 'Hidden'}.`);
    };

    const resetForm = () => {
        setEditingId(null);
        setAuthor('');
        setRole('');
        setContent('');
        setRating(5);
        setAvatar('');
        setIsActive(true);
        setIsModalOpen(false);
    };

    const openEdit = (item: Testimonial) => {
        setEditingId(item.id);
        setAuthor(item.author);
        setRole(item.role);
        setContent(item.content);
        setRating(item.rating);
        setAvatar(item.avatar);
        setIsActive(item.isActive);
        setIsModalOpen(true);
    };

    const filtered = list.filter(item =>
        item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeItems = list.filter(i => i.isActive);
    const previewItem = activeItems[0] || list[0];

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="admin-page-title">Voice of Customer</h1>
                    <p className="admin-page-subtitle">Manage client testimonials and section headers.</p>
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
                            placeholder="Search testimonials..."
                            className="category-form-input"
                            style={{ paddingLeft: '40px', marginBottom: 0 }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn-save" onClick={() => { resetForm(); setIsModalOpen(true); }} style={{ margin: 0 }}>
                        <FaPlus /> Add Testimonial
                    </button>
                </div>
            </div>

            {/* Section Header Editor */}
            <div className="category-form-card" style={{ marginBottom: '32px', padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaQuoteLeft style={{ color: 'var(--color-primary)' }} /> Section Header Settings
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

                    {previewItem ? (
                        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '40px' }}>
                            <FaQuoteLeft style={{ color: 'var(--color-primary)', fontSize: '2rem', marginBottom: '20px', opacity: 0.6 }} />
                            <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: '20px' }}>
                                {[...Array(previewItem.rating)].map((_, i) => <FaStar key={i} size={14} />)}
                            </div>
                            <p style={{ color: 'white', fontSize: '1.2rem', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '30px' }}>"{previewItem.content}"</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', overflow: 'hidden' }}>
                                    {previewItem.avatar ? <img src={previewItem.avatar} alt={previewItem.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : previewItem.author.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ color: 'white', fontWeight: 'bold' }}>{previewItem.author}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>{previewItem.role}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px' }}>Add a testimonial to see the preview.</div>
                    )}
                </div>
            </div>

            <div className="category-table-card">
                <table className="custom-category-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Testimonial</th>
                            <th>Rating</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No testimonials found.</td></tr>
                            ) : (
                                filtered.map(item => (
                                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '45px', height: '45px', borderRadius: '50%', overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
                                                    {item.avatar ? <img src={item.avatar} alt={item.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUserAlt style={{ width: '100%', height: '100%', padding: '10px', color: '#9ca3af' }} />}
                                                </div>
                                                <div>
                                                    <strong style={{ display: 'block' }}>{item.author}</strong>
                                                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{item.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ maxWidth: '400px' }}>
                                            <div style={{ position: 'relative', paddingLeft: '20px' }}>
                                                <FaQuoteLeft style={{ position: 'absolute', left: 0, top: '4px', fontSize: '0.8rem', color: '#d1d5db' }} />
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#4b5563', fontStyle: 'italic', lineHeight: '1.5' }}>{item.content}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '2px', color: '#f59e0b' }}>
                                                {[...Array(item.rating)].map((_, i) => <FaStar key={i} size={12} />)}
                                            </div>
                                        </td>
                                        <td>
                                            <button className={`status-toggle ${item.isActive ? 'active' : 'inactive'}`} onClick={() => {
                                                const updated = list.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i);
                                                setList(updated);
                                                saveTestimonialsConfig({ list: updated });
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
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ maxWidth: '600px' }}>
                            <div className="modal-header">
                                <h3>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                                <button className="btn-close" onClick={resetForm}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="category-form-group">
                                        <label>Customer Name *</label>
                                        <input type="text" className="category-form-input" value={author} onChange={e => setAuthor(e.target.value)} required placeholder="e.g. Rajesh Kumar" />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Role / Location</label>
                                        <input type="text" className="category-form-input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Farmer, Punjab" />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="category-form-group">
                                        <label>Rating (1-5)</label>
                                        <select className="category-form-input" value={rating} onChange={e => setRating(Number(e.target.value))}>
                                            <option value="5">5 Stars</option>
                                            <option value="4">4 Stars</option>
                                            <option value="3">3 Stars</option>
                                            <option value="2">2 Stars</option>
                                            <option value="1">1 Star</option>
                                        </select>
                                    </div>
                                    <div className="category-form-group">
                                        <label>Avatar image URL</label>
                                        <input type="text" className="category-form-input" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="https://..." />
                                    </div>
                                </div>
                                <div className="category-form-group">
                                    <label>Testimonial Content *</label>
                                    <textarea className="category-form-input" value={content} onChange={e => setContent(e.target.value)} required rows={5} placeholder="What does the customer say about GreenRevotec?" />
                                </div>
                                <div className="category-form-group">
                                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                        <span>Visible on homepage</span>
                                    </label>
                                </div>
                                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save Testimonial</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TestimonialsManagement;
