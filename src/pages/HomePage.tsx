import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero/Hero';
import WhyChooseUs from '../components/WhyChooseUs/WhyChooseUs';
import Products from '../components/Products/Products';
import Services from '../components/Services/Services';
import Speciality from '../components/Speciality/Speciality';
import Projects from '../components/Projects/Projects';
import BrandsTrust from '../components/BrandsTrust/BrandsTrust';
import Gallery from '../components/Gallery/Gallery';
import Awards from '../components/Awards/Awards';
import Testimonials from '../components/Testimonials/Testimonials';
import Pricing from '../components/Pricing/Pricing';
import OnboardUs from '../components/OnboardUs/OnboardUs';
import Contact from '../components/Contact/Contact';

const HomePage: React.FC = () => {
    const [visibility, setVisibility] = useState<Record<string, boolean>>({});
    const location = useLocation();

    // Scroll to section when navigated from another page
    useEffect(() => {
        const state = location.state as { scrollTo?: string } | null;
        if (state?.scrollTo) {
            // Wait for DOM to fully render sections
            setTimeout(() => {
                const el = document.getElementById(state.scrollTo!);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
            // Clear the state so refresh doesn't re-scroll
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    useEffect(() => {
        const loadVisibility = () => {
            const stored = localStorage.getItem('admin_section_visibility');
            const visibilityMap: Record<string, boolean> = stored ? JSON.parse(stored) : {};

            // Also check consolidated configs which might have their own visibility toggles
            const heroConfig = localStorage.getItem('admin_hero_config');
            if (heroConfig) {
                const data = JSON.parse(heroConfig);
                // Hero visibility is not explicitly in HomePage list but we could add it
            }

            const projectsConfig = localStorage.getItem('admin_projects_config');
            if (projectsConfig) {
                const data = JSON.parse(projectsConfig);
                if (data.sectionVisible !== undefined) {
                    visibilityMap.projects = data.sectionVisible;
                }
            }

            const galleryConfig = localStorage.getItem('admin_gallery_config');
            if (galleryConfig) {
                const data = JSON.parse(galleryConfig);
                if (data.sectionVisible !== undefined) {
                    visibilityMap.gallery = data.sectionVisible;
                }
            }

            const recognitionConfig = localStorage.getItem('admin_recognition_config');
            if (recognitionConfig) {
                const data = JSON.parse(recognitionConfig);
                if (data.sectionVisible !== undefined) {
                    visibilityMap.recognition = data.sectionVisible;
                }
            }

            const testimonialsConfig = localStorage.getItem('admin_testimonials_config');
            if (testimonialsConfig) {
                const data = JSON.parse(testimonialsConfig);
                if (data.sectionVisible !== undefined) {
                    visibilityMap.testimonials = data.sectionVisible;
                }
            }

            const pricingConfig = localStorage.getItem('admin_pricing_plans');
            if (pricingConfig) {
                const data = JSON.parse(pricingConfig);
                if (data.sectionVisible !== undefined) {
                    visibilityMap.pricing = data.sectionVisible;
                }
            }

            const whyChooseUsConfig = localStorage.getItem('admin_why_choose_us');
            if (whyChooseUsConfig) {
                const data = JSON.parse(whyChooseUsConfig);
                if (data.sectionVisible !== undefined) {
                    visibilityMap.whyChooseUs = data.sectionVisible;
                }
            }



            setVisibility(visibilityMap);
        };

        loadVisibility();

        const handleStorageChange = () => {
            loadVisibility();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Helper to check visibility (default true)
    const isVisible = (section: string) => visibility[section] !== false;

    return (
        <main>
            <Hero />
            <WhyChooseUs />
            {isVisible('products') && <Products />}
            {isVisible('services') && <Services />}
            <Speciality />
            {isVisible('projects') && <Projects />}
            {isVisible('brands') && <BrandsTrust />}
            {isVisible('gallery') && <Gallery />}
            {isVisible('recognition') && <Awards />}
            {isVisible('testimonials') && <Testimonials />}
            {isVisible('pricing') && <Pricing />}
            {isVisible('onboard') && <OnboardUs />}
            <Contact />
        </main>
    );
};

export default HomePage;
