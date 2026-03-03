import React, { useState, useEffect } from 'react';
import { FaDownload, FaEnvelope, FaPhone, FaUserTie, FaFileAlt, FaBriefcase } from 'react-icons/fa';
import '../AdminLayout.css';
import './JobLeads.css';

interface JobApplication {
    id: string;
    appCode?: string;
    jobOpeningId: string;
    candidateName: string;
    email: string;
    phone: string;
    experience: string;
    coverLetter: string;
    resumePath: string;
    status: string;
    createdAt: string;
    jobOpening?: {
        title: string;
        department: string;
        jobCode?: string;
    }
}

const JobLeads: React.FC = () => {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await fetch('/api/applications');
            if (!res.ok) throw new Error('Failed to fetch applications');
            const data = await res.json();
            setApplications(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-content-inner">
            {/* Page Header */}
            <div className="jl-header">
                <div className="jl-header-left">
                    <div className="jl-icon-wrap"><FaBriefcase /></div>
                    <div>
                        <h2 className="jl-title">Job Applications</h2>
                        <p className="jl-subtitle">Review and manage all candidate submissions</p>
                    </div>
                </div>
                <div className="jl-count-badge">
                    {applications.length} Total Application{applications.length !== 1 ? 's' : ''}
                </div>
            </div>

            {error && <div className="jl-error">{error}</div>}

            {isLoading ? (
                <div className="jl-empty">
                    <FaFileAlt className="jl-empty-icon" />
                    <p>Loading applications...</p>
                </div>
            ) : applications.length === 0 ? (
                <div className="jl-empty">
                    <FaFileAlt className="jl-empty-icon" />
                    <p>No job applications received yet.</p>
                    <span>Applications will appear here once candidates apply via the Careers page.</span>
                </div>
            ) : (
                <div className="jl-cards">
                    {applications.map(app => (
                        <div key={app.id} className="jl-card">
                            {/* Code ID Bar */}
                            <div className="jl-code-bar">
                                {app.appCode && (
                                    <div className="jl-code-item">
                                        <span className="jl-code-label">Lead ID:</span>
                                        <span className="jl-code-value">{app.appCode}</span>
                                    </div>
                                )}
                                {app.jobOpening?.jobCode && (
                                    <div className="jl-code-item">
                                        <span className="jl-code-label">Job ID:</span>
                                        <span className="jl-code-value">{app.jobOpening.jobCode}</span>
                                    </div>
                                )}
                            </div>

                            {/* Card Header */}
                            <div className="jl-card-header">
                                <div className="jl-candidate-info">
                                    <div className="jl-avatar">
                                        {app.candidateName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="jl-candidate-name">{app.candidateName}</h3>
                                        <span className="jl-role-badge">
                                            {app.jobOpening?.title || 'Unknown Role'}
                                        </span>
                                    </div>
                                </div>
                                <div className="jl-card-meta">
                                    <span className="jl-dept-tag">{app.jobOpening?.department}</span>
                                    <span className="jl-date">{new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                            </div>

                            {/* Contact Row */}
                            <div className="jl-contact-row">
                                <div className="jl-contact-item">
                                    <FaEnvelope className="jl-ci-icon" />
                                    <a href={`mailto:${app.email}`}>{app.email}</a>
                                </div>
                                <div className="jl-contact-item">
                                    <FaPhone className="jl-ci-icon" />
                                    <a href={`tel:${app.phone}`}>{app.phone}</a>
                                </div>
                                <div className="jl-contact-item">
                                    <FaUserTie className="jl-ci-icon" />
                                    <span>Experience: <strong>{app.experience || 'Not specified'}</strong></span>
                                </div>
                            </div>

                            {/* Cover Letter */}
                            {app.coverLetter && (
                                <div className="jl-cover">
                                    <button
                                        className="jl-cover-toggle"
                                        onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                                    >
                                        {expanded === app.id ? '▲ Hide' : '▼ View'} Cover Letter
                                    </button>
                                    {expanded === app.id && (
                                        <p className="jl-cover-text">{app.coverLetter}</p>
                                    )}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="jl-actions">
                                <a
                                    href={`/api/resumes/${app.resumePath.split('/').pop()}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="jl-btn-download"
                                >
                                    <FaDownload /> Download Resume
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobLeads;
