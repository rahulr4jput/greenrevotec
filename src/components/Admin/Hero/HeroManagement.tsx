import React, { useState, useEffect } from 'react';
import {
    FaSave, FaPlus, FaTrash, FaPencilAlt, FaTimes, FaVideo, FaImage,
    FaArrowUp, FaArrowDown, FaEye, FaEyeSlash, FaPlay, FaHandshake,
    FaSeedling, FaChartLine, FaShieldAlt, FaFlask, FaTractor, FaUsers,
    FaMicrochip, FaLeaf
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type SlideNavigateTo = 'page-products' | 'page-services' | 'section-products' | 'section-services';

interface HeroSlide {
    id: string;
    title: string;
    highlight: string;
    subtitle: string;
    type: 'video' | 'image';
    src: string;
    isActive: boolean;
    navigateTo?: SlideNavigateTo;
}

interface HeroStat {
    id: string;
    value: number;
    suffix: string;
    label: string;
    iconName: string;
    isActive: boolean;
}

const DEFAULT_SLIDES: HeroSlide[] = [
    {
        id: 'slide-0',
        title: 'Empowering',
        highlight: 'Modern Farming',
        subtitle: "India's premier drone farming and agricultural technology partner. Transforming farmland with smart, data-driven solutions.",
        type: 'video',
        src: '/hero-bg.mp4',
        isActive: true
    },
    {
        id: 'slide-1',
        title: 'High-Yield',
        highlight: 'Precision Fertilizers',
        subtitle: 'Maximize your crop production with our scientifically formulated, targeted nutrition plans designed for Indian soils.',
        type: 'image',
        src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80',
        isActive: true
    },
    {
        id: 'slide-2',
        title: 'Eco-Friendly',
        highlight: 'Organic Pesticides',
        subtitle: 'Protect your crops and the environment with our advanced range of bio-pesticides and natural crop protection solutions.',
        type: 'image',
        src: 'https://images.pexels.com/photos/2132227/pexels-photo-2132227.jpeg?auto=compress&cs=tinysrgb&w=1920',
        isActive: true
    }
];

const DEFAULT_STATS: HeroStat[] = [
    { id: 'stat-0', value: 15000, suffix: '+', label: 'Farmers Served', iconName: 'FaSeedling', isActive: true },
    { id: 'stat-1', value: 98, suffix: '%', label: 'Crop Yield Increase', iconName: 'FaChartLine', isActive: true },
    { id: 'stat-2', value: 250, suffix: '+', label: 'Agri Products', iconName: 'FaShieldAlt', isActive: true },
    { id: 'stat-3', value: 18, suffix: '+', label: 'Years Experience', iconName: 'FaPlay', isActive: true },
];

const STAT_ICONS: Record<string, any> = {
    FaSeedling: FaSeedling,
    FaChartLine: FaChartLine,
    FaShieldAlt: FaShieldAlt,
    FaPlay: FaPlay,
    FaHandshake: FaHandshake,
    FaPlus: FaPlus,
    FaArrowUp: FaArrowUp,
    FaFlask: FaFlask,
    FaTractor: FaTractor,
    FaUsers: FaUsers,
    FaMicrochip: FaMicrochip,
    FaLeaf: FaLeaf
};

const HeroManagement: React.FC = () => {
    const [slides, setSlides] = useState<HeroSlide[]>([]);
    const [brands, setBrands] = useState<string[]>([]);
    const [isBrandsVisible, setIsBrandsVisible] = useState(true);
    const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
    const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
    const [newBrand, setNewBrand] = useState('');

    const [formData, setFormData] = useState<{
        title: string;
        highlight: string;
        subtitle: string;
        type: 'video' | 'image';
        src: string;
        isActive: boolean;
        navigateTo: SlideNavigateTo;
    }>({
        title: '',
        highlight: '',
        subtitle: '',
        type: 'image',
        src: '',
        isActive: true,
        navigateTo: 'page-products'
    });

    const [stats, setStats] = useState<HeroStat[]>([]);
    const [isStatsVisible, setIsStatsVisible] = useState(true);
    const [isStatModalOpen, setIsStatModalOpen] = useState(false);
    const [editingStat, setEditingStat] = useState<HeroStat | null>(null);
    const [statFormData, setStatFormData] = useState({
        value: 0,
        suffix: '',
        label: '',
        iconName: 'FaSeedling',
        isActive: true
    });

    const fetchHeroConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_hero_config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setSlides(data.slides || DEFAULT_SLIDES);
                    setBrands(data.brands || ['IFFCO', 'Bayer', 'UPL', 'Syngenta', 'BASF']);
                    setIsBrandsVisible(data.brandsVisible !== false);
                    setStats(data.stats || DEFAULT_STATS);
                    setIsStatsVisible(data.statsVisible !== false);
                    localStorage.setItem('admin_hero_config', JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch hero config:", error);
        }

        const consolidated = localStorage.getItem('admin_hero_config');
        if (consolidated) {
            const data = JSON.parse(consolidated);
            setSlides(data.slides || DEFAULT_SLIDES);
            setBrands(data.brands || []);
            setIsBrandsVisible(data.brandsVisible !== false);
            setStats(data.stats || DEFAULT_STATS);
            setIsStatsVisible(data.statsVisible !== false);
        } else {
            setSlides(DEFAULT_SLIDES);
            setBrands(['IFFCO', 'Bayer', 'UPL', 'Syngenta', 'BASF']);
            setStats(DEFAULT_STATS);
        }
    };

    useEffect(() => {
        fetchHeroConfig();
    }, []);

    const saveHeroConfig = async (updatedData: any) => {
        const fullConfig = {
            slides,
            brands,
            brandsVisible: isBrandsVisible,
            stats,
            statsVisible: isStatsVisible,
            ...updatedData
        };

        try {
            const response = await fetch('/api/settings/admin_hero_config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: fullConfig })
            });

            if (response.ok) {
                localStorage.setItem('admin_hero_config', JSON.stringify(fullConfig));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            console.error("Error saving hero config:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        let updatedSlides;
        if (editingSlide) {
            updatedSlides = slides.map(s => s.id === editingSlide.id ? { ...s, ...formData } : s);
            toast.success("Slide updated!");
        } else {
            updatedSlides = [...slides, { id: `slide-${Date.now()}`, ...formData }];
            toast.success("New slide added!");
        }
        setSlides(updatedSlides);
        await saveHeroConfig({ slides: updatedSlides });
        setIsSlideModalOpen(false);
        setEditingSlide(null);
    };

    const handleAddBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBrand.trim()) return;
        const updated = [...brands, newBrand.trim()];
        setBrands(updated);
        await saveHeroConfig({ brands: updated });
        setNewBrand('');
        toast.success("Brand added!");
    };

    const removeBrand = async (brand: string) => {
        const updated = brands.filter(b => b !== brand);
        setBrands(updated);
        await saveHeroConfig({ brands: updated });
        toast.info("Brand removed.");
    };

    const toggleBrandsVisibility = async () => {
        const newValue = !isBrandsVisible;
        setIsBrandsVisible(newValue);
        await saveHeroConfig({ brandsVisible: newValue });
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Delete slide?")) {
            const updated = slides.filter(s => s.id !== id);
            setSlides(updated);
            await saveHeroConfig({ slides: updated });
        }
    };

    const toggleStatus = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = slides.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
        setSlides(updated);
        await saveHeroConfig({ slides: updated });
    };

    const moveSlide = async (idx: number, direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        const newSlides = [...slides];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx >= 0 && targetIdx < newSlides.length) {
            [newSlides[idx], newSlides[targetIdx]] = [newSlides[targetIdx], newSlides[idx]];
            setSlides(newSlides);
            await saveHeroConfig({ slides: newSlides });
        }
    };

    const openEdit = (slide: HeroSlide) => {
        setEditingSlide(slide);
        setFormData({
            title: slide.title,
            highlight: slide.highlight,
            subtitle: slide.subtitle,
            type: slide.type,
            src: slide.src,
            isActive: slide.isActive,
            navigateTo: slide.navigateTo || 'page-products'
        });
        setIsSlideModalOpen(true);
    };

    const openAdd = () => {
        setEditingSlide(null);
        setFormData({ title: '', highlight: '', subtitle: '', type: 'image', src: '', isActive: true, navigateTo: 'page-products' });
        setIsSlideModalOpen(true);
    };

    const toggleStatsVisibility = async () => {
        const newValue = !isStatsVisible;
        setIsStatsVisible(newValue);
        await saveHeroConfig({ statsVisible: newValue });
    };

    const handleSaveStat = async (e: React.FormEvent) => {
        e.preventDefault();
        let updatedStats;
        if (editingStat) {
            updatedStats = stats.map(s => s.id === editingStat.id ? { ...s, ...statFormData } : s);
        } else {
            updatedStats = [...stats, { id: `stat-${Date.now()}`, ...statFormData }];
        }
        setStats(updatedStats);
        await saveHeroConfig({ stats: updatedStats });
        setIsStatModalOpen(false);
    };

    const deleteStat = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = stats.filter(s => s.id !== id);
        setStats(updated);
        await saveHeroConfig({ stats: updated });
    };

    const toggleStatStatus = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = stats.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
        setStats(updated);
        await saveHeroConfig({ stats: updated });
    };

    const moveStat = async (idx: number, direction: 'up' | 'down', e: React.MouseEvent) => {
        e.stopPropagation();
        const newStats = [...stats];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx >= 0 && targetIdx < newStats.length) {
            [newStats[idx], newStats[targetIdx]] = [newStats[targetIdx], newStats[idx]];
            setStats(newStats);
            await saveHeroConfig({ stats: newStats });
        }
    };

    const openEditStat = (stat: HeroStat) => {
        setEditingStat(stat);
        setStatFormData({ ...stat });
        setIsStatModalOpen(true);
    };

    const openAddStat = () => {
        setEditingStat(null);
        setStatFormData({ value: 0, suffix: '+', label: '', iconName: 'FaSeedling', isActive: true });
        setIsStatModalOpen(true);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 1024 * 1024 * 3) {
            toast.error("Image too large (>3MB).");
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => setFormData({ ...formData, src: event.target?.result as string });
        reader.readAsDataURL(file);
    };

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="admin-page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="admin-page-title">Hero Carousel Management</h1>
                    <p className="admin-page-subtitle">Manage the high-impact slides, videos, and headlines on your homepage.</p>
                </div>
                <button className="btn-save" onClick={openAdd}>
                    <FaPlus /> Add New Slide
                </button>
            </div>

            {/* Brands Management Section */}
            <div className="category-form-card" style={{ marginBottom: '40px', padding: '24px' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaHandshake style={{ color: 'var(--color-primary)' }} /> Trusted Agri-Brands
                        </h3>
                        <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Manage the list of partner brands displayed in the Hero trust bar.</p>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 14px',
                            background: isBrandsVisible ? '#ecfdf5' : '#fef2f2',
                            border: `1px solid ${isBrandsVisible ? '#10b981' : '#ef4444'}`,
                            borderRadius: '20px',
                            cursor: 'pointer',
                            transition: '0.3s'
                        }}
                        onClick={toggleBrandsVisibility}
                    >
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isBrandsVisible ? '#047857' : '#b91c1c' }}>
                            {isBrandsVisible ? 'VISIBLE' : 'HIDDEN'}
                        </span>
                        <div style={{
                            width: '32px',
                            height: '18px',
                            background: isBrandsVisible ? '#10b981' : '#ef4444',
                            borderRadius: '10px',
                            position: 'relative',
                            transition: '0.3s'
                        }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '3px',
                                left: isBrandsVisible ? '17px' : '3px',
                                transition: '0.3s'
                            }}></div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        className="category-form-input"
                        style={{ marginBottom: 0, flex: 1 }}
                        placeholder="Enter brand name (e.g. IFFCO)"
                        value={newBrand}
                        onChange={(e) => setNewBrand(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddBrand(e)}
                    />
                    <button className="btn-save" onClick={handleAddBrand} style={{ whiteSpace: 'nowrap' }}>
                        <FaPlus /> Add Brand
                    </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {brands.map((brand) => (
                        <div key={brand} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: '#f3f4f6',
                            borderRadius: '20px',
                            border: '1px solid #e5e7eb',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#374151'
                        }}>
                            {brand}
                            <button
                                onClick={() => removeBrand(brand)}
                                style={{
                                    border: 'none',
                                    background: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    padding: '2px',
                                    borderRadius: '50%',
                                    transition: '0.2s'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                            >
                                <FaTimes size={14} />
                            </button>
                        </div>
                    ))}
                    {brands.length === 0 && (
                        <p style={{ width: '100%', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', padding: '20px' }}>No brands added yet.</p>
                    )}
                </div>
            </div>

            {/* Stats Management Section */}
            <div className="category-form-card" style={{ marginBottom: '40px', padding: '24px' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FaChartLine style={{ color: 'var(--color-primary)' }} /> Hero Stats Cards
                        </h3>
                        <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Manage the impact numbers displayed across the bottom of the hero section.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '6px 14px',
                                background: isStatsVisible ? '#ecfdf5' : '#fef2f2',
                                border: `1px solid ${isStatsVisible ? '#10b981' : '#ef4444'}`,
                                borderRadius: '20px',
                                cursor: 'pointer',
                                transition: '0.3s'
                            }}
                            onClick={toggleStatsVisibility}
                        >
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isStatsVisible ? '#047857' : '#b91c1c' }}>
                                {isStatsVisible ? 'VISIBLE' : 'HIDDEN'}
                            </span>
                        </div>
                        <button className="btn-save" onClick={openAddStat} style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                            <FaPlus /> Add Stat
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    {stats.map((stat, idx) => {
                        const Icon = STAT_ICONS[stat.iconName] || FaSeedling;
                        return (
                            <motion.div
                                key={stat.id}
                                layout
                                style={{
                                    padding: '16px',
                                    background: '#f9fafb',
                                    borderRadius: '12px',
                                    border: stat.isActive ? '1px solid #e5e7eb' : '1px dashed #d1d5db',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    <div style={{ padding: '8px', background: 'white', borderRadius: '8px', color: 'var(--color-primary)', display: 'flex' }}>
                                        <Icon size={20} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{stat.value}{stat.suffix}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>{stat.label}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px' }} onClick={(e) => moveStat(idx, 'up', e)} disabled={idx === 0}><FaArrowUp size={12} /></button>
                                        <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px' }} onClick={(e) => moveStat(idx, 'down', e)} disabled={idx === stats.length - 1}><FaArrowDown size={12} /></button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn-save" style={{ flex: 1, padding: '6px', fontSize: '0.75rem', background: 'white', border: '1px solid #e5e7eb', boxShadow: 'none', color: '#374151' }} onClick={() => openEditStat(stat)}>
                                        <FaPencilAlt /> Edit
                                    </button>
                                    <button
                                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e5e7eb', background: stat.isActive ? '#ecfdf5' : '#f3f4f6', color: stat.isActive ? '#10b981' : '#9ca3af', cursor: 'pointer' }}
                                        onClick={(e) => toggleStatStatus(stat.id, e)}
                                    >
                                        {stat.isActive ? <FaEye /> : <FaEyeSlash />}
                                    </button>
                                    <button
                                        style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fef2f2', color: '#ef4444', cursor: 'pointer' }}
                                        onClick={(e) => deleteStat(stat.id, e)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaImage style={{ color: 'var(--color-primary)' }} /> Hero Slides
                </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
                {slides.map((slide, idx) => (
                    <motion.div
                        key={slide.id}
                        className="category-form-card"
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        style={{ margin: 0, padding: 0, overflow: 'hidden', cursor: 'pointer', border: slide.isActive ? '1px solid #e5e7eb' : '1px dashed #d1d5db' }}
                        onClick={() => openEdit(slide)}
                    >
                        {/* Preview Header */}
                        <div style={{ height: '180px', position: 'relative', background: '#000' }}>
                            {slide.type === 'video' ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column', gap: '10px' }}>
                                    <FaPlay style={{ fontSize: '2rem', opacity: 0.7 }} />
                                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Video Background</span>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{slide.src}</span>
                                </div>
                            ) : (
                                <img src={slide.src} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                            )}

                            <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px', zIndex: 2 }}>
                                <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151' }} onClick={(e) => moveSlide(idx, 'up', e)} disabled={idx === 0}><FaArrowUp /></button>
                                <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.9)', color: '#374151' }} onClick={(e) => moveSlide(idx, 'down', e)} disabled={idx === slides.length - 1}><FaArrowDown /></button>
                            </div>

                            <div
                                style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 2 }}
                                onClick={(e) => toggleStatus(slide.id, e)}
                            >
                                <div style={{
                                    padding: '5px 12px',
                                    borderRadius: '20px',
                                    background: slide.isActive ? '#10b981' : '#6b7280',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}>
                                    {slide.isActive ? <><FaEye /> ACTIVE</> : <><FaEyeSlash /> HIDDEN</>}
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div style={{ padding: '20px' }}>
                            <div style={{ marginBottom: '10px' }}>
                                <h3 style={{ margin: '0 0 5px', fontSize: '1.2rem', color: '#111827' }}>
                                    {slide.title} <span style={{ color: 'var(--color-primary)' }}>{slide.highlight}</span>
                                </h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                                    {slide.subtitle}
                                </p>
                            </div>

                            {/* Navigation Badge */}
                            <div style={{ marginBottom: '14px' }}>
                                {(() => {
                                    const navMap: Record<string, { label: string; color: string; bg: string }> = {
                                        'page-products': { label: '🛒 → Products Page', color: '#065f46', bg: '#d1fae5' },
                                        'page-services': { label: '⚙️ → Services Page', color: '#1e40af', bg: '#dbeafe' },
                                        'section-products': { label: '📦 → Products Section', color: '#78350f', bg: '#fef3c7' },
                                        'section-services': { label: '🌿 → Services Section', color: '#4c1d95', bg: '#ede9fe' },
                                    };
                                    const nav = navMap[slide.navigateTo || 'page-products'];
                                    return (
                                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', color: nav.color, background: nav.bg }}>
                                            {nav.label}
                                        </span>
                                    );
                                })()}
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="btn-save" style={{ flex: 1, justifyContent: 'center', background: '#f9fafb', color: '#374151', border: '1px solid #e5e7eb', boxShadow: 'none' }} onClick={(e) => { e.stopPropagation(); openEdit(slide); }}>
                                    <FaPencilAlt /> Edit Content
                                </button>
                                <button className="btn-icon delete" onClick={(e) => handleDelete(slide.id, e)}>
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {isSlideModalOpen && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ maxWidth: '600px', width: '90%' }}>
                            <div className="modal-header">
                                <h3>{editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}</h3>
                                <button className="btn-close" onClick={() => setIsSlideModalOpen(false)}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="category-form-group">
                                        <label>Main Title *</label>
                                        <input type="text" className="category-form-input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Empowering" required />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Highlighted Text *</label>
                                        <input type="text" className="category-form-input" value={formData.highlight} onChange={(e) => setFormData({ ...formData, highlight: e.target.value })} placeholder="e.g. Modern Farming" required />
                                    </div>
                                </div>

                                <div className="category-form-group">
                                    <label>Subtitle Paragraph *</label>
                                    <textarea className="category-form-input" value={formData.subtitle} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} rows={3} placeholder="Enter a compelling description..." required />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="category-form-group">
                                        <label>Media Type</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button
                                                type="button"
                                                className={`btn-save ${formData.type === 'image' ? 'active' : ''}`}
                                                style={{ flex: 1, justifyContent: 'center', background: formData.type === 'image' ? 'var(--color-primary)' : 'white', color: formData.type === 'image' ? 'white' : '#6b7280', border: '1px solid #e5e7eb' }}
                                                onClick={() => setFormData({ ...formData, type: 'image' })}
                                            >
                                                <FaImage /> Image
                                            </button>
                                            <button
                                                type="button"
                                                className={`btn-save ${formData.type === 'video' ? 'active' : ''}`}
                                                style={{ flex: 1, justifyContent: 'center', background: formData.type === 'video' ? 'var(--color-primary)' : 'white', color: formData.type === 'video' ? 'white' : '#6b7280', border: '1px solid #e5e7eb' }}
                                                onClick={() => setFormData({ ...formData, type: 'video' })}
                                            >
                                                <FaVideo /> Video
                                            </button>
                                        </div>
                                    </div>
                                    <div className="category-form-group">
                                        <label>{formData.type === 'image' ? 'Image Source' : 'Video URL/Path'} *</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <input
                                                type="text"
                                                className="category-form-input"
                                                value={formData.src}
                                                onChange={(e) => setFormData({ ...formData, src: e.target.value })}
                                                placeholder={formData.type === 'image' ? 'https://... or upload below' : '/video.mp4'}
                                                style={{ marginBottom: 0 }}
                                                required
                                            />
                                            {formData.type === 'image' && (
                                                <div style={{ padding: '4px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontStyle: 'italic' }}>
                                                        Ideal Size: 1920 x 1080px (16:9)
                                                    </span>
                                                </div>
                                            )}
                                            {formData.type === 'image' && (
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="file"
                                                        id="hero-file-upload"
                                                        accept="image/*"
                                                        onChange={handleFileUpload}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <label
                                                        htmlFor="hero-file-upload"
                                                        className="btn-save"
                                                        style={{
                                                            width: '100%',
                                                            justifyContent: 'center',
                                                            background: '#f9fafb',
                                                            color: '#374151',
                                                            border: '1px solid #e5e7eb',
                                                            boxShadow: 'none',
                                                            padding: '8px',
                                                            fontSize: '0.85rem'
                                                        }}
                                                    >
                                                        <FaPlus style={{ fontSize: '0.9rem' }} /> Upload from Computer
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Navigate To Selector */}
                                <div className="category-form-group" style={{ paddingTop: '4px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                                        🔗 Explore Button — Links To
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        {([
                                            { value: 'page-products', label: '🛒 Products Page', desc: 'Navigate to /products' },
                                            { value: 'page-services', label: '⚙️ Services Page', desc: 'Navigate to /services' },
                                            { value: 'section-products', label: '📦 Products Section', desc: 'Scroll to homepage #products' },
                                            { value: 'section-services', label: '🌿 Services Section', desc: 'Scroll to homepage #services' },
                                        ] as { value: SlideNavigateTo; label: string; desc: string }[]).map(opt => (
                                            <div
                                                key={opt.value}
                                                onClick={() => setFormData({ ...formData, navigateTo: opt.value })}
                                                style={{
                                                    padding: '10px 14px',
                                                    borderRadius: '10px',
                                                    border: `2px solid ${formData.navigateTo === opt.value ? 'var(--color-primary)' : '#e5e7eb'}`,
                                                    background: formData.navigateTo === opt.value ? 'var(--color-primary-light, #ecfdf5)' : '#f9fafb',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px', color: formData.navigateTo === opt.value ? 'var(--color-primary)' : '#374151' }}>{opt.label}</div>
                                                <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>{opt.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="category-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px' }}>
                                    <input type="checkbox" id="slideActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                                    <label htmlFor="slideActive" style={{ marginBottom: 0, fontWeight: 500 }}>Active (Show in Homepage Carousel)</label>
                                </div>

                                <div className="modal-actions" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" className="btn-cancel" onClick={() => setIsSlideModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> {editingSlide ? 'Update Slide' : 'Create Slide'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isStatModalOpen && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={{ maxWidth: '450px', width: '90%' }}>
                            <div className="modal-header">
                                <h3>{editingStat ? 'Edit Stat Card' : 'Add New Stat'}</h3>
                                <button className="btn-close" onClick={() => setIsStatModalOpen(false)}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSaveStat} style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="category-form-group">
                                        <label>Value (Number) *</label>
                                        <input type="number" className="category-form-input" value={statFormData.value} onChange={(e) => setStatFormData({ ...statFormData, value: parseInt(e.target.value) })} required />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Suffix (e.g. +, %)</label>
                                        <input type="text" className="category-form-input" value={statFormData.suffix} onChange={(e) => setStatFormData({ ...statFormData, suffix: e.target.value })} />
                                    </div>
                                </div>

                                <div className="category-form-group">
                                    <label>Label Title *</label>
                                    <input type="text" className="category-form-input" value={statFormData.label} onChange={(e) => setStatFormData({ ...statFormData, label: e.target.value })} placeholder="e.g. Farmers Served" required />
                                </div>

                                <div className="category-form-group">
                                    <label>Icon Selection</label>
                                    <div style={{
                                        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px',
                                        padding: '12px', background: '#f9fafb', borderRadius: '10px', border: '1px solid #e5e7eb'
                                    }}>
                                        {Object.keys(STAT_ICONS).map(iconName => {
                                            const Icon = STAT_ICONS[iconName];
                                            return (
                                                <div
                                                    key={iconName}
                                                    onClick={() => setStatFormData({ ...statFormData, iconName })}
                                                    style={{
                                                        padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                                        background: statFormData.iconName === iconName ? 'var(--color-primary)' : 'white',
                                                        color: statFormData.iconName === iconName ? 'white' : '#6b7280',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: '1px solid #e5e7eb', transition: '0.2s'
                                                    }}
                                                >
                                                    <Icon size={18} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="category-form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '10px' }}>
                                    <input type="checkbox" id="statActive" checked={statFormData.isActive} onChange={(e) => setStatFormData({ ...statFormData, isActive: e.target.checked })} style={{ width: '20px', height: '20px' }} />
                                    <label htmlFor="statActive" style={{ marginBottom: 0, fontWeight: 500 }}>Active (Show on Hero)</label>
                                </div>

                                <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" className="btn-cancel" onClick={() => setIsStatModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> {editingStat ? 'Update Stat' : 'Create Stat'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HeroManagement;
