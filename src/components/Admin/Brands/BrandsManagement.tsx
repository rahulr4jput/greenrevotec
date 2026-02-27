import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaSave, FaTimes, FaSearch, FaCertificate, FaLink, FaImage, FaPencilAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Brand {
    id: string;
    name: string;
    desc: string;
    logo: string;
    link: string;
    isActive: boolean;
}

interface SectionHeader {
    label: string;
    title: string;
    subtitle: string;
}

const defaultBrands: Brand[] = [
    { id: '1', name: 'IFFCO', desc: "India's Largest Fertilizer Cooperative", logo: '', link: '', isActive: true },
    { id: '2', name: 'Bayer CropScience', desc: 'Global Crop Protection Leader', logo: '', link: '', isActive: true },
    { id: '3', name: 'UPL Limited', desc: "World's 5th Largest Agrochemicals", logo: '', link: '', isActive: true },
    { id: '4', name: 'Syngenta', desc: 'Global GreenRevotec Innovator', logo: '', link: '', isActive: true },
    { id: '5', name: 'BASF India', desc: 'Chemical & AgriScience Giant', logo: '', link: '', isActive: true },
    { id: '6', name: 'Coromandel International', desc: 'Integrated AgriSolutions Provider', logo: '', link: '', isActive: true },
    { id: '7', name: 'PI Industries', desc: 'Crop Protection Specialists', logo: '', link: '', isActive: true },
    { id: '8', name: 'Godrej Agrovet', desc: 'Diversified AgriSciences Leader', logo: '', link: '', isActive: true },
    { id: '9', name: 'Dhanuka Agritech', desc: 'Pesticide & Fertilizer Brand', logo: '', link: '', isActive: true },
    { id: '10', name: 'Rallis India', desc: 'TATA Group Agri Company', logo: '', link: '', isActive: true },
];

interface BrandStat {
    id: string;
    label: string;
    value: string;
}

const BrandsManagement: React.FC = () => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrandId, setEditingBrandId] = useState<string | null>(null);

    // Header State
    const [header, setHeader] = useState<SectionHeader>({
        label: "Trusted By",
        title: "Brands That Trust Us",
        subtitle: "Partnered with India's and the world's most respected agricultural brands to bring you the best products and innovations."
    });

    // Form State
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [logo, setLogo] = useState('');
    const [link, setLink] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSectionVisible, setIsSectionVisible] = useState(true);

    const [stats, setStats] = useState<BrandStat[]>([
        { id: '1', label: 'Brand Partners', value: '50+' },
        { id: '2', label: 'Distributor Network', value: '500+' },
        { id: '3', label: 'States Covered', value: '22' },
        { id: '4', label: 'Annual GMV', value: '₹500Cr+' }
    ]);

    // Stat Form State
    const [isStatModalOpen, setIsStatModalOpen] = useState(false);
    const [editingStatId, setEditingStatId] = useState<string | null>(null);
    const [statLabel, setStatLabel] = useState('');
    const [statValue, setStatValue] = useState('');

    useEffect(() => {
        const storedBrands = localStorage.getItem('admin_brands');
        if (storedBrands) {
            setBrands(JSON.parse(storedBrands));
        } else {
            setBrands(defaultBrands);
            localStorage.setItem('admin_brands', JSON.stringify(defaultBrands));
        }

        const storedStats = localStorage.getItem('admin_brands_stats');
        if (storedStats) {
            setStats(JSON.parse(storedStats));
        }

        const storedHeader = localStorage.getItem('admin_brands_header');
        if (storedHeader) {
            setHeader(JSON.parse(storedHeader));
        }

        const visibility = localStorage.getItem('admin_section_visibility');
        if (visibility) {
            const parsed = JSON.parse(visibility);
            setIsSectionVisible(parsed.brands !== false);
        }
    }, []);

    const saveStats = (newStats: BrandStat[]) => {
        setStats(newStats);
        localStorage.setItem('admin_brands_stats', JSON.stringify(newStats));
    };

    const saveToLocalStorage = (newBrands: Brand[]) => {
        setBrands(newBrands);
        localStorage.setItem('admin_brands', JSON.stringify(newBrands));
    };

    const saveHeader = () => {
        localStorage.setItem('admin_brands_header', JSON.stringify(header));
        toast.success("Section header updated!");
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            toast.error("Brand name is required.");
            return;
        }

        const newBrand: Brand = {
            id: editingBrandId || Date.now().toString(),
            name,
            desc,
            logo,
            link,
            isActive
        };

        if (editingBrandId) {
            const updated = brands.map(b => b.id === editingBrandId ? newBrand : b);
            saveToLocalStorage(updated);
            toast.success("Brand updated!");
        } else {
            saveToLocalStorage([newBrand, ...brands]);
            toast.success("Brand added!");
        }
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Delete this brand?")) {
            const updated = brands.filter(b => b.id !== id);
            saveToLocalStorage(updated);
            toast.error("Brand deleted.");
        }
    };

    const toggleStatus = (id: string) => {
        const updated = brands.map(b => b.id === id ? { ...b, isActive: !b.isActive } : b);
        saveToLocalStorage(updated);
    };

    const resetForm = () => {
        setEditingBrandId(null);
        setName('');
        setDesc('');
        setLogo('');
        setLink('');
        setIsActive(true);
        setIsModalOpen(false);
    };

    const toggleSectionVisibility = () => {
        const newValue = !isSectionVisible;
        setIsSectionVisible(newValue);
        const visibility = localStorage.getItem('admin_section_visibility');
        const parsed = visibility ? JSON.parse(visibility) : {};
        localStorage.setItem('admin_section_visibility', JSON.stringify({ ...parsed, brands: newValue }));
        toast.info(`Section is now ${newValue ? 'Visible' : 'Hidden'} on homepage.`);
    };

    const openEdit = (brand: Brand) => {
        setEditingBrandId(brand.id);
        setName(brand.name);
        setDesc(brand.desc || '');
        setLogo(brand.logo);
        setLink(brand.link);
        setIsActive(brand.isActive);
        setIsModalOpen(true);
    };

    const openEditStat = (stat: BrandStat) => {
        setEditingStatId(stat.id);
        setStatLabel(stat.label);
        setStatValue(stat.value);
        setIsStatModalOpen(true);
    };

    const handleSaveStat = (e: React.FormEvent) => {
        e.preventDefault();
        if (!statLabel || !statValue) return;

        const newStat = {
            id: editingStatId || Date.now().toString(),
            label: statLabel,
            value: statValue
        };

        if (editingStatId) {
            saveStats(stats.map(s => s.id === editingStatId ? newStat : s));
            toast.success("Stat updated!");
        } else {
            saveStats([...stats, newStat]);
            toast.success("Stat added!");
        }
        setIsStatModalOpen(false);
        setEditingStatId(null);
        setStatLabel('');
        setStatValue('');
    };

    const handleDeleteStat = (id: string) => {
        if (window.confirm("Delete this stat card?")) {
            saveStats(stats.filter(s => s.id !== id));
            toast.error("Stat deleted.");
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogo(reader.result as string);
                toast.success("Logo uploaded successfully!");
            };
            reader.readAsDataURL(file);
        }
    };

    const filtered = brands.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const activeBrandsForPreview = brands.filter(b => b.isActive);

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />

            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 className="admin-page-title">Trusted By (Brands)</h1>
                    <p className="admin-page-subtitle">Manage company logos and section labels.</p>
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
                            placeholder="Search brands..."
                            className="category-form-input"
                            style={{ paddingLeft: '40px', marginBottom: 0 }}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn-save" onClick={() => { resetForm(); setIsModalOpen(true); }} style={{ margin: 0 }}>
                        <FaPlus /> Add Brand
                    </button>
                </div>
            </div>

            {/* Section Header Editor */}
            <div className="category-form-card" style={{ marginBottom: '32px', padding: '24px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCertificate style={{ color: 'var(--color-primary)' }} /> Section Header Settings
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
                        <label>Main Title</label>
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
                <div style={{ padding: '40px 20px', background: '#0a140f', borderRadius: '0 0 12px 12px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>{header.label}</div>
                        <h2 style={{ color: 'white', fontSize: '1.8rem', margin: '10px 0' }}>{header.title}</h2>
                        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '600px', margin: '0 auto', fontSize: '0.9rem' }}>{header.subtitle}</p>
                    </div>

                    <div className="preview-scroll-container" style={{ overflowX: 'auto', padding: '20px 0', scrollbarWidth: 'thin' }}>
                        <div style={{ display: 'flex', gap: '24px', width: 'max-content', paddingBottom: '10px' }}>
                            {activeBrandsForPreview.length > 0 ? (
                                [...activeBrandsForPreview, ...activeBrandsForPreview].map((brand, i) => (
                                    <div key={i} style={{ width: '200px', padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                                        <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name} style={{ maxHeight: '100%', maxWidth: '140px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                                            ) : (
                                                <div style={{ color: 'white', fontWeight: '800', fontSize: '1.2rem' }}>{brand.name}</div>
                                            )}
                                        </div>
                                        <div style={{ color: 'white', fontWeight: '700', fontSize: '0.9rem' }}>{brand.name}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{brand.desc || 'Brand Partner'}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', width: '100%' }}>No active brands to display in preview.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="category-table-card">
                <table className="custom-category-table">
                    <thead>
                        <tr>
                            <th>Brand Logo</th>
                            <th>Brand Name</th>
                            <th>Link</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>No brands found.</td></tr>
                            ) : (
                                filtered.map(brand => (
                                    <motion.tr key={brand.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <td>
                                            <div style={{ width: '100px', height: '50px', background: '#f9fafb', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                {brand.logo ? (
                                                    <img src={brand.logo} alt={brand.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <span style={{ color: '#9ca3af' }}>{brand.name}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: '600' }}>{brand.name}</td>
                                        <td>{brand.link ? <a href={brand.link} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}><FaLink /> Visit</a> : 'N/A'}</td>
                                        <td>
                                            <button className={`status-toggle ${brand.isActive ? 'active' : 'inactive'}`} onClick={() => toggleStatus(brand.id)}>
                                                {brand.isActive ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="action-buttons">
                                                <button className="btn-icon edit" onClick={() => openEdit(brand)}><FaPencilAlt /></button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(brand.id)}><FaTrash /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Statistics Section */}
            <div className="admin-page-header" style={{ marginTop: '48px', marginBottom: '24px' }}>
                <div>
                    <h2 className="admin-page-title" style={{ fontSize: '1.25rem' }}>Business Statistics Cards</h2>
                    <p className="admin-page-subtitle">Manage the 4 cards displayed below the brand slider.</p>
                </div>
                <button className="btn-save" onClick={() => { setEditingStatId(null); setStatLabel(''); setStatValue(''); setIsStatModalOpen(true); }} style={{ margin: 0 }}>
                    <FaPlus /> Add Stat Card
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {stats.map(stat => (
                    <div key={stat.id} className="category-form-card" style={{ margin: 0, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-primary)' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase' }}>{stat.label}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', paddingTop: '10px', borderTop: '1px solid #f3f4f6' }}>
                            <button className="btn-icon edit" onClick={() => openEditStat(stat)}><FaPencilAlt /></button>
                            <button className="btn-icon delete" onClick={() => handleDeleteStat(stat.id)}><FaTrash /></button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stat Edit Modal */}
            <AnimatePresence>
                {isStatModalOpen && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ maxWidth: '400px' }}>
                            <div className="modal-header">
                                <h3>{editingStatId ? 'Edit Stat Card' : 'Add Stat Card'}</h3>
                                <button className="btn-close" onClick={() => setIsStatModalOpen(false)}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSaveStat} style={{ padding: '20px' }}>
                                <div className="category-form-group">
                                    <label>Stat Value (e.g. 500+)</label>
                                    <input type="text" className="category-form-input" value={statValue} onChange={e => setStatValue(e.target.value)} required />
                                </div>
                                <div className="category-form-group">
                                    <label>Stat Label (e.g. Annual GMV)</label>
                                    <input type="text" className="category-form-input" value={statLabel} onChange={e => setStatLabel(e.target.value)} required />
                                </div>
                                <div className="modal-actions" style={{ marginTop: '20px' }}>
                                    <button type="button" className="btn-cancel" onClick={() => setIsStatModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save Stat</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                            <div className="modal-header">
                                <h3>{editingBrandId ? 'Edit Brand' : 'Add New Brand'}</h3>
                                <button className="btn-close" onClick={resetForm}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ padding: '24px' }}>
                                <div className="category-form-group">
                                    <label>Brand Name *</label>
                                    <input type="text" className="category-form-input" value={name} onChange={e => setName(e.target.value)} required />
                                </div>
                                <div className="category-form-group">
                                    <label>Short Description (Optional)</label>
                                    <input type="text" className="category-form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. India's Largest Cooperative" />
                                </div>
                                <div className="category-form-group">
                                    <label>Logo Source *</label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <label htmlFor="logo-upload" className="btn-save" style={{ margin: 0, justifyContent: 'center', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer' }}>
                                                <FaImage /> Upload File
                                            </label>
                                            <input
                                                id="logo-upload"
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                onChange={handleFileUpload}
                                            />
                                        </div>
                                        <div style={{ flex: 2 }}>
                                            <input
                                                type="text"
                                                className="category-form-input"
                                                value={logo}
                                                onChange={e => setLogo(e.target.value)}
                                                placeholder="Or paste Logo URL..."
                                                style={{ marginBottom: 0 }}
                                            />
                                        </div>
                                    </div>
                                    {logo && (
                                        <div style={{ position: 'relative', width: 'fit-content', marginTop: '10px' }}>
                                            <img src={logo} alt="Preview" style={{ width: '120px', height: '60px', objectFit: 'contain', background: '#f9fafb', padding: '5px', borderRadius: '4px', border: '1px solid #e5e7eb' }} />
                                            <button
                                                type="button"
                                                onClick={() => setLogo('')}
                                                style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="category-form-group">
                                    <label>Website Link (Optional)</label>
                                    <input type="text" className="category-form-input" value={link} onChange={e => setLink(e.target.value)} />
                                </div>
                                <div className="category-form-group">
                                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                        <span>Show on homepage</span>
                                    </label>
                                </div>
                                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save Brand</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BrandsManagement;
