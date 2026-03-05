import React, { useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import SEO from '../components/SEO/SEO';
import { FaBullseye, FaEye, FaHandshake, FaLeaf, FaTractor, FaSun, FaTools } from 'react-icons/fa';
import './AboutPage.css';

const AboutPage: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fadeInUp: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as any } }
    };

    const staggerContainer: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    return (
        <div className="about-page">
            <SEO
                title="About Us | GreenRevotec - Leaders in Drip Irrigation"
                description="Learn about GreenRevotec, our mission to modernize farming with smart irrigation solutions, and our leadership team dedicated to sustainable agriculture in India."
                keywords="GreenRevotec About, Drip Irrigation Experts, Smart Agriculture India, Irrigation Solutions UP"
            />
            {/* Header Section */}
            <section className="about-header">
                <div className="container">
                    <motion.div
                        className="about-header-content"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <h1>About Us <span>Green Revotec</span></h1>
                        <p className="subtitle">Modernizing Agriculture for a Greener Tomorrow</p>
                    </motion.div>
                </div>
                <div className="about-header-bg"></div>
            </section>

            {/* Introduction Section */}
            <section className="about-intro">
                <div className="container">
                    <motion.div
                        className="intro-card glass-panel"
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <p>
                            <strong>Green Revotec</strong> is a technology-driven agriculture and irrigation solutions company based in Uttar Pradesh, India. Founded with a vision to modernize farming and landscape management, the company focuses on delivering innovative, sustainable, and efficient solutions for farmers, households, and commercial spaces.
                        </p>
                        <p>
                            Established in 2020, Green Revotec was created with the goal of bringing advanced agricultural technologies, smart irrigation systems, and renewable energy solutions to support the evolving needs of modern agriculture and landscape development.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="mission-vision-section">
                <div className="container">
                    <motion.div
                        className="mv-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.div className="mv-card" variants={fadeInUp}>
                            <div className="mv-icon-wrapper">
                                <FaBullseye className="mv-icon" />
                            </div>
                            <h2>Our Mission</h2>
                            <p>
                                Our mission is to empower farmers, homeowners, and businesses with efficient irrigation systems, sustainable farming solutions, and renewable solar technologies that improve productivity while conserving natural resources.
                            </p>
                        </motion.div>

                        <motion.div className="mv-card" variants={fadeInUp}>
                            <div className="mv-icon-wrapper">
                                <FaEye className="mv-icon" />
                            </div>
                            <h2>Our Vision</h2>
                            <p>
                                Green Revotec aims to become a leading provider of smart agriculture, irrigation, and renewable energy solutions in India, helping communities adopt environmentally responsible technologies that promote long-term sustainability and economic growth.
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* What We Do Section */}
            <section className="what-we-do-section section-padding bg-light">
                <div className="container">
                    <motion.div
                        className="section-header text-center"
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2>What We Do</h2>
                        <p className="section-desc">
                            At Green Revotec, we provide a wide range of solutions designed to improve water efficiency, crop productivity, and green infrastructure development.
                        </p>
                    </motion.div>

                    <motion.div
                        className="services-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        <motion.div className="service-item card-hover" variants={fadeInUp}>
                            <div className="service-icon"><FaTractor /></div>
                            <h3>Drip Irrigation & Farm Solutions</h3>
                            <p>Premium drip irrigation systems, mini sprinklers, and automated farm hydration that maximize water efficiency and crop yield.</p>
                        </motion.div>

                        <motion.div className="service-item card-hover" variants={fadeInUp}>
                            <div className="service-icon"><FaLeaf /></div>
                            <h3>Landscape Irrigation Systems</h3>
                            <p>Smart sprinkler systems and automated irrigation for gardens, parks, and commercial landscapes.</p>
                        </motion.div>

                        <motion.div className="service-item card-hover" variants={fadeInUp}>
                            <div className="service-icon"><span role="img" aria-label="garden">🌳</span></div>
                            <h3>Garden Development</h3>
                            <p>Design and development of beautiful and sustainable gardens, lawns, and landscape environments.</p>
                        </motion.div>

                        <motion.div className="service-item card-hover" variants={fadeInUp}>
                            <div className="service-icon"><FaTools /></div>
                            <h3>Agriculture & Gardening Equipment</h3>
                            <p>High-quality tools, organic products, and advanced equipment to support everyday farming and gardening needs.</p>
                        </motion.div>

                        <motion.div className="service-item card-hover" variants={fadeInUp}>
                            <div className="service-icon"><FaSun /></div>
                            <h3>Renewable Solar Energy Solutions</h3>
                            <p>Solar water pumps and renewable energy systems for both agricultural and domestic applications.</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Leadership Section */}
            <section className="leadership-section section-padding">
                <div className="container">
                    <motion.div
                        className="section-header text-center"
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <h2>Leadership</h2>
                        <p className="section-desc">
                            Green Revotec is led by visionary directors who are committed to bringing innovation and sustainability to agriculture and landscape development.
                        </p>
                    </motion.div>

                    <motion.div
                        className="directors-grid"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.div className="director-card" variants={fadeInUp}>
                            <div className="director-avatar">
                                <span>PR</span>
                            </div>
                            <div className="director-info">
                                <h3>Pradeep Kumar Rajput</h3>
                                <p className="director-title">Director | B.Tech in Agriculture</p>
                                <p className="director-exp">15 years of expertise in advanced agriculture, smart irrigation, and professional garden development.</p>
                            </div>
                        </motion.div>

                        <motion.div className="director-card" variants={fadeInUp}>
                            <div className="director-avatar">
                                <span>PD</span>
                            </div>
                            <div className="director-info">
                                <h3>Priyanka Devi</h3>
                                <p className="director-title">Director | Company Secretary</p>
                                <p className="director-exp">Head of Planning & Management, dedicated to ensuring exceptional customer experience with our products and services.</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="leadership-footer text-center"
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <p>Their leadership and dedication drive the company’s mission to create modern, efficient, and environmentally responsible solutions for farmers and communities.</p>
                    </motion.div>
                </div>
            </section>

            {/* Our Commitment Section */}
            <section className="commitment-section">
                <div className="container">
                    <motion.div
                        className="commitment-content text-center glass-panel"
                        variants={fadeInUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <div className="commitment-icon"><FaHandshake /></div>
                        <h2>Our Commitment</h2>
                        <p>
                            We believe that the future of agriculture and landscape management lies in technology, sustainability, and efficient resource management. Green Revotec is committed to delivering reliable solutions that help customers save water, reduce energy costs, and build greener environments.
                        </p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
