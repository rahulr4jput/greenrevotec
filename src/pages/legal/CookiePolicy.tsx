import React, { useEffect } from 'react';
import { FaCookieBite, FaCalendarAlt, FaEnvelope, FaLeaf } from 'react-icons/fa';
import './LegalPage.css';

const sections = [
    {
        id: 'what-are-cookies',
        title: 'What Are Cookies?',
        content: (
            <>
                <p>Cookies are small text files stored on your device (computer, tablet, or smartphone) when you visit a website. They contain information that helps the website recognise your device on subsequent visits to provide a better, more personalised experience.</p>
                <p>Similar technologies — such as pixel tags, web beacons, local storage, and session storage — may also be used alongside cookies to achieve the same purposes. This policy covers all such technologies collectively.</p>
            </>
        ),
    },
    {
        id: 'cookies-we-use',
        title: 'Cookies We Use',
        content: (
            <>
                <h3>2.1 Strictly Necessary Cookies</h3>
                <p>These cookies are essential for the website to function and cannot be disabled. They include:</p>
                <ul>
                    <li><strong>Session Cookies:</strong> Maintain your logged-in state during your visit to the admin portal.</li>
                    <li><strong>Security Cookies:</strong> Protect against CSRF attacks and ensure secure form submissions.</li>
                    <li><strong>Load Balancing Cookies:</strong> Distribute traffic efficiently across our servers.</li>
                    <li><strong>Cookie Consent Cookie:</strong> Remembers your cookie preferences.</li>
                </ul>
                <p><em>Legal Basis: Legitimate Interest / Contractual Necessity</em></p>

                <h3>2.2 Functional Cookies</h3>
                <p>These cookies enhance your experience by remembering your choices:</p>
                <ul>
                    <li><strong>Theme Preference:</strong> Remembers whether you selected dark or light mode on our website.</li>
                    <li><strong>Region / State:</strong> Saves your preferred farming region so we can display relevant crop calendars and local advisory.</li>
                    <li><strong>Language Preference:</strong> If you select a regional language, we remember it for future visits.</li>
                    <li><strong>Recently Viewed Products:</strong> Shows you products you recently explored, improving navigation.</li>
                </ul>
                <p><em>Legal Basis: Consent</em></p>

                <h3>2.3 Analytics Cookies</h3>
                <p>We use analytics cookies to understand how visitors interact with our platform so we can improve our services:</p>
                <ul>
                    <li><strong>Google Analytics:</strong> Tracks page views, session duration, and user flow across advisory pages and product listings. Data is anonymised and aggregated.</li>
                    <li><strong>Hotjar (if enabled):</strong> Heatmaps and session recordings (with IP masking) to understand UX friction points.</li>
                    <li><strong>Internal Analytics:</strong> Our own statistics on which crop advisory topics, drone services, and soil services are most accessed.</li>
                </ul>
                <p><em>Legal Basis: Consent</em></p>

                <h3>2.4 Marketing & Targeting Cookies</h3>
                <p>With your consent, we may use cookies to deliver relevant content and advertisements:</p>
                <ul>
                    <li><strong>Retargeting Pixels:</strong> To show Green Revotec content on partner platforms to users who have previously shown interest in our soil testing or irrigation services.</li>
                    <li><strong>Social Media Cookies:</strong> Facebook and LinkedIn pixels to measure the effectiveness of our awareness campaigns targeting agricultural communities.</li>
                    <li><strong>Campaign Attribution:</strong> To measure which WhatsApp, SMS, or email campaigns drive the most distributor sign-ups.</li>
                </ul>
                <p><em>Legal Basis: Consent – you can withdraw this at any time.</em></p>
            </>
        ),
    },
    {
        id: 'third-party',
        title: 'Third-Party Cookies',
        content: (
            <>
                <p>Some cookies are set by our trusted third-party partners. These partners may include:</p>
                <ul>
                    <li><strong>Google LLC</strong> – Analytics and advertising services</li>
                    <li><strong>Meta Platforms (Facebook/Instagram)</strong> – Social media share buttons and campaign pixels</li>
                    <li><strong>LinkedIn Corporation</strong> – Professional network integration and B2B campaign tracking</li>
                    <li><strong>YouTube (Google LLC)</strong> – Embedded training and advisory videos</li>
                    <li><strong>Razorpay / PayU</strong> – Payment gateway session management</li>
                </ul>
                <p>These third parties have their own privacy and cookie policies. We encourage you to review them. Green Revotec is not responsible for third-party cookie practices.</p>
            </>
        ),
    },
    {
        id: 'duration',
        title: 'Cookie Duration',
        content: (
            <>
                <p>Cookies can be either <strong>session cookies</strong> (deleted when you close your browser) or <strong>persistent cookies</strong> (remain on your device for a set period):</p>
                <ul>
                    <li><strong>Session Cookies:</strong> Expire when your browser session ends (e.g., login state, cart items).</li>
                    <li><strong>Short-Term Persistent (up to 30 days):</strong> Season-specific crop alerts and recent product views.</li>
                    <li><strong>Medium-Term Persistent (up to 1 year):</strong> Theme preference, region preference, and language selection.</li>
                    <li><strong>Long-Term Persistent (up to 2 years):</strong> Marketing attribution and returning visitor recognition.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'manage',
        title: 'Managing Cookies',
        content: (
            <>
                <h3>5.1 Browser Settings</h3>
                <p>You can control and delete cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our website:</p>
                <ul>
                    <li><strong>Google Chrome:</strong> Settings → Privacy & Security → Cookies and other site data</li>
                    <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                    <li><strong>Microsoft Edge:</strong> Settings → Cookies and Site Permissions</li>
                </ul>
                <h3>5.2 Opt-Out Tools</h3>
                <ul>
                    <li><strong>Google Analytics Opt-Out:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-light)' }}>Google Analytics Opt-out Add-on</a></li>
                    <li><strong>Digital Advertising Alliance:</strong> <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary-light)' }}>aboutads.info/choices</a></li>
                </ul>
                <h3>5.3 Cookie Consent Banner</h3>
                <p>When you first visit our website, a cookie consent banner allows you to accept, reject, or customise non-essential cookies. You can revisit these preferences at any time by clicking "Cookie Settings" in the footer.</p>
            </>
        ),
    },
    {
        id: 'agri-specific',
        title: 'Agricultural Data & Local Storage',
        content: (
            <>
                <p>In addition to traditional cookies, our platform uses browser <strong>localStorage</strong> to store certain preferences on your device:</p>
                <ul>
                    <li>Your selected crop type and farm region for the Crop Advisory interface.</li>
                    <li>Saved product comparisons in the Fertilizer and Pesticide catalogue.</li>
                    <li>Soil test history shortcuts for returning customers.</li>
                    <li>Admin panel settings and display preferences (for registered partners and distributors).</li>
                </ul>
                <p>This data is stored entirely on your device and is not transmitted to our servers unless you explicitly save or sync your preferences. You can clear this data by clearing your browser's local storage or site data.</p>
            </>
        ),
    },
    {
        id: 'updates',
        title: 'Updates to This Policy',
        content: (
            <>
                <p>We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our services. When we make significant changes, we will notify you through our website's cookie consent banner. The "Last Updated" date at the top of this policy reflects the most recent revision.</p>
                <p>Continued use of our website after an update constitutes acceptance of the revised Cookie Policy.</p>
            </>
        ),
    },
    {
        id: 'contact-cookies',
        title: 'Contact Us',
        content: (
            <>
                <p>If you have any questions about our use of cookies or this policy, please contact us:</p>
                <ul>
                    <li><strong>Email:</strong> privacy@greenrevotec.com</li>
                    <li><strong>Address:</strong> Green Revotec Private Limited, Agri-Tech Park, Pune, Maharashtra 411001</li>
                </ul>
            </>
        ),
    },
];

const CookiePolicy: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Cookie Policy | Green Revotec';
    }, []);

    return (
        <div className="legal-page">
            {/* Hero */}
            <div className="legal-hero">
                <div className="container">
                    <div className="legal-badge"><FaCookieBite /> Cookie Policy</div>
                    <h1 className="legal-title">Cookie Policy</h1>
                    <p className="legal-subtitle">
                        Understanding how we use cookies and similar technologies to serve you better on India's leading agri-tech platform.
                    </p>
                    <div className="legal-meta">
                        <span className="legal-meta-item"><FaCalendarAlt /> Effective: 1 January 2025</span>
                        <span className="legal-meta-item"><FaCalendarAlt /> Last Updated: 24 February 2025</span>
                        <span className="legal-meta-item"><FaLeaf /> Green Revotec Pvt. Ltd.</span>
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
                    <h3>Questions About Cookies?</h3>
                    <p>We're happy to clarify how we use data to improve your farming advisory experience.</p>
                    <a href="mailto:privacy@greenrevotec.com"><FaEnvelope /> privacy@greenrevotec.com</a>
                </div>
            </div>
        </div>
    );
};

export default CookiePolicy;
