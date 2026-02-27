import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
    FaLeaf, FaFlask, FaTint, FaBug, FaSeedling,
    FaMicrochip, FaArrowRight, FaStar, FaTimes, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import type { IconType } from 'react-icons';
import './Products.css';

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0
    }),
    center: {
        x: 0,
        opacity: 1
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -50 : 50,
        opacity: 0
    })
};


export interface Product {
    id: number;
    name: string;
    category: string;
    description: string;
    images: string[];
    badge: string;
    badgeColor: string;
    IconComponent: IconType | string;
    iconColor: string;
    rating: number;
    reviews: number;
    features: string[];
    sku?: string;
    mrp?: number;
    salePrice?: number;
    manufacturer?: string;
    mfrPartNumber?: string;
    unitCount?: string;
    weight?: string;
    unit?: string;
    showPricing?: boolean;
    bulletPoints?: string[];
    applicableCrops?: string[];
    isActive?: boolean;
}

export const products: Product[] = [];

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
};

const Products: React.FC = () => {
    const [categories, setCategories] = React.useState<{ id: string, name: string }[]>([]);
    const [productList, setProductList] = React.useState<typeof products>([]);
    const [activeCategory, setActiveCategory] = React.useState('All');
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    // Modal State
    const [selectedProduct, setSelectedProduct] = React.useState<typeof products[0] | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const [slideDirection, setSlideDirection] = React.useState(0);
    const [showQuoteForm, setShowQuoteForm] = React.useState(false);

    // Form State
    const [form, setForm] = React.useState({ name: '', email: '', phone: '', message: '' });
    const [submitted, setSubmitted] = React.useState(false);

    const iconMap: Record<string, IconType> = { FaLeaf, FaFlask, FaTint, FaBug, FaSeedling, FaMicrochip };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories
                const catRes = await fetch('/api/categories');
                if (catRes.ok) {
                    const cats = await catRes.json();
                    setCategories([{ id: 'all', name: 'All' }, ...cats]);
                }

                // Fetch Products
                const prodRes = await fetch('/api/products');
                if (prodRes.ok) {
                    const prods = await prodRes.json();
                    setProductList(prods.filter((p: any) => p.isActive !== false && p.status !== 'draft'));
                }
            } catch (error) {
                console.error('Error fetching homepage products:', error);
            }
        };

        fetchData();

        // Polling or storage event if needed, but direct API is better for real-time
        const interval = setInterval(fetchData, 30000); // Optional: check every 30s
        return () => clearInterval(interval);
    }, []);

    const filtered = activeCategory === 'All'
        ? productList
        : productList.filter(p => p.category === activeCategory);

    const openModal = (product: typeof products[0]) => {
        setSelectedProduct(product);
        setCurrentImageIndex(0);
        setShowQuoteForm(false);
        setSubmitted(false);
        setForm({ name: '', email: '', phone: '', message: '' });
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModal = () => {
        setSelectedProduct(null);
        document.body.style.overflow = 'auto';
    };

    const nextImage = () => {
        if (selectedProduct) {
            setSlideDirection(1);
            setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
        }
    };

    const prevImage = () => {
        if (selectedProduct) {
            setSlideDirection(-1);
            setCurrentImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleQuoteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    subject: `Quote Request for ${selectedProduct.name}`,
                    productName: selectedProduct.name,
                    type: 'Quote',
                    source: 'Homepage Product Modal'
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

    return (
        <section className="section section-dark products" id="products">
            <div className="container">
                <motion.div
                    className="section-header centered"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="section-label">Our Products</div>
                    <h2 className="section-title">
                        Premium <span>Agricultural Products</span>
                    </h2>
                    <p className="section-subtitle">
                        Scientifically formulated products designed for India's diverse farming conditions
                        to maximize yield, minimize cost, and protect the environment.
                    </p>
                </motion.div>

                {/* Category Filter */}
                <motion.div
                    className="product-filter"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={`filter-btn ${activeCategory === cat.name ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.name)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </motion.div>

                {/* Products Grid */}
                <motion.div
                    ref={ref}
                    className="products-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                >
                    {filtered.length === 0 ? (
                        <div className="empty-category-state" style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '60px 20px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            border: '1px dashed rgba(255,255,255,0.2)'
                        }}>
                            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '12px' }}>
                                Products Coming Soon
                            </h3>
                            <p style={{ color: '#9ca3af', fontSize: '1.1rem' }}>
                                We are currently updating our catalog for <strong>{activeCategory}</strong>. Please check back later!
                            </p>
                        </div>
                    ) : (
                        filtered.map((product) => {
                            const Icon = typeof product.IconComponent === 'string' ? iconMap[product.IconComponent] || FaLeaf : product.IconComponent || FaLeaf;
                            return (
                                <motion.div
                                    key={product.id}
                                    variants={itemVariants}
                                    className="product-card glass-card"
                                    layout
                                >
                                    {/* Image Header */}
                                    <div className="product-image-wrap">
                                        <img src={product.images[0]} alt={product.name} className="product-image" loading="lazy" />
                                        {/* Badge overlays image */}
                                        <div
                                            className="product-badge"
                                            style={{ background: `${product.badgeColor}E6`, color: '#fff', border: `1px solid ${product.badgeColor}` }}
                                        >
                                            {product.badge}
                                        </div>
                                        <div className="img-overlay"></div>
                                    </div>

                                    {/* Content Body */}
                                    <div className="product-content">
                                        {/* Icon overlapping image and body */}
                                        <div
                                            className="product-icon"
                                            style={{ color: product.iconColor, background: `${product.iconColor}18` }}
                                        >
                                            <Icon />
                                        </div>

                                        {/* Info */}
                                        <h3 className="product-name">{product.name}</h3>
                                        <p className="product-category">{product.category}</p>

                                        {/* Meta Row */}
                                        <div className="product-meta-row">
                                            {product.sku && <span className="product-meta-item"><strong>SKU:</strong> {product.sku}</span>}
                                            {product.weight && <span className="product-meta-item"><strong>Weight:</strong> {product.weight}{product.unit || 'Kg'}</span>}
                                        </div>

                                        {/* Applicable Crops */}
                                        <div className="card-applicable-crops">
                                            <p className="crops-label">Applicable Crops:</p>
                                            <div className="crops-list">
                                                {product.applicableCrops?.map(crop => (
                                                    <span key={crop} className="crop-tag">{crop}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pricing Block */}
                                        {product.showPricing !== false && (
                                            <div className="product-price-row" style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary-light)' }}>
                                                    ₹{product.salePrice?.toLocaleString()}
                                                </span>
                                                {product.mrp && (
                                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', marginLeft: '8px' }}>
                                                        ₹{product.mrp.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <button className="product-cta" onClick={() => openModal(product)}>
                                            Get Quote <FaArrowRight />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        }))}
                </motion.div>

                <motion.div
                    className="view-all-products"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginTop: '60px' }}
                >
                    <Link to="/products" className="btn btn-outline btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        Show All Products <FaArrowRight />
                    </Link>
                </motion.div>
            </div>

            {/* Quick View Modal */}
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
                                                <div className="form-group">
                                                    <label>Full Name *</label>
                                                    <input type="text" name="name" value={form.name} onChange={handleFormChange} required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Phone Number *</label>
                                                    <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Email Address</label>
                                                    <input type="email" name="email" value={form.email} onChange={handleFormChange} />
                                                </div>
                                                <div className="form-group">
                                                    <label>Requirements</label>
                                                    <textarea name="message" value={form.message} onChange={handleFormChange} rows={3} placeholder="Quantity, delivery location, etc." />
                                                </div>
                                                <button type="submit" className="btn btn-primary submit-quote-btn">Submit Request</button>
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
                                                <span className="rating-count">({selectedProduct.reviews.toLocaleString()} reviews)</span>
                                            </div>

                                            <div className="modal-divider" />

                                            <p className="modal-desc">{selectedProduct.description}</p>

                                            <div className="modal-meta-grid">
                                                {selectedProduct.sku && (
                                                    <div className="meta-item">
                                                        <span className="meta-label">SKU</span>
                                                        <span className="meta-value">{selectedProduct.sku}</span>
                                                    </div>
                                                )}
                                                {selectedProduct.manufacturer && (
                                                    <div className="meta-item">
                                                        <span className="meta-label">Manufacturer</span>
                                                        <span className="meta-value">{selectedProduct.manufacturer}</span>
                                                    </div>
                                                )}
                                                {selectedProduct.mfrPartNumber && (
                                                    <div className="meta-item">
                                                        <span className="meta-label">Part Number</span>
                                                        <span className="meta-value">{selectedProduct.mfrPartNumber}</span>
                                                    </div>
                                                )}
                                                {selectedProduct.unitCount && (
                                                    <div className="meta-item">
                                                        <span className="meta-label">Unit Count</span>
                                                        <span className="meta-value">{selectedProduct.unitCount}</span>
                                                    </div>
                                                )}
                                                {selectedProduct.weight && (
                                                    <div className="meta-item">
                                                        <span className="meta-label">Weight</span>
                                                        <span className="meta-value">{selectedProduct.weight}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="modal-features">
                                                <h4>Key Features & Bullet Points</h4>
                                                <ul>
                                                    {(selectedProduct.bulletPoints && selectedProduct.bulletPoints.length > 0
                                                        ? selectedProduct.bulletPoints
                                                        : selectedProduct.features
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
        </section>
    );
};

export default Products;
