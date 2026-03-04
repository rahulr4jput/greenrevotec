import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaTint, FaSun, FaSeedling, FaFlask, FaTractor, FaMicroscope, FaSatellite, FaTree, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import type { IconType } from 'react-icons';
import './Gallery.css';

interface GalleryItem {
    id: string | number;
    title: string;
    category: string;
    color?: string;
    IconComponent?: IconType;
    image?: string;
    size: string;
}

const defaultGalleryItems: GalleryItem[] = [
    { id: 1, title: 'Paddy Farm Drone Survey', category: 'Precision Farming', color: '#25b565', IconComponent: FaSatellite as IconType, size: 'large' },
    { id: 2, title: 'Organic Compost Unit', category: 'Organic Farming', color: '#84cc16', IconComponent: FaLeaf as IconType, size: 'small' },
    { id: 3, title: 'Drip Irrigation Wheat', category: 'Irrigation', color: '#38bdf8', IconComponent: FaTint as IconType, size: 'small' },
    { id: 4, title: 'Lab Soil Analysis', category: 'Soil Science', color: '#f5a623', IconComponent: FaMicroscope as IconType, size: 'medium' },
    { id: 5, title: 'Green House Farming', category: 'Protected Cultivation', color: '#25b565', IconComponent: FaTree as IconType, size: 'medium' },
    { id: 6, title: 'Fertilizer Blending Plant', category: 'Manufacturing', color: '#e879f9', IconComponent: FaFlask as IconType, size: 'small' },
    { id: 7, title: 'Solar Powered Irrigation', category: 'Smart Irrigation', color: '#fbbf24', IconComponent: FaSun as IconType, size: 'small' },
    { id: 8, title: 'Tractor Fleet Operations', category: 'Mechanization', color: '#f97316', IconComponent: FaTractor as IconType, size: 'large' },
    { id: 9, title: 'Nursery & Seedling Center', category: 'Horticulture', color: '#84cc16', IconComponent: FaSeedling as IconType, size: 'medium' },
];

const mapItems = (raw: any[]): GalleryItem[] =>
    raw.filter((item: any) => item.isActive).map((item: any, idx: number) => ({
        id: item.id,
        title: item.caption || 'GreenRevotec Operations',
        category: item.category,
        image: item.image,
        size: idx % 4 === 0 ? 'large' : (idx % 3 === 0 ? 'medium' : 'small'),
        color: '#25b565'
    }));

const Gallery: React.FC = () => {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [header, setHeader] = useState({
        label: "Our Gallery",
        title: "GreenRevotec in <span>Action</span>",
        subtitle: "A glimpse into our field operations, products, and the farmers we serve across India."
    });
    const [currentPage, setCurrentPage] = useState(0);

    // Show max 7 images per page — triggers carousel when > 7 images
    const ITEMS_PER_PAGE = 7;

    useEffect(() => {
        const loadGallery = async () => {
            // 1. Fetch from API first (source of truth on AWS)
            try {
                const res = await fetch('/api/settings/admin_gallery_config');
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        if (data.header) setHeader(data.header);
                        if (data.items) {
                            const active = mapItems(data.items);
                            if (active.length > 0) {
                                setGalleryItems(active);
                                setCurrentPage(0);
                                localStorage.setItem('admin_gallery_config', JSON.stringify(data));
                                return;
                            }
                        }
                    }
                }
            } catch { }

            // 2. localStorage fallback (consolidated)
            const consolidated = localStorage.getItem('admin_gallery_config');
            if (consolidated) {
                const data = JSON.parse(consolidated);
                if (data.header) setHeader(data.header);
                if (data.items) {
                    const active = mapItems(data.items);
                    if (active.length > 0) { setGalleryItems(active); setCurrentPage(0); return; }
                }
            }

            // 3. Legacy localStorage
            const stored = localStorage.getItem('admin_gallery');
            if (stored) {
                const active = mapItems(JSON.parse(stored));
                if (active.length > 0) { setGalleryItems(active); setCurrentPage(0); return; }
            }
            const storedHeader = localStorage.getItem('admin_gallery_header');
            if (storedHeader) setHeader(JSON.parse(storedHeader));

            // 4. Default items
            setGalleryItems(defaultGalleryItems);
            setCurrentPage(0);
        };

        loadGallery();
        window.addEventListener('storage', loadGallery);
        return () => window.removeEventListener('storage', loadGallery);
    }, []);

    const totalPages = Math.ceil(galleryItems.length / ITEMS_PER_PAGE);
    const paginatedItems = galleryItems.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    const handleNext = () => setCurrentPage((prev) => (prev + 1) % totalPages);
    const handlePrev = () => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);

    return (
        <section className="section gallery" id="gallery">
            <div className="container">
                <motion.div
                    className="section-header centered"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="section-label">{header.label}</div>
                    <h2 className="section-title" dangerouslySetInnerHTML={{ __html: header.title }}></h2>
                    <p className="section-subtitle">{header.subtitle}</p>
                </motion.div>

                <div className="gallery-carousel-wrapper">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.4, ease: 'easeInOut' }}
                            className="gallery-masonry"
                        >
                            {paginatedItems.map((item, i) => {
                                const Icon = item.IconComponent;
                                return (
                                    <motion.div
                                        key={item.id}
                                        className={`gallery-item ${item.size}`}
                                        initial={{ opacity: 0, scale: 0.92 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.05, duration: 0.4 }}
                                        whileHover={{ scale: 1.02 }}
                                    >
                                        {item.image ? (
                                            <div className="gallery-bg" style={{ border: 'none' }}>
                                                <img src={item.image} alt={item.title} className="gallery-img-bg" />
                                                <div className="gallery-circle-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
                                            </div>
                                        ) : (
                                            <div
                                                className="gallery-bg"
                                                style={{
                                                    background: `linear-gradient(135deg, ${item.color}33 0%, rgba(0,0,0,0.8) 100%)`,
                                                    borderColor: `${item.color}33`,
                                                }}
                                            >
                                                {Icon && (
                                                    <div className="gallery-icon" style={{ color: item.color }}>
                                                        <Icon />
                                                    </div>
                                                )}
                                                <div className="gallery-circle-1" style={{ background: `${item.color}15` }} />
                                                <div className="gallery-circle-2" style={{ background: `${item.color}08` }} />
                                            </div>
                                        )}
                                        <div className="gallery-overlay">
                                            <span className="gallery-category">{item.category}</span>
                                            <h4 className="gallery-title">{item.title}</h4>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>

                    {/* Carousel controls — only shown when multiple pages */}
                    {totalPages > 1 && (
                        <div className="gallery-controls">
                            <button
                                className="gallery-control-btn"
                                onClick={handlePrev}
                                aria-label="Previous page"
                            >
                                <FaChevronLeft />
                            </button>

                            <div className="gallery-dots">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        className={`gallery-dot ${currentPage === i ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i)}
                                        aria-label={`Go to page ${i + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                className="gallery-control-btn"
                                onClick={handleNext}
                                aria-label="Next page"
                            >
                                <FaChevronRight />
                            </button>
                        </div>
                    )}

                    {/* Page counter */}
                    {totalPages > 1 && (
                        <p className="gallery-page-indicator">
                            Page {currentPage + 1} of {totalPages}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Gallery;
