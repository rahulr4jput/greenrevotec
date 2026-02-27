import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiAlertCircle } from 'react-icons/fi';
import './NotFound.css';

const NotFound: React.FC = () => {
    return (
        <div className="not-found-container dot-pattern">
            <div className="not-found-content glass-card">
                <div className="not-found-icon">
                    <FiAlertCircle />
                </div>
                <h1 className="not-found-title">404</h1>
                <div className="section-divider centered"></div>
                <h2 className="not-found-subtitle">Oops! Page Not Found</h2>
                <p className="not-found-text">
                    The page you are looking for might have been removed, had its name changed,
                    or is temporarily unavailable.
                </p>
                <Link to="/" className="btn btn-primary btn-lg">
                    <FiHome className="btn-icon" /> Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
