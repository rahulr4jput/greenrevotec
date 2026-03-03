import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaTag, FaList, FaLanguage, FaPencilAlt, FaTimes } from 'react-icons/fa';
import '../AdminLayout.css';
import './ProductCategories.css'; // Add new custom styling
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { products } from '../../Products/Products';

interface Category {
    id: string;
    name: string;
    description: string;
    language: string;
    linkedToId?: string | null;
    createdAt: string;
}

interface Language {
    id: string;
    name: string;
    script: string;
}


const ProductCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDesc, setNewCategoryDesc] = useState('');
    const [language, setLanguage] = useState('English');
    const [linkedToId, setLinkedToId] = useState<string | null>(null);
    const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [multilangEnabled, setMultilangEnabled] = useState<boolean>(() => {
        const v = localStorage.getItem('admin_multilang_enabled');
        return v === null ? false : v === 'true';
    });

    useEffect(() => {
        fetchData();
        const onStorage = (e: StorageEvent) => {
            if (e.key === 'admin_multilang_enabled') setMultilangEnabled(e.newValue !== 'false');
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const fetchData = async () => {
        try {
            // Load Categories from DB
            const catRes = await fetch('/api/categories');
            const catData = await catRes.json();
            if (catRes.ok) {
                setCategories(catData);
            }

            // Load Languages
            const langRes = await fetch('/api/languages');
            const langData = await langRes.json();
            if (langRes.ok) {
                setAvailableLanguages(langData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load categories');
            setCategories([]);
        }
    };

    const validateScript = (text: string, langName: string) => {
        if (!text || langName === 'English') return true;
        const langObj = availableLanguages.find(l => l.name === langName);
        if (!langObj) return true;

        const sampleText = langObj.script.replace(/[0-9\s]/g, '');
        if (!sampleText) return true;

        const sampleCode = sampleText.charCodeAt(0);
        if (sampleCode >= 0x0900 && sampleCode <= 0x097F) { // Devanagari
            const devanagariRegex = /[\u0900-\u097F]/;
            return devanagariRegex.test(text);
        }
        if (sampleCode >= 0x0600 && sampleCode <= 0x06FF) { // Arabic
            const arabicRegex = /[\u0600-\u06FF]/;
            return arabicRegex.test(text);
        }
        return true;
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategoryId(category.id);
        setNewCategoryName(category.name);
        setNewCategoryDesc(category.description);
        setLanguage(category.language || 'English');
        setLinkedToId(category.linkedToId || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingCategoryId(null);
        setNewCategoryName('');
        setNewCategoryDesc('');
        setLanguage('English');
        setLinkedToId(null);
    };

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        setLinkedToId(null);
        if (newLang !== 'English' && newCategoryName && !validateScript(newCategoryName, newLang)) {
            setNewCategoryName('');
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            toast.error('Category name is required.');
            return;
        }

        if (categories.some(c => c.id !== editingCategoryId && c.name.toLowerCase() === newCategoryName.trim().toLowerCase() && c.language === language)) {
            toast.error(`A category with this name already exists in ${language}.`);
            return;
        }

        // Script Validation
        if (language !== 'English' && !validateScript(newCategoryName, language)) {
            toast.error(`The category name does not match the script for "${language}".`);
            return;
        }

        const payload = {
            id: editingCategoryId || undefined,
            name: newCategoryName.trim(),
            description: newCategoryDesc.trim(),
            language,
            linkedToId
        };

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(editingCategoryId ? 'Category updated' : 'Category added');
                handleCancelEdit();
                fetchData();
            } else {
                toast.error('Failed to save category');
            }
        } catch (error) {
            toast.error('Server error while saving');
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        // Prevent deletion if category is currently linked to any product
        const storedProductsStr = localStorage.getItem('product_list');
        const currentProducts = storedProductsStr ? JSON.parse(storedProductsStr) : products;
        const isLinkedToProduct = currentProducts.some((product: { category: string }) => product.category.toLowerCase() === name.toLowerCase());

        if (isLinkedToProduct) {
            toast.error(`Cannot delete category "${name}" because it is currently linked to one or more products.`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete the category "${name}"?`)) {
            try {
                const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    toast.success('Category deleted.');
                    fetchData();
                } else {
                    toast.error('Failed to delete category');
                }
            } catch (error) {
                toast.error('Server error while deleting');
            }
        }
    };

    return (
        <div className="admin-content-area">
            <ToastContainer position="top-right" autoClose={3000} />
            <div className="categories-container">
                <div className="categories-header">
                    <div>
                        <h3 style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '8px' }}>Product Categories</h3>
                        <p style={{ color: '#6b7280' }}>Manage the categories used to filter products on the homepage.</p>
                    </div>
                </div>

                <div className="categories-grid">
                    {/* Add Category Form */}
                    <div className="category-form-card">
                        <h4 className="category-form-title">
                            {editingCategoryId ? <><FaPencilAlt /> Edit Category</> : <><FaTag /> Add New Category</>}
                        </h4>
                        <form onSubmit={handleAddCategory}>
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
                                        <option value="">-- Optional: Select English Category --</option>
                                        {categories.filter(c => c.language === 'English').map(englishCat => (
                                            <option key={englishCat.id} value={englishCat.id}>{englishCat.name}</option>
                                        ))}
                                    </select>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#d97706' }}>Connecting this translation to its English "Main" entry.</p>
                                </div>
                            )}

                            <div className="category-form-group">
                                <label>Category Name *</label>
                                <input
                                    type="text"
                                    className="category-form-input"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g., Smart Tractors"
                                    required
                                />
                            </div>
                            <div className="category-form-group">
                                <label>Description (Optional)</label>
                                <input
                                    type="text"
                                    className="category-form-input"
                                    value={newCategoryDesc}
                                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                                    placeholder="Brief description..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn-save" style={{ flex: 1 }}>
                                    {editingCategoryId ? <><FaPencilAlt /> Update Category</> : <><FaPlus /> Add Category</>}
                                </button>
                                {editingCategoryId && (
                                    <button type="button" className="btn-cancel" onClick={handleCancelEdit} style={{ background: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaTimes /> Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Categories Table */}
                    <div className="category-table-card">
                        <div className="category-table-header">
                            <h4 className="category-table-title">
                                <FaList /> Existing Categories
                            </h4>
                            <span className="category-badge">{categories.length} Total</span>
                        </div>
                        <div className="table-responsive">
                            <table className="custom-category-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Created Date</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="empty-state">No categories found.</td>
                                        </tr>
                                    ) : (
                                        categories.map((category) => (
                                            <tr key={category.id}>
                                                <td className="cat-name-cell">
                                                    <div style={{ fontWeight: '600' }}>{category.name}</div>
                                                    <div style={{ marginTop: '4px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        <span style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', color: '#374151', fontSize: '11px' }}>
                                                            {category.language || 'English'}
                                                        </span>
                                                        {category.linkedToId && (
                                                            <span style={{ background: '#ecfdf5', padding: '2px 6px', borderRadius: '4px', border: '1px solid #10b981', color: '#047857', fontSize: '11px' }}>
                                                                Linked to English
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="cat-desc-cell">{category.description || '-'}</td>
                                                <td className="cat-date-cell">{new Date(category.createdAt).toLocaleDateString()}</td>
                                                <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon edit"
                                                            title="Edit Category"
                                                            onClick={() => handleEditCategory(category)}
                                                            style={{ color: '#0ea5e9', marginRight: '8px' }}
                                                        >
                                                            <FaPencilAlt />
                                                        </button>
                                                        <button
                                                            className="btn-icon delete"
                                                            title="Delete Category"
                                                            onClick={() => handleDeleteCategory(category.id, category.name)}
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

export default ProductCategories;
