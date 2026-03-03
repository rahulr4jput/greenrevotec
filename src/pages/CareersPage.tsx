import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMapMarkerAlt, FaBriefcase, FaEnvelope, FaTimes, FaFileUpload, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import '../components/Contact/Contact.css'; // Reusing premium card styles
import './CareersPage.css';

interface JobOpening {
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string[]; // parsed from JSON
    contactEmail?: string;
}

const CareersPage: React.FC = () => {
    const [jobs, setJobs] = useState<JobOpening[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
    const [applyingFor, setApplyingFor] = useState<JobOpening | null>(null);

    // Application Form State
    const [formData, setFormData] = useState({
        candidateName: '',
        email: '',
        phone: '',
        experience: '',
        coverLetter: ''
    });
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await fetch('/api/jobs?public=true');
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (error) {
            console.error("Failed to load jobs", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleJobExpand = (id: string) => {
        setExpandedJobId(prev => prev === id ? null : id);
    };

    const handleApplyClick = (job: JobOpening, e: React.MouseEvent) => {
        e.stopPropagation();
        setApplyingFor(job);
        setSubmitSuccess(false);
        setSubmitError('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (validTypes.includes(file.type)) {
                if (file.size <= 5 * 1024 * 1024) { // 5MB
                    setResumeFile(file);
                    setSubmitError('');
                } else {
                    setSubmitError('File size must be less than 5MB.');
                    setResumeFile(null);
                }
            } else {
                setSubmitError('Only PDF and Word documents are allowed.');
                setResumeFile(null);
            }
        }
    };

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!applyingFor || !resumeFile) return;

        setIsSubmitting(true);
        setSubmitError('');

        const data = new FormData();
        data.append('jobOpeningId', applyingFor.id);
        data.append('candidateName', formData.candidateName);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('experience', formData.experience);
        data.append('coverLetter', formData.coverLetter);
        data.append('resume', resumeFile);

        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                body: data, // No Content-Type header needed for FormData; browser sets it with boundary
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to submit application');
            }

            setSubmitSuccess(true);
            setFormData({ candidateName: '', email: '', phone: '', experience: '', coverLetter: '' });
            setResumeFile(null);
        } catch (err: any) {
            setSubmitError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container unified-careers">
            <div className="container">
                {/* — Hero Header — */}
                <div className="careers-hero-header">
                    <motion.div
                        className="careers-hero-badge"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <span className="badge-dot" />
                        We're Hiring
                    </motion.div>

                    <motion.h1
                        className="careers-hero-title"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        Shape the Future of{' '}
                        <span className="careers-title-highlight">Agriculture</span>
                    </motion.h1>

                    <motion.p
                        className="careers-hero-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.35 }}
                    >
                        We're building a greener future and we need passionate people to do it.
                        Explore open roles at GreenRevotec and make a global impact.
                    </motion.p>

                    <motion.div
                        className="careers-hero-stats"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <div className="hero-stat">
                            <span className="hero-stat-icon">🌱</span>
                            <span>Mission-driven culture</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-icon">🌍</span>
                            <span>Global impact</span>
                        </div>
                        <div className="hero-stat-divider" />
                        <div className="hero-stat">
                            <span className="hero-stat-icon">🚀</span>
                            <span>Fast-growing team</span>
                        </div>
                    </motion.div>
                </div>

                {isLoading ? (
                    <div className="loading-spinner"><FaSpinner className="spin" /> Loading opportunities...</div>
                ) : jobs.length === 0 ? (
                    <div className="glass-card text-center" style={{ padding: '60px 20px', maxWidth: '600px', margin: '0 auto' }}>
                        <FaBriefcase style={{ fontSize: '3rem', color: 'var(--color-primary-light)', marginBottom: '20px' }} />
                        <h3>No Open Positions Currently</h3>
                        <p style={{ color: 'rgba(255,255,255,0.7)' }}>Please check back later or follow our social media for updates on new opportunities.</p>
                    </div>
                ) : (
                    <div className="jobs-grid-unified">
                        {jobs.map(job => (
                            <div key={job.id} className="job-card-unified glass-card">
                                <div className="job-card-header">
                                    <div className="job-meta">
                                        <span className="badge badge-green">{job.department}</span>
                                        <span className="badge badge-gold">{job.type}</span>
                                    </div>
                                    <h3 className="job-title">{job.title}</h3>
                                    <div className="job-location">
                                        <FaMapMarkerAlt className="job-icon" /> {job.location}
                                    </div>
                                </div>

                                <div className="job-card-body-unified">
                                    <div className="job-description">
                                        <h4>Role Overview</h4>
                                        <p className="job-desc-text">{job.description}</p>
                                    </div>

                                    {(job.requirements && job.requirements.length > 0) && (
                                        <div className="job-requirements">
                                            <h4>Requirements</h4>
                                            <ul>
                                                {job.requirements.map((req, i) => (
                                                    <li key={i}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="job-actions">
                                        <button
                                            className="btn btn-primary"
                                            onClick={(e) => handleApplyClick(job, e)}
                                        >
                                            Apply Now
                                        </button>
                                        {job.contactEmail && (
                                            <a href={`mailto:${job.contactEmail}`} className="job-email-link" onClick={e => e.stopPropagation()}>
                                                <FaEnvelope /> Email Us
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Application Modal */}
            <AnimatePresence>
                {applyingFor && (
                    <div className="modal-overlay" onClick={() => !isSubmitting && setApplyingFor(null)}>
                        <motion.div
                            className="apply-modal glass-card"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className="modal-close" onClick={() => setApplyingFor(null)} disabled={isSubmitting}>
                                <FaTimes />
                            </button>

                            {submitSuccess ? (
                                <div className="apply-success text-center">
                                    <FaCheckCircle className="success-icon" />
                                    <h3>Application Submitted!</h3>
                                    <p>Thank you for applying for the <strong>{applyingFor.title}</strong> role. Our team will review your application and get back to you soon.</p>
                                    <button className="btn btn-outline mt-4" onClick={() => setApplyingFor(null)}>Close</button>
                                </div>
                            ) : (
                                <>
                                    <div className="apply-header">
                                        <h2>Apply for {applyingFor.title}</h2>
                                        <p>Please fill out the form below and attach your resume.</p>
                                    </div>

                                    {submitError && <div className="form-error">{submitError}</div>}

                                    <form onSubmit={handleSubmitApplication} className="apply-form">
                                        <div className="gr-form-group">
                                            <label className="gr-label">Full Name *</label>
                                            <input
                                                type="text"
                                                className="gr-input"
                                                required
                                                style={{ paddingLeft: '18px' }} // overriding icon offset
                                                value={formData.candidateName}
                                                onChange={e => setFormData({ ...formData, candidateName: e.target.value })}
                                            />
                                        </div>

                                        <div className="form-row grid-2">
                                            <div className="gr-form-group">
                                                <label className="gr-label">Email Address *</label>
                                                <input
                                                    type="email"
                                                    className="gr-input"
                                                    required
                                                    style={{ paddingLeft: '18px' }}
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="gr-form-group">
                                                <label className="gr-label">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    className="gr-input"
                                                    required
                                                    style={{ paddingLeft: '18px' }}
                                                    value={formData.phone}
                                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="gr-form-group">
                                            <label className="gr-label">Years of Experience *</label>
                                            <select
                                                className="gr-select"
                                                required
                                                style={{ paddingLeft: '18px' }}
                                                value={formData.experience}
                                                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                                            >
                                                <option value="" disabled>Select your experience</option>
                                                <option value="Fresher">Fresher (0 years)</option>
                                                <option value="1-3 Years">1 - 3 Years</option>
                                                <option value="3-5 Years">3 - 5 Years</option>
                                                <option value="5-10 Years">5 - 10 Years</option>
                                                <option value="10+ Years">10+ Years</option>
                                            </select>
                                        </div>

                                        <div className="gr-form-group">
                                            <label className="gr-label">Resume / CV *</label>
                                            <div className="file-upload-wrapper">
                                                <input
                                                    type="file"
                                                    id="resume-upload"
                                                    className="file-input-hidden"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={handleFileChange}
                                                    required
                                                />
                                                <label htmlFor="resume-upload" className="file-upload-label">
                                                    <FaFileUpload className="upload-icon" />
                                                    <div className="upload-text">
                                                        <span className="primary-text">{resumeFile ? resumeFile.name : 'Click to upload your resume'}</span>
                                                        <span className="secondary-text">PDF or DOCX (Max 5MB)</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="gr-form-group">
                                            <label className="gr-label">Cover Letter (Optional)</label>
                                            <textarea
                                                className="gr-textarea"
                                                rows={4}
                                                value={formData.coverLetter}
                                                onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                                                placeholder="Briefly tell us why you are a good fit for this role..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? <><FaSpinner className="spin" /> Submitting...</> : 'Submit Application'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CareersPage;
