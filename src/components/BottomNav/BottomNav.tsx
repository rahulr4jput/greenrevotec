import React from 'react';
import './BottomNav.css';

interface NavAction {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    active?: boolean;
}

interface BottomNavProps {
    actions: NavAction[];
}

const BottomNav: React.FC<BottomNavProps> = ({ actions }) => {
    return (
        <div className="bottom-nav">
            <div className="bottom-nav-inner">
                {actions.map((action, index) => (
                    <button
                        key={index}
                        className={`bottom-nav-item ${action.active ? 'active' : ''}`}
                        onClick={action.onClick}
                    >
                        <span className="nav-icon">{action.icon}</span>
                        <span className="nav-label">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
