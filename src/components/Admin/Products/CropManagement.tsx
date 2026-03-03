import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaSeedling, FaList, FaImage, FaTimes, FaLanguage } from 'react-icons/fa';
import '../AdminLayout.css';
import './ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Crop {
    id: string;
    name: string;
    imageUrl: string | null;
    language: string;
    linkedToId?: string | null;
    createdAt: string;
}

interface Language {
    id: string;
    name: string;
    script: string;
}

const CropManagement: React.FC = () => {
    const [crops, setCrops] = useState<Crop[]>([]);
    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [language, setLanguage] = useState('English');
    const [linkedToId, setLinkedToId] = useState<string | null>(null);
    const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(false);
    const [multilangEnabled, setMultilangEnabled] = useState<boolean>(() => {
        const v = localStorage.getItem('admin_multilang_enabled');
        return v === null ? false : v === 'true';
    });

    const fetchData = async () => {
        try {
            const [cropsRes, langsRes] = await Promise.all([
                fetch('/api/crops'),
                fetch('/api/languages')
            ]);

            if (cropsRes.ok) {
                const cropsData = await cropsRes.json();
                setCrops(cropsData);
            }

            if (langsRes.ok) {
                const langsData = await langsRes.json();
                setAvailableLanguages(langsData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load data');
        }
    };

    useEffect(() => {
        fetchData();
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'admin_multilang_enabled') setMultilangEnabled(e.newValue !== 'false');
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        if (file.size > 2 * 1024 * 1024) {
            toast.warning('Image is too large. Max size 2MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImageUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
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

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        setLinkedToId(null); // Reset link when language changes
        if (newLang !== 'English' && name && !validateScript(name, newLang)) {
            setName('');
        }
    };

    const handleAddCrop = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Crop name is required');
            return;
        }

        // Script Validation
        if (language !== 'English' && !validateScript(name, language)) {
            toast.error(`The crop name does not match the script for "${language}".`);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/crops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), imageUrl, language, linkedToId }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Crop "${name}" created successfully`);
                setName('');
                setImageUrl(null);
                setLanguage('English');
                setLinkedToId(null);
                fetchData();
            } else {
                toast.error(data.error || 'Failed to create crop');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCrop = async (id: string, cropName: string) => {
        if (!window.confirm(`Are you sure you want to delete crop "${cropName}"?`)) return;

        try {
            const response = await fetch(`/api/crops/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('Crop deleted');
                fetchData();
            } else {
                toast.error('Failed to delete crop');
            }
        } catch (error) {
            toast.error('Network error');
        }
    };

    return (
        <div className="admin-content-area">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="categories-container">
                <div className="categories-header">
                    <div>
                        <h3 style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '8px' }}>Crop Management</h3>
                        <p style={{ color: '#6b7280' }}>Manage crop names and images for product tagging.</p>
                    </div>
                </div>

                <div className="categories-grid">
                    {/* Add Crop Form */}
                    <div className="category-form-card">
                        <h4 className="category-form-title"><FaSeedling /> Add New Crop</h4>
                        <form onSubmit={handleAddCrop}>
                            {/* Language selection at the top */}
                            {multilangEnabled && (
                                <div className="category-form-group" style={{ background: '#f0f9ff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd', marginBottom: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontWeight: 'bold', fontSize: '13px' }}>
                                        <FaLanguage /> Entry Language
                                    </label>
                                    <select
                                        className="category-form-input"
                                        value={language}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        required
                                        style={{ marginBottom: 0, marginTop: '6px', fontSize: '13px', padding: '8px' }}
                                    >
                                        <option value="English">English</option>
                                        {availableLanguages.map(lang => (
                                            <option key={lang.id} value={lang.name}>{lang.name} ({lang.script})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Linked To English Entry - Only for non-English */}
                            {language !== 'English' && (
                                <div className="category-form-group" style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', border: '1px solid #fef3c7', marginBottom: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 'bold', fontSize: '13px' }}>
                                        Link to English Version
                                    </label>
                                    <select
                                        className="category-form-input"
                                        value={linkedToId || ''}
                                        onChange={(e) => setLinkedToId(e.target.value || null)}
                                        style={{ marginBottom: 0, marginTop: '6px', fontSize: '13px', padding: '8px' }}
                                    >
                                        <option value="">-- Optional: Select English Crop --</option>
                                        {crops.filter(c => c.language === 'English').map(englishCrop => (
                                            <option key={englishCrop.id} value={englishCrop.id}>{englishCrop.name}</option>
                                        ))}
                                    </select>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#d97706' }}>Connecting this translation to its English "Main" entry.</p>
                                </div>
                            )}

                            <div className="category-form-group">
                                <label>Crop Name *</label>
                                <input
                                    type="text"
                                    className="category-form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Wheat, Cotton, Rice"
                                    required
                                />
                            </div>
                            <div className="category-form-group">
                                <label>Crop Image (Optional)</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="category-form-input"
                                        onChange={handleImageUpload}
                                        style={{ padding: '8px' }}
                                    />
                                    {imageUrl && (
                                        <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                                            <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                            <button
                                                type="button"
                                                onClick={() => setImageUrl(null)}
                                                style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                <FaTimes size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Saving...' : <><FaPlus /> Add Crop</>}
                            </button>
                        </form>
                    </div>

                    {/* Crops Table */}
                    <div className="category-table-card">
                        <div className="category-table-header">
                            <h4 className="category-table-title">
                                <FaList /> Managed Crops
                            </h4>
                            <span className="category-badge">{crops.length} Total</span>
                        </div>
                        <div className="table-responsive">
                            <table className="custom-category-table">
                                <thead>
                                    <tr>
                                        <th>Image</th>
                                        <th>Crop Name</th>
                                        <th>Created Date</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {crops.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="empty-state">No crops found. Add one on the left.</td>
                                        </tr>
                                    ) : (
                                        crops.map((crop) => (
                                            <tr key={crop.id}>
                                                <td style={{ width: '80px' }}>
                                                    {crop.imageUrl ? (
                                                        <img src={crop.imageUrl} alt={crop.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                                            <FaImage />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="cat-name-cell">
                                                    <div style={{ fontWeight: '600' }}>{crop.name}</div>
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', color: '#374151', fontSize: '11px' }}>
                                                            {crop.language || 'English'}
                                                        </span>
                                                        {crop.linkedToId && (
                                                            <span style={{ background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #10b981', color: '#047857', fontSize: '11px' }}>
                                                                Linked to English
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="cat-date-cell">{new Date(crop.createdAt).toLocaleDateString()}</td>
                                                <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon delete"
                                                            title="Delete Crop"
                                                            onClick={() => handleDeleteCrop(crop.id, crop.name)}
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
            </div>
        </div>
    );
};

export default CropManagement;
