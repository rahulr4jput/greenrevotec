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

// --- Image Compression Helper ---
const compressImage = (file: File, callback: (base64: string) => void, maxWidth = 1920, maxHeight = 1080) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to 60% quality WebP
                const base64 = canvas.toDataURL('image/webp', 0.6);
                callback(base64);
            } else {
                // Fallback
                callback(event.target?.result as string);
            }
        };
        img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
};

interface HeroSlide {
    id: string;
    title: string;
    highlight: string;
    subtitle: string;
    tagline?: string;
    taglineHighlight?: string;
    type: 'video' | 'image';
    src: string;
    isActive: boolean;
    navigateTo?: SlideNavigateTo;
    linkedProductId?: string;
    linkedServiceId?: string;
    showSubtitle?: boolean;
    mobileSrc?: string;
    mobileFocus?: string;
    mobileZoom?: string;
}

interface SlimProduct { id: string | number; name: string; }
interface SlimService { id: string; title: string; }

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
        tagline?: string;
        taglineHighlight?: string;
        type: 'video' | 'image';
        src: string;
        isActive: boolean;
        navigateTo: SlideNavigateTo;
        linkedProductId: string;
        linkedServiceId: string;
        showSubtitle: boolean;
        mobileSrc?: string;
        mobileFocus?: string;
        mobileZoom?: string;
    }>({
        title: '',
        highlight: '',
        subtitle: '',
        type: 'image',
        src: '',
        isActive: true,
        navigateTo: 'page-products',
        linkedProductId: '',
        linkedServiceId: '',
        showSubtitle: true,
        mobileSrc: '',
        mobileFocus: 'center',
        mobileZoom: 'cover',
    });

    const [availableProducts, setAvailableProducts] = useState<SlimProduct[]>([]);
    const [availableServices, setAvailableServices] = useState<SlimService[]>([]);

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
        // Load available products & services for the deep-link dropdowns
        fetch('/api/products')
            .then(r => r.ok ? r.json() : [])
            .then((data: any[]) => setAvailableProducts(data.filter(p => p.status !== 'draft').map(p => ({ id: p.id, name: p.name }))))
            .catch(() => { });
        fetch('/api/services')
            .then(r => r.ok ? r.json() : [])
            .then((data: any[]) => setAvailableServices(data.filter(s => s.isActive !== false).map(s => ({ id: s.id, title: s.title }))))
            .catch(() => { });
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
            tagline: slide.tagline || '',
            taglineHighlight: slide.taglineHighlight || '',
            type: slide.type,
            src: slide.src,
            isActive: slide.isActive,
            navigateTo: slide.navigateTo || 'page-products',
            linkedProductId: slide.linkedProductId || '',
            linkedServiceId: slide.linkedServiceId || '',
            showSubtitle: slide.showSubtitle !== false,
            mobileSrc: slide.mobileSrc || '',
            mobileFocus: slide.mobileFocus || 'center',
            mobileZoom: slide.mobileZoom || 'cover',
        });
        setIsSlideModalOpen(true);
    };

    const openAdd = () => {
        setEditingSlide(null);
        setFormData({ title: '', highlight: '', subtitle: '', tagline: '', taglineHighlight: '', type: 'image', src: '', isActive: true, navigateTo: 'page-products', linkedProductId: '', linkedServiceId: '', showSubtitle: true, mobileSrc: '', mobileFocus: 'center', mobileZoom: 'cover' });
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

    // ─── White-theme style constants for slide modal ─────────────────────────
    const inputSt: React.CSSProperties = {
        width: '100%', boxSizing: 'border-box', padding: '10px 12px',
        border: '1.5px solid #d1d5db', borderRadius: 8,
        background: '#fff', color: '#111827', fontSize: '0.9rem', outline: 'none',
    };
    const labelSt: React.CSSProperties = {
        display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: 6,
    };
    const selectSt: React.CSSProperties = {
        ...inputSt, cursor: 'pointer', appearance: 'auto',
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
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: '#ffffff',
                                borderRadius: 16,
                                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                                maxWidth: 640,
                                width: '90%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                border: '1px solid #e5e7eb',
                            }}
                        >
                            {/* Modal Header */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
                                background: '#f9fafb', borderRadius: '16px 16px 0 0',
                            }}>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <FaImage style={{ color: 'var(--color-primary)' }} />
                                    {editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                                </h3>
                                <button
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', padding: 4 }}
                                    onClick={() => setIsSlideModalOpen(false)}
                                ><FaTimes size={18} /></button>
                            </div>

                            <form onSubmit={handleSave} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {/* Title + Highlight */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={labelSt}>Main Title *</label>
                                        <input
                                            style={inputSt}
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="e.g. Empowering"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label style={labelSt}>Highlighted Text *</label>
                                        <input
                                            style={inputSt}
                                            type="text"
                                            value={formData.highlight}
                                            onChange={e => setFormData({ ...formData, highlight: e.target.value })}
                                            placeholder="e.g. Modern Farming"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Subtitle */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <label style={{ ...labelSt, marginBottom: 0 }}>Subtitle Paragraph *</label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', cursor: 'pointer', color: '#4b5563' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.showSubtitle !== false}
                                                onChange={e => setFormData({ ...formData, showSubtitle: e.target.checked })}
                                            />
                                            Visible in Hero
                                        </label>
                                    </div>
                                    <textarea
                                        style={{ ...inputSt, minHeight: 80, resize: 'vertical' }}
                                        value={formData.subtitle}
                                        onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                                        rows={3}
                                        placeholder="Enter a compelling description..."
                                        required
                                    />
                                </div>

                                {/* Tagline — two-colour split */}
                                <div>
                                    <label style={labelSt}>
                                        Tagline
                                        <span style={{ fontWeight: 400, color: '#9ca3af', fontSize: '0.8em' }}> (subheading below main title)</span>
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffffff', border: '1px solid #d1d5db', display: 'inline-block' }} />
                                                White text
                                            </div>
                                            <input
                                                style={inputSt}
                                                type="text"
                                                value={formData.tagline || ''}
                                                onChange={e => setFormData({ ...formData, tagline: e.target.value })}
                                                placeholder="Through Smart"
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg,#f5a623,#e88c16)', display: 'inline-block' }} />
                                                Gold highlight text
                                            </div>
                                            <input
                                                style={inputSt}
                                                type="text"
                                                value={formData.taglineHighlight || ''}
                                                onChange={e => setFormData({ ...formData, taglineHighlight: e.target.value })}
                                                placeholder="GreenRevotec"
                                            />
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 5 }}>Leave both blank to use default: "Through Smart <span style={{ color: '#f5a623' }}>GreenRevotec</span>"</div>
                                </div>

                                {/* Media Type + Source */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={labelSt}>Media Type</label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'image' })}
                                                style={{
                                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                    padding: '9px 0', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                                                    background: formData.type === 'image' ? 'var(--color-primary)' : '#fff',
                                                    color: formData.type === 'image' ? '#fff' : '#6b7280',
                                                    border: `1.5px solid ${formData.type === 'image' ? 'var(--color-primary)' : '#d1d5db'}`,
                                                    transition: '0.2s',
                                                }}
                                            ><FaImage size={13} /> Image</button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, type: 'video' })}
                                                style={{
                                                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                    padding: '9px 0', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                                                    background: formData.type === 'video' ? 'var(--color-primary)' : '#fff',
                                                    color: formData.type === 'video' ? '#fff' : '#6b7280',
                                                    border: `1.5px solid ${formData.type === 'video' ? 'var(--color-primary)' : '#d1d5db'}`,
                                                    transition: '0.2s',
                                                }}
                                            ><FaVideo size={13} /> Video</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelSt}>{formData.type === 'image' ? 'Image URL / Upload' : 'Video Path'} *</label>
                                        <input
                                            style={{ ...inputSt, marginBottom: formData.type === 'image' ? 6 : 0 }}
                                            type="text"
                                            value={formData.src}
                                            onChange={e => setFormData({ ...formData, src: e.target.value })}
                                            placeholder={formData.type === 'image' ? 'https://... or upload' : '/hero-bg.mp4'}
                                            required
                                        />
                                        {formData.type === 'image' && (
                                            <>
                                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontStyle: 'italic', marginBottom: 6 }}>Desktop Ideal: 1920×1080px (16:9)</div>
                                                <input type="file" id="hero-file-upload-desktop" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            toast.warning("Image is very large and might take a moment to compress.");
                                                        }
                                                        compressImage(file, (base64) => {
                                                            setFormData({ ...formData, src: base64 });
                                                        }, 1920, 1080);
                                                    }
                                                }} style={{ display: 'none' }} />
                                                <label htmlFor="hero-file-upload-desktop" style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                    padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem',
                                                    background: '#f9fafb', color: '#374151', border: '1.5px dashed #d1d5db', fontWeight: 500,
                                                    marginBottom: 12
                                                }}>
                                                    <FaPlus size={11} /> Upload Desktop Image
                                                </label>

                                                {/* Mobile Image Upload */}
                                                <label style={{ ...labelSt, marginTop: 12 }}>Mobile Hero Image (Optional)</label>
                                                <div style={{ fontSize: '0.72rem', color: '#9ca3af', fontStyle: 'italic', marginBottom: 6 }}>Mobile Ideal: 1080×1920px (9:16). Falls back to desktop image if empty.</div>
                                                {formData.mobileSrc && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '4px 8px', background: '#ecfdf5', borderRadius: 6, border: '1px solid #10b981' }}>
                                                        <span style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Mobile Image Selected</span>
                                                        <button type="button" onClick={() => setFormData({ ...formData, mobileSrc: '' })} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}><FaTimes size={12} /></button>
                                                    </div>
                                                )}
                                                <input type="file" id="hero-file-upload-mobile" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            toast.warning("Image is very large and might take a moment to compress.");
                                                        }
                                                        compressImage(file, (base64) => {
                                                            setFormData({ ...formData, mobileSrc: base64 });
                                                        }, 1080, 1920); // Portrait max dimensions
                                                    }
                                                }} style={{ display: 'none' }} />
                                                <label htmlFor="hero-file-upload-mobile" style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                                    padding: '8px', borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem',
                                                    background: formData.mobileSrc ? '#f0fdf4' : '#fef2f2',
                                                    color: formData.mobileSrc ? '#166534' : '#991b1b',
                                                    border: `1.5px dashed ${formData.mobileSrc ? '#86efac' : '#fca5a5'}`,
                                                    fontWeight: 500,
                                                    marginBottom: 16
                                                }}>
                                                    <FaPlus size={11} /> {formData.mobileSrc ? 'Change Mobile Image' : 'Upload Mobile Image (9:16)'}
                                                </label>

                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: 10, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                                                    <div>
                                                        <label style={{ ...labelSt, fontSize: '0.75rem', marginBottom: 4 }}>📱 Mobile Focus</label>
                                                        <select
                                                            style={{ ...inputSt, padding: '6px 10px', fontSize: '0.8rem', marginBottom: 0 }}
                                                            value={formData.mobileFocus || 'center'}
                                                            onChange={e => setFormData({ ...formData, mobileFocus: e.target.value })}
                                                        >
                                                            <option value="center">Center</option>
                                                            <option value="left">Left</option>
                                                            <option value="right">Right</option>
                                                            <option value="top">Top</option>
                                                            <option value="bottom">Bottom</option>
                                                            <option value="30% 50%">Center-Left</option>
                                                            <option value="70% 50%">Center-Right</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label style={{ ...labelSt, fontSize: '0.75rem', marginBottom: 4 }}>📱 Mobile Zoom</label>
                                                        <select
                                                            style={{ ...inputSt, padding: '6px 10px', fontSize: '0.8rem', marginBottom: 0 }}
                                                            value={formData.mobileZoom || 'cover'}
                                                            onChange={e => setFormData({ ...formData, mobileZoom: e.target.value })}
                                                        >
                                                            <option value="cover">Default (Cover)</option>
                                                            <option value="contain">Fit entirely (Contain)</option>
                                                            <option value="auto 100%">Match Height</option>
                                                            <option value="120%">Zoom 120%</option>
                                                            <option value="150%">Zoom 150%</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Navigate To — 4 tiles */}
                                <div style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', padding: '16px' }}>
                                    <label style={{ ...labelSt, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                                        🔗 Explore Button — Links To
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        {([
                                            { value: 'page-products', label: '🛒 Products Page', desc: 'Navigate to /products' },
                                            { value: 'page-services', label: '⚙️ Services Page', desc: 'Navigate to /services' },
                                            { value: 'section-products', label: '📦 Products Section', desc: 'Scroll to #products' },
                                            { value: 'section-services', label: '🌿 Services Section', desc: 'Scroll to #services' },
                                        ] as { value: SlideNavigateTo; label: string; desc: string }[]).map(opt => {
                                            const active = formData.navigateTo === opt.value;
                                            return (
                                                <div
                                                    key={opt.value}
                                                    onClick={() => setFormData({ ...formData, navigateTo: opt.value, linkedProductId: '', linkedServiceId: '' })}
                                                    style={{
                                                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s',
                                                        border: `2px solid ${active ? 'var(--color-primary)' : '#e5e7eb'}`,
                                                        background: active ? '#ecfdf5' : '#fff',
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 700, fontSize: '0.83rem', marginBottom: 2, color: active ? 'var(--color-primary)' : '#374151' }}>{opt.label}</div>
                                                    <div style={{ fontSize: '0.71rem', color: '#9ca3af' }}>{opt.desc}</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Deep-link: specific product */}
                                    {formData.navigateTo === 'page-products' && availableProducts.length > 0 && (
                                        <div style={{ marginTop: 14 }}>
                                            <label style={{ ...labelSt, marginBottom: 6 }}>🎯 Highlight specific product (optional)</label>
                                            <select
                                                style={selectSt}
                                                value={formData.linkedProductId}
                                                onChange={e => setFormData({ ...formData, linkedProductId: e.target.value })}
                                            >
                                                <option value="">— All Products (no highlight) —</option>
                                                {availableProducts.map(p => (
                                                    <option key={p.id} value={String(p.id)}>{p.name}</option>
                                                ))}
                                            </select>
                                            <p style={{ margin: '5px 0 0', fontSize: '0.72rem', color: '#9ca3af' }}>When selected, clicking the hero button will open this product's detail modal directly.</p>
                                        </div>
                                    )}

                                    {/* Deep-link: specific service */}
                                    {formData.navigateTo === 'page-services' && availableServices.length > 0 && (
                                        <div style={{ marginTop: 14 }}>
                                            <label style={{ ...labelSt, marginBottom: 6 }}>🎯 Go directly to service</label>
                                            <select
                                                style={selectSt}
                                                value={formData.linkedServiceId}
                                                onChange={e => setFormData({ ...formData, linkedServiceId: e.target.value })}
                                            >
                                                <option value="">— First service (default) —</option>
                                                {availableServices.map(s => (
                                                    <option key={s.id} value={s.id}>{s.title}</option>
                                                ))}
                                            </select>
                                            <p style={{ margin: '5px 0 0', fontSize: '0.72rem', color: '#9ca3af' }}>When selected, the hero button will navigate to this specific service's page.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Active toggle */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb' }}>
                                    <input
                                        type="checkbox"
                                        id="slideActive"
                                        checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                                    />
                                    <label htmlFor="slideActive" style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem', color: '#374151', cursor: 'pointer' }}>
                                        Active — Show in Homepage Carousel
                                    </label>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 4 }}>
                                    <button type="button" className="btn-cancel" onClick={() => setIsSlideModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> {editingSlide ? 'Update Slide' : 'Create Slide'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div >
                )}
            </AnimatePresence >

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
        </div >
    );
};

export default HeroManagement;
