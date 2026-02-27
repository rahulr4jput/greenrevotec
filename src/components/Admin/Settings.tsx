import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaUserEdit, FaProjectDiagram, FaHandshake, FaImages, FaAward,
    FaComments, FaTags, FaQuestionCircle, FaUserPlus, FaShareAlt,
    FaPhoneAlt, FaWindowMaximize, FaGlobe, FaLanguage, FaEye
} from 'react-icons/fa';
import './Settings.css';

const Settings: React.FC = () => {
    const settingsItems = [
        { title: 'Hero Section', path: '/admin/hero', icon: FaUserEdit, desc: 'Update home banner' }, // Changed icon based on provided import
        { title: 'Our Projects', path: '/admin/projects/all', icon: FaProjectDiagram, desc: 'Manage project portfolio' },
        { title: 'Trusted By', path: '/admin/trusted-by', icon: FaHandshake, desc: 'Partner brands & logos' }, // Changed icon based on provided import
        { title: 'Our Gallery', path: '/admin/gallery', icon: FaImages, desc: 'Photo gallery management' },
        { title: 'Recognition', path: '/admin/recognition', icon: FaAward, desc: 'Awards and certifications' },
        { title: 'Voice of Customer', path: '/admin/voice-of-customer', icon: FaComments, desc: 'Testimonials management' },
        { title: 'Pricing Plans', path: '/admin/pricing-plans', icon: FaTags, desc: 'Manage service pricing' },
        { title: 'Why Green Revotec', path: '/admin/why-choose-us', icon: FaQuestionCircle, desc: 'Unique selling points' }, // Changed icon based on provided import
        { title: 'Onboard With Us', path: '/admin/join-revolution', icon: FaUserPlus, desc: 'Partner onboarding' }, // Changed icon based on provided import
        { title: 'Social Media', path: '/admin/social', icon: FaShareAlt, desc: 'Social platform links' }, // Changed icon based on provided import
        { title: 'Contact Us', path: '/admin/contact', icon: FaPhoneAlt, desc: 'Contact info & details' }, // Changed icon based on provided import
        { title: 'Section Visibility', path: '/admin/visibility', icon: FaEye, desc: 'Toggle site sections' },
        { title: 'Footer Settings', path: '/admin/footer', icon: FaWindowMaximize, desc: 'Manage footer content' }, // Changed icon based on provided import
        { title: 'Site Identity', path: '/admin/site-identity', icon: FaGlobe, desc: 'Logo, Title & Meta' }, // Changed icon and desc based on provided snippet
        { title: 'Language Settings', path: '/admin/settings/languages', icon: FaLanguage, desc: 'Manage Site Languages' }
    ];

    return (
        <div className="settings-container">
            <div className="admin-view-header">
                <h3>Settings Dashboard</h3>
                <p>Consolidated management for all site sections and configurations.</p>
            </div>

            <div className="settings-grid">
                {settingsItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link to={item.path} key={index} className="settings-card">
                            <div className="settings-card-icon">
                                <Icon />
                            </div>
                            <div className="settings-card-title">{item.title}</div>
                            <div className="settings-card-description">{item.desc}</div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default Settings;
