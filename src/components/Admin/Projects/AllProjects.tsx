import React, { useState, useEffect } from 'react';
import { FaTrash, FaPlus, FaSave, FaTimes, FaSearch, FaPencilAlt, FaProjectDiagram } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../AdminLayout.css';
import '../Products/ProductCategories.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AdminProject {
    id: string;
    title: string;
    location: string;
    year: string;
    category: string;
    impact: string;
    description: string;
    color: string;
    isActive: boolean;
}

const AllProjects: React.FC = () => {
    const [projects, setProjects] = useState<AdminProject[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [isSectionVisible, setIsSectionVisible] = useState(true);

    // Form State
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [year, setYear] = useState('');
    const [category, setCategory] = useState('');
    const [impact, setImpact] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('#25b565');
    const [isActive, setIsActive] = useState(true);

    const fetchProjectsConfig = async () => {
        try {
            const response = await fetch('/api/settings/admin_projects_config');
            if (response.ok) {
                const data = await response.json();
                if (data) {
                    setProjects(data.projects || []);
                    setIsSectionVisible(data.sectionVisible !== false);
                    localStorage.setItem('admin_projects_config', JSON.stringify(data));
                    return;
                }
            }
        } catch (error) {
            console.error("Failed to fetch projects config:", error);
        }

        // Fallback
        const consolidated = localStorage.getItem('admin_projects_config');
        if (consolidated) {
            const data = JSON.parse(consolidated);
            setProjects(data.projects || []);
            setIsSectionVisible(data.sectionVisible !== false);
        } else {
            // Check legacy key
            const oldProjects = localStorage.getItem('admin_projects');
            if (oldProjects) setProjects(JSON.parse(oldProjects));
        }
    };

    useEffect(() => {
        fetchProjectsConfig();
    }, []);

    const saveProjectsConfig = async (updatedData: any) => {
        const fullConfig = {
            projects,
            sectionVisible: isSectionVisible,
            ...updatedData
        };

        try {
            const response = await fetch('/api/settings/admin_projects_config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value: fullConfig })
            });

            if (response.ok) {
                localStorage.setItem('admin_projects_config', JSON.stringify(fullConfig));
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error) {
            console.error("Error saving projects config:", error);
            toast.error("Saved locally, but failed to sync.");
        }
    };

    const toggleSectionVisibility = async () => {
        const newValue = !isSectionVisible;
        setIsSectionVisible(newValue);
        await saveProjectsConfig({ sectionVisible: newValue });
        toast.info(`Projects section is now ${newValue ? 'Visible' : 'Hidden'}.`);
    };

    const openEditModal = (project: AdminProject) => {
        setEditingProjectId(project.id);
        setTitle(project.title);
        setLocation(project.location);
        setYear(project.year);
        setCategory(project.category);
        setImpact(project.impact);
        setDescription(project.description);
        setColor(project.color);
        setIsActive(project.isActive !== false);
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditingProjectId(null);
        setTitle('');
        setLocation('');
        setYear('');
        setCategory('');
        setImpact('');
        setDescription('');
        setColor('#25b565');
        setIsActive(true);
        setIsModalOpen(false);
    };

    const handleSaveProject = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !description || !location || !category) {
            toast.error("Please fill all required fields.");
            return;
        }

        const newProject: AdminProject = {
            id: editingProjectId || Date.now().toString(),
            title,
            location,
            year,
            category,
            impact,
            description,
            color,
            isActive
        };

        let updatedProjects;
        if (editingProjectId) {
            updatedProjects = projects.map(p => p.id === editingProjectId ? newProject : p);
            toast.success("Project updated!");
        } else {
            updatedProjects = [newProject, ...projects];
            toast.success("Project created!");
        }

        setProjects(updatedProjects);
        await saveProjectsConfig({ projects: updatedProjects });
        resetForm();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this project?")) {
            const updated = projects.filter(p => p.id !== id);
            setProjects(updated);
            await saveProjectsConfig({ projects: updated });
            toast.error("Project deleted!");
        }
    };

    const toggleStatus = async (id: string) => {
        const updated = projects.map(p => {
            if (p.id === id) {
                return { ...p, isActive: !p.isActive };
            }
            return p;
        });
        setProjects(updated);
        await saveProjectsConfig({ projects: updated });
        toast.info("Status updated.");
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="admin-page-container">
            <ToastContainer position="bottom-right" theme="colored" />
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 className="admin-page-title">Manage Projects</h1>
                    <p className="admin-page-subtitle">Add or edit showcase projects with their location, impact, and details.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: isSectionVisible ? '#ecfdf5' : '#fef2f2', border: `1px solid ${isSectionVisible ? '#10b981' : '#ef4444'}`, borderRadius: '8px', cursor: 'pointer' }} onClick={toggleSectionVisibility}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSectionVisible ? '#047857' : '#b91c1c' }}>{isSectionVisible ? 'VISIBLE' : 'HIDDEN'} ON HOME</span>
                        <div style={{ width: '36px', height: '20px', background: isSectionVisible ? '#10b981' : '#ef4444', borderRadius: '10px', position: 'relative', transition: '0.3s' }}>
                            <div style={{ width: '14px', height: '14px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: isSectionVisible ? '19px' : '3px', transition: '0.3s' }}></div>
                        </div>
                    </div>
                    <div style={{ position: 'relative', width: '250px' }}>
                        <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px 10px 36px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                backgroundColor: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button className="btn-save" onClick={() => setIsModalOpen(true)} style={{ margin: 0 }}>
                        <FaPlus /> Add New Project
                    </button>
                </div>
            </div>

            <div className="category-table-card">
                <table className="custom-category-table">
                    <thead>
                        <tr>
                            <th>Project Details</th>
                            <th>Info</th>
                            <th>Impact Badge</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '60px 20px' }}>
                                        No projects found. Add your first project!
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <motion.tr
                                        key={project.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${project.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: project.color }}>
                                                    <FaProjectDiagram />
                                                </div>
                                                <div>
                                                    <strong style={{ display: 'block' }}>{project.title}</strong>
                                                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{project.category}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.85rem' }}>
                                                <div>📍 {project.location}</div>
                                                <div>📅 {project.year}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                background: `${project.color}18`,
                                                color: project.color,
                                                border: `1px solid ${project.color}33`
                                            }}>
                                                🎯 {project.impact}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`status-toggle ${project.isActive ? 'active' : 'inactive'}`}
                                                onClick={() => toggleStatus(project.id)}
                                            >
                                                {project.isActive ? 'Active' : 'Hidden'}
                                            </button>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="action-buttons">
                                                <button className="btn-icon edit" onClick={() => openEditModal(project)}>
                                                    <FaPencilAlt />
                                                </button>
                                                <button className="btn-icon delete" onClick={() => handleDelete(project.id)}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="modal-content category-form-card large-modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
                            <div className="modal-header">
                                <h3>{editingProjectId ? 'Edit Project' : 'Add Project'}</h3>
                                <button className="btn-close" onClick={resetForm}><FaTimes /></button>
                            </div>
                            <form onSubmit={handleSaveProject} className="modal-form">
                                <div className="form-grid">
                                    <div className="category-form-group full-width">
                                        <label>Project Title *</label>
                                        <input type="text" className="category-form-input" value={title} onChange={e => setTitle(e.target.value)} required />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Category *</label>
                                        <input type="text" className="category-form-input" value={category} onChange={e => setCategory(e.target.value)} required />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Location *</label>
                                        <input type="text" className="category-form-input" value={location} onChange={e => setLocation(e.target.value)} required />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Year</label>
                                        <input type="text" className="category-form-input" value={year} onChange={e => setYear(e.target.value)} />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Impact Badge Text</label>
                                        <input type="text" className="category-form-input" value={impact} onChange={e => setImpact(e.target.value)} placeholder="e.g. 8,000 Farmers Benefited" />
                                    </div>
                                    <div className="category-form-group">
                                        <label>Theme Color</label>
                                        <input type="color" className="category-form-input" style={{ height: '45px', padding: '5px' }} value={color} onChange={e => setColor(e.target.value)} />
                                    </div>
                                    <div className="category-form-group full-width">
                                        <label>Description *</label>
                                        <textarea className="category-form-input" value={description} onChange={e => setDescription(e.target.value)} required rows={4} />
                                    </div>
                                    <div className="category-form-group full-width">
                                        <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                            <span>Active (Visible on Homepage)</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                                    <button type="submit" className="btn-save"><FaSave /> Save Project</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AllProjects;
