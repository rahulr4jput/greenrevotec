import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLeaf, FaTint, FaSun, FaSeedling, FaFlask, FaTractor, FaMicroscope, FaSatellite, FaTree } from 'react-icons/fa';
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

const Gallery: React.FC = () => {
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [header, setHeader] = useState({
        label: "Our Gallery",
        title: "GreenRevotec in <span>Action</span>",
        subtitle: "A glimpse into our field operations, products, and the farmers we serve across India."
    });
    const [currentPage, setCurrentPage] = useState(0);
    const [totalActiveItems, setTotalActiveItems] = useState(0);

    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        const loadGallery = () => {
            const consolidated = localStorage.getItem('admin_gallery_config');
            if (consolidated) {
                const data = JSON.parse(consolidated);

                // Header
                if (data.header) setHeader(data.header);

                // Items
                if (data.items) {
                    const activeItems = data.items.filter((item: any) => item.isActive).map((item: any, idx: number) => ({
                        id: item.id,
                        title: item.caption || 'GreenRevotec Operations',
                        category: item.category,
                        image: item.image,
                        size: idx % 4 === 0 ? 'large' : (idx % 3 === 0 ? 'medium' : 'small'),
                        color: '#25b565'
                    }));

                    if (activeItems.length > 0) {
                        setGalleryItems(activeItems);
                        setTotalActiveItems(activeItems.length);
                    } else {
                        setGalleryItems(defaultGalleryItems);
                        setTotalActiveItems(defaultGalleryItems.length);
                    }
                }
            } else {
                // Fallback to legacy
                const stored = localStorage.getItem('admin_gallery');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    const activeItems = parsed.filter((item: any) => item.isActive).map((item: any, idx: number) => ({
                        id: item.id,
                        title: item.caption || 'GreenRevotec Operations',
                        category: item.category,
                        image: item.image,
                        size: idx % 4 === 0 ? 'large' : (idx % 3 === 0 ? 'medium' : 'small'),
                        color: '#25b565'
                    }));
                    if (activeItems.length > 0) {
                        setGalleryItems(activeItems);
                        setTotalActiveItems(activeItems.length);
                    }
                } else {
                    setGalleryItems(defaultGalleryItems);
                    setTotalActiveItems(defaultGalleryItems.length);
                }

                const storedHeader = localStorage.getItem('admin_gallery_header');
                if (storedHeader) setHeader(JSON.parse(storedHeader));
            }
        };

        loadGallery();
        window.addEventListener('storage', loadGallery);
        return () => window.removeEventListener('storage', loadGallery);
    }, []);

    const totalPages = Math.ceil(totalActiveItems / ITEMS_PER_PAGE);
    const paginatedItems = galleryItems.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    const handleNext = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const handlePrev = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

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
                    <p className="section-subtitle">
                        {header.subtitle}
                    </p>
                </motion.div>

                <div className="gallery-carousel-wrapper">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5 }}
                            className="gallery-masonry"
                        >
                            {paginatedItems.map((item, i) => {
                                const Icon = item.IconComponent;
                                return (
                                    <motion.div
                                        key={item.id}
                                        className={`gallery-item ${item.size}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.06, duration: 0.5 }}
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

                    {totalPages > 1 && (
                        <div className="gallery-controls">
                            <button className="gallery-control-btn prev" onClick={handlePrev} aria-label="Previous images">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <div className="gallery-dots">
                                {Array.from({ length: totalPages }).map((_, i) => (
                                    <button
                                        key={i}
                                        className={`gallery-dot ${currentPage === i ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i)}
                                    />
                                ))}
                            </div>
                            <button className="gallery-control-btn next" onClick={handleNext} aria-label="Next images">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default Gallery;
