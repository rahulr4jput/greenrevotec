import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaSave, FaTimes, FaSearch, FaImage, FaPencilAlt, FaUpload } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface GalleryItem {
    id: string;
    image: string;
    category: string;
    caption: string;
    isActive: boolean;
}

interface SectionHeader {
    label: string;
    title: string;
    subtitle: string;
}

const GALLERY_CATEGORIES = ['All', 'Agriculture', 'Equipment', 'Sustainable', 'Farming', 'Innovation'];

const GalleryManagement: React.FC = () => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isSectionVisible, setIsSectionVisible] = useState(true);

    // Header State
    const [header, setHeader] = useState<SectionHeader>({
        label: "Our Gallery",
        title: "GreenRevotec in <span>Action</span>",
        subtitle: "A glimpse into our field operations, products, and the farmers we serve across India."
    });

    // Form State
    const [image, setImage] = useState('');
    const [category, setCategory] = useState('Agriculture');
    const [caption, setCaption] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');

    const fetchGalleryConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_gallery_config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setItems(data.items || []);
                    setHeader(data.header || {
                        label: "Our Gallery",
                        title: "GreenRevotec in <span>Action</span>",
                        subtitle: "A glimpse into our field operations, products, and the farmers we serve across India."
                    });
                    setIsSectionVisible(data.sectionVisible !== false);
                    localStorage.setItem('admin_gallery_config', JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch gallery config:", error);
        }

        // Fallback
        const consolidated = localStorage.getItem('admin_gallery_config');
        if (consolidated) {
            const data = JSON.parse(consolidated);
            setItems(data.items || []);
            setHeader(data.header || header);
            setIsSectionVisible(data.sectionVisible !== false);
        } else {
            // Check legacy keys
            const oldItems = localStorage.getItem('admin_gallery');
            if (oldItems) setItems(JSON.parse(oldItems));
            const oldHeader = localStorage.getItem('admin_gallery_header');
            if (oldHeader) setHeader(JSON.parse(oldHeader));
        }
    };

    useEffect(() => {
        fetchGalleryConfig();
    }, []);

    const saveGalleryConfig = async (updatedData: any) => {
        const fullConfig = {
            items,
            header,
            sectionVisible: isSectionVisible,
            ...updatedData
        };

        try {
            const response = await fetch('/api/settings/admin_gallery_config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: fullConfig })
            });

            if (response.ok) {
                localStorage.setItem('admin_gallery_config', JSON.stringify(fullConfig));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            console.error("Error saving gallery config:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const saveHeader = async () => {
        await saveGalleryConfig({ header });
        toast.success("Section header updated!");
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File is too large. Max 2MB allowed.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) {
            toast.error("Image URL is required.");
            return;
        }

        const newItem: GalleryItem = {
            id: editingId || Date.now().toString(),
            image,
            category,
            caption,
            isActive
        };

        let updatedItems;
        if (editingId) {
            updatedItems = items.map(item => item.id === editingId ? newItem : item);
            toast.success("Gallery item updated!");
        } else {
            updatedItems = [newItem, ...items];
            toast.success("Image added to gallery!");
        }

        setItems(updatedItems);
        await saveGalleryConfig({ items: updatedItems });
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this image?")) {
            const updated = items.filter(item => item.id !== id);
            setItems(updated);
            await saveGalleryConfig({ items: updated });
            toast.error("Deleted.");
        }
    };

    const toggleSectionVisibility = async () => {
        const newValue = !isSectionVisible;
        setIsSectionVisible(newValue);
        await saveGalleryConfig({ sectionVisible: newValue });
        toast.info(`Gallery section is now ${newValue ? 'Visible' : 'Hidden'}.`);
    };

    const resetForm = () => {
        setEditingId(null);
        setImage('');
        setCategory('Agriculture');
        setCaption('');
        setIsActive(true);
        setImageSource('url');
        setIsModalOpen(false);
    };

    const filtered = items.filter(item =>
        (filterCategory === 'All' || item.category === filterCategory) &&
        (item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const activeItems = items.filter(item => item.isActive).slice(0, 8);

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="admin-page-title">Our Gallery</h1>
                    <p className="admin-page-subtitle">Manage images and section headers.</p>
                </div>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isSectionVisible ? '#ecfdf5' : '#fef2f2', border: `1px solid ${isSectionVisible ? '#10b981' : '#ef4444'}`, borderRadius: '8px', cursor: 'pointer' }} onClick={toggleSectionVisibility}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSectionVisible ? '#047857' : '#b91c1c' }}>{isSectionVisible ? 'VISIBLE' : 'HIDDEN'} ON HOME</span>
                        <div style={{ width: '36px', height: '20px', background: isSectionVisible ? '#10b981' : '#ef4444', borderRadius: '10px', position: 'relative', transition: '0.3s' }}>
                            <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isSectionVisible ? '19px' : '3px', transition: '0.3s' }}></div>
                        </div>
                    </div>
                    <select
                        className="category-form-input"
                        style={{ width: 'auto', marginBottom: 0 }}
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        {GALLERY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div style={{ position: 'relative', width: '200px' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search gallery..."
                            className="category-form-input"
                            style={{ paddingLeft: '40px', marginBottom: 0 }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: 500, marginRight: '10px' }}>
                        {items.length} / 100 Images
                    </div>
                    <button className="btn-save" onClick={() => { resetForm(); setIsModalOpen(true); }} style={{ margin: 0 }}>
                        <FaPlus /> Add Image
                    </button>
                </div>
            </div>

            {/* Section Header Editor */}
            <div className="category-form-card" style={{ marginBottom: '32px', padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaImage style={{ color: 'var(--color-primary)' }} /> Section Header Settings
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gridAutoRows: '150px', gap: '12px', overflowX: 'auto' }}>
                        {activeItems.length > 0 ? (
                            activeItems.map((item, i) => {
                                let spanClass = i === 0 ? "span 2 / span 2" : (i === 1 || i === 4 ? "span 2 / span 1" : "span 1 / span 1");
                                return (
                                    <div key={item.id} style={{ gridArea: spanClass, position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img src={item.image} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                                            <div style={{ color: 'var(--color-primary-light)', fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>{item.category}</div>
                                            <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: '600' }}>{item.caption}</div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ gridColumn: 'span 4', textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px' }}>Add active images to see the preview.</div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                <AnimatePresence>
                    {filtered.map(item => (
                        <motion.div
                            key={item.id}
                            className="category-form-card"
                            style={{ margin: 0, padding: 0, overflow: 'hidden', position: 'relative' }}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                        >
                            <div style={{ height: '200px', width: '100%', position: 'relative' }}>
                                <img src={item.image} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                                    <button className="btn-icon edit" style={{ background: 'white' }} onClick={() => {
                                        setEditingId(item.id);
                                        setImage(item.image);
                                        setCategory(item.category);
                                        setCaption(item.caption);
                                        setIsActive(item.isActive);
                                        setIsModalOpen(true);
                                    }}><FaPencilAlt /></button>
                                    <button className="btn-icon delete" style={{ background: 'white' }} onClick={() => handleDelete(item.id)}><FaTrash /></button>
                                </div>
                                <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
                                    <span className="category-badge" style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: 'black' }}>{item.category}</span>
                                </div>
                            </div>
                            <div style={{ padding: '15px' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>{item.caption || 'No caption'}</p>
                                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>ID: {item.id.slice(-6)}</span>
                                    <button
                                        className={`status-toggle ${item.isActive ? 'active' : 'inactive'}`}
                                        style={{ transform: 'scale(0.8)' }}
                                        onClick={() => {
                                            const updated = items.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i);
                                            setItems(updated);
                                            saveGalleryConfig({ items: updated });
                                        }}
                                    >
                                        {item.isActive ? 'Active' : 'Hidden'}
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
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div className="modal-header">
                                <h3>{editingId ? 'Edit Gallery Item' : 'Add New Image'}</h3>
                                <button className="btn-close" onClick={resetForm}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ padding: '24px' }}>
                                <div className="category-form-group">
                                    <label>Image Source</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                        <button
                                            type="button"
                                            className={`btn-icon ${imageSource === 'url' ? 'edit' : ''}`}
                                            style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: imageSource === 'url' ? 'rgba(76, 175, 80, 0.1)' : '#f3f4f6', color: imageSource === 'url' ? '#2e7d32' : '#6b7280', border: '1px solid', borderColor: imageSource === 'url' ? '#2e7d32' : 'transparent', borderRadius: '8px' }}
                                            onClick={() => setImageSource('url')}
                                        >
                                            <FaSearch size={14} /> Image URL
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn-icon ${imageSource === 'upload' ? 'edit' : ''}`}
                                            style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: imageSource === 'upload' ? 'rgba(76, 175, 80, 0.1)' : '#f3f4f6', color: imageSource === 'upload' ? '#2e7d32' : '#6b7280', border: '1px solid', borderColor: imageSource === 'upload' ? '#2e7d32' : 'transparent', borderRadius: '8px' }}
                                            onClick={() => setImageSource('upload')}
                                        >
                                            <FaUpload size={14} /> Local Upload
                                        </button>
                                    </div>

                                    {imageSource === 'url' ? (
                                        <input
                                            type="text"
                                            className="category-form-input"
                                            value={image}
                                            onChange={e => setImage(e.target.value)}
                                            required
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                    ) : (
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileUpload}
                                                style={{ display: 'none' }}
                                                id="gallery-file-upload"
                                            />
                                            <label
                                                htmlFor="gallery-file-upload"
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '30px',
                                                    border: '2px dashed #d1d5db',
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    background: '#f9fafb',
                                                    gap: '10px'
                                                }}
                                            >
                                                <FaUpload size={24} color="#9ca3af" />
                                                <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Click to upload or drag and drop</span>
                                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Max size: 2MB</span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {image && (
                                    <div className="category-form-group">
                                        <label>Image Preview</label>
                                        <div style={{ height: '150px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', marginTop: '10px' }}>
                                            <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    </div>
                                )}
                                <div className="category-form-group">
                                    <label>Category</label>
                                    <select className="category-form-input" value={category} onChange={e => setCategory(e.target.value)}>
                                        {GALLERY_CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="category-form-group">
                                    <label>Caption (Optional)</label>
                                    <input type="text" className="category-form-input" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Enter a photo caption..." />
                                </div>
                                <div className="category-form-group">
                                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                        <span>Show in gallery</span>
                                    </label>
                                </div>
                                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save Image</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GalleryManagement;
