import React, { useState, useEffect } from 'react';
import {
    FaWhatsapp, FaLinkedin, FaFacebook, FaInstagram, FaTwitter, FaYoutube,
    FaSave, FaPlus, FaTrash, FaGlobe, FaLink, FaPencilAlt, FaTimes, FaEye, FaEyeSlash
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SocialLink {
    id: string;
    platform: string;
    href: string;
    color: string;
    isActive: boolean;
}

const DEFAULT_SOCIALS: SocialLink[] = [
    { id: 'soc-1', platform: 'WhatsApp', href: '#', color: '#25D366', isActive: true },
    { id: 'soc-2', platform: 'LinkedIn', href: '#', color: '#0A66C2', isActive: true },
    { id: 'soc-3', platform: 'Facebook', href: '#', color: '#1877F2', isActive: true },
    { id: 'soc-4', platform: 'Instagram', href: '#', color: '#E1306C', isActive: true },
    { id: 'soc-5', platform: 'Twitter', href: '#', color: '#1DA1F2', isActive: true },
    { id: 'soc-6', platform: 'YouTube', href: '#', color: '#FF0000', isActive: true },
];

const PLATFORM_COLORS: Record<string, string> = {
    'WhatsApp': '#25D366',
    'LinkedIn': '#0A66C2',
    'Facebook': '#1877F2',
    'Instagram': '#E1306C',
    'Twitter': '#1DA1F2',
    'YouTube': '#FF0000',
    'Other': '#6366f1'
};

const SocialManagement: React.FC = () => {
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<SocialLink | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        platform: 'WhatsApp',
        href: '',
        color: '#25D366',
        isActive: true
    });

    const fetchSocialLinks = async () => {
        try {
            const response = await fetch('/api/settings/admin_social_links');
            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data)) {
                    setLinks(data);
                    localStorage.setItem('admin_social_links', JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch Social links:", error);
        }

        // Fallback
        const stored = localStorage.getItem('admin_social_links');
        if (stored) {
            setLinks(JSON.parse(stored));
        } else {
            setLinks(DEFAULT_SOCIALS);
        }
    };

    useEffect(() => {
        fetchSocialLinks();
    }, []);

    const saveSocialLinks = async (updatedLinks: SocialLink[]) => {
        try {
            const response = await fetch('/api/settings/admin_social_links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: updatedLinks })
            });

            if (response.ok) {
                setLinks(updatedLinks);
                localStorage.setItem('admin_social_links', JSON.stringify(updatedLinks));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            console.error("Error saving Social links:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        let updatedLinks;
        if (editingLink) {
            updatedLinks = links.map(l => l.id === editingLink.id ? { ...l, ...formData } : l);
            toast.success("Social link updated!");
        } else {
            const newLink = {
                id: Date.now().toString(),
                ...formData
            };
            updatedLinks = [...links, newLink];
            toast.success("New social platform added!");
        }

        await saveSocialLinks(updatedLinks);
        setIsModalOpen(false);
        setEditingLink(null);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to remove this social link?")) {
            const updatedLinks = links.filter(l => l.id !== id);
            await saveSocialLinks(updatedLinks);
            toast.info("Social link removed.");
        }
    };

    const toggleStatus = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedLinks = links.map(l => l.id === id ? { ...l, isActive: !l.isActive } : l);
        await saveSocialLinks(updatedLinks);
    };

    const openEdit = (link: SocialLink) => {
        setEditingLink(link);
        setFormData({
            platform: link.platform,
            href: link.href,
            color: link.color,
            isActive: link.isActive
        });
        setIsModalOpen(true);
    };

    const openAdd = () => {
        setEditingLink(null);
        setFormData({
            platform: 'WhatsApp',
            href: '',
            color: '#25D366',
            isActive: true
        });
        setIsModalOpen(true);
    };

    const handlePlatformChange = (val: string) => {
        setFormData({
            ...formData,
            platform: val,
            color: PLATFORM_COLORS[val] || PLATFORM_COLORS['Other']
        });
    };

    const getIcon = (platform: string) => {
        switch (platform) {
            case 'WhatsApp': return <FaWhatsapp />;
            case 'LinkedIn': return <FaLinkedin />;
            case 'Facebook': return <FaFacebook />;
            case 'Instagram': return <FaInstagram />;
            case 'Twitter': return <FaTwitter />;
            case 'YouTube': return <FaYoutube />;
            default: return <FaGlobe />;
        }
    };

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="admin-page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="admin-page-title">Social Media Presence</h1>
                    <p className="admin-page-subtitle">Manage the social links that appear in your Contact section and Footer.</p>
                </div>
                <button className="btn-save" onClick={openAdd}>
                    <FaPlus /> Add Platform
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {links.map((link) => (
                    <motion.div
                        key={link.id}
                        className="category-form-card"
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        style={{ margin: 0, padding: '24px', cursor: 'pointer', position: 'relative', border: link.isActive ? '1px solid transparent' : '1px dashed #d1d5db', background: link.isActive ? 'white' : '#f9fafb' }}
                        onClick={() => openEdit(link)}
                    >
                        {/* Status Toggle in Corner */}
                        <div
                            style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 2 }}
                            onClick={(e) => toggleStatus(link.id, e)}
                        >
                            <div style={{
                                padding: '6px 10px',
                                borderRadius: '20px',
                                background: link.isActive ? '#ecfdf5' : '#f3f4f6',
                                color: link.isActive ? '#10b981' : '#6b7280',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}>
                                {link.isActive ? <><FaEye /> Visible</> : <><FaEyeSlash /> Hidden</>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: `${link.color}15`,
                                    color: link.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.4rem'
                                }}>
                                    {getIcon(link.platform)}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827' }}>{link.platform}</h3>
                                    <span style={{ fontSize: '0.8rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Social Link</span>
                                </div>
                            </div>

                            <div style={{ flexGrow: 1, padding: '12px', background: '#f8fafc', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                    <FaLink style={{ fontSize: '0.8rem', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                        {link.href || 'Link not configured'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    className="btn-save"
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        background: 'white',
                                        color: 'var(--color-primary)',
                                        border: '1px solid #e5e7eb',
                                        boxShadow: 'none',
                                        fontSize: '0.85rem'
                                    }}
                                    onClick={(e) => { e.stopPropagation(); openEdit(link); }}
                                >
                                    <FaPencilAlt /> Edit
                                </button>
                                <button
                                    className="btn-icon delete"
                                    style={{ width: '40px', height: '40px', flexShrink: 0 }}
                                    onClick={(e) => handleDelete(link.id, e)}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Add New Card Placeholder */}
                <motion.div
                    className="category-form-card"
                    layout
                    whileHover={{ scale: 1.02 }}
                    style={{
                        margin: 0,
                        padding: '24px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #e5e7eb',
                        background: 'transparent',
                        boxShadow: 'none'
                    }}
                    onClick={openAdd}
                >
                    <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.2rem' }}>
                            <FaPlus />
                        </div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Add New Platform</p>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h3>{editingLink ? `Edit ${formData.platform}` : 'Add Social Platform'}</h3>
                                <button className="btn-close" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ padding: '24px' }}>
                                <div className="category-form-group">
                                    <label>Platform *</label>
                                    <select
                                        className="category-form-input"
                                        value={formData.platform}
                                        onChange={(e) => handlePlatformChange(e.target.value)}
                                        required
                                    >
                                        {Object.keys(PLATFORM_COLORS).map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="category-form-group">
                                    <label><FaLink /> Link URL (href)</label>
                                    <input
                                        type="text"
                                        className="category-form-input"
                                        value={formData.href}
                                        onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                                        placeholder="https://facebook.com/your-page"
                                    />
                                </div>

                                <div className="category-form-group">
                                    <label>Brand Color</label>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            style={{ width: '50px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>{formData.color}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Platform Color</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="category-form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="isActive" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 500 }}>Visible on Homepage</label>
                                </div>

                                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> {editingLink ? 'Update' : 'Add'} Link</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SocialManagement;
