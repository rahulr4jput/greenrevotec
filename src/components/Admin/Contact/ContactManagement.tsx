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

interface Office {
    id: string;
    type: 'Branch Office' | 'Corporate Office';
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    pinCode: string;
    phone1: string;
    phone2: string;
    email: string;
}

const DEFAULT_CONTACT: ContactInfo[] = [
    { id: '1', type: 'phone', title: 'Call Us', lines: ['+91 94548 80810'], color: '#25b565' },
    { id: '2', type: 'email', title: 'Email Us', lines: ['info@greenrevotec.com', 'support@greenrevotec.com'], color: '#f5a623' },
    { id: '3', type: 'address', title: 'Head Office', lines: ['Green Revotec HQ', '26, Bsnl Exchange Road', 'Chhibramau, Kannauj, Uttar Pradesh- 209721'], color: '#38bdf8' },
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

const DEFAULT_OFFICES: Office[] = [
    {
        id: '1772358184949',
        type: 'Branch Office',
        addressLine1: 'A-81, Ekta Enclave',
        addressLine2: 'Paschim Vihar',
        city: 'New Delhi',
        state: 'Delhi',
        pinCode: '110087',
        phone1: '+918849226427',
        phone2: '',
        email: 'info@greenrevotec.com',
    },
];

const ContactManagement: React.FC = () => {
    const [info, setInfo] = useState<ContactInfo[]>([]);
    const [inquiryTypes, setInquiryTypes] = useState<InquiryType[]>([]);
    const [offices, setOffices] = useState<Office[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ContactInfo | null>(null);
    const [editingOffice, setEditingOffice] = useState<Office | null>(null);

    // Form state for basic info
    const [lines, setLines] = useState<string[]>(['']);

    // Form state for inquiry types
    const [newInquiryLabel, setNewInquiryLabel] = useState('');

    // Form state for offices
    const [officeForm, setOfficeForm] = useState<Partial<Office>>({
        type: 'Branch Office',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pinCode: '',
        phone1: '',
        phone2: '',
        email: ''
    });

    const fetchContactConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_contact_config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setInfo(data.info || DEFAULT_CONTACT);
                    setInquiryTypes(data.inquiryTypes || DEFAULT_INQUIRY_TYPES);
                    setOffices(data.offices || []);
                    localStorage.setItem('admin_contact_info', JSON.stringify(data.info || DEFAULT_CONTACT));
                    localStorage.setItem('admin_inquiry_types', JSON.stringify(data.inquiryTypes || DEFAULT_INQUIRY_TYPES));
                    localStorage.setItem('admin_offices', JSON.stringify(data.offices || []));
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

        const storedOffices = localStorage.getItem('admin_offices');
        if (storedOffices) setOffices(JSON.parse(storedOffices));
        else setOffices(DEFAULT_OFFICES);
    };

    useEffect(() => {
        fetchContactConfig();
    }, []);

    const saveContactConfig = async (updatedData: { info?: ContactInfo[], inquiryTypes?: InquiryType[], offices?: Office[] }) => {
        const fullConfig = {
            info: updatedData.info || info,
            inquiryTypes: updatedData.inquiryTypes || inquiryTypes,
            offices: updatedData.offices || offices
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
                if (updatedData.offices) setOffices(updatedData.offices);
                localStorage.setItem('admin_contact_info', JSON.stringify(fullConfig.info));
                localStorage.setItem('admin_inquiry_types', JSON.stringify(fullConfig.inquiryTypes));
                localStorage.setItem('admin_offices', JSON.stringify(fullConfig.offices));
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

    const handleOfficeEdit = (office: Office) => {
        setEditingOffice(office);
        setOfficeForm(office);
        setIsOfficeModalOpen(true);
    };

    const handleAddOffice = () => {
        setEditingOffice(null);
        setOfficeForm({
            type: 'Branch Office',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pinCode: '',
            phone1: '',
            phone2: '',
            email: ''
        });
        setIsOfficeModalOpen(true);
    };

    const handleSaveOffice = async (e: React.FormEvent) => {
        e.preventDefault();

        const newOffice = {
            ...officeForm,
            id: editingOffice ? editingOffice.id : Date.now().toString()
        } as Office;

        let updatedOffices;
        if (editingOffice) {
            updatedOffices = offices.map(o => o.id === editingOffice.id ? newOffice : o);
        } else {
            updatedOffices = [...offices, newOffice];
        }

        await saveContactConfig({ offices: updatedOffices });
        toast.success(`Office ${editingOffice ? 'updated' : 'added'} successfully!`);
        setIsOfficeModalOpen(false);
        setEditingOffice(null);
    };

    const handleDeleteOffice = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this office?")) {
            const updated = offices.filter(o => o.id !== id);
            await saveContactConfig({ offices: updated });
            toast.info("Office removed.");
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

            <div className="admin-page-header" style={{ marginTop: '50px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="admin-page-title">Offices Management</h1>
                    <p className="admin-page-subtitle">Add or remove branch and corporate offices.</p>
                </div>
                <button className="btn-save" onClick={handleAddOffice}>
                    <FaPlus /> Add Office
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                {offices.map((office) => (
                    <div key={office.id} className="category-form-card" style={{ margin: 0, padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                            <div style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                background: office.type === 'Corporate Office' ? '#eff6ff' : '#f0fdf4',
                                color: office.type === 'Corporate Office' ? '#2563eb' : '#16a34a',
                                fontSize: '0.75rem',
                                fontWeight: 600
                            }}>
                                {office.type}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-icon" onClick={() => handleOfficeEdit(office)}><FaPencilAlt /></button>
                                <button className="btn-icon delete" onClick={() => handleDeleteOffice(office.id)}><FaTrash /></button>
                            </div>
                        </div>

                        <div style={{ flexGrow: 1 }}>
                            <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem', color: '#111827' }}>{office.city}</h3>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', color: '#4b5563', fontSize: '0.9rem' }}>
                                <FaMapMarkerAlt style={{ marginTop: '3px', flexShrink: 0 }} />
                                <div>
                                    <div>{office.addressLine1}</div>
                                    {office.addressLine2 && <div>{office.addressLine2}</div>}
                                    <div>{office.city}, {office.state} - {office.pinCode}</div>
                                </div>
                            </div>
                            {(office.phone1 || office.phone2) && (
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', color: '#4b5563', fontSize: '0.9rem' }}>
                                    <FaPhone style={{ marginTop: '3px', flexShrink: 0 }} />
                                    <div>
                                        {office.phone1 && <div>{office.phone1}</div>}
                                        {office.phone2 && <div>{office.phone2}</div>}
                                    </div>
                                </div>
                            )}
                            {office.email && (
                                <div style={{ display: 'flex', gap: '8px', color: '#4b5563', fontSize: '0.9rem' }}>
                                    <FaEnvelope style={{ marginTop: '3px', flexShrink: 0 }} />
                                    <div style={{ wordBreak: 'break-all' }}>{office.email}</div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {offices.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', background: '#f9fafb', borderRadius: '12px', border: '2px dashed #e5e7eb' }}>
                        <p style={{ color: '#6b7280' }}>No offices added yet. Click "Add Office" to get started.</p>
                    </div>
                )}
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

            <AnimatePresence>
                {isOfficeModalOpen && (
                    <div className="modal-overlay">
                        <motion.div className="modal-content category-form-card" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} style={{ maxWidth: '700px', width: '90%' }}>
                            <div className="modal-header">
                                <h3>{editingOffice ? 'Edit Office' : 'Add New Office'}</h3>
                                <button className="btn-close" onClick={() => setIsOfficeModalOpen(false)}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSaveOffice} style={{ padding: '24px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="category-form-group" style={{ gridColumn: '1 / -1' }}>
                                        <label>Office Type</label>
                                        <select
                                            className="category-form-input"
                                            value={officeForm.type}
                                            onChange={(e) => setOfficeForm({ ...officeForm, type: e.target.value as any })}
                                            required
                                        >
                                            <option value="Branch Office">Branch Office</option>
                                            <option value="Corporate Office">Corporate Office</option>
                                        </select>
                                    </div>

                                    <div className="category-form-group">
                                        <label>Address Line 1</label>
                                        <input
                                            type="text"
                                            className="category-form-input"
                                            value={officeForm.addressLine1}
                                            onChange={(e) => setOfficeForm({ ...officeForm, addressLine1: e.target.value })}
                                            placeholder="Building, Street..."
                                            required
                                        />
                                    </div>

                                    <div className="category-form-group">
                                        <label>Address Line 2 (Optional)</label>
                                        <input
                                            type="text"
                                            className="category-form-input"
                                            value={officeForm.addressLine2}
                                            onChange={(e) => setOfficeForm({ ...officeForm, addressLine2: e.target.value })}
                                            placeholder="Area, Landmark..."
                                        />
                                    </div>

                                    <div className="category-form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            className="category-form-input"
                                            value={officeForm.city}
                                            onChange={(e) => setOfficeForm({ ...officeForm, city: e.target.value })}
                                            placeholder="City"
                                            required
                                        />
                                    </div>

                                    <div className="category-form-group">
                                        <label>State</label>
                                        <input
                                            type="text"
                                            className="category-form-input"
                                            value={officeForm.state}
                                            onChange={(e) => setOfficeForm({ ...officeForm, state: e.target.value })}
                                            placeholder="State"
                                            required
                                        />
                                    </div>

                                    <div className="category-form-group">
                                        <label>Pin Code</label>
                                        <input
                                            type="text"
                                            className="category-form-input"
                                            value={officeForm.pinCode}
                                            onChange={(e) => setOfficeForm({ ...officeForm, pinCode: e.target.value })}
                                            placeholder="XXXXXX"
                                            required
                                        />
                                    </div>

                                    <div className="category-form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            className="category-form-input"
                                            value={officeForm.email}
                                            onChange={(e) => setOfficeForm({ ...officeForm, email: e.target.value })}
                                            placeholder="office@greenrevotec.com"
                                        />
                                    </div>

                                    <div className="category-form-group">
                                        <label>Primary Phone</label>
                                        <input
                                            type="tel"
                                            className="category-form-input"
                                            value={officeForm.phone1}
                                            onChange={(e) => setOfficeForm({ ...officeForm, phone1: e.target.value })}
                                            placeholder="+91 XXXXX XXXXX"
                                            required
                                        />
                                    </div>

                                    <div className="category-form-group">
                                        <label>Secondary Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            className="category-form-input"
                                            value={officeForm.phone2}
                                            onChange={(e) => setOfficeForm({ ...officeForm, phone2: e.target.value })}
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                </div>

                                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button type="button" className="btn-cancel" onClick={() => setIsOfficeModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save Office</button>
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
