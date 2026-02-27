import React, { useEffect } from 'react';
import { FaShieldAlt, FaCalendarAlt, FaEnvelope, FaLeaf } from 'react-icons/fa';
import './LegalPage.css';

const sections = [
    {
        id: 'info-collect',
        title: 'Information We Collect',
        content: (
            <>
                <p>Green Revotec Private Limited ("we," "our," or "us") collects information to provide better agricultural technology services to farmers, distributors, and business partners across India. We collect:</p>
                <h3>1.1 Personal Information</h3>
                <ul>
                    <li><strong>Contact Details:</strong> Name, phone number, email address, and postal address when you register or contact us.</li>
                    <li><strong>Farm & Land Information:</strong> Land size (in acres/hectares), crop types, soil test results, irrigation details, and location data to personalize advisory services.</li>
                    <li><strong>Business Information:</strong> GST number, distributor/retailer licence details, and bank account details for partnership programs.</li>
                    <li><strong>Identity Verification:</strong> Aadhaar number or PAN (with your consent) for government subsidy-linked programs where required by law.</li>
                </ul>
                <h3>1.2 Usage Data</h3>
                <ul>
                    <li>Pages visited, products viewed, and time spent on our website.</li>
                    <li>Device type, browser, IP address, and approximate geographic location.</li>
                    <li>Interaction with our soil testing reports, advisory emails, and drone survey bookings.</li>
                </ul>
                <h3>1.3 Communication Data</h3>
                <ul>
                    <li>Calls, WhatsApp messages, and emails exchanged with our agronomists and customer support.</li>
                    <li>Feedback, reviews, and survey responses submitted through our platform.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'info-use',
        title: 'How We Use Your Information',
        content: (
            <>
                <p>We use the collected information for the following agricultural and business purposes:</p>
                <ul>
                    <li><strong>Service Delivery:</strong> To provide crop advisory, soil analysis, drone scouting, smart irrigation planning, and farmer training services.</li>
                    <li><strong>Product Recommendations:</strong> To recommend relevant fertilizers, pesticides, organic solutions, and irrigation equipment based on your crop and soil profile.</li>
                    <li><strong>Order Fulfilment:</strong> To process purchases of agricultural inputs, issue invoices, and coordinate delivery through our distributor network.</li>
                    <li><strong>Partnership Management:</strong> To manage distributor, retailer, and FPO partnerships, including commission calculations and territory assignments.</li>
                    <li><strong>Regulatory Compliance:</strong> To fulfill obligations under applicable laws including the Fertilizers (Control) Order, the Insecticides Act, and FSSAI regulations.</li>
                    <li><strong>Research & Development:</strong> Anonymised, aggregated farm data helps us improve crop yield models, pest prediction algorithms, and irrigation scheduling systems.</li>
                    <li><strong>Communications:</strong> To send seasonal crop advisories, product alerts, disease/pest outbreak warnings, and promotional offers (with your consent).</li>
                </ul>
            </>
        ),
    },
    {
        id: 'sharing',
        title: 'Data Sharing & Disclosure',
        content: (
            <>
                <p>We do <strong>not sell</strong> your personal information. We may share data in the following limited circumstances:</p>
                <ul>
                    <li><strong>Authorised Partners:</strong> Agronomists, third-party soil testing laboratories, and certified drone operators engaged to deliver services you have requested.</li>
                    <li><strong>Logistics Partners:</strong> Courier and logistics companies that ship agricultural inputs to your registered address.</li>
                    <li><strong>Government Bodies:</strong> NABARD, state agriculture departments, or other regulatory authorities when required by law or for subsidy disbursement.</li>
                    <li><strong>Financial Institutions:</strong> Banks or NBFCs if you apply for crop insurance or agricultural credit lines through our platform.</li>
                    <li><strong>Technology Providers:</strong> Strictly vetted cloud hosting, analytics, and SMS/WhatsApp providers governed by data processing agreements.</li>
                </ul>
                <p>All third parties are contractually required to process your data only for the specified purpose and in compliance with applicable Indian data protection laws.</p>
            </>
        ),
    },
    {
        id: 'security',
        title: 'Data Security',
        content: (
            <>
                <p>We implement industry-standard measures to protect your personal and farm data:</p>
                <ul>
                    <li>TLS/SSL encryption for all data transmitted between your device and our servers.</li>
                    <li>AES-256 encryption for sensitive data at rest, including soil reports and identity documents.</li>
                    <li>Role-based access control ensuring only authorised personnel can access your farm data.</li>
                    <li>Regular security audits and penetration testing of our digital platforms.</li>
                    <li>Secure, ISO 27001-aligned data centres within India.</li>
                </ul>
                <p>In the event of a data breach that may affect your rights, we will notify you within 72 hours as required by applicable regulations.</p>
            </>
        ),
    },
    {
        id: 'retention',
        title: 'Data Retention',
        content: (
            <>
                <p>We retain your data for the following periods:</p>
                <ul>
                    <li><strong>Account & Farm Profile:</strong> Duration of your active relationship + 3 years post-termination for legal compliance.</li>
                    <li><strong>Soil Test & Advisory Reports:</strong> 7 years, as the data is valuable for long-term crop planning and regulatory purposes.</li>
                    <li><strong>Transaction & Invoice Records:</strong> 8 years as required under Indian tax and GST laws.</li>
                    <li><strong>Marketing Preferences:</strong> Until you withdraw consent or request deletion.</li>
                    <li><strong>Website Analytics:</strong> 14 months, aggregated after that period.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'rights',
        title: 'Your Rights',
        content: (
            <>
                <p>You have the following rights with respect to your personal data:</p>
                <ul>
                    <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                    <li><strong>Correction:</strong> Request correction of inaccurate or outdated farm or personal information.</li>
                    <li><strong>Deletion:</strong> Request deletion of your data (subject to legal retention requirements).</li>
                    <li><strong>Portability:</strong> Receive your farm profile data in a structured, machine-readable format.</li>
                    <li><strong>Objection:</strong> Object to processing for marketing purposes at any time.</li>
                    <li><strong>Consent Withdrawal:</strong> Withdraw consent for optional data processing without affecting past processing.</li>
                </ul>
                <p>To exercise any of these rights, contact our Data Protection Officer at <strong>privacy@greenrevotec.com</strong>. We will respond within 30 days.</p>
            </>
        ),
    },
    {
        id: 'cookies',
        title: 'Cookies',
        content: (
            <>
                <p>Our website uses cookies and similar tracking technologies to enhance your browsing experience. Please refer to our <a href="/cookie-policy" style={{ color: 'var(--color-primary-light)', textDecoration: 'underline' }}>Cookie Policy</a> for detailed information. You can manage cookie preferences through your browser settings or our cookie consent banner.</p>
            </>
        ),
    },
    {
        id: 'contact',
        title: 'Contact & Grievance Redressal',
        content: (
            <>
                <p>For any privacy-related concerns, please reach out to our dedicated Data Protection Officer:</p>
                <ul>
                    <li><strong>Name:</strong> Data Protection Officer, Green Revotec Pvt. Ltd.</li>
                    <li><strong>Email:</strong> privacy@greenrevotec.com</li>
                    <li><strong>Address:</strong> Green Revotec Private Limited, Agri-Tech Park, Pune, Maharashtra 411001, India</li>
                    <li><strong>Response Time:</strong> Within 30 working days</li>
                </ul>
                <p>If you are unsatisfied with our response, you may lodge a complaint with the appropriate data protection authority as provided under applicable Indian law.</p>
            </>
        ),
    },
];

const PrivacyPolicy: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Privacy Policy | Green Revotec';
    }, []);

    return (
        <div className="legal-page">
            {/* Hero */}
            <div className="legal-hero">
                <div className="container">
                    <div className="legal-badge"><FaShieldAlt /> Privacy Policy</div>
                    <h1 className="legal-title">Your Privacy Matters to Us</h1>
                    <p className="legal-subtitle">
                        We are committed to protecting the personal and farm data you share with us while delivering India's most trusted agri-tech services.
                    </p>
                    <div className="legal-meta">
                        <span className="legal-meta-item"><FaCalendarAlt /> Effective: 1 January 2025</span>
                        <span className="legal-meta-item"><FaCalendarAlt /> Last Updated: 24 February 2025</span>
                        <span className="legal-meta-item"><FaEnvelope /> privacy@greenrevotec.com</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="legal-content">
                {/* Table of Contents */}
                <aside className="legal-toc">
                    <p className="legal-toc-title">Contents</p>
                    {sections.map((s, i) => (
                        <a key={s.id} href={`#${s.id}`} className="legal-toc-link">
                            {i + 1}. {s.title}
                        </a>
                    ))}
                </aside>

                {/* Sections */}
                <div className="legal-sections">
                    {sections.map((s, i) => (
                        <div key={s.id} id={s.id} className="legal-section">
                            <span className="legal-section-number">Section {i + 1}</span>
                            <h2>{s.title}</h2>
                            {s.content}
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div className="legal-cta">
                <div className="legal-cta-inner">
                    <h3>Questions About Your Data?</h3>
                    <p>Our team is here to help. Reach out to our Data Protection Officer directly.</p>
                    <a href="mailto:privacy@greenrevotec.com"><FaEnvelope /> privacy@greenrevotec.com</a>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
