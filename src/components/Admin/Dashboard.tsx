import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div>
            <div className="admin-view-header">
                <h3>Welcome to Green Revotec Admin</h3>
                <p>Overview of your platform activities and quick stats.</p>
            </div>
            <div className="admin-card">
                <h4>Recent Activity</h4>
                <p style={{ marginTop: '12px', color: '#6b7280' }}>
                    Dashboard statistics and charts will be displayed here.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
