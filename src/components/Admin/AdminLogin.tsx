import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import './AdminAuth.css';

const AdminLogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Hardcoded credentials as per requirements
        if (username === 'rahulr4jput' && password === 'St20040@**') {
            // Mock authentication session with 60 minute timeout
            const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes
            localStorage.setItem('isAdminAuthenticated', 'true');
            localStorage.setItem('adminSessionExpiry', (Date.now() + SESSION_TIMEOUT_MS).toString());
            navigate('/admin/leads');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Admin Portal</h2>
                    <p>Enter your credentials to access the dashboard</p>
                </div>

                {error && <div className="login-error">{error}</div>}

                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-with-icon">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <FaLock className="input-icon" />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password"
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary login-btn">
                        Sign In
                    </button>
                </form>

                <div className="login-footer">
                    <a href="/">&larr; Back to Website</a>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
