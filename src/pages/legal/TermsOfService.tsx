import React, { useEffect } from 'react';
import { FaFileContract, FaCalendarAlt, FaEnvelope, FaLeaf } from 'react-icons/fa';
import './LegalPage.css';

const sections = [
    {
        id: 'acceptance',
        title: 'Acceptance of Terms',
        content: (
            <>
                <p>By accessing or using the website, mobile applications, or services of <strong>Green Revotec Private Limited</strong> ("Green Revotec," "we," "our," or "us"), you agree to be bound by these Terms of Service ("Terms"). These Terms apply to all visitors, farmers, distributors, retailers, FPOs, and any other users of our platform.</p>
                <p>If you do not agree to these Terms, please do not access or use our services. We reserve the right to update these Terms at any time; continued use of our services constitutes acceptance of the revised Terms.</p>
            </>
        ),
    },
    {
        id: 'services',
        title: 'Description of Services',
        content: (
            <>
                <p>Green Revotec provides a suite of agricultural technology products and services including but not limited to:</p>
                <ul>
                    <li><strong>Agricultural Inputs:</strong> Supply of fertilizers, bio-pesticides, organic solutions, irrigation hardware, and soil testing kits.</li>
                    <li><strong>Crop Advisory Services:</strong> Personalized agronomist consultations, crop nutrition planning, and seasonal field recommendations.</li>
                    <li><strong>Soil Testing & Analysis:</strong> Laboratory analysis of soil samples with AI-powered crop suitability reports.</li>
                    <li><strong>Drone-Based Crop Scouting:</strong> Aerial multispectral imaging for pest, disease, and nutrient deficiency detection.</li>
                    <li><strong>Smart Irrigation Management:</strong> IoT-based scheduling systems and sensor monitoring services.</li>
                    <li><strong>Farmer Training Programs:</strong> On-site and digital workshops on modern agricultural practices.</li>
                    <li><strong>Market Linkage Services:</strong> Connection with buyers, commodity exchanges, and export channels.</li>
                    <li><strong>Partnership Programs:</strong> Distributor, retailer, and FPO onboarding and management.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'user-obligations',
        title: 'User Obligations',
        content: (
            <>
                <p>By using our services, you agree to:</p>
                <ul>
                    <li>Provide accurate and current information about your farm, land holdings, crop types, and contact details.</li>
                    <li>Use agricultural inputs strictly in compliance with the <strong>Fertilizers (Control) Order 1985</strong>, the <strong>Insecticides Act 1968</strong>, and all other applicable Indian laws and state regulations.</li>
                    <li>Follow all safety and application guidelines provided with our products and advisory reports.</li>
                    <li>Not resell, redistribute, or repackage any Green Revotec products without prior written authorisation as an accredited distributor or retailer.</li>
                    <li>Not misrepresent product certifications, subsidies, or government approvals to third parties.</li>
                    <li>Keep your account credentials confidential and notify us immediately of any unauthorised access.</li>
                    <li>Not use our digital platforms to transmit malicious code, spam, or engage in any fraudulent activity.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'products-liability',
        title: 'Products & Advisory Liability',
        content: (
            <>
                <h3>4.1 Agricultural Products</h3>
                <p>All products sold by Green Revotec comply with applicable Indian agricultural regulations at the time of sale. However:</p>
                <ul>
                    <li>Crop outcomes depend on numerous environmental and agronomic factors beyond our control, including rainfall, temperature, soil microbiology, and pest pressure.</li>
                    <li>Users must follow all label instructions, dosage guidelines, and safety precautions. Green Revotec shall not be liable for crop damage arising from improper application.</li>
                    <li>Products must be stored under recommended conditions. Liability for damage caused by improper storage rests with the user.</li>
                </ul>
                <h3>4.2 Crop Advisory & AI Recommendations</h3>
                <p>Our crop advisory services, AI-based recommendations, and soil analysis reports are provided as <strong>professional guidance</strong> and not as guarantees of yield or outcomes. Actual results may vary based on local conditions. Farmers maintain full responsibility for all farming decisions.</p>
                <h3>4.3 Drone Scouting Services</h3>
                <p>Drone operations are conducted by certified operators in compliance with DGCA regulations. Service availability is subject to weather conditions, airspace clearances, and field accessibility.</p>
            </>
        ),
    },
    {
        id: 'payments',
        title: 'Payments & Refunds',
        content: (
            <>
                <ul>
                    <li><strong>Payment Terms:</strong> Services and products must be paid for as per the agreed schedule. Distributors are bound by the specific credit terms in their partnership agreements.</li>
                    <li><strong>GST Compliance:</strong> All prices are inclusive/exclusive of GST as stated. GST invoices will be issued for all transactions.</li>
                    <li><strong>Returns Policy:</strong> Sealed, undamaged agricultural input products may be returned within 15 days of delivery with proof of purchase. Soil testing and advisory advisory fees are non-refundable once the service has been initiated.</li>
                    <li><strong>Defective Products:</strong> If a product is found to be defective or out of specification, raise a claim within 7 days of receipt. We will arrange replacement or refund after investigation.</li>
                    <li><strong>Failed Deliveries:</strong> Unclaimed shipments returned to our warehouse may attract re-delivery charges.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual Property',
        content: (
            <>
                <p>All content on the Green Revotec platform — including crop advisory algorithms, soil analysis models, training materials, product formulations, logos, brand assets, and website design — is the exclusive intellectual property of Green Revotec Private Limited or its licensors.</p>
                <ul>
                    <li>You may not reproduce, distribute, adapt, or commercially exploit any of our proprietary content without express written permission.</li>
                    <li>Soil test reports and advisory documents issued to you are licensed for personal use on your registered farm only.</li>
                    <li>The Green Revotec name, logo, and brand marks are registered trademarks and may not be used without authorisation.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'limitation',
        title: 'Limitation of Liability',
        content: (
            <>
                <p>To the maximum extent permitted by applicable law, Green Revotec shall not be liable for:</p>
                <ul>
                    <li>Crop failure, yield reduction, or loss of produce arising from natural disasters, unforeseen pest outbreaks, or factors beyond reasonable agronomic control.</li>
                    <li>Indirect, incidental, or consequential damages arising from the use or inability to use our services.</li>
                    <li>Any loss arising from reliance on third-party data sources, weather forecasts, or market price information provided through our platform.</li>
                    <li>Disruptions in IoT sensor services due to power outages, connectivity failures, or hardware damage beyond normal wear.</li>
                </ul>
                <p>Our total aggregate liability for any claim shall not exceed the amount paid by you for the specific service giving rise to the claim in the 3 months preceding the incident.</p>
            </>
        ),
    },
    {
        id: 'termination',
        title: 'Termination',
        content: (
            <>
                <p>Green Revotec reserves the right to suspend or terminate your access to our services with immediate effect if you:</p>
                <ul>
                    <li>Breach any provision of these Terms.</li>
                    <li>Engage in fraudulent, illegal, or abusive behaviour on our platform.</li>
                    <li>Misuse government subsidy-linked programs or misrepresent your eligibility.</li>
                    <li>Fail to make payment as per agreed terms after written notice.</li>
                </ul>
                <p>You may terminate your account at any time by contacting us. Outstanding obligations (including payments) will survive termination.</p>
            </>
        ),
    },
    {
        id: 'governing-law',
        title: 'Governing Law & Disputes',
        content: (
            <>
                <p>These Terms shall be governed by and construed in accordance with the laws of India. Any dispute arising from or related to these Terms shall be subject to:</p>
                <ul>
                    <li><strong>Mediation First:</strong> Parties agree to attempt good-faith mediation before initiating formal proceedings.</li>
                    <li><strong>Arbitration:</strong> Unresolved disputes shall be referred to arbitration under the Arbitration and Conciliation Act 1996, with a single arbitrator mutually appointed.</li>
                    <li><strong>Jurisdiction:</strong> Courts in Pune, Maharashtra, shall have exclusive jurisdiction for any legal proceedings.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'contact-legal',
        title: 'Contact',
        content: (
            <>
                <p>For any questions about these Terms, please contact:</p>
                <ul>
                    <li><strong>Email:</strong> legal@greenrevotec.com</li>
                    <li><strong>Address:</strong> Green Revotec Private Limited, Agri-Tech Park, Pune, Maharashtra 411001</li>
                    <li><strong>Phone:</strong> +91 98765 43210</li>
                </ul>
            </>
        ),
    },
];

const TermsOfService: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Terms of Service | Green Revotec';
    }, []);

    return (
        <div className="legal-page">
            {/* Hero */}
            <div className="legal-hero">
                <div className="container">
                    <div className="legal-badge"><FaFileContract /> Terms of Service</div>
                    <h1 className="legal-title">Terms of Service</h1>
                    <p className="legal-subtitle">
                        Clear, fair terms governing how you use Green Revotec's agricultural technology products, advisory services, and digital platforms.
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
                    <h3>Have a Legal Query?</h3>
                    <p>Our legal team is available for partnership and compliance queries.</p>
                    <a href="mailto:legal@greenrevotec.com"><FaEnvelope /> legal@greenrevotec.com</a>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
