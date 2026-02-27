import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import './Projects.css';

interface Project {
    id?: string;
    title: string;
    location: string;
    year: string;
    category: string;
    impact: string;
    description: string;
    color: string;
    bgPattern?: string;
    isActive?: boolean;
}

const defaultProjects: Project[] = [
    {
        title: 'Smart Irrigation Rollout — Punjab',
        location: 'Punjab, India',
        year: '2024',
        category: 'Irrigation Tech',
        impact: '8,000 Farmers Benefited',
        description: 'Deployed IoT-based precision irrigation across 45,000 acres of wheat farms, reducing water usage by 55% while increasing yield by 28%.',
        color: '#38bdf8',
        bgPattern: 'irrigation',
        isActive: true
    },
    {
        title: 'Organic Certification Drive — Maharashtra',
        location: 'Maharashtra, India',
        year: '2024',
        category: 'Organic Farming',
        impact: '₹12 Cr Revenue Generated',
        description: 'Assisted 3,200 cotton and soyabean farmers in transitioning to certified organic farming, opening premium export markets in Europe.',
        color: '#25b565',
        bgPattern: 'organic',
        isActive: true
    },
    {
        title: 'Drone Surveillance — Telangana',
        location: 'Telangana, India',
        year: '2023',
        category: 'Precision GreenRevotec',
        impact: '40% Pesticide Reduction',
        description: 'Introduced AI-powered drone fleet for real-time crop health monitoring and targeted spraying across 28,000 acres of paddy fields.',
        color: '#e879f9',
        bgPattern: 'drone',
        isActive: true
    },
    {
        title: 'Soil Rejuvenation Program — Rajasthan',
        location: 'Rajasthan, India',
        year: '2023',
        category: 'Soil Science',
        impact: '2.1M Tons Soil Restored',
        description: 'Large-scale soil health restoration using bio-organic amendments and microbial inoculants, transforming degraded desert-edge farmland.',
        color: '#f5a623',
        bgPattern: 'soil',
        isActive: true
    },
    {
        title: 'FPO Partnership Network — UP',
        location: 'Uttar Pradesh, India',
        year: '2023',
        category: 'Agri-Business',
        impact: '240 FPOs Connected',
        description: 'Partnered with 240 Farmer Producer Organizations across UP to provide subsidized inputs, financing, and direct market access.',
        color: '#84cc16',
        bgPattern: 'network',
        isActive: true
    },
    {
        title: 'Greenhouse Tech — Karnataka',
        location: 'Karnataka, India',
        year: '2022',
        category: 'Protected Cultivation',
        impact: '6x Yield Increase',
        description: 'Installed climate-controlled polyhouse and hydroponic systems for high-value vegetable cultivation in water-scarce regions.',
        color: '#f97316',
        bgPattern: 'greenhouse',
        isActive: true
    },
];

const Projects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>(defaultProjects);

    useEffect(() => {
        const loadProjects = () => {
            const consolidated = localStorage.getItem('admin_projects_config');
            if (consolidated) {
                const data = JSON.parse(consolidated);
                if (data.projects) {
                    const activeOnly = data.projects.filter((p: any) => p.isActive !== false);
                    if (activeOnly.length > 0) {
                        setProjects(activeOnly);
                    } else {
                        setProjects(defaultProjects);
                    }
                }
            } else {
                // Check legacy key
                const storedProjects = localStorage.getItem('admin_projects');
                if (storedProjects) {
                    const parsed = JSON.parse(storedProjects);
                    const activeOnly = parsed.filter((p: any) => p.isActive !== false);
                    if (activeOnly.length > 0) {
                        setProjects(activeOnly);
                    }
                }
            }
        };

        loadProjects();
        window.addEventListener('storage', loadProjects);
        return () => window.removeEventListener('storage', loadProjects);
    }, []);

    return (
        <section className="section projects" id="projects">
            <div className="container">
                <motion.div
                    className="section-header centered"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="section-label">Our Projects</div>
                    <h2 className="section-title">
                        Real Impact, <span>Real Results</span>
                    </h2>
                    <p className="section-subtitle">
                        From small-holder farms to large agri-corporate estates — our projects
                        span across 22 states and have impacted over 1.5 million farming families.
                    </p>
                </motion.div>

                <div className="projects-grid">
                    {projects.map((project, i) => (
                        <motion.div
                            key={project.id || i}
                            className="project-card glass-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1, duration: 0.6 }}
                            whileHover={{ y: -8 }}
                        >
                            {/* Top Bar */}
                            <div className="project-top-bar" style={{ background: `${project.color}22`, borderBottom: `2px solid ${project.color}44` }}>
                                <span className="project-category" style={{ color: project.color }}>{project.category}</span>
                                <span className="project-year">{project.year}</span>
                            </div>

                            {/* Content */}
                            <div className="project-content">
                                <h3 className="project-title">{project.title}</h3>
                                <p className="project-desc">{project.description}</p>

                                {/* Meta */}
                                <div className="project-meta">
                                    <div className="project-meta-item">
                                        <FaMapMarkerAlt /> {project.location}
                                    </div>
                                    <div className="project-meta-item">
                                        <FaCalendarAlt /> {project.year}
                                    </div>
                                </div>

                                {/* Impact Badge */}
                                <div className="project-impact" style={{ background: `${project.color}18`, color: project.color, border: `1px solid ${project.color}33` }}>
                                    🎯 {project.impact}
                                </div>

                                <button className="project-link">
                                    View Case Study <FaArrowRight />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Projects;
