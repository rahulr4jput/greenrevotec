import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaBoxOpen, FaPencilAlt, FaSave, FaTimes, FaSearch, FaLanguage } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import './ProductCategories.css'; // Reusing the same nice styling!
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { products as defaultProducts } from '../../Products/Products'; // Fallback import

// Types
import type { IconType } from 'react-icons';
import { FaLeaf } from 'react-icons/fa';

interface Product {
    id: string | number;
    name: string;
    category: string;
    description: string;
    images: string[];
    badge: string;
    badgeColor: string;
    IconComponent?: IconType | string;
    iconColor: string;
    rating: number;
    reviews: number;
    features: string[];
    // New Fields
    sku?: string;
    mrp?: number;
    salePrice?: number;
    manufacturer?: string;
    mfrPartNumber?: string;
    unitCount?: string;
    weight?: string;
    bulletPoints?: string[];
    isActive?: boolean;
    unit?: string;
    showPricing?: boolean;
    applicableCrops?: string[];
    language?: string;
    linkedToId?: string | number | null;
    status: string; // "published" or "draft"
}

interface Language {
    id: string;
    name: string;
    script: string;
}

interface Category {
    id: string;
    name: string;
}

const AllProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [badge, setBadge] = useState('');
    const [badgeColor, setBadgeColor] = useState('#25b565');

    // New Fields State
    const [sku, setSku] = useState('');
    const [mrp, setMrp] = useState<number | ''>('');
    const [salePrice, setSalePrice] = useState<number | ''>('');
    const [manufacturer, setManufacturer] = useState('');
    const [mfrPartNumber, setMfrPartNumber] = useState('');
    const [unitCount, setUnitCount] = useState('');
    const [weight, setWeight] = useState('');
    const [unit, setUnit] = useState('Kg'); // Added unit state
    const [bulletPoints, setBulletPoints] = useState<string[]>(['']);
    const [isActive, setIsActive] = useState(true);
    const [applicableCrops, setApplicableCrops] = useState<string[]>([]);
    const [availableCrops, setAvailableCrops] = useState<Crop[]>([]);
    const [language, setLanguage] = useState('English');
    const [linkedToId, setLinkedToId] = useState<string | number | null>(null);
    const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
    const [status, setStatus] = useState('published');
    const [showPricing, setShowPricing] = useState(true);

    interface Crop {
        id: string;
        name: string;
    }

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter State
    const [filterCategory, setFilterCategory] = useState('All');
    const [filterCrop, setFilterCrop] = useState('All');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortBy, setSortBy] = useState('Newest');
    const [searchQuery, setSearchQuery] = useState('');

    // Edit State
    const [editingProductId, setEditingProductId] = useState<string | number | null>(null);
    const [isSectionVisible, setIsSectionVisible] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Load Products
            const prodRes = await fetch('/api/products');
            const prodData = await prodRes.json();
            if (prodRes.ok) {
                setProducts(prodData);
            }

            // Load Categories
            const catRes = await fetch('/api/categories');
            const catData = await catRes.json();
            if (catRes.ok) {
                setCategories(catData.length > 0 ? catData : []);
                if (catData.length > 0) setCategory(catData[0].name);
            }

            // Load Languages
            const langRes = await fetch('/api/languages');
            const langData = await langRes.json();
            if (langRes.ok) {
                setAvailableLanguages(langData);
            }

            // Load Crops
            const cropRes = await fetch('/api/crops');
            const cropData = await cropRes.json();
            if (cropRes.ok) {
                setAvailableCrops(cropData);
            }
        } catch (error) {
            console.error('Error fetching products data:', error);
            toast.error('Failed to load products');
        }
    };

    const toggleSectionVisibility = () => {
        const newValue = !isSectionVisible;
        setIsSectionVisible(newValue);
        const visibility = localStorage.getItem('admin_section_visibility');
        const parsed = visibility ? JSON.parse(visibility) : {};
        localStorage.setItem('admin_section_visibility', JSON.stringify({ ...parsed, products: newValue }));
        toast.info(`Products section is now ${newValue ? 'Visible' : 'Hidden'} on homepage.`);
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setUploadedImages([]);
        setBadge('');
        setBadgeColor('#25b565');
        setSku('');
        setMrp('');
        setSalePrice('');
        setManufacturer('');
        setMfrPartNumber('');
        setUnitCount('');
        setWeight('');
        setUnit('Kg'); // Reset unit
        setBulletPoints(['']);
        setIsActive(true);
        setApplicableCrops([]);
        setLanguage('English');
        setLinkedToId(null);
        setEditingProductId(null);
        setStatus('published');
        if (categories.length > 0) setCategory(categories[0].name);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);

        if (uploadedImages.length + files.length > 10) {
            toast.error('You can only upload a maximum of 10 images per product.');
            return;
        }

        files.forEach(file => {
            if (file.size > 2 * 1024 * 1024) {
                toast.warning(`File ${file.name} is too large. Max size is 2MB. Skipping.`);
                return;
            }
            if (!file.type.startsWith('image/')) {
                toast.warning(`File ${file.name} is not an image. Skipping.`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setUploadedImages(prev => {
                    if (prev.length >= 10) return prev;
                    return [...prev, base64String];
                });
            };
            reader.readAsDataURL(file);
        });

        // Reset file input
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleBulletPointChange = (index: number, value: string) => {
        const newBullets = [...bulletPoints];
        newBullets[index] = value;
        setBulletPoints(newBullets);
    };

    const addBulletPoint = () => {
        if (bulletPoints.length < 5) {
            setBulletPoints([...bulletPoints, '']);
        }
    };

    const removeBulletPoint = (index: number) => {
        const newBullets = bulletPoints.filter((_, i) => i !== index);
        setBulletPoints(newBullets.length ? newBullets : ['']);
    };

    const validateScript = (text: string, langName: string) => {
        if (!text || langName === 'English') return true; // English/Latin is usually okay or skipped for now

        // Find the language object to get its native script sample
        const langObj = availableLanguages.find(l => l.name === langName);
        if (!langObj) return true;

        // Simple script detection: check if at least one character in text is in the same Unicode block as the native script sample
        const sampleText = langObj.script.replace(/[0-9\s]/g, '');
        if (!sampleText) return true;

        const sampleCode = sampleText.charCodeAt(0);
        // Devanagari range: 0x0900 - 0x097F
        if (sampleCode >= 0x0900 && sampleCode <= 0x097F) {
            const devanagariRegex = /[\u0900-\u097F]/;
            return devanagariRegex.test(text);
        }
        // Arabic range: 0x0600 - 0x06FF
        if (sampleCode >= 0x0600 && sampleCode <= 0x06FF) {
            const arabicRegex = /[\u0600-\u06FF]/;
            return arabicRegex.test(text);
        }

        return true; // Fallback
    };

    const handleAddOrUpdateProduct = async (e: React.FormEvent, forceStatus?: string) => {
        if (e) e.preventDefault();

        const currentStatus = forceStatus || status;

        if (!name.trim() || !category) {
            toast.error('Please fill in required fields (Name & Category)');
            return;
        }

        // Script Validation
        if (language !== 'English') {
            if (!validateScript(name, language)) {
                toast.error(`The product name does not match the script for "${language}".`);
                return;
            }
            if (description && !validateScript(description, language)) {
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

        const productData = {
            id: editingProductId || undefined,
            name: name.trim(),
            category,
            description: description.trim() || 'Premium agricultural product.',
            images: uploadedImages.length > 0 ? uploadedImages : [
                'https://images.unsplash.com/photo-1592839719941-8e2651039d01?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            badge: badge.trim() || 'New',
            badgeColor: badgeColor,
            IconComponent: 'FaLeaf',
            iconColor: '#25b565',
            rating: 5.0,
            reviews: Math.floor(Math.random() * 500) + 100,
            features: ['High quality', 'Tested & Verified', 'Eco friendly'],
            sku: sku.trim(),
            mrp: typeof mrp === 'number' ? mrp : parseFloat(mrp as string) || 0,
            salePrice: typeof salePrice === 'number' ? salePrice : parseFloat(salePrice as string) || 0,
            manufacturer: manufacturer.trim(),
            mfrPartNumber: mfrPartNumber.trim(),
            unitCount: unitCount.trim(),
            weight: weight.trim(),
            unit: unit,
            bulletPoints: bulletPoints.filter(b => b.trim() !== ''),
            isActive: isActive,
            applicableCrops: applicableCrops,
            language: language,
            linkedToId: linkedToId,
            status: currentStatus,
            showPricing: showPricing
        };

        try {
            const response = await fetch('/api/products', {
                method: editingProductId ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                toast.success(editingProductId ? 'Product updated successfully!' : 'Product added successfully!');
                resetForm();
                setIsModalOpen(false);
                fetchData();
            } else {
                const errData = await response.json();
                toast.error(errData.error || 'Failed to save product');
            }
        } catch (error) {
            console.error('Save error:', error);
            toast.error('Server error while saving product');
        }
    };

    const handleEditClick = (product: Product) => {
        setEditingProductId(product.id);
        setName(product.name);
        setCategory(product.category);
        setDescription(product.description);
        setUploadedImages(product.images || []);
        setBadge(product.badge);
        setBadgeColor(product.badgeColor || '#25b565'); // Set badgeColor
        setSku(product.sku || '');
        setMrp(product.mrp || '');
        setSalePrice(product.salePrice || '');
        setManufacturer(product.manufacturer || '');
        setMfrPartNumber(product.mfrPartNumber || '');
        setUnitCount(product.unitCount || '');
        setWeight(product.weight || '');
        setUnit(product.unit || 'Kg'); // Set unit for editing
        setBulletPoints(product.bulletPoints && product.bulletPoints.length > 0 ? product.bulletPoints : ['']);
        setIsActive(product.isActive !== undefined ? product.isActive : true);
        setApplicableCrops(product.applicableCrops || []);
        setLanguage(product.language || 'English');
        setLinkedToId(product.linkedToId || null);
        setStatus(product.status || 'published');
        setShowPricing(product.showPricing !== undefined ? product.showPricing : true);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (id: string | number, productName: string) => {
        if (!window.confirm(`Are you sure you want to delete the product "${productName}"?`)) return;

        try {
            const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('Product deleted.');
                fetchData(); // Refresh the product list
            } else {
                toast.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Server error while deleting product');
        }
    };

    // Filtering & Sorting Logic
    const getFilteredProducts = () => {
        let filtered = [...products];

        // Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query) ||
                (p.sku && p.sku.toLowerCase().includes(query))
            );
        }

        // Category Filter
        if (filterCategory !== 'All') {
            filtered = filtered.filter(p => p.category === filterCategory);
        }

        // Crop Filter
        if (filterCrop !== 'All') {
            filtered = filtered.filter(p => p.applicableCrops && p.applicableCrops.includes(filterCrop));
        }

        // Status Filter
        if (filterStatus === 'Active') {
            filtered = filtered.filter(p => p.isActive !== false);
        } else if (filterStatus === 'Inactive') {
            filtered = filtered.filter(p => p.isActive === false);
        } else if (filterStatus === 'Draft') {
            filtered = filtered.filter(p => p.status === 'draft');
        } else if (filterStatus === 'Published') {
            filtered = filtered.filter(p => p.status === 'published');
        }

        // Sorting
        switch (sortBy) {
            case 'Price: Low to High':
                filtered.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
                break;
            case 'Price: High to Low':
                filtered.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
                break;
            case 'Oldest':
                // ID contains timestamp prod-123456789
                filtered.sort((a, b) => {
                    const timeA = parseInt(a.id.toString().split('-')[1] || '0');
                    const timeB = parseInt(b.id.toString().split('-')[1] || '0');
                    return timeA - timeB;
                });
                break;
            case 'Newest':
            default:
                filtered.sort((a, b) => {
                    const timeA = parseInt(a.id.toString().split('-')[1] || '0');
                    const timeB = parseInt(b.id.toString().split('-')[1] || '0');
                    return timeB - timeA;
                });
                break;
        }

        return filtered;
    };

    const filteredProducts = getFilteredProducts();

    return (
        <div className="admin-content-area" style={{ position: 'relative' }}>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="categories-container" style={{ maxWidth: '100%' }}>
                <div className="categories-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', marginBottom: '32px' }}>
                    <div style={{ flexShrink: 0 }}>
                        <h3 style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '8px' }}>Product Inventory</h3>
                        <p style={{ color: '#6b7280' }}>Manage products, prices, and stock status.</p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isSectionVisible ? '#ecfdf5' : '#fef2f2', border: `1px solid ${isSectionVisible ? '#10b981' : '#ef4444'}`, borderRadius: '8px', cursor: 'pointer' }} onClick={toggleSectionVisibility}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSectionVisible ? '#047857' : '#b91c1c' }}>{isSectionVisible ? 'VISIBLE' : 'HIDDEN'} ON HOME</span>
                            <div style={{ width: '36px', height: '20px', background: isSectionVisible ? '#10b981' : '#ef4444', borderRadius: '10px', position: 'relative', transition: '0.3s' }}>
                                <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isSectionVisible ? '19px' : '3px', transition: '0.3s' }}></div>
                            </div>
                        </div>
                        {/* Compact Integrated Search */}
                        <div style={{ position: 'relative', minWidth: '200px', flex: '1', maxWidth: '300px' }}>
                            <FaSearch style={{ position: 'absolute', top: '12px', left: '12px', color: '#9ca3af' }} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '14px', outline: 'none' }}
                            />
                        </div>

                        {/* Dropdown Filters */}
                        <select className="category-form-input" style={{ width: 'auto', marginBottom: 0, padding: '9px 12px', fontSize: '13px' }} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                            <option value="All">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>

                        <select className="category-form-input" style={{ width: 'auto', marginBottom: 0, padding: '9px 12px', fontSize: '13px' }} value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)}>
                            <option value="All">All Crops</option>
                            {availableCrops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>

                        <select className="category-form-input" style={{ width: 'auto', marginBottom: 0, padding: '9px 12px', fontSize: '13px' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                        </select>

                        <select className="category-form-input" style={{ width: 'auto', marginBottom: 0, padding: '9px 12px', fontSize: '13px' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="Newest">Newest First</option>
                            <option value="Oldest">Oldest First</option>
                            <option value="Price: Low to High">Low-High</option>
                            <option value="Price: High to Low">High-Low</option>
                        </select>

                        <button
                            className="btn-save"
                            style={{ margin: 0, padding: '10px 20px', whiteSpace: 'nowrap' }}
                            onClick={() => { resetForm(); setIsModalOpen(true); }}
                        >
                            <FaPlus /> Add New Product
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="category-table-card" style={{ width: '100%' }}>
                    <div className="table-responsive">
                        <table className="custom-category-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Product Details</th>
                                    <th>Category</th>
                                    <th>Pricing</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="empty-state">No products match your filters.</td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((p) => (
                                        <tr key={p.id}>
                                            <td style={{ padding: '12px 24px', color: '#6b7280', fontSize: '13px', fontWeight: 'bold' }}>#{p.id}</td>
                                            <td style={{ padding: '12px 24px', width: '80px' }}>
                                                <img
                                                    src={p.images[0]}
                                                    alt={p.name}
                                                    style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e5e7eb' }}
                                                />
                                            </td>
                                            <td className="cat-name-cell">
                                                <div style={{ fontWeight: '600' }}>{p.name}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', color: '#374151' }}>{p.language || 'English'}</span>
                                                    {p.linkedToId && (
                                                        <span style={{ backgroundColor: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #10b981', color: '#047857', fontWeight: 'bold', fontSize: '10px' }}>
                                                            Linked to English
                                                        </span>
                                                    )}
                                                    <span>SKU: {p.sku || 'N/A'} {p.manufacturer ? `| Mfg: ${p.manufacturer}` : ''}</span>
                                                </div>
                                            </td>
                                            <td className="cat-desc-cell">
                                                <div style={{ fontWeight: '500' }}>{p.category}</div>
                                                {p.applicableCrops && p.applicableCrops.length > 0 && (
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                                        {p.applicableCrops.map(crop => (
                                                            <span key={crop} style={{ fontSize: '10px', padding: '1px 5px', background: '#ecfdf5', color: '#065f46', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                                                                {crop}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {p.salePrice ? (
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', color: '#059669' }}>₹{p.salePrice}</span>
                                                        {p.mrp && <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '12px', marginLeft: '6px' }}>₹{p.mrp}</span>}
                                                    </div>
                                                ) : <span style={{ color: '#9ca3af' }}>N/A</span>}
                                            </td>
                                            <td>
                                                <span className="category-badge" style={{ backgroundColor: p.isActive !== false ? '#dcfce7' : '#fee2e2', color: p.isActive !== false ? '#166534' : '#991b1b' }}>
                                                    {p.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                                {p.status === 'draft' && (
                                                    <span className="category-badge" style={{ backgroundColor: '#f3f4f6', color: '#374151', marginLeft: '4px' }}>
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-icon edit"
                                                        title="Edit Product"
                                                        type="button"
                                                        onClick={() => handleEditClick(p)}
                                                    >
                                                        <FaPencilAlt />
                                                    </button>
                                                    <button
                                                        className="btn-icon delete"
                                                        title="Delete Product"
                                                        type="button"
                                                        onClick={() => handleDeleteProduct(p.id, p.name)}
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Product Module Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="category-form-card"
                            style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', background: 'white', margin: 0, padding: '32px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px' }}>
                                <h4 className="category-form-title" style={{ marginBottom: 0 }}>
                                    {editingProductId ? <><FaPencilAlt /> Edit Product Details</> : <><FaBoxOpen /> Create New Product</>}
                                </h4>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '20px' }}>
                                    <FaTimes />
                                </button>
                            </div>

                            <form onSubmit={handleAddOrUpdateProduct}>
                                {/* Language Selection at the top */}
                                <div className="category-form-group" style={{ background: '#f0f9ff', padding: '16px', borderRadius: '12px', border: '1px solid #bae6fd', marginBottom: '24px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 'bold' }}>
                                        <FaLanguage /> Selected Language for this Entry
                                    </label>
                                    <select
                                        className="category-form-input"
                                        value={language}
                                        onChange={(e) => {
                                            const newLang = e.target.value;
                                            setLanguage(newLang);
                                            setLinkedToId(null); // Reset link when language changes
                                            // Auto-clear fields if they don't match the new script
                                            if (newLang !== 'English') {
                                                if (name && !validateScript(name, newLang)) setName('');
                                                if (description && !validateScript(description, newLang)) setDescription('');

                                                const someBulletsMismatch = bulletPoints.some(bp => bp.trim() && !validateScript(bp, newLang));
                                                if (someBulletsMismatch) {
                                                    setBulletPoints(['']);
                                                }
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

                                {/* Basic Info */}
                                <h5 style={{ marginBottom: '16px', color: '#374151', fontSize: '1.1rem' }}>Basic Information</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="category-form-group">
                                        <label>Product Name *</label>
                                        <input type="text" className="category-form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Category *</label>
                                        <select className="category-form-input" value={category} onChange={(e) => setCategory(e.target.value)} required>
                                            {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="category-form-group">
                                        <label>SKU Number</label>
                                        <input type="text" className="category-form-input" value={sku} onChange={(e) => setSku(e.target.value)} />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Badge Label (e.g., Bestseller, New)</label>
                                        <input type="text" className="category-form-input" value={badge} onChange={(e) => setBadge(e.target.value)} />
                                    </div>
                                </div>

                                {/* Target Crops Selection Moved Up */}
                                <div className="category-form-group" style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: 'bold', marginBottom: '12px' }}>
                                        <FaLeaf style={{ color: '#10b981' }} /> Target Crops (Applicable for)
                                    </label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {availableCrops.length === 0 ? (
                                            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>No crops defined. Go to "Create Crop Name" to add some.</p>
                                        ) : (
                                            availableCrops.map(crop => (
                                                <label key={crop.id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    cursor: 'pointer',
                                                    background: applicableCrops.includes(crop.name) ? '#f0fdf4' : 'white',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    border: `1px solid ${applicableCrops.includes(crop.name) ? '#22c55e' : '#e2e8f0'}`,
                                                    fontSize: '13px',
                                                    transition: '0.2s all',
                                                    boxShadow: applicableCrops.includes(crop.name) ? '0 2px 4px rgba(34, 197, 94, 0.1)' : 'none'
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={applicableCrops.includes(crop.name)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setApplicableCrops([...applicableCrops, crop.name]);
                                                            } else {
                                                                setApplicableCrops(applicableCrops.filter(c => c !== crop.name));
                                                            }
                                                        }}
                                                        style={{ cursor: 'pointer', accentColor: '#22c55e' }}
                                                    />
                                                    <span style={{ color: applicableCrops.includes(crop.name) ? '#166534' : '#64748b', fontWeight: applicableCrops.includes(crop.name) ? '600' : '400' }}>{crop.name}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Pricing & Inventory */}
                                <h5 style={{ margin: '24px 0 16px', color: '#374151', fontSize: '1.1rem', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>Pricing & Details</h5>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div className="category-form-group">
                                        <label>Sale Price (₹)</label>
                                        <input type="number" className="category-form-input" value={salePrice} onChange={(e) => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))} />
                                    </div>
                                    <div className="category-form-group">
                                        <label>MRP (₹)</label>
                                        <input type="number" className="category-form-input" value={mrp} onChange={(e) => setMrp(e.target.value === '' ? '' : Number(e.target.value))} />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Pricing Visibility</label>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px',
                                                background: showPricing ? '#f0fdf4' : '#f9fafb',
                                                borderRadius: '8px',
                                                border: `1px solid ${showPricing ? '#86efac' : '#e5e7eb'}`,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setShowPricing(!showPricing)}
                                        >
                                            <div style={{
                                                width: '40px',
                                                height: '22px',
                                                background: showPricing ? '#22c55e' : '#d1d5db',
                                                borderRadius: '11px',
                                                position: 'relative',
                                                transition: 'all 0.3s ease'
                                            }}>
                                                <div style={{
                                                    width: '16px',
                                                    height: '16px',
                                                    background: 'white',
                                                    borderRadius: '50%',
                                                    position: 'absolute',
                                                    top: '3px',
                                                    left: showPricing ? '21px' : '3px',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '13px', fontWeight: '600', color: showPricing ? '#166534' : '#4b5563' }}>
                                                {showPricing ? 'Show Prices to Public' : 'Hide Prices from Public'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="category-form-group">
                                        <label>Status / Availability</label>
                                        <select className="category-form-input" style={{ marginBottom: 0 }} value={isActive ? 'Active' : 'Inactive'} onChange={(e) => setIsActive(e.target.value === 'Active')}>
                                            <option value="Active">Active / In Stock</option>
                                            <option value="Inactive">Inactive / Out of Stock</option>
                                        </select>
                                    </div>
                                    <div className="category-form-group">
                                        <label>Manufacturer</label>
                                        <input type="text" className="category-form-input" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Mfg. Part Number</label>
                                        <input type="text" className="category-form-input" value={mfrPartNumber} onChange={(e) => setMfrPartNumber(e.target.value)} />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Weight / Volume</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                className="category-form-input"
                                                style={{ flex: 1, marginBottom: 0 }}
                                                value={weight}
                                                onChange={(e) => setWeight(e.target.value)}
                                                placeholder="Value (e.g. 500)"
                                            />
                                            <select
                                                className="category-form-input"
                                                style={{ width: '80px', marginBottom: 0 }}
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                            >
                                                <option value="g">g</option>
                                                <option value="Kg">Kg</option>
                                                <option value="Ml">ml</option>
                                                <option value="L">L</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="category-form-group">
                                        <label>Unit Count</label>
                                        <input type="text" className="category-form-input" value={unitCount} onChange={(e) => setUnitCount(e.target.value)} placeholder="e.g. Pack of 2" />
                                    </div>
                                </div>

                                {/* Description & Images */}
                                <h5 style={{ margin: '24px 0 16px', color: '#374151', fontSize: '1.1rem', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>Content & Media</h5>
                                <div className="category-form-group">
                                    <label>Short Description</label>
                                    <textarea className="category-form-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={3}></textarea>
                                </div>
                                <div className="category-form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ margin: 0 }}>Bullet Points (Max 5)</label>
                                        {bulletPoints.length < 5 && (
                                            <button type="button" onClick={addBulletPoint} style={{ background: 'none', border: 'none', color: '#25b565', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaPlus /> Add Bullet
                                            </button>
                                        )}
                                    </div>
                                    {bulletPoints.map((bullet, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input
                                                type="text"
                                                className="category-form-input"
                                                style={{ marginBottom: 0 }}
                                                value={bullet}
                                                onChange={(e) => handleBulletPointChange(index, e.target.value)}
                                                placeholder={`Key feature ${index + 1}...`}
                                            />
                                            {bulletPoints.length > 1 && (
                                                <button type="button" onClick={() => removeBulletPoint(index)} style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0 12px', borderRadius: '4px', cursor: 'pointer' }}>
                                                    <FaTrash size={12} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="category-form-group">
                                    <label>Product Images (Max 10) *</label>
                                    <input type="file" multiple accept="image/*" className="category-form-input" onChange={handleImageUpload} style={{ padding: '8px' }} />
                                    {uploadedImages.length > 0 && (
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                                            {uploadedImages.map((img, index) => (
                                                <div key={index} style={{ position: 'relative', width: '60px', height: '60px' }}>
                                                    <img src={img} alt={`Upload ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                                                    >
                                                        <FaTimes />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-secondary"
                                        style={{ flex: 1 }}
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn-secondary"
                                        style={{ flex: 1, border: '1px solid #d1d5db' }}
                                        onClick={(e) => handleAddOrUpdateProduct(e as any, 'draft')}
                                    >
                                        Save as Draft
                                    </button>
                                    <button
                                        type="submit"
                                        className="admin-btn admin-btn-primary"
                                        style={{ flex: 1 }}
                                        onClick={() => setStatus('published')}
                                    >
                                        {editingProductId ? 'Update & Publish' : 'Create & Publish'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllProducts;
