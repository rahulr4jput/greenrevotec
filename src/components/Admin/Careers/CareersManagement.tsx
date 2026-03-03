import React, { useState, useEffect } from 'react';
import {
    FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaBriefcase,
    FaInfoCircle, FaMapMarkerAlt, FaFileAlt, FaCheck, FaBuilding
} from 'react-icons/fa';
import '../AdminLayout.css';
import '../Settings.css';
import './CareersManagement.css'; // Importing the new specific modern styles

interface JobOpening {
    id: string;
    jobCode?: string;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
    contactEmail?: string;
    isActive: boolean;
}

const CareersManagement: React.FC = () => {
    const [jobs, setJobs] = useState<JobOpening[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentJob, setCurrentJob] = useState<Partial<JobOpening>>({});
    const [reqInput, setReqInput] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/jobs');
            if (!res.ok) throw new Error('Failed to fetch jobs');
            const data = await res.json();
            setJobs(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const method = 'POST';
            const res = await fetch('/api/jobs', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentJob),
            });

            if (!res.ok) throw new Error('Failed to save job');

            setIsEditing(false);
            fetchJobs();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this job opening? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete job');
            fetchJobs();
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleAddRequirement = (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (!reqInput.trim()) return;
        setCurrentJob({
            ...currentJob,
            requirements: [...(currentJob.requirements || []), reqInput.trim()]
        });
        setReqInput('');
    };

    const handleRemoveRequirement = (index: number) => {
        const newReqs = [...(currentJob.requirements || [])];
        newReqs.splice(index, 1);
        setCurrentJob({ ...currentJob, requirements: newReqs });
    };

    return (
        <div className="admin-content-inner careers-management-container">
            <div className="modern-admin-header">
                <h2>
                    <FaBriefcase className="header-icon" />
                    Manage Job Openings
                </h2>
                {!isEditing && (
                    <button className="modern-btn modern-btn-primary" onClick={() => {
                        setCurrentJob({ isActive: true, requirements: [], type: 'Full-time' });
                        setIsEditing(true);
                    }}>
                        <FaPlus /> Add New Role
                    </button>
                )}
            </div>

            {error && <div className="admin-error-message">{error}</div>}

            {isEditing ? (
                <div className="modern-form-card">

                    {/* Section 1: Basic Info */}
                    <div className="modern-form-section">
                        <h3 className="career-section-title"><FaInfoCircle /> Basic Information</h3>
                        <div className="form-grid-2">
                            <div className="modern-form-group">
                                <label>Job Title *</label>
                                <input
                                    type="text"
                                    className="modern-input"
                                    value={currentJob.title || ''}
                                    onChange={(e) => setCurrentJob({ ...currentJob, title: e.target.value })}
                                    placeholder="e.g. Senior Agronomist"
                                    required
                                />
                            </div>
                            <div className="modern-form-group">
                                <label>Department *</label>
                                <input
                                    type="text"
                                    className="modern-input"
                                    value={currentJob.department || ''}
                                    onChange={(e) => setCurrentJob({ ...currentJob, department: e.target.value })}
                                    placeholder="e.g. Research & Development"
                                    required
                                />
                            </div>
                            <div className="modern-form-group">
                                <label>Location *</label>
                                <input
                                    type="text"
                                    className="modern-input"
                                    value={currentJob.location || ''}
                                    onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
                                    placeholder="e.g. Remote / Mumbai"
                                    required
                                />
                            </div>
                            <div className="modern-form-group">
                                <label>Employment Type *</label>
                                <select
                                    className="modern-input"
                                    value={currentJob.type || 'Full-time'}
                                    onChange={(e) => setCurrentJob({ ...currentJob, type: e.target.value })}
                                    required
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Details & Description */}
                    <div className="modern-form-section">
                        <h3 className="career-section-title"><FaFileAlt /> Role Details</h3>
                        <div className="modern-form-group">
                            <label>Job Description *</label>
                            <textarea
                                className="modern-input modern-textarea"
                                value={currentJob.description || ''}
                                onChange={(e) => setCurrentJob({ ...currentJob, description: e.target.value })}
                                placeholder="Write a detailed description of the responsibilities and expectations for this role..."
                                required
                            />
                        </div>

                        <div className="modern-form-group" style={{ marginTop: '20px' }}>
                            <label>Requirements & Qualifications</label>
                            <div className="requirement-input-wrapper">
                                <input
                                    type="text"
                                    className="modern-input"
                                    value={reqInput}
                                    onChange={(e) => setReqInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddRequirement(e)}
                                    placeholder="e.g. 5+ years of experience in Agriculture"
                                />
                                <button className="modern-btn-add" onClick={handleAddRequirement} type="button">
                                    <FaPlus /> Add
                                </button>
                            </div>

                            {/* Tags display */}
                            {currentJob.requirements && currentJob.requirements.length > 0 && (
                                <div className="requirements-container">
                                    {currentJob.requirements.map((req, idx) => (
                                        <div key={idx} className="requirement-tag">
                                            <span>{req}</span>
                                            <button type="button" onClick={() => handleRemoveRequirement(idx)} aria-label="Remove">
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Contact & Status */}
                    <div className="modern-form-section">
                        <h3 className="career-section-title"><FaCheck /> Status & Contact</h3>
                        <div className="form-grid-2" style={{ alignItems: 'center' }}>
                            <div className="modern-form-group">
                                <label>Specific Contact Email (Optional)</label>
                                <input
                                    type="email"
                                    className="modern-input"
                                    value={currentJob.contactEmail || ''}
                                    onChange={(e) => setCurrentJob({ ...currentJob, contactEmail: e.target.value })}
                                    placeholder="hr@greenrevotec.com"
                                />
                                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block', fontSize: '0.8rem' }}>
                                    If applicable, candidates can be directed to this email for specific queries.
                                </small>
                            </div>

                            <div className="modern-form-group">
                                <div
                                    className="modern-switch-container"
                                    onClick={() => setCurrentJob({ ...currentJob, isActive: !currentJob.isActive })}
                                >
                                    <div className={`modern-switch ${currentJob.isActive !== false ? 'active' : ''}`}>
                                        <div className="modern-switch-thumb"></div>
                                    </div>
                                    <span className="modern-switch-label">
                                        {currentJob.isActive !== false ? 'Active (Visible to public)' : 'Draft (Hidden)'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions-footer">
                        <button className="modern-btn modern-btn-secondary" onClick={() => { setIsEditing(false); setError(null); }}>
                            <FaTimes /> Cancel
                        </button>
                        <button
                            className="modern-btn modern-btn-primary"
                            onClick={handleSave}
                            disabled={!currentJob.title || !currentJob.department || !currentJob.description}
                        >
                            <FaSave /> Save Job Role
                        </button>
                    </div>
                </div>
            ) : (
                <div className="modern-jobs-grid">
                    {isLoading ? (
                        <div className="admin-loading" style={{ gridColumn: '1 / -1' }}>
                            <div className="spinner"></div> Loading available jobs...
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="admin-empty-state" style={{ gridColumn: '1 / -1' }}>
                            <FaBriefcase className="empty-icon" />
                            <p>No job openings found. Click 'Add New Role' to get started.</p>
                        </div>
                    ) : (
                        jobs.map(job => (
                            <div key={job.id} className="modern-job-card">
                                {/* Job Code ID Bar */}
                                {job.jobCode && (
                                    <div className="job-code-bar">
                                        <span className="job-code-label">ID:</span>
                                        <span className="job-code-value">{job.jobCode}</span>
                                    </div>
                                )}
                                <div className="job-card-header">
                                    <div>
                                        <h3 className="job-card-title">{job.title}</h3>
                                        <div className="job-card-badges">
                                            <span className={`modern-badge ${job.isActive ? 'active' : 'inactive'}`}>
                                                {job.isActive ? 'Active' : 'Closed'}
                                            </span>
                                            <span className="modern-badge dept">
                                                {job.type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="job-card-actions">
                                        <button className="action-btn edit" onClick={() => { setCurrentJob(job); setIsEditing(true); }} aria-label="Edit">
                                            <FaEdit />
                                        </button>
                                        <button className="action-btn delete" onClick={() => handleDelete(job.id)} aria-label="Delete">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                <div className="job-card-details">
                                    <div className="detail-row">
                                        <FaBuilding className="detail-icon" />
                                        <span>{job.department}</span>
                                    </div>
                                    <div className="detail-row">
                                        <FaMapMarkerAlt className="detail-icon" />
                                        <span>{job.location}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CareersManagement;
