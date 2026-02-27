import React, { useState, useEffect } from 'react';
import { FaSave, FaImage, FaEye, FaEyeSlash, FaUpload, FaTimes, FaGlobe, FaLayerGroup } from 'react-icons/fa';
import '../AdminLayout.css';

interface SiteIdentity {
    logo: {
        url: string;
        show: boolean;
    };
    favicon: {
        url: string;
        show: boolean;
    };
    adminSidebarLogo: {
        url: string;
        show: boolean;
    };
    siteName: string;
    tagline: string;
}

const SiteIdentityManagement: React.FC = () => {
    const [config, setConfig] = useState<SiteIdentity>({
        logo: { url: '/logo.png', show: true },
        favicon: { url: '/favicon.ico', show: true },
        adminSidebarLogo: { url: '/logo.png', show: true },
        siteName: 'GreenRevotec',
        tagline: 'Modernizing Agriculture for a Greener Tomorrow'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await fetch('/api/settings/admin_site_identity');
                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        setConfig(data);
                        localStorage.setItem('admin_site_identity', JSON.stringify(data));
                        return;
                    }
                }
            } catch (error) {
                console.error("Failed to fetch settings from API:", error);
            }

            // Fallback to local storage if API fails or is empty
            const stored = localStorage.getItem('admin_site_identity');
            if (stored) {
                try {
                    setConfig(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse site identity config", e);
                }
            }
        };

        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Save to Backend Database
            const response = await fetch('/api/settings/admin_site_identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: config })
            });

            if (!response.ok) {
                throw new Error("Failed to save to database");
            }

            // 2. Save to Local Storage for immediate fallback
            localStorage.setItem('admin_site_identity', JSON.stringify(config));

            // 3. Dispatch storage event for real-time update in current tab
            window.dispatchEvent(new Event('storage'));

            setSaveMessage('Settings saved successfully!');
        } catch (error) {
            console.error("Error saving site identity:", error);
            setSaveMessage('Failed to save settings. Please try again.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const handleImageUpload = (type: 'logo' | 'favicon' | 'adminSidebarLogo', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setConfig(prev => ({
                    ...prev,
                    [type]: { ...prev[type], url: reader.result as string }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (field: keyof SiteIdentity, value: string) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const toggleShow = (type: 'logo' | 'favicon' | 'adminSidebarLogo') => {
        setConfig(prev => ({
            ...prev,
            [type]: { ...prev[type], show: !prev[type].show }
        }));
    };

    return (
        <div className="admin-page-container">
            <div className="admin-page-header">
                <div>
                    <h2 className="admin-page-title">Site Identity Settings</h2>
                    <p className="admin-page-subtitle">Manage your website's logo and browser favicon.</p>
                </div>
                <button
                    className="admin-btn admin-btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? <div className="admin-spinner" /> : <FaSave />}
                    <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
                </button>
            </div>

            {saveMessage && (
                <div className="admin-alert admin-alert-success" style={{ marginBottom: '24px' }}>
                    {saveMessage}
                </div>
            )}

            <div className="admin-grid-v2">
                {/* Site Basics */}
                <div className="admin-card-v2" style={{ gridColumn: '1 / -1' }}>
                    <div className="card-header-v2">
                        <div className="header-icon-v2" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                            <FaGlobe />
                        </div>
                        <div className="header-text-v2">
                            <h3>Site Basics</h3>
                            <p>Global settings for your website branding.</p>
                        </div>
                    </div>
                    <div className="card-content-v2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <div className="admin-form-group">
                            <label>Website Name</label>
                            <input
                                type="text"
                                className="admin-input"
                                value={config.siteName}
                                onChange={(e) => handleInputChange('siteName', e.target.value)}
                                placeholder="E.g. GreenRevotec"
                            />
                        </div>
                        <div className="admin-form-group">
                            <label>Slogan / Tagline</label>
                            <input
                                type="text"
                                className="admin-input"
                                value={config.tagline}
                                onChange={(e) => handleInputChange('tagline', e.target.value)}
                                placeholder="E.g. Engineering the Future of Farming"
                            />
                        </div>
                    </div>
                </div>

                {/* Logo Settings */}
                <div className="admin-card-v2">
                    <div className="card-header-v2">
                        <div className="header-icon-v2">
                            <FaImage />
                        </div>
                        <div className="header-text-v2">
                            <h3>Site Logo</h3>
                            <p>Displayed in the main navigation bar.</p>
                        </div>
                    </div>

                    <div className="card-content-v2">
                        <div className="admin-form-group">
                            <label>Logo Source (URL or Upload)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={config.logo.url}
                                    onChange={(e) => setConfig(prev => ({ ...prev, logo: { ...prev.logo, url: e.target.value } }))}
                                    placeholder="https://example.com/logo.png or upload below"
                                />
                                <button className="admin-btn admin-btn-secondary" style={{ padding: '0 12px' }} onClick={() => toggleShow('logo')}>
                                    {config.logo.show ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label>Upload Logo</label>
                            <label className="upload-box-v2" style={{ cursor: 'pointer' }}>
                                <input
                                    type="file"
                                    className="hidden-input"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload('logo', e)}
                                />
                                <FaUpload className="upload-icon-v2" />
                                <span>Choose an image...</span>
                            </label>
                        </div>

                        {config.logo.url && (
                            <div className="preview-container-v2">
                                <label>Logo Preview</label>
                                <div className="logo-preview-box" style={{
                                    background: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    border: '1px solid #e2e8f0',
                                    minHeight: '100px'
                                }}>
                                    <img
                                        src={config.logo.url}
                                        alt="Logo Preview"
                                        style={{ maxHeight: '60px', width: 'auto', objectFit: 'contain', opacity: config.logo.show ? 1 : 0.3 }}
                                    />
                                </div>
                                {!config.logo.show && (
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '8px', fontStyle: 'italic' }}>
                                        * Logo is currently hidden from frontend.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Favicon Settings */}
                <div className="admin-card-v2">
                    <div className="card-header-v2">
                        <div className="header-icon-v2">
                            <FaGlobe />
                        </div>
                        <div className="header-text-v2">
                            <h3>Site Favicon</h3>
                            <p>Small icon displayed in browser tabs.</p>
                        </div>
                    </div>

                    <div className="card-content-v2">
                        <div className="admin-form-group">
                            <label>Favicon Source (URL or Upload)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={config.favicon.url}
                                    onChange={(e) => setConfig(prev => ({ ...prev, favicon: { ...prev.favicon, url: e.target.value } }))}
                                    placeholder="https://example.com/favicon.ico or upload below"
                                />
                                <button className="admin-btn admin-btn-secondary" style={{ padding: '0 12px' }} onClick={() => toggleShow('favicon')}>
                                    {config.favicon.show ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label>Upload Favicon</label>
                            <label className="upload-box-v2" style={{ cursor: 'pointer' }}>
                                <input
                                    type="file"
                                    className="hidden-input"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload('favicon', e)}
                                />
                                <FaUpload className="upload-icon-v2" />
                                <span>Choose an image...</span>
                            </label>
                        </div>

                        {config.favicon.url && (
                            <div className="preview-container-v2">
                                <label>Favicon Preview</label>
                                <div style={{
                                    background: '#f8fafc',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', width: '100%', maxWidth: '200px' }}>
                                        <img
                                            src={config.favicon.url}
                                            alt="Favicon Preview"
                                            style={{ width: '24px', height: '24px' }}
                                        />
                                        <span style={{ fontSize: '0.8rem', color: '#111', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>GreenRevotec...</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Simulated browser tab preview</p>
                                </div>
                                {!config.favicon.show && (
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '8px', fontStyle: 'italic' }}>
                                        * Favicon is currently hidden (system default will be used).
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin Sidebar Logo Settings */}
                <div className="admin-card-v2">
                    <div className="card-header-v2">
                        <div className="header-icon-v2">
                            <FaLayerGroup />
                        </div>
                        <div className="header-text-v2">
                            <h3>Admin Sidebar Logo</h3>
                            <p>Icon shown at the top of this sidebar.</p>
                        </div>
                    </div>

                    <div className="card-content-v2">
                        <div className="admin-form-group">
                            <label>Sidebar Logo Source (URL or Upload)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    className="admin-input"
                                    value={config.adminSidebarLogo?.url || ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, adminSidebarLogo: { ...prev.adminSidebarLogo, url: e.target.value } }))}
                                    placeholder="https://example.com/admin-logo.png or upload below"
                                />
                                <button className="admin-btn admin-btn-secondary" style={{ padding: '0 12px' }} onClick={() => toggleShow('adminSidebarLogo')}>
                                    {config.adminSidebarLogo?.show !== false ? <FaEye /> : <FaEyeSlash />}
                                </button>
                            </div>
                        </div>

                        <div className="admin-form-group">
                            <label>Upload Sidebar Logo</label>
                            <label className="upload-box-v2" style={{ cursor: 'pointer' }}>
                                <input
                                    type="file"
                                    className="hidden-input"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload('adminSidebarLogo', e)}
                                />
                                <FaUpload className="upload-icon-v2" />
                                <span>Choose an image...</span>
                            </label>
                        </div>

                        {config.adminSidebarLogo?.url && (
                            <div className="preview-container-v2">
                                <label>Sidebar Preview</label>
                                <div style={{
                                    background: '#0f172a', /* Matching sidebar dark theme */
                                    padding: '20px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '10px',
                                    border: '1px solid #1e293b'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px' }}>
                                        <img
                                            src={config.adminSidebarLogo.url}
                                            alt="Sidebar Logo"
                                            style={{ width: '28px', height: '28px', objectFit: 'contain', opacity: config.adminSidebarLogo.show ? 1 : 0.3 }}
                                        />
                                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>GreenRevotec</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sidebar header preview</p>
                                </div>
                                {!config.adminSidebarLogo.show && (
                                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '8px', fontStyle: 'italic' }}>
                                        * Sidebar logo is currently hidden (default icon will be used).
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SiteIdentityManagement;
