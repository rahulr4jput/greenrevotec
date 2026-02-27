import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFilter, FaSearch, FaLeaf, FaStar, FaArrowRight, FaTimes, FaChevronLeft, FaChevronRight, FaHeadset, FaUser, FaPhone, FaEnvelope, FaPen, FaRocket } from 'react-icons/fa';
import { FaWhatsapp } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { usePageReady } from '../components/PageTransition/PageTransition';
import BottomNav from '../components/BottomNav/BottomNav';
import './ProductCatalog.css';


interface Product {
    id: number | string;
    name: string;
    category: string;
    description: string;
    images: string[];
    badge: string;
    badgeColor: string;
    iconColor: string;
    rating: number;
    reviews: number;
    features: string[];
    applicableCrops?: string[];
    salePrice?: number;
    mrp?: number;
    sku?: string;
    weight?: string;
    unit?: string;
    showPricing?: boolean;
}

interface Category {
    id: string;
    name: string;
}

interface Crop {
    id: string;
    name: string;
}

const ProductCatalog: React.FC = () => {
    const reportPageReady = usePageReady();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [crops, setCrops] = useState<Crop[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter & Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCrop, setSelectedCrop] = useState('All');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showContactPopup, setShowContactPopup] = useState(false);
    const [contactPhones, setContactPhones] = useState<string[]>([]);
    const location = useLocation();

    // Modal & Product Detail State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showQuoteForm, setShowQuoteForm] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [slideDirection, setSlideDirection] = useState(0);
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });

    useEffect(() => {
        window.scrollTo(0, 0);

        // Handle Category pre-selection from URL
        const params = new URLSearchParams(location.search);
        const catParam = params.get('category');
        if (catParam) {
            setSelectedCategory(catParam);
        }

        fetchData();

        // Fetch contact phone numbers from admin settings
        fetch('/api/settings/admin_contact_config')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.info) {
                    const phoneEntry = data.info.find((item: any) => item.type === 'phone');
                    if (phoneEntry?.lines?.length) {
                        setContactPhones(phoneEntry.lines);
                    }
                }
            })
            .catch(() => { });
    }, [location.search]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [prodRes, catRes, cropRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/categories'),
                fetch('/api/crops')
            ]);

            if (prodRes.ok) {
                const prods = await prodRes.json();
                setProducts(prods.filter((p: any) => p.status !== 'draft'));
            }
            if (catRes.ok) {
                const catData = await catRes.json();
                setCategories(catData);
            }
            if (cropRes.ok) {
                const cropData = await cropRes.json();
                setCrops(cropData);
            }
        } catch (error) {
            console.error('Error fetching catalog data:', error);
        } finally {
            setIsLoading(false);
            reportPageReady();
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesCrop = selectedCrop === 'All' || (p.applicableCrops && p.applicableCrops.includes(selectedCrop));

        return matchesSearch && matchesCategory && matchesCrop;
    });

    // Modal Handlers
    const openModal = (product: Product) => {
        setSelectedProduct(product);
        setCurrentImageIndex(0);
        setShowQuoteForm(false);
        setSubmitted(false);
        setForm({ name: '', email: '', phone: '', message: '' });
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedProduct(null);
        document.body.style.overflow = 'auto';
    };

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedProduct) return;
        setSlideDirection(1);
        setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedProduct) return;
        setSlideDirection(-1);
        setCurrentImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleQuoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    subject: `Quote Request: ${selectedProduct?.name}`,
                    productName: selectedProduct?.name,
                    type: 'Quote',
                    source: 'Product Catalog'
                })
            });
            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    closeModal();
                }, 3000);
            }
        } catch (error) {
            console.error('Error submitting quote request:', error);
        }
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    return (
        <div className="catalog-page">
            <div className="container catalog-container">
                {/* Mobile Controls Row */}
                <div className="catalog-mobile-controls">
                    <div className="mobile-search-wrap">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Mobile Filter Backdrop */}
                {showMobileFilters && (
                    <div className="filter-backdrop" onClick={() => setShowMobileFilters(false)} />
                )}

                {/* Sidebar Filters */}
                <aside className={`catalog-sidebar ${showMobileFilters ? 'show' : ''}`}>
                    <div className="sidebar-header">
                        <h3>Filters</h3>
                        <button className="close-filters" onClick={() => setShowMobileFilters(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="filter-group">
                        <label><FaSearch /> Search Products</label>
                        <div className="search-input-wrap">
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="filter-group">
                        <label>Categories</label>
                        <div className="filter-options">
                            <button
                                className={`filter-opt ${selectedCategory === 'All' ? 'active' : ''}`}
                                onClick={() => setSelectedCategory('All')}
                            >
                                All Categories
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`filter-opt ${selectedCategory === cat.name ? 'active' : ''}`}
                                    onClick={() => setSelectedCategory(cat.name)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Crop Filter */}
                    <div className="filter-group">
                        <label>Target Crops</label>
                        <div className="filter-options">
                            <button
                                className={`filter-opt ${selectedCrop === 'All' ? 'active' : ''}`}
                                onClick={() => setSelectedCrop('All')}
                            >
                                All Crops
                            </button>
                            {crops.map(crop => (
                                <button
                                    key={crop.id}
                                    className={`filter-opt ${selectedCrop === crop.name ? 'active' : ''}`}
                                    onClick={() => setSelectedCrop(crop.name)}
                                >
                                    {crop.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="reset-filters" onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSelectedCrop('All');
                        setShowMobileFilters(false);
                    }}>
                        Reset All Filters
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="catalog-main">
                    <div className="catalog-results-header">
                        <p>Showing <strong>{filteredProducts.length}</strong> products</p>
                        <div className="breadcrumbs">
                            <Link to="/">Home</Link> / <span>Catalog</span>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="catalog-loading">
                            <div className="spinner"></div>
                            <p>Loading products...</p>
                        </div>
                    ) : (
                        <div className="catalog-grid">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        className="catalog-card shadow-sm"
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <div className="card-image">
                                            <img src={product.images[0]} alt={product.name} />
                                            {product.badge && (
                                                <span className="card-badge" style={{ backgroundColor: product.badgeColor }}>
                                                    {product.badge}
                                                </span>
                                            )}
                                        </div>
                                        <div className="card-content">
                                            <p className="card-cat">{product.category}</p>
                                            <h3 className="card-title">{product.name}</h3>
                                            <div className="card-compact-row">
                                                {product.weight && (
                                                    <div className="card-weight">
                                                        <strong>Wt:</strong> {product.weight}{product.unit || 'Kg'}
                                                    </div>
                                                )}
                                                <div className="card-crops-mini">
                                                    {product.applicableCrops?.slice(0, 2).map(crop => (
                                                        <span key={crop} className="crop-tag-mini">{crop}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="card-footer" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
                                                {product.showPricing !== false && (
                                                    <div className="card-price" style={{ margin: 0 }}>
                                                        {product.salePrice ? (
                                                            <>
                                                                <span className="price">₹{product.salePrice}</span>
                                                                {product.mrp && <span className="mrp">₹{product.mrp}</span>}
                                                            </>
                                                        ) : (
                                                            <span className="price-on-request">Price on Request</span>
                                                        )}
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => openModal(product)}
                                                    className="view-btn"
                                                >
                                                    View Details <FaArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="no-results">
                                    <div className="no-results-icon"><FaSearch /></div>
                                    <h3>No products found</h3>
                                    <p>Try adjusting your filters or search terms.</p>
                                    <button onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('All');
                                        setSelectedCrop('All');
                                    }}>Clear Filters</button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="product-modal-overlay" onClick={closeModal}>
                        <motion.div
                            className="product-modal glass-card"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="modal-close-btn" onClick={closeModal}>
                                <FaTimes />
                            </button>

                            <div className="modal-content-grid">
                                {/* Left Pane: Carousel */}
                                <div className="modal-left">
                                    <div className="modal-carousel">
                                        <AnimatePresence mode="wait" custom={slideDirection}>
                                            <motion.img
                                                key={currentImageIndex}
                                                src={selectedProduct.images[currentImageIndex]}
                                                alt={selectedProduct.name}
                                                className="modal-main-image"
                                                custom={slideDirection}
                                                variants={slideVariants}
                                                initial="enter"
                                                animate="center"
                                                exit="exit"
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            />
                                        </AnimatePresence>
                                        <button className="carousel-btn prev" onClick={prevImage}><FaChevronLeft /></button>
                                        <button className="carousel-btn next" onClick={nextImage}><FaChevronRight /></button>

                                        <div className="carousel-indicators">
                                            {selectedProduct.images.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}
                                                    onClick={() => setCurrentImageIndex(idx)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Pane: Details or Form */}
                                <div className="modal-right" style={{ overflowX: 'hidden', position: 'relative' }}>
                                    <AnimatePresence mode="wait">
                                        {submitted ? (
                                            <motion.div
                                                key="success"
                                                className="modal-success"
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="success-icon">✅</div>
                                                <h3>Quote Request Sent!</h3>
                                                <p>Our sales team will contact you shortly about <strong>{selectedProduct.name}</strong>.</p>
                                            </motion.div>
                                        ) : showQuoteForm ? (
                                            <motion.div
                                                key="form"
                                                className="modal-form-view"
                                                initial={{ opacity: 0, x: 50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 50 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            >
                                                <button className="back-to-details-btn" onClick={() => setShowQuoteForm(false)}>
                                                    <FaChevronLeft /> Back to Details
                                                </button>
                                                <h3 className="modal-form-title">Request Quote for {selectedProduct.name}</h3>
                                                <form className="modal-quote-form" onSubmit={handleQuoteSubmit}>
                                                    <div className="gr-form-group">
                                                        <label className="gr-label">Full Name *</label>
                                                        <div className="gr-input-wrapper">
                                                            <FaUser className="input-icon" />
                                                            <input className="gr-input" type="text" name="name" value={form.name} onChange={handleFormChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="gr-form-group">
                                                        <label className="gr-label">Phone Number *</label>
                                                        <div className="gr-input-wrapper">
                                                            <FaPhone className="input-icon" />
                                                            <input className="gr-input" type="tel" name="phone" value={form.phone} onChange={handleFormChange} required />
                                                        </div>
                                                    </div>
                                                    <div className="gr-form-group">
                                                        <label className="gr-label">Email Address</label>
                                                        <div className="gr-input-wrapper">
                                                            <FaEnvelope className="input-icon" />
                                                            <input className="gr-input" type="email" name="email" value={form.email} onChange={handleFormChange} />
                                                        </div>
                                                    </div>
                                                    <div className="gr-form-group">
                                                        <label className="gr-label">Requirements</label>
                                                        <div className="gr-input-wrapper">
                                                            <FaPen className="input-icon" style={{ top: '24px', transform: 'none' }} />
                                                            <textarea className="gr-textarea with-icon" name="message" value={form.message} onChange={handleFormChange} rows={3} placeholder="Quantity, delivery location, etc." />
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="btn btn-primary btn-lg w-full">
                                                        Submit Request <FaRocket style={{ marginLeft: '10px' }} />
                                                    </button>
                                                </form>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="details"
                                                className="modal-details-view"
                                                initial={{ opacity: 0, x: -50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -50 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            >
                                                <div className="modal-badge" style={{ background: `${selectedProduct.badgeColor}22`, color: selectedProduct.badgeColor }}>
                                                    {selectedProduct.badge}
                                                </div>
                                                <h2 className="modal-product-name">{selectedProduct.name}</h2>
                                                <p className="modal-product-cat">{selectedProduct.category}</p>

                                                {selectedProduct.showPricing !== false && (
                                                    <div className="modal-price-row">
                                                        {selectedProduct.salePrice ? (
                                                            <>
                                                                <span className="modal-price">₹{selectedProduct.salePrice.toLocaleString('en-IN')}</span>
                                                                {selectedProduct.mrp && <span className="modal-mrp">₹{selectedProduct.mrp.toLocaleString('en-IN')}</span>}
                                                            </>
                                                        ) : (
                                                            <span className="modal-price">Price on Request</span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="modal-rating">
                                                    <FaStar className="star-icon" />
                                                    <span className="rating-value">{selectedProduct.rating}</span>
                                                    <span className="rating-count">({selectedProduct.reviews?.toLocaleString()} reviews)</span>
                                                </div>

                                                <div className="modal-divider" />

                                                <p className="modal-desc">{selectedProduct.description}</p>

                                                <div className="modal-features">
                                                    <h4>Key Features & Bullet Points</h4>
                                                    <ul>
                                                        {(selectedProduct.features && selectedProduct.features.length > 0
                                                            ? selectedProduct.features
                                                            : []
                                                        ).map((f, i) => (
                                                            <li key={i}><FaLeaf className="feature-marker" /> {f}</li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="modal-divider" />

                                                <button className="btn btn-primary btn-lg open-form-btn" onClick={() => setShowQuoteForm(true)}>
                                                    Request a Quote
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Contact Popup */}
            <AnimatePresence>
                {showContactPopup && (
                    <>
                        <div className="contact-popup-backdrop" onClick={() => setShowContactPopup(false)} />
                        <motion.div
                            className="contact-popup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <a
                                href={contactPhones[0] ? `https://wa.me/${contactPhones[0].replace(/[^0-9]/g, '')}` : 'https://wa.me/'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="contact-popup-btn whatsapp"
                                onClick={() => setShowContactPopup(false)}
                            >
                                <FaWhatsapp />
                                <span>WhatsApp</span>
                            </a>
                            <a
                                href={contactPhones[1] ? `tel:${contactPhones[1].replace(/[^0-9+]/g, '')}` : 'tel:'}
                                className="contact-popup-btn phone"
                                onClick={() => setShowContactPopup(false)}
                            >
                                <FaPhone />
                                <span>Call Us</span>
                            </a>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <BottomNav
                actions={[
                    {
                        icon: <FaFilter />,
                        label: 'Filters',
                        onClick: () => setShowMobileFilters(true)
                    },
                    {
                        icon: <FaHeadset />,
                        label: 'Contact',
                        onClick: () => setShowContactPopup(prev => !prev)
                    }
                ]}
            />
        </div>
    );
};

export default ProductCatalog;
