import React, { useState, useEffect } from 'react';
import { FaTrash, FaPencilAlt, FaPlus, FaSave, FaTimes, FaGripVertical, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { toast } from 'react-toastify';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FooterLink {
    label: string;
    href: string;
}

interface FooterSection {
    id: string;
    title: string;
    links: FooterLink[];
    isActive: boolean;
}

interface FooterConfig {
    tagline: string;
    phone: string;
    email: string;
    address: string;
    copyrightText: string;
    certifications: string[];
    bottomLinks: FooterLink[];
    sections: FooterSection[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultConfig: FooterConfig = {
    tagline: "Empowering India's farmers through innovation, science, and sustainable agriculture technology.",
    phone: '+91 98765 43210',
    email: 'info@greenrevotec.com',
    address: 'Pune, Maharashtra 411001',
    copyrightText: '© {year} Green Revotec Private Limited. All rights reserved.',
    certifications: ['ISO 9001:2015', 'ICAR Certified', 'NABARD Approved'],
    bottomLinks: [
        { label: 'Privacy Policy', href: '/privacy-policy' },
        { label: 'Terms of Service', href: '/terms-of-service' },
        { label: 'Cookie Policy', href: '/cookie-policy' },
        { label: 'Sitemap', href: '#' },
    ],
    sections: [
        {
            id: 'company', title: 'Company', isActive: true,
            links: [
                { label: 'About Us', href: '#' }, { label: 'Our Team', href: '#' },
                { label: 'Careers', href: '#' }, { label: 'Press & Media', href: '#' },
                { label: 'Corporate Responsibility', href: '#' }, { label: 'Investor Relations', href: '#' },
            ],
        },
        {
            id: 'products', title: 'Products', isActive: true,
            links: [
                { label: 'Fertilizers', href: '#' }, { label: 'Pesticides & Herbicides', href: '#' },
                { label: 'Organic Solutions', href: '#' }, { label: 'Irrigation Systems', href: '#' },
                { label: 'Soil Testing Kits', href: '#' }, { label: 'Drip & Sprinkler', href: '#' },
            ],
        },
        {
            id: 'services', title: 'Services', isActive: true,
            links: [
                { label: 'Crop Advisory', href: '#' }, { label: 'Soil Analysis', href: '#' },
                { label: 'Drone Survey', href: '#' }, { label: 'Smart Irrigation', href: '#' },
                { label: 'Farmer Training', href: '#' }, { label: 'Market Linkage', href: '#' },
            ],
        },
        {
            id: 'partner', title: 'Partner With Us', isActive: true,
            links: [
                { label: 'Distributor Program', href: '#' }, { label: 'Retailer Signup', href: '#' },
                { label: 'FPO Partnership', href: '#' }, { label: 'Corporate Tie-Up', href: '#' },
                { label: 'Strategic Alliance', href: '#' }, { label: 'CSR Programs', href: '#' },
            ],
        },
    ],
};

const STORAGE_KEY = 'admin_footer_config';

const uid = () => Math.random().toString(36).slice(2, 9);
const loadConfig = (): FooterConfig => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? { ...defaultConfig, ...JSON.parse(raw) } : defaultConfig;
    } catch { return defaultConfig; }
};
const saveConfig = (cfg: FooterConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new Event('storage'));
};

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = 'info' | 'sections' | 'certifications' | 'bottom-links';

const FooterManagement: React.FC = () => {
    const [config, setConfig] = useState<FooterConfig>(loadConfig);
    const [activeTab, setActiveTab] = useState<Tab>('info');
    const [sectionModal, setSectionModal] = useState<{ open: boolean; mode: 'add' | 'edit'; section?: FooterSection }>({ open: false, mode: 'add' });
    const [sectionForm, setSectionForm] = useState({ id: '', title: '' });
    const [linkModal, setLinkModal] = useState<{ open: boolean; sectionId: string; linkIdx: number | null }>({ open: false, sectionId: '', linkIdx: null });
    const [linkForm, setLinkForm] = useState<FooterLink>({ label: '', href: '#' });
    const [bottomLinkModal, setBottomLinkModal] = useState<{ open: boolean; idx: number | null }>({ open: false, idx: null });
    const [bottomLinkForm, setBottomLinkForm] = useState<FooterLink>({ label: '', href: '#' });
    const [newCert, setNewCert] = useState('');

    const fetchFooterConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_footer_config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setConfig({ ...defaultConfig, ...data });
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch Footer config:", error);
        }

        // Fallback
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            setConfig({ ...defaultConfig, ...JSON.parse(stored) });
        }
    };

    useEffect(() => {
        fetchFooterConfig();
    }, []);

    const saveFooterConfig = async (updatedConfig: FooterConfig) => {
        try {
            const response = await fetch('/api/settings/admin_footer_config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: updatedConfig })
            });

            if (response.ok) {
                setConfig(updatedConfig);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfig));
                window.dispatchEvent(new Event('storage'));
                toast.success('Footer updated!');
            }
        } catch (error) {
            console.error("Error saving Footer config:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const save = async (cfg: FooterConfig) => { await saveFooterConfig(cfg); };
    const saveInfo = async () => await save(config);

    // Sections
    const openAddSection = () => { setSectionForm({ id: uid(), title: '' }); setSectionModal({ open: true, mode: 'add' }); };
    const openEditSection = (s: FooterSection) => { setSectionForm({ id: s.id, title: s.title }); setSectionModal({ open: true, mode: 'edit', section: s }); };
    const saveSection = () => {
        if (!sectionForm.title.trim()) { toast.error('Section title is required'); return; }
        const sections = sectionModal.mode === 'add'
            ? [...config.sections, { id: sectionForm.id, title: sectionForm.title, links: [], isActive: true }]
            : config.sections.map(s => s.id === sectionForm.id ? { ...s, title: sectionForm.title } : s);
        save({ ...config, sections });
        setSectionModal({ open: false, mode: 'add' });
    };
    const deleteSection = (id: string) => { if (!window.confirm('Delete this section?')) return; save({ ...config, sections: config.sections.filter(s => s.id !== id) }); };
    const toggleSection = (id: string) => save({ ...config, sections: config.sections.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s) });

    // Links
    const openAddLink = (sectionId: string) => { setLinkForm({ label: '', href: '#' }); setLinkModal({ open: true, sectionId, linkIdx: null }); };
    const openEditLink = (sectionId: string, idx: number, link: FooterLink) => { setLinkForm({ ...link }); setLinkModal({ open: true, sectionId, linkIdx: idx }); };
    const saveLink = () => {
        if (!linkForm.label.trim()) { toast.error('Link label is required'); return; }
        const sections = config.sections.map(s => {
            if (s.id !== linkModal.sectionId) return s;
            const links = [...s.links];
            linkModal.linkIdx === null ? links.push({ ...linkForm }) : links[linkModal.linkIdx] = { ...linkForm };
            return { ...s, links };
        });
        save({ ...config, sections });
        setLinkModal({ open: false, sectionId: '', linkIdx: null });
    };
    const deleteLink = (sectionId: string, idx: number) => save({ ...config, sections: config.sections.map(s => s.id !== sectionId ? s : { ...s, links: s.links.filter((_, i) => i !== idx) }) });

    // Certifications
    const addCert = () => { if (!newCert.trim()) return; save({ ...config, certifications: [...config.certifications, newCert.trim()] }); setNewCert(''); };
    const deleteCert = (idx: number) => save({ ...config, certifications: config.certifications.filter((_, i) => i !== idx) });

    // Bottom Links
    const openAddBottomLink = () => { setBottomLinkForm({ label: '', href: '#' }); setBottomLinkModal({ open: true, idx: null }); };
    const openEditBottomLink = (idx: number) => { setBottomLinkForm({ ...config.bottomLinks[idx] }); setBottomLinkModal({ open: true, idx }); };
    const saveBottomLink = () => {
        if (!bottomLinkForm.label.trim()) { toast.error('Label is required'); return; }
        const bottomLinks = [...config.bottomLinks];
        bottomLinkModal.idx === null ? bottomLinks.push({ ...bottomLinkForm }) : bottomLinks[bottomLinkModal.idx] = { ...bottomLinkForm };
        save({ ...config, bottomLinks });
        setBottomLinkModal({ open: false, idx: null });
    };
    const deleteBottomLink = (idx: number) => save({ ...config, bottomLinks: config.bottomLinks.filter((_, i) => i !== idx) });

    return (
        <div style={{ padding: '32px', maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#111827', margin: 0 }}>Footer Settings</h1>
                <p style={{ color: '#6b7280', marginTop: 6, fontSize: '0.9rem' }}>Manage all content displayed in the website footer.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
                {(['info', 'sections', 'certifications', 'bottom-links'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '8px 20px', borderRadius: 8, border: '1px solid',
                        borderColor: activeTab === tab ? '#2ea34b' : '#d1d5db',
                        background: activeTab === tab ? '#ecfdf5' : '#fff',
                        color: activeTab === tab ? '#166534' : '#374151',
                        fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem',
                        textTransform: 'capitalize', transition: 'all 0.2s',
                    }}>
                        {tab.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </button>
                ))}
            </div>

            {/* ── Tab: Info ─────────────────────────────────────────────── */}
            {activeTab === 'info' && (
                <div style={card}>
                    <h3 style={cardTitle}>Brand & Contact Info</h3>
                    <div style={{ display: 'grid', gap: 16 }}>
                        {(['tagline', 'phone', 'email', 'address'] as const).map(field => (
                            <div key={field}>
                                <label style={labelStyle}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                                {field === 'tagline' ? (
                                    <textarea rows={3} value={config[field]} onChange={e => setConfig(c => ({ ...c, [field]: e.target.value }))} style={inputStyle} />
                                ) : (
                                    <input value={config[field]} onChange={e => setConfig(c => ({ ...c, [field]: e.target.value }))} style={inputStyle} />
                                )}
                            </div>
                        ))}

                        {/* Copyright */}
                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 16, marginTop: 4 }}>
                            <label style={labelStyle}>Copyright Text</label>
                            <input
                                value={config.copyrightText}
                                onChange={e => setConfig(c => ({ ...c, copyrightText: e.target.value }))}
                                style={inputStyle}
                                placeholder="© {year} Your Company. All rights reserved."
                            />
                            <p style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 6 }}>
                                Use <code style={{ background: '#f3f4f6', padding: '1px 6px', borderRadius: 4, color: '#374151' }}>{'{year}'}</code> as a placeholder — it will be automatically replaced with the current year.
                            </p>
                            {/* Live Preview */}
                            <div style={{ marginTop: 10, padding: '10px 14px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'block', marginBottom: 4 }}>Preview:</span>
                                <span style={{ fontSize: '0.85rem', color: '#374151' }}>
                                    {config.copyrightText.replace('{year}', new Date().getFullYear().toString())}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={saveInfo} className="admin-btn admin-btn-primary" style={{ marginTop: 16 }}><FaSave /> Save Info</button>
                </div>
            )}

            {/* ── Tab: Sections ─────────────────────────────────────────── */}
            {activeTab === 'sections' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ color: '#111827', fontSize: '1.1rem', margin: 0 }}>Navigation Sections</h3>
                        <button onClick={openAddSection} className="admin-btn admin-btn-primary"><FaPlus /> Add Section</button>
                    </div>
                    <div style={{ display: 'grid', gap: 14 }}>
                        {config.sections.map(section => (
                            <div key={section.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                {/* Section Header */}
                                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px', gap: 10, borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}>
                                    <FaGripVertical style={{ color: '#9ca3af' }} />
                                    <span style={{ flex: 1, fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>{section.title}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', background: '#f3f4f6', padding: '2px 10px', borderRadius: 20 }}>{section.links.length} links</span>
                                    <button onClick={() => toggleSection(section.id)} style={iconBtnDark} title="Toggle Visibility">
                                        {section.isActive ? <FaToggleOn style={{ color: '#2ea34b', fontSize: '1.3rem' }} /> : <FaToggleOff style={{ color: '#9ca3af', fontSize: '1.3rem' }} />}
                                    </button>
                                    <button onClick={() => openEditSection(section)} style={iconBtnDark} title="Edit"><FaPencilAlt style={{ color: '#374151' }} /></button>
                                    <button onClick={() => deleteSection(section.id)} style={iconBtnDark} title="Delete"><FaTrash style={{ color: '#ef4444' }} /></button>
                                </div>

                                {/* Links List */}
                                <div style={{ padding: '10px 18px' }}>
                                    {section.links.length === 0 && (
                                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', textAlign: 'center', padding: '10px 0' }}>No links yet. Add one below.</p>
                                    )}
                                    {section.links.map((link, idx) => (
                                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: idx < section.links.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                            <span style={{ flex: 1, color: '#374151', fontSize: '0.875rem' }}>{link.label}</span>
                                            <span style={{ fontSize: '0.72rem', color: '#9ca3af', fontFamily: 'monospace', background: '#f9fafb', padding: '2px 8px', borderRadius: 6 }}>{link.href}</span>
                                            <button onClick={() => openEditLink(section.id, idx, link)} style={iconBtnDark}><FaPencilAlt style={{ color: '#374151' }} /></button>
                                            <button onClick={() => deleteLink(section.id, idx)} style={iconBtnDark}><FaTrash style={{ color: '#ef4444' }} /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => openAddLink(section.id)} className="admin-btn admin-btn-secondary" style={{ marginTop: 8 }}><FaPlus /> Add Link</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Tab: Certifications ───────────────────────────────────── */}
            {activeTab === 'certifications' && (
                <div style={card}>
                    <h3 style={cardTitle}>Certification Badges</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                        {config.certifications.map((cert, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#ecfdf5', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 12px' }}>
                                <span style={{ color: '#166534', fontSize: '0.85rem', fontWeight: 600 }}>{cert}</span>
                                <button onClick={() => deleteCert(idx)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}><FaTimes /></button>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input value={newCert} onChange={e => setNewCert(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCert()} placeholder="Add new certification (e.g., ISO 14001)" style={{ ...inputStyle, flex: 1 }} />
                        <button onClick={addCert} className="admin-btn admin-btn-primary"><FaPlus /> Add</button>
                    </div>
                </div>
            )}

            {/* ── Tab: Bottom Links ─────────────────────────────────────── */}
            {activeTab === 'bottom-links' && (
                <div style={card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                        <h3 style={{ ...cardTitle, margin: 0 }}>Bottom Bar Links</h3>
                        <button onClick={openAddBottomLink} className="admin-btn admin-btn-primary"><FaPlus /> Add Link</button>
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {config.bottomLinks.map((bl, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10 }}>
                                <span style={{ flex: 1, color: '#111827', fontWeight: 500, fontSize: '0.9rem' }}>{bl.label}</span>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 8px', borderRadius: 6 }}>{bl.href}</span>
                                <button onClick={() => openEditBottomLink(idx)} style={iconBtnDark}><FaPencilAlt style={{ color: '#374151' }} /></button>
                                <button onClick={() => deleteBottomLink(idx)} style={iconBtnDark}><FaTrash style={{ color: '#ef4444' }} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Modal: Section ────────────────────────────────────────── */}
            {sectionModal.open && (
                <div style={overlay}>
                    <div style={modal}>
                        <div style={modalHeader}>
                            <h3 style={{ color: '#111827', margin: 0 }}>{sectionModal.mode === 'add' ? 'Add Section' : 'Edit Section'}</h3>
                            <button onClick={() => setSectionModal({ open: false, mode: 'add' })} style={iconBtnDark}><FaTimes /></button>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            <label style={labelStyle}>Section Title</label>
                            <input value={sectionForm.title} onChange={e => setSectionForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} placeholder="e.g., Company" autoFocus />
                        </div>
                        <div style={modalFooter}>
                            <button onClick={() => setSectionModal({ open: false, mode: 'add' })} className="admin-btn admin-btn-secondary">Cancel</button>
                            <button onClick={saveSection} className="admin-btn admin-btn-primary"><FaSave /> Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Link ───────────────────────────────────────────── */}
            {linkModal.open && (
                <div style={overlay}>
                    <div style={modal}>
                        <div style={modalHeader}>
                            <h3 style={{ color: '#111827', margin: 0 }}>{linkModal.linkIdx === null ? 'Add Link' : 'Edit Link'}</h3>
                            <button onClick={() => setLinkModal({ open: false, sectionId: '', linkIdx: null })} style={iconBtnDark}><FaTimes /></button>
                        </div>
                        <div style={{ padding: '20px 24px', display: 'grid', gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Label</label>
                                <input value={linkForm.label} onChange={e => setLinkForm(f => ({ ...f, label: e.target.value }))} style={inputStyle} placeholder="e.g., About Us" autoFocus />
                            </div>
                            <div>
                                <label style={labelStyle}>URL / Href</label>
                                <input value={linkForm.href} onChange={e => setLinkForm(f => ({ ...f, href: e.target.value }))} style={inputStyle} placeholder="e.g., https://... or #" />
                            </div>
                        </div>
                        <div style={modalFooter}>
                            <button onClick={() => setLinkModal({ open: false, sectionId: '', linkIdx: null })} className="admin-btn admin-btn-secondary">Cancel</button>
                            <button onClick={saveLink} className="admin-btn admin-btn-primary"><FaSave /> Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal: Bottom Link ────────────────────────────────────── */}
            {bottomLinkModal.open && (
                <div style={overlay}>
                    <div style={modal}>
                        <div style={modalHeader}>
                            <h3 style={{ color: '#111827', margin: 0 }}>{bottomLinkModal.idx === null ? 'Add Bottom Link' : 'Edit Bottom Link'}</h3>
                            <button onClick={() => setBottomLinkModal({ open: false, idx: null })} style={iconBtnDark}><FaTimes /></button>
                        </div>
                        <div style={{ padding: '20px 24px', display: 'grid', gap: 14 }}>
                            <div>
                                <label style={labelStyle}>Label</label>
                                <input value={bottomLinkForm.label} onChange={e => setBottomLinkForm(f => ({ ...f, label: e.target.value }))} style={inputStyle} placeholder="e.g., Privacy Policy" autoFocus />
                            </div>
                            <div>
                                <label style={labelStyle}>URL / Href</label>
                                <input value={bottomLinkForm.href} onChange={e => setBottomLinkForm(f => ({ ...f, href: e.target.value }))} style={inputStyle} placeholder="e.g., /privacy or #" />
                            </div>
                        </div>
                        <div style={modalFooter}>
                            <button onClick={() => setBottomLinkModal({ open: false, idx: null })} className="admin-btn admin-btn-secondary">Cancel</button>
                            <button onClick={saveBottomLink} className="admin-btn admin-btn-primary"><FaSave /> Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    padding: 24,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
};

const cardTitle: React.CSSProperties = {
    color: '#111827',
    fontSize: '1.05rem',
    fontWeight: 700,
    marginTop: 0,
    marginBottom: 20,
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: '#fff',
    border: '1.5px solid #d1d5db',
    borderRadius: 8,
    color: '#111827',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
};

const primaryBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    background: '#2ea34b',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
    marginTop: 16,
};

const ghostBtn: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '9px 18px',
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    borderRadius: 8,
    fontWeight: 500,
    cursor: 'pointer',
    fontSize: '0.875rem',
};

const iconBtnDark: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    color: '#374151',
    fontSize: '0.82rem',
    fontWeight: 600,
    marginBottom: 6,
};

const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
};

const modal: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 16,
    width: '100%',
    maxWidth: 480,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
};

const modalHeader: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 24px',
    borderBottom: '1px solid #f3f4f6',
};

const modalFooter: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 10,
    padding: '16px 24px',
    borderTop: '1px solid #f3f4f6',
};

export default FooterManagement;
