import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaHandshake, FaPencilAlt, FaSave, FaTimes, FaSearch, FaLeaf, FaTractor, FaFlask, FaRobot, FaUsers, FaChartLine, FaMicrochip, FaLanguage } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css'; // Reusing the clean table styling
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// The available icons for admins to choose from
const AVAILABLE_ICONS = [
    { name: 'FaLeaf', component: FaLeaf },
    { name: 'FaTractor', component: FaTractor },
    { name: 'FaFlask', component: FaFlask },
    { name: 'FaRobot', component: FaRobot },
    { name: 'FaMicrochip', component: FaMicrochip },
    { name: 'FaUsers', component: FaUsers },
    { name: 'FaChartLine', component: FaChartLine },
    { name: 'FaHandshake', component: FaHandshake }
];

interface AdminService {
    id: string;
    iconName: string;
    customIcon?: string;
    title: string;
    description: string;
    gradient: string;
    tag: string;
    image: string;
    thumbnail?: string;
    contentBlocks?: { image: string; title: string; description: string }[];
    isActive: boolean;
    bulletPoints?: string[];
    additionalImages?: string[];
    language?: string;
    linkedToId?: string | null;
    serviceCategory?: string;
}

interface Language {
    id: string;
    name: string;
    script: string;
}

const AllServices: React.FC = () => {
    const [services, setServices] = useState<AdminService[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
    const [isSectionVisible, setIsSectionVisible] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tag, setTag] = useState('');
    const [gradient, setGradient] = useState('linear-gradient(135deg, #1a8c4e, #12653a)');
    const [iconName, setIconName] = useState('FaLeaf');
    const [customIcon, setCustomIcon] = useState('');
    const [image, setImage] = useState('');
    const [thumbnail, setThumbnail] = useState('');
    const [additionalImages, setAdditionalImages] = useState<string[]>([]);
    const [isActive, setIsActive] = useState(true);
    const [bulletPoints, setBulletPoints] = useState<string[]>(['']);
    const [contentBlocks, setContentBlocks] = useState<{ image: string; title: string; description: string }[]>([]);
    const [language, setLanguage] = useState('English');
    const [linkedToId, setLinkedToId] = useState<string | null>(null);
    const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
    const [serviceCategory, setServiceCategory] = useState('');
    const [serviceCategories, setServiceCategories] = useState<{ id: string; name: string }[]>([]);
    const [multilangEnabled, setMultilangEnabled] = useState<boolean>(() => {
        const v = localStorage.getItem('admin_multilang_enabled');
        return v === null ? false : v === 'true';
    });

    useEffect(() => {
        fetchData();
        const visibility = localStorage.getItem('admin_section_visibility');
        if (visibility) {
            const parsed = JSON.parse(visibility);
            setIsSectionVisible(parsed.services !== false);
        }
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'admin_multilang_enabled') {
                setMultilangEnabled(e.newValue !== 'false');
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const fetchData = async () => {
        try {
            // Load Services from DB
            const servRes = await fetch('/api/services');
            const servData = await servRes.json();
            if (servRes.ok) {
                setServices(servData);
            }

            // Load Languages
            const langRes = await fetch('/api/languages');
            const langData = await langRes.json();
            if (langRes.ok) {
                setAvailableLanguages(langData);
            }

            // Load Service Categories from API
            const catRes = await fetch('/api/service-categories');
            if (catRes.ok) {
                const catData = await catRes.json();
                setServiceCategories(catData);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services');
        }
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                // If thumbnail is empty, auto-set it to this image too as a convenience
                if (!thumbnail) {
                    setThumbnail(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnail(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (additionalImages.length + files.length > 10) {
            toast.warning("You can only upload up to 10 additional images.");
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdditionalImages(prev => {
                    if (prev.length >= 10) return prev;
                    return [...prev, reader.result as string];
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const removeAdditionalImage = (index: number) => {
        setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleCustomIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomIcon(reader.result as string);
                setIconName('Custom'); // Automatically switch dropdown to custom
            };
            reader.readAsDataURL(file);
        }
    };

    const addContentBlock = () => {
        setContentBlocks([...contentBlocks, { image: '', title: '', description: '' }]);
    };

    const removeContentBlock = (index: number) => {
        setContentBlocks(contentBlocks.filter((_, i) => i !== index));
    };

    const updateContentBlock = (index: number, field: string, value: string) => {
        const newBlocks = [...contentBlocks];
        (newBlocks[index] as any)[field] = value;
        setContentBlocks(newBlocks);
    };

    const handleBlockImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateContentBlock(index, 'image', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleSectionVisibility = () => {
        const newValue = !isSectionVisible;
        setIsSectionVisible(newValue);
        const visibility = localStorage.getItem('admin_section_visibility');
        const parsed = visibility ? JSON.parse(visibility) : {};
        localStorage.setItem('admin_section_visibility', JSON.stringify({ ...parsed, services: newValue }));
        toast.info(`Services section is now ${newValue ? 'Visible' : 'Hidden'} on homepage.`);
    };

    const openEditModal = (service: AdminService) => {
        setEditingServiceId(service.id);
        setTitle(service.title);
        setDescription(service.description);
        setTag(service.tag);
        setGradient(service.gradient);
        setIconName(service.iconName);
        setCustomIcon(service.customIcon || '');
        setImage(service.image);
        setThumbnail(service.thumbnail || '');
        setAdditionalImages(service.additionalImages || []);
        setIsActive(service.isActive !== false);
        setLanguage(service.language || 'English');
        setLinkedToId(service.linkedToId || null);
        setServiceCategory(service.serviceCategory || '');
        setBulletPoints(service.bulletPoints && service.bulletPoints.length > 0 ? service.bulletPoints : ['']);
        setContentBlocks(service.contentBlocks || []);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingServiceId(null);
        setTitle('');
        setDescription('');
        setTag('');
        setGradient('linear-gradient(135deg, #1a8c4e, #12653a)');
        setIconName('FaLeaf');
        setCustomIcon('');
        setImage('');
        setThumbnail('');
        setAdditionalImages([]);
        setIsActive(true);
        setLanguage('English');
        setBulletPoints(['']);
        setContentBlocks([]);
        setLinkedToId(null);
        setServiceCategory('');
        setIsModalOpen(false);
    };

    const validateScript = (text: string, langName: string) => {
        if (!text || langName === 'English') return true;

        const langObj = availableLanguages.find(l => l.name === langName);
        if (!langObj) return true;

        const sampleText = langObj.script.replace(/[0-9\s]/g, '');
        if (!sampleText) return true;

        const sampleCode = sampleText.charCodeAt(0);
        if (sampleCode >= 0x0900 && sampleCode <= 0x097F) {
            const devanagariRegex = /[\u0900-\u097F]/;
            return devanagariRegex.test(text);
        }
        if (sampleCode >= 0x0600 && sampleCode <= 0x06FF) {
            const arabicRegex = /[\u0600-\u06FF]/;
            return arabicRegex.test(text);
        }

        return true;
    };

    const handleSaveService = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !description || !image || !tag) {
            toast.error("Please fill all required fields and upload both Main Image and Thumbnail.");
            return;
        }

        // Script Validation
        if (language !== 'English') {
            if (!validateScript(title, language)) {
                toast.error(`The service title does not match the script for "${language}".`);
                return;
            }
            if (!validateScript(description, language)) {
                toast.error(`The description does not match the script for "${language}".`);
                return;
            }
            for (let bp of bulletPoints) {
                if (bp.trim() && !validateScript(bp, language)) {
                    toast.error(`One or more bullet points do not match the script for "${language}".`);
                    return;
                }
            }
        }

        const payload = {
            id: editingServiceId || undefined,
            title,
            description,
            tag,
            iconName,
            customIcon: customIcon || undefined,
            gradient,
            image,
            thumbnail,
            additionalImages,
            isActive,
            bulletPoints: bulletPoints.filter(bp => bp.trim() !== ''),
            contentBlocks,
            language,
            linkedToId,
            serviceCategory
        };

        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(editingServiceId ? 'Service updated successfully!' : 'Service added successfully!');
                resetForm();
                fetchData();
            } else {
                toast.error('Failed to save service');
            }
        } catch (error) {
            toast.error('Server error while saving');
        }
    };

    const handleDeleteService = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const response = await fetch(`/api/services/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('Service deleted');
                fetchData();
            } else {
                toast.error('Failed to delete service');
            }
        } catch (error) {
            toast.error('Server error while deleting');
        }
    };

    const toggleStatus = async (service: AdminService) => {
        try {
            const response = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...service, isActive: !service.isActive })
            });
            if (response.ok) {
                toast.info(`Service ${!service.isActive ? 'activated' : 'hidden'}.`);
                fetchData();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const renderIcon = (service: AdminService) => {
        if (service.iconName === 'Custom' && service.customIcon) {
            return <img src={service.customIcon} alt="Custom Icon" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />;
        }
        const iconDef = AVAILABLE_ICONS.find(i => i.name === service.iconName);
        if (iconDef) {
            const IconComp = iconDef.component;
            return <IconComp />;
        }
        return <FaHandshake />;
    };

    const filteredServices = services.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="categories-header filter-toolbar-header">
                <div className="filter-header-title">
                    <h3 style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '8px' }}>Manage Services</h3>
                    <p style={{ color: '#6b7280' }}>Create and update the services displayed on the homepage carousel.</p>
                </div>

                <div className="filter-toolbar-actions">
                    <div className="visibility-toggle" style={{ background: isSectionVisible ? '#ecfdf5' : '#fef2f2', border: `1px solid ${isSectionVisible ? '#10b981' : '#ef4444'}` }} onClick={toggleSectionVisibility}>
                        <span style={{ color: isSectionVisible ? '#047857' : '#b91c1c' }}>{isSectionVisible ? 'VISIBLE' : 'HIDDEN'} ON HOME</span>
                        <div className="toggle-switch" style={{ background: isSectionVisible ? '#10b981' : '#ef4444' }}>
                            <div className="toggle-knob" style={{ left: isSectionVisible ? '19px' : '3px' }}></div>
                        </div>
                    </div>

                    <div className="filter-search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by title or tag..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        className="btn-save btn-add-product"
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                    >
                        <FaPlus /> Add New Service
                    </button>
                </div>
            </div>

            <div className="category-table-card" style={{ width: '100%' }}>
                <table className="custom-category-table">
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Category</th>
                            <th>Tag</th>
                            <th>Icon & Theme</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredServices.length === 0 ? (
                                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fcfcfc' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '24px' }}>
                                                <FaSearch />
                                            </div>
                                            <div>
                                                <h4 style={{ margin: 0, color: '#374151', fontSize: '1.05rem', fontWeight: 600 }}>No services found</h4>
                                                <p style={{ margin: '6px 0 0', color: '#6b7280', fontSize: '0.9rem', maxWidth: '300px' }}>Try adjusting your search criteria or click "Add New Service" to create a new entry.</p>
                                            </div>
                                        </div>
                                    </td>
                                </motion.tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <motion.tr
                                        key={service.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <td data-label="Service">
                                            <div className="product-list-item" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                <div className="product-list-thumb" style={{ width: '90px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                    <img src={service.thumbnail || service.image} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                </div>
                                                <div className="product-list-details">
                                                    <div style={{ fontWeight: 'bold', color: '#111827' }}>{service.title}</div>
                                                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                                        <span style={{ backgroundColor: '#f3f4f6', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                            {service.language || 'English'}
                                                        </span>
                                                        {service.linkedToId && (
                                                            <span style={{ backgroundColor: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', border: '1px solid #10b981', color: '#047857', fontWeight: 'bold' }}>
                                                                Linked to English
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="product-list-category" style={{ maxWidth: '250px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem', color: '#6b7280', marginTop: '4px' }}>
                                                        {service.description}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Category">
                                            {service.serviceCategory ? (
                                                <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: '50px', whiteSpace: 'nowrap' }}>
                                                    {service.serviceCategory}
                                                </span>
                                            ) : (
                                                <span style={{ color: '#d1d5db', fontSize: '0.82rem' }}>—</span>
                                            )}
                                        </td>
                                        <td data-label="Tag">
                                            <span className="category-badge">
                                                {service.tag}
                                            </span>
                                        </td>
                                        <td data-label="Icon & Theme">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '36px', height: '36px', borderRadius: '8px',
                                                    background: service.gradient, display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center', color: 'white', fontSize: '18px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}>
                                                    {renderIcon(service)}
                                                </div>
                                                <span style={{ fontSize: '0.8rem', color: '#4b5563', fontFamily: 'monospace', background: '#f3f4f6', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                                    {service.iconName}
                                                </span>
                                            </div>
                                        </td>
                                        <td data-label="Status">
                                            <button
                                                className={`status-toggle ${service.isActive !== false ? 'active' : 'inactive'}`}
                                                onClick={() => toggleStatus(service)}
                                            >
                                                {service.isActive !== false ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td data-label="Actions" style={{ textAlign: 'right' }}>
                                            <div className="action-buttons">
                                                <button className="btn-icon edit" onClick={() => openEditModal(service)} title="Edit Service">
                                                    <FaPencilAlt />
                                                </button>
                                                <button className="btn-icon delete" onClick={() => handleDeleteService(service.id, service.title)} title="Delete Service">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Modal for Add/Edit Service */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="modal-content category-form-card large-modal"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            style={{ borderRadius: '24px' }}
                        >
                            <div className="modal-header">
                                <h3>{editingServiceId ? 'Edit Service' : 'Add New Service'}</h3>
                                <button className="btn-close" onClick={resetForm}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSaveService} className="modal-form scrollable-form">
                                {/* Language Selection at the top */}
                                {multilangEnabled && (
                                    <div className="category-form-group" style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '24px', gridColumn: '1/-1' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 'bold' }}>
                                            <FaLanguage /> Selected Language for this Entry
                                        </label>
                                        <select
                                            className="category-form-input"
                                            value={language}
                                            onChange={(e) => {
                                                const newLang = e.target.value;
                                                setLanguage(newLang);
                                                setLinkedToId(null);
                                                if (newLang !== 'English') {
                                                    if (title && !validateScript(title, newLang)) setTitle('');
                                                    if (description && !validateScript(description, newLang)) setDescription('');
                                                    const someBulletsMismatch = bulletPoints.some(bp => bp.trim() && !validateScript(bp, newLang));
                                                    if (someBulletsMismatch) setBulletPoints(['']);
                                                }
                                            }}
                                            required
                                            style={{ marginBottom: 0, marginTop: '8px', border: '1px solid #7dd3fc', background: 'white' }}
                                        >
                                            <option value="English">English</option>
                                            {availableLanguages.map(lang => (
                                                <option key={lang.id} value={lang.name}>{lang.name} ({lang.script})</option>
                                            ))}
                                        </select>
                                        <p style={{ fontSize: '11px', color: '#0ea5e9', marginTop: '6px' }}>
                                            Please ensure all text fields match the selected language's script.
                                        </p>
                                    </div>
                                )}

                                <div className="form-grid">
                                    <h4 style={{ gridColumn: '1 / -1', marginBottom: '10px', fontSize: '1.05rem', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaLeaf /> Basic Information
                                    </h4>
                                    <div className="responsive-form-grid-2">
                                        <div className="category-form-group">
                                            <label>Title *</label>
                                            <input type="text" className="category-form-input" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Smart Irrigation" />
                                        </div>
                                        <div className="category-form-group">
                                            <label>Short Tag/Badge *</label>
                                            <input type="text" className="category-form-input" value={tag} onChange={e => setTag(e.target.value)} required placeholder="e.g. IoT Smart" />
                                        </div>
                                        <div className="category-form-group">
                                            <label>Service Category</label>
                                            <select
                                                className="category-form-input"
                                                value={serviceCategory}
                                                onChange={e => setServiceCategory(e.target.value)}
                                            >
                                                <option value="">— None —</option>
                                                {serviceCategories.map(cat => (
                                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                            {serviceCategories.length === 0 && (
                                                <p style={{ fontSize: '0.78rem', color: '#f59e0b', marginTop: '5px' }}>
                                                    No categories yet. <a href="/admin/services/categories" target="_blank" rel="noreferrer" style={{ color: '#16a34a' }}>Create categories first →</a>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="category-form-group full-width">
                                        <label>Description *</label>
                                        <textarea className="category-form-input" value={description} onChange={e => setDescription(e.target.value)} required rows={3} placeholder="Brief description of the service..." />
                                    </div>

                                    <div className="category-form-group full-width">
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Bullet Points (Shown in Learn More)
                                            <button
                                                type="button"
                                                onClick={() => setBulletPoints([...bulletPoints, ''])}
                                                style={{
                                                    padding: '4px 8px',
                                                    fontSize: '0.75rem',
                                                    background: 'var(--color-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FaPlus size={10} /> Add Point
                                            </button>
                                        </label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                                            {bulletPoints.map((point, index) => (
                                                <div key={index} style={{ display: 'flex', gap: '8px' }}>
                                                    <input
                                                        type="text"
                                                        className="category-form-input"
                                                        value={point}
                                                        onChange={(e) => {
                                                            const newPoints = [...bulletPoints];
                                                            newPoints[index] = e.target.value;
                                                            setBulletPoints(newPoints);
                                                        }}
                                                        placeholder={`Bullet point ${index + 1}`}
                                                    />
                                                    {bulletPoints.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setBulletPoints(bulletPoints.filter((_, i) => i !== index))}
                                                            style={{
                                                                padding: '0 12px',
                                                                background: '#fee2e2',
                                                                color: '#ef4444',
                                                                border: '1px solid #fecaca',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <FaTrash size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <h4 style={{ gridColumn: '1 / -1', marginTop: '10px', marginBottom: '10px', fontSize: '1.05rem', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg> Visual Configuration
                                    </h4>

                                    <div className="responsive-form-grid-2">
                                        <div className="category-form-group">
                                            <label>Icon Selection *</label>
                                            <select className="category-form-input" value={iconName} onChange={e => setIconName(e.target.value)}>
                                                <option value="Custom">Custom Upload</option>
                                                {AVAILABLE_ICONS.map(icon => (
                                                    <option key={icon.name} value={icon.name}>{icon.name.replace('Fa', '')} Icon</option>
                                                ))}
                                            </select>
                                        </div>

                                        {iconName === 'Custom' && (
                                            <div className="category-form-group">
                                                <label>Upload Custom Icon (Recommended 100x100px) *</label>
                                                <div className="image-upload-wrapper">
                                                    {customIcon ? (
                                                        <div className="image-preview" style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '10px' }}>
                                                            <img src={customIcon} alt="Custom Icon Preview" style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }} />
                                                        </div>
                                                    ) : null}
                                                    <label className="upload-btn" style={{
                                                        display: 'inline-block',
                                                        padding: '10px 16px',
                                                        backgroundColor: '#f3f4f6',
                                                        border: '1px solid #d1d5db',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        color: '#374151',
                                                        fontWeight: 500,
                                                        transition: 'all 0.2s'
                                                    }}>
                                                        <input type="file" accept="image/*" onChange={handleCustomIconUpload} style={{ display: 'none' }} />
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <FaPlus style={{ color: '#9ca3af' }} />
                                                            {customIcon ? 'Change Custom Icon' : 'Choose Custom Icon'}
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                        <div className="category-form-group">
                                            <label>Theme Gradient *</label>
                                            <select className="category-form-input" value={gradient} onChange={e => setGradient(e.target.value)}>
                                                <option value="linear-gradient(135deg, #1a8c4e, #12653a)">Green (Default)</option>
                                                <option value="linear-gradient(135deg, #f5a623, #d97706)">Orange/Gold</option>
                                                <option value="linear-gradient(135deg, #38bdf8, #0284c7)">Blue</option>
                                                <option value="linear-gradient(135deg, #e879f9, #9333ea)">Purple</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="category-form-group">
                                        <label>Service Thumbnail (3:2 Ratio recommended) *</label>
                                        <div className="image-upload-wrapper">
                                            {thumbnail ? (
                                                <div className="image-preview" style={{ width: '150px', height: '100px', position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                                    <img src={thumbnail} alt="Thumbnail Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <button type="button" className="remove-image" onClick={() => setThumbnail('')} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}>
                                                        <FaTimes size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="upload-placeholder" style={{
                                                    width: '150px',
                                                    height: '100px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px dashed #cbd5e1',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#f8fafc',
                                                    cursor: 'pointer',
                                                    color: '#64748b',
                                                    gap: '8px'
                                                }}>
                                                    <input type="file" accept="image/*" onChange={handleThumbnailUpload} style={{ display: 'none' }} />
                                                    <FaPlus size={16} />
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Thumbnail (3:2)</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="category-form-group full-width">
                                        <label>Carousel Image (16:9 High Quality Banner) *</label>
                                        <div className="image-upload-wrapper">
                                            {image ? (
                                                <div className="image-preview" style={{ width: '100%', aspectRatio: '16/9', height: 'auto', position: 'relative', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                                    <img src={image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <button type="button" className="remove-image" onClick={() => setImage('')} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="upload-placeholder" style={{
                                                    width: '100%',
                                                    aspectRatio: '16/9',
                                                    height: 'auto',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px dashed #cbd5e1',
                                                    borderRadius: '12px',
                                                    backgroundColor: '#f8fafc',
                                                    cursor: 'pointer',
                                                    color: '#64748b',
                                                    gap: '12px',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                                    <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '5px' }}>
                                                        <FaPlus style={{ color: 'var(--color-primary)', fontSize: '20px' }} />
                                                    </div>
                                                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Upload Carousel Image (16:9)</span>
                                                    <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Recommended: 1920x1080px</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="category-form-group full-width" style={{ marginTop: '20px' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                                <span style={{ fontSize: '1.05rem', fontWeight: 'bold' }}>A+ Content Modules (Alternating Layout)</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={addContentBlock}
                                                style={{
                                                    padding: '8px 16px',
                                                    fontSize: '0.85rem',
                                                    background: 'var(--color-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 2px 4px rgba(37, 181, 101, 0.2)'
                                                }}
                                            >
                                                <FaPlus /> Add Module Section
                                            </button>
                                        </label>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '10px' }}>
                                            {contentBlocks.map((block, index) => (
                                                <div key={index} style={{
                                                    padding: '24px',
                                                    background: '#f8fafc',
                                                    border: '1px solid #e2e8f0',
                                                    borderRadius: '16px',
                                                    position: 'relative',
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                                                }}>
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-12px',
                                                        left: '20px',
                                                        background: 'var(--color-primary)',
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        Module {index + 1} - {index % 2 === 0 ? 'Image Left' : 'Image Right'}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => removeContentBlock(index)}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '12px',
                                                            right: '12px',
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '50%',
                                                            background: '#fee2e2',
                                                            color: '#ef4444',
                                                            border: '1px solid #fecaca',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>

                                                    <div style={{
                                                        display: 'grid',
                                                        gridTemplateColumns: '300px 1fr',
                                                        gap: '24px',
                                                        alignItems: 'start',
                                                        marginTop: '10px'
                                                    }}>
                                                        <div className="category-form-group" style={{ margin: 0 }}>
                                                            <label style={{ fontSize: '0.8rem' }}>Module Image *</label>
                                                            <div className="image-upload-wrapper">
                                                                {block.image ? (
                                                                    <div className="image-preview" style={{ width: '100%', height: '180px', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
                                                                        <img src={block.image} alt={`Module ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                        <button type="button" onClick={() => updateContentBlock(index, 'image', '')} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}>
                                                                            <FaTimes size={12} />
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <label style={{
                                                                        width: '100%',
                                                                        height: '180px',
                                                                        display: 'flex',
                                                                        flexDirection: 'column',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        border: '2px dashed #cbd5e1',
                                                                        borderRadius: '12px',
                                                                        backgroundColor: '#fff',
                                                                        cursor: 'pointer',
                                                                        color: '#64748b'
                                                                    }}>
                                                                        <input type="file" accept="image/*" onChange={(e) => handleBlockImageUpload(index, e)} style={{ display: 'none' }} />
                                                                        <FaPlus />
                                                                        <span style={{ fontSize: '0.8rem', marginTop: '8px' }}>Module Image</span>
                                                                    </label>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                            <div className="category-form-group" style={{ margin: 0 }}>
                                                                <label style={{ fontSize: '0.8rem' }}>Module Title *</label>
                                                                <input
                                                                    type="text"
                                                                    className="category-form-input"
                                                                    value={block.title}
                                                                    onChange={e => updateContentBlock(index, 'title', e.target.value)}
                                                                    placeholder="Heading for this section..."
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="category-form-group" style={{ margin: 0 }}>
                                                                <label style={{ fontSize: '0.8rem' }}>Module Description *</label>
                                                                <textarea
                                                                    className="category-form-input"
                                                                    value={block.description}
                                                                    onChange={e => updateContentBlock(index, 'description', e.target.value)}
                                                                    rows={5}
                                                                    placeholder="Detailed text content..."
                                                                    required
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {contentBlocks.length === 0 && (
                                                <div style={{
                                                    padding: '30px',
                                                    textAlign: 'center',
                                                    background: '#f1f5f9',
                                                    borderRadius: '16px',
                                                    border: '2px dashed #cbd5e1',
                                                    color: '#64748b'
                                                }}>
                                                    No content modules added yet. Add modules to create a professional alternating layout.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="category-form-group full-width" style={{ marginTop: '10px' }}>
                                        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            Additional Gallery Images (Max 10)
                                            <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{additionalImages.length} / 10 used</span>
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '12px' }}>
                                            {additionalImages.map((img, idx) => (
                                                <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                                    <img src={img} alt={`Gallery ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAdditionalImage(idx)}
                                                        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px' }}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                            {additionalImages.length < 10 && (
                                                <label style={{
                                                    height: '80px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '2px dashed #cbd5e1',
                                                    borderRadius: '8px',
                                                    backgroundColor: '#f8fafc',
                                                    cursor: 'pointer',
                                                    color: '#64748b'
                                                }}>
                                                    <input type="file" accept="image/*" multiple onChange={handleAdditionalImagesUpload} style={{ display: 'none' }} />
                                                    <FaPlus size={16} />
                                                    <span style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 600 }}>Add Image</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <h4 style={{ gridColumn: '1 / -1', marginTop: '10px', marginBottom: '10px', fontSize: '1.05rem', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Visibility
                                    </h4>

                                    <div className="category-form-group full-width" style={{ marginTop: '0px' }}>
                                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} style={{ width: '20px', height: '20px' }} />
                                            <span style={{ fontWeight: 600 }}>Active (Visible on Homepage)</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-actions admin-form-actions">
                                    <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> {editingServiceId ? 'Update Service' : 'Save Service'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllServices;
