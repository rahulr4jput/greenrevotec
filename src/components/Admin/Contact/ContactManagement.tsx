import React, { useState, useEffect } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaSave, FaPencilAlt, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ContactInfo {
    id: string;
    type: 'phone' | 'email' | 'address' | 'hours';
    title: string;
    lines: string[];
    color: string;
}

const DEFAULT_CONTACT: ContactInfo[] = [
    { id: '1', type: 'phone', title: 'Call Us', lines: ['+91 98765 43210', '+91 80001 12345'], color: '#25b565' },
    { id: '2', type: 'email', title: 'Email Us', lines: ['info@greenrevotec.com', 'support@greenrevotec.com'], color: '#f5a623' },
    { id: '3', type: 'address', title: 'Head Office', lines: ['Green Revotec HQ, GreenRevotec Park', 'Pune, Maharashtra 411001'], color: '#38bdf8' },
    { id: '4', type: 'hours', title: 'Business Hours', lines: ['Mon – Sat: 9:00 AM – 7:00 PM', 'Sun: 10:00 AM – 3:00 PM'], color: '#e879f9' },
];

interface InquiryType {
    id: string;
    label: string;
    value: string;
}

const DEFAULT_INQUIRY_TYPES: InquiryType[] = [
    { id: '1', label: 'General Inquiry', value: 'general' },
    { id: '2', label: 'Product Information', value: 'product' },
    { id: '3', label: 'Service Inquiry', value: 'service' },
    { id: '4', label: 'Distributorship', value: 'distribution' },
    { id: '5', label: 'Corporate Partnership', value: 'corporate' },
];

const ContactManagement: React.FC = () => {
    const [info, setInfo] = useState<ContactInfo[]>([]);
    const [inquiryTypes, setInquiryTypes] = useState<InquiryType[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ContactInfo | null>(null);

    // Form state
    const [lines, setLines] = useState<string[]>(['']);
    const [newInquiryLabel, setNewInquiryLabel] = useState('');

    const fetchContactConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_contact_config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setInfo(data.info || DEFAULT_CONTACT);
                    setInquiryTypes(data.inquiryTypes || DEFAULT_INQUIRY_TYPES);
                    localStorage.setItem('admin_contact_info', JSON.stringify(data.info || DEFAULT_CONTACT));
                    localStorage.setItem('admin_inquiry_types', JSON.stringify(data.inquiryTypes || DEFAULT_INQUIRY_TYPES));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch Contact config:", error);
        }

        // Fallback
        const storedInfo = localStorage.getItem('admin_contact_info');
        if (storedInfo) setInfo(JSON.parse(storedInfo));
        else setInfo(DEFAULT_CONTACT);

        const storedInquiries = localStorage.getItem('admin_inquiry_types');
        if (storedInquiries) setInquiryTypes(JSON.parse(storedInquiries));
        else setInquiryTypes(DEFAULT_INQUIRY_TYPES);
    };

    useEffect(() => {
        fetchContactConfig();
    }, []);

    const saveContactConfig = async (updatedData: { info?: ContactInfo[], inquiryTypes?: InquiryType[] }) => {
        const fullConfig = {
            info: updatedData.info || info,
            inquiryTypes: updatedData.inquiryTypes || inquiryTypes
        };

        try {
            const response = await fetch('/api/settings/admin_contact_config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: fullConfig })
            });

            if (response.ok) {
                if (updatedData.info) setInfo(updatedData.info);
                if (updatedData.inquiryTypes) setInquiryTypes(updatedData.inquiryTypes);
                localStorage.setItem('admin_contact_info', JSON.stringify(fullConfig.info));
                localStorage.setItem('admin_inquiry_types', JSON.stringify(fullConfig.inquiryTypes));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            console.error("Error saving Contact config:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        const updatedLines = lines.filter(l => l.trim() !== '');
        if (updatedLines.length === 0) {
            toast.error("At least one line of information is required.");
            return;
        }

        const updatedInfo = info.map(item =>
            item.id === editingItem.id ? { ...item, lines: updatedLines } : item
        );

        await saveContactConfig({ info: updatedInfo });
        toast.success(`${editingItem.title} updated successfully!`);
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const openEdit = (item: ContactInfo) => {
        setEditingItem(item);
        setLines(item.lines);
        setIsModalOpen(true);
    };

    const updateLine = (idx: number, val: string) => {
        const newLines = [...lines];
        newLines[idx] = val;
        setLines(newLines);
    };

    const addLine = () => setLines([...lines, '']);
    const removeLine = (idx: number) => {
        if (lines.length > 1) {
            setLines(lines.filter((_, i) => i !== idx));
        }
    };

    const handleAddInquiryType = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newInquiryLabel.trim()) return;

        const newValue = newInquiryLabel.trim().toLowerCase().replace(/\s+/g, '-');

        if (inquiryTypes.find(t => t.value === newValue)) {
            toast.error("This inquiry type already exists.");
            return;
        }

        const newType: InquiryType = {
            id: Date.now().toString(),
            label: newInquiryLabel.trim(),
            value: newValue
        };

        const updated = [...inquiryTypes, newType];
        await saveContactConfig({ inquiryTypes: updated });
        setNewInquiryLabel('');
        toast.success("Inquiry type added!");
    };

    const handleDeleteInquiryType = async (id: string) => {
        if (inquiryTypes.length <= 1) {
            toast.error("At least one inquiry type is required.");
            return;
        }
        const updated = inquiryTypes.filter(t => t.id !== id);
        await saveContactConfig({ inquiryTypes: updated });
        toast.info("Inquiry type removed.");
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'phone': return <FaPhone />;
            case 'email': return <FaEnvelope />;
            case 'address': return <FaMapMarkerAlt />;
            case 'hours': return <FaClock />;
            default: return <FaPhone />;
        }
    };

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="admin-page-header" style={{ marginBottom: '32px' }}>
                <h1 className="admin-page-title">Contact Us Management</h1>
                <p className="admin-page-subtitle">Update your business coordinates, contact numbers, and hours.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {info.map((item) => (
                    <div key={item.id} className="category-form-card" style={{ margin: 0, padding: '30px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '12px',
                                background: `${item.color}15`,
                                color: item.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem'
                            }}>
                                {getIcon(item.type)}
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>{item.title}</h3>
                        </div>

                        <div style={{ flexGrow: 1, marginBottom: '24px' }}>
                            {item.lines.map((line, idx) => (
                                <p key={idx} style={{ margin: '0 0 8px', color: '#4b5563', fontSize: '0.95rem' }}>{line}</p>
                            ))}
                        </div>

                        <button
                            className="btn-save"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                background: 'white',
                                color: item.color,
                                border: `1px solid ${item.color}33`,
                                boxShadow: 'none'
                            }}
                            onClick={() => openEdit(item)}
                        >
                            <FaPencilAlt /> Edit {item.title}
                        </button>
                    </div>
                ))}
            </div>

            <div className="admin-page-header" style={{ marginTop: '50px', marginBottom: '32px' }}>
                <h1 className="admin-page-title">Inquiry Types Management</h1>
                <p className="admin-page-subtitle">Add or remove inquiry categories for the public contact form.</p>
            </div>

            <div className="category-form-card" style={{ maxWidth: '800px' }}>
                <form onSubmit={handleAddInquiryType} style={{ display: 'flex', gap: '15px', marginBottom: '30px', padding: '24px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ flexGrow: 1 }}>
                        <input
                            type="text"
                            className="category-form-input"
                            style={{ marginBottom: 0 }}
                            value={newInquiryLabel}
                            onChange={(e) => setNewInquiryLabel(e.target.value)}
                            placeholder="e.g. Technical Support, Sales Inquiry..."
                            required
                        />
                    </div>
                    <button type="submit" className="btn-save" style={{ whiteSpace: 'nowrap' }}>
                        <FaPlus /> Add Type
                    </button>
                </form>

                <div style={{ padding: '0 24px 24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {inquiryTypes.map((type) => (
                            <div key={type.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 18px',
                                background: '#f9fafb',
                                borderRadius: '10px',
                                border: '1px solid #f3f4f6'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                                    <span style={{ fontWeight: 500, color: '#374151' }}>{type.label}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', background: '#fff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                                        value: {type.value}
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleDeleteInquiryType(type.id)}
                                    className="btn-icon delete"
                                    title="Delete Type"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isModalOpen && editingItem && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ maxWidth: '500px' }}>
                            <div className="modal-header">
                                <h3>Edit {editingItem.title}</h3>
                                <button className="btn-close" onClick={() => setIsModalOpen(false)}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSave} style={{ padding: '24px' }}>
                                <div className="category-form-group">
                                    <label>Information Lines</label>
                                    {lines.map((link, index) => (
                                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                            <input
                                                type="text"
                                                className="category-form-input"
                                                style={{ marginBottom: 0 }}
                                                value={link}
                                                onChange={(e) => updateLine(index, e.target.value)}
                                                placeholder={`Enter ${editingItem.title.toLowerCase()}...`}
                                                required
                                            />
                                            {lines.length > 1 && (
                                                <button type="button" className="btn-icon delete" onClick={() => removeLine(index)}><FaTimes /></button>
                                            )}
                                        </div>
                                    ))}
                                    <button type="button" onClick={addLine} style={{
                                        background: 'transparent',
                                        border: '1px dashed #d1d5db',
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        color: '#6b7280',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer'
                                    }}>
                                        + Add Another Line
                                    </button>
                                </div>

                                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save Changes</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContactManagement;
