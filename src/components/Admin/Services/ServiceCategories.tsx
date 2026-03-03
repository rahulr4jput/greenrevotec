import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaTag, FaList, FaPencilAlt, FaTimes, FaCogs } from 'react-icons/fa';
import '../AdminLayout.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ServiceCategory {
    id: string;
    name: string;
    description: string;
    createdAt: string;
}

const ServiceCategories: React.FC = () => {
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/service-categories');
            if (res.ok) {
                setCategories(await res.json());
            } else {
                toast.error('Failed to load categories');
            }
        } catch {
            toast.error('Network error while loading categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { toast.error('Category name is required.'); return; }

        try {
            if (editingId) {
                // Update existing
                const res = await fetch(`/api/service-categories/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name.trim(), description: description.trim() })
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Category updated!');
                    fetchCategories();
                } else {
                    toast.error(data.error || 'Failed to update category');
                }
            } else {
                // Create new
                const res = await fetch('/api/service-categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: name.trim(), description: description.trim() })
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success('Category added!');
                    fetchCategories();
                } else {
                    toast.error(data.error || 'Failed to add category');
                }
            }
        } catch {
            toast.error('Network error. Please try again.');
        }
        handleCancel();
    };

    const handleEdit = (cat: ServiceCategory) => {
        setEditingId(cat.id);
        setName(cat.name);
        setDescription(cat.description || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setName('');
        setDescription('');
    };

    const handleDelete = async (id: string, catName: string) => {
        if (!window.confirm(`Delete category "${catName}"?`)) return;
        try {
            const res = await fetch(`/api/service-categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Category deleted.');
                fetchCategories();
            } else {
                toast.error('Failed to delete category');
            }
        } catch {
            toast.error('Network error. Please try again.');
        }
    };

    return (
        <div className="admin-content-area">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid #e8ecf0' }}>
                <div style={{ width: '44px', height: '44px', background: '#dcfce7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontSize: '1.2rem' }}>
                    <FaCogs />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Service Categories</h2>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Manage categories to organise your services</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px', alignItems: 'start' }}>

                {/* Form */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '22px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 18px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                        <FaTag style={{ color: '#16a34a' }} />
                        {editingId ? 'Edit Category' : 'Add New Category'}
                    </h4>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Category Name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g., Crop Advisory"
                                style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 14px', fontSize: '0.95rem', outline: 'none', color: '#111827', background: '#fff' }}
                                required
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Description <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional)</span></label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Brief description of this category..."
                                rows={3}
                                style={{ border: '1px solid #d1d5db', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', outline: 'none', resize: 'vertical', color: '#111827', background: '#fff', fontFamily: 'inherit' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                            <button type="submit" style={{ flex: 1, background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                                {editingId ? <><FaPencilAlt /> Update</> : <><FaPlus /> Add Category</>}
                            </button>
                            {editingId && (
                                <button type="button" onClick={handleCancel} style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 16px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <FaTimes /> Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0, display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <FaList style={{ color: '#16a34a' }} /> All Categories
                        </h4>
                        <span style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', fontSize: '0.78rem', fontWeight: 600, padding: '3px 10px', borderRadius: '50px' }}>
                            {categories.length} Total
                        </span>
                    </div>
                    {isLoading ? (
                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>Loading...</p>
                    ) : categories.length === 0 ? (
                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>No categories yet. Add your first one!</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Name</th>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Description</th>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Created</th>
                                    <th style={{ textAlign: 'center', padding: '10px 12px', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map(cat => (
                                    <tr key={cat.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                                        <td style={{ padding: '12px', fontWeight: 600, color: '#111827' }}>{cat.name}</td>
                                        <td style={{ padding: '12px', color: '#6b7280' }}>{cat.description || '—'}</td>
                                        <td style={{ padding: '12px', color: '#9ca3af', fontSize: '0.82rem' }}>
                                            {new Date(cat.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '12px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                                <button onClick={() => handleEdit(cat)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FaPencilAlt />
                                                </button>
                                                <button onClick={() => handleDelete(cat.id, cat.name)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceCategories;
