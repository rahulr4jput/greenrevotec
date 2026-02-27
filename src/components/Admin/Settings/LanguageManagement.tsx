import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaLanguage, FaList } from 'react-icons/fa';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Language {
    id: string;
    name: string;
    script: string;
    createdAt: string;
}

const LanguageManagement: React.FC = () => {
    const [languages, setLanguages] = useState<Language[]>([]);
    const [name, setName] = useState('');
    const [script, setScript] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchLanguages = async () => {
        try {
            const response = await fetch('/api/languages');
            const data = await response.json();
            if (response.ok) {
                setLanguages(data);
            }
        } catch (error) {
            console.error('Error fetching languages:', error);
            toast.error('Failed to load languages');
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    const handleAddLanguage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !script.trim()) {
            toast.error('Both name and script are required');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/languages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), script: script.trim() }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`Language "${name}" added successfully`);
                setName('');
                setScript('');
                fetchLanguages();
            } else {
                toast.error(data.error || 'Failed to add language');
            }
        } catch (error) {
            toast.error('Network error. Please try again.');
        }
    };

    const handleDeleteLanguage = async (id: string, langName: string) => {
        if (!window.confirm(`Are you sure you want to delete language "${langName}"?`)) return;

        try {
            const response = await fetch(`/api/languages/${id}`, { method: 'DELETE' });
            if (response.ok) {
                toast.success('Language deleted');
                fetchLanguages();
            } else {
                toast.error('Failed to delete language');
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
                        <h3 style={{ fontSize: '1.5rem', color: '#111827', marginBottom: '8px' }}>Language Settings</h3>
                        <p style={{ color: '#6b7280' }}>Define languages with English names and their native scripts.</p>
                    </div>
                </div>

                <div className="categories-grid">
                    {/* Add Language Form */}
                    <div className="category-form-card">
                        <h4 className="category-form-title"><FaLanguage /> Add New Language</h4>
                        <form onSubmit={handleAddLanguage}>
                            <div className="category-form-group">
                                <label>Language Name (English) *</label>
                                <input
                                    type="text"
                                    className="category-form-input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Hindi, Spanish, French"
                                    required
                                />
                            </div>
                            <div className="category-form-group">
                                <label>Native Script *</label>
                                <input
                                    type="text"
                                    className="category-form-input"
                                    value={script}
                                    onChange={(e) => setScript(e.target.value)}
                                    placeholder="e.g., हिन्दी, Español, Français"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-save" disabled={loading}>
                                {loading ? 'Saving...' : <><FaPlus /> Add Language</>}
                            </button>
                        </form>
                    </div>

                    {/* Languages Table */}
                    <div className="category-table-card">
                        <div className="category-table-header">
                            <h4 className="category-table-title">
                                <FaList /> Supported Languages
                            </h4>
                            <span className="category-badge">{languages.length} Total</span>
                        </div>
                        <div className="table-responsive">
                            <table className="custom-category-table">
                                <thead>
                                    <tr>
                                        <th>Name (English)</th>
                                        <th>Native Script</th>
                                        <th>Created Date</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {languages.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="empty-state">No languages found.</td>
                                        </tr>
                                    ) : (
                                        languages.map((lang) => (
                                            <tr key={lang.id}>
                                                <td className="cat-name-cell">{lang.name}</td>
                                                <td className="cat-desc-cell">{lang.script}</td>
                                                <td className="cat-date-cell">{new Date(lang.createdAt).toLocaleDateString()}</td>
                                                <td style={{ display: 'flex', justifyContent: 'center' }}>
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-icon delete"
                                                            title="Delete Language"
                                                            onClick={() => handleDeleteLanguage(lang.id, lang.name)}
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

export default LanguageManagement;
