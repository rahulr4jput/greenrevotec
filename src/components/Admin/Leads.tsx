import React, { useState, useEffect } from 'react';
import './Leads.css';

interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    type: string;
    source: string;
    timestamp: string;
    productName?: string;
}

const Leads: React.FC = () => {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeads = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/leads');
            const data = await response.json();
            setLeads(data);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleDelete = async (idToDelete: string) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                const response = await fetch(`/api/leads/${idToDelete}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    setLeads(leads.filter(lead => lead.id !== idToDelete));
                }
            } catch (error) {
                console.error('Error deleting lead:', error);
                alert('Failed to delete lead');
            }
        }
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div>
            <div className="admin-view-header">
                <h3>Leads Management</h3>
                <p>View and manage inquiries from farmers, distributors, and corporates.</p>
            </div>

            <div className="admin-leads-table-container">
                {loading ? (
                    <div className="empty-state">
                        <p>Loading leads...</p>
                    </div>
                ) : leads.length === 0 ? (
                    <div className="empty-state">
                        <p>No leads found. When a user submits a contact form, it will appear here.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-leads-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Contact Details</th>
                                    <th>Inquiry Type</th>
                                    <th>Message Preview</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td className="lead-date">{formatDate(lead.timestamp)}</td>
                                        <td>
                                            <div className="lead-name">{lead.name}</div>
                                            <div className="lead-contact">
                                                <span>{lead.phone}</span>
                                                {lead.email && <span>{lead.email}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`lead-type-badge type-${lead.type}`}>
                                                {lead.type || 'General'}
                                            </span>
                                        </td>
                                        <td className="lead-message">
                                            {lead.subject && <span className="lead-subject">{lead.subject}</span>}
                                            {lead.productName && <span className="lead-product-tag">Product: {lead.productName}</span>}
                                            <span className="lead-excerpt">{lead.message}</span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-delete-lead"
                                                onClick={() => handleDelete(lead.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Leads;
