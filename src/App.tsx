import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { PageTransitionProvider } from './components/PageTransition/PageTransition';
import SEO from './components/SEO/SEO';

// Public Components
import PublicLayout from './components/PublicLayout';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import ProductCatalog from './pages/ProductCatalog';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import CareersPage from './pages/CareersPage';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';
import NotFound from './pages/NotFound';

// Admin Components
import AdminLogin from './components/Admin/AdminLogin';
import ProtectedRoute from './components/Admin/ProtectedRoute';
import AdminLayout from './components/Admin/AdminLayout';
import Settings from './components/Admin/Settings';
import Leads from './components/Admin/Leads';
import ProductCategories from './components/Admin/Products/ProductCategories';
import AllProducts from './components/Admin/Products/AllProducts';
import CropManagement from './components/Admin/Products/CropManagement';
import AllServices from './components/Admin/Services/AllServices';
import ServiceCategories from './components/Admin/Services/ServiceCategories';
import AllProjects from './components/Admin/Projects/AllProjects';
import BrandsManagement from './components/Admin/Brands/BrandsManagement';
import GalleryManagement from './components/Admin/Gallery/GalleryManagement';
import RecognitionManagement from './components/Admin/Awards/RecognitionManagement';
import TestimonialsManagement from './components/Admin/Testimonials/TestimonialsManagement';
import PricingManagement from './components/Admin/Pricing/PricingManagement';
import OnboardManagement from './components/Admin/Onboarding/OnboardManagement';
import ContactManagement from './components/Admin/Contact/ContactManagement';
import SocialManagement from './components/Admin/Social/SocialManagement';
import HeroManagement from './components/Admin/Hero/HeroManagement';
import WhyChooseUsManagement from './components/Admin/WhyChooseUs/WhyChooseUsManagement';
import FooterManagement from './components/Admin/Footer/FooterManagement';
import SiteIdentityManagement from './components/Admin/SiteIdentity/SiteIdentityManagement';
import SectionVisibility from './components/Admin/SectionVisibility/SectionVisibility';
import LanguageManagement from './components/Admin/Settings/LanguageManagement';
import CareersManagement from './components/Admin/Careers/CareersManagement';
import JobLeads from './components/Admin/Careers/JobLeads';

function App() {
  // Logic to handle site-wide identity (Favicon, Title, Description)
  React.useEffect(() => {
    const applySiteIdentity = (config: any) => {
      try {
        // 1. Update Title
        if (config.siteName) {
          document.title = config.tagline ? `${config.siteName} - ${config.tagline}` : config.siteName;
        }

        // 2. Update Favicon
        const faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        const targetFavicon = (config.favicon?.show && config.favicon?.url) ? config.favicon.url : '/favicon.ico';

        if (faviconLink) {
          faviconLink.href = targetFavicon;
        } else {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.href = targetFavicon;
          document.getElementsByTagName('head')[0].appendChild(link);
        }

        // 3. Update Meta Description
        if (config.tagline) {
          let metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', config.tagline);
          } else {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            metaDesc.setAttribute('content', config.tagline);
            document.getElementsByTagName('head')[0].appendChild(metaDesc);
          }
        }
      } catch (e) {
        console.error("Error applying site identity", e);
      }
    };

    const loadSettings = async () => {
      const settingsKeys = [
        'admin_site_identity',
        'admin_hero_config',
        'admin_projects_config',
        'admin_gallery_config',
        'admin_recognition_config',
        'admin_testimonials_config',
        'admin_pricing_plans',
        'admin_why_choose_us',
        'admin_join_revolution',
        'admin_social_links',
        'admin_footer_config',
        'admin_contact_config',
        'admin_section_visibility'
      ];

      try {
        // Fetch all settings in parallel
        const results = await Promise.all(
          settingsKeys.map(key =>
            fetch(`/api/settings/${key}`)
              .then(res => res.ok ? res.json() : null)
              .catch(() => null)
          )
        );

        let identityApplied = false;

        results.forEach((data, index) => {
          const key = settingsKeys[index];
          if (data !== null) {
            localStorage.setItem(key, JSON.stringify(data));
            if (key === 'admin_site_identity') {
              applySiteIdentity(data);
              identityApplied = true;
            }
          }
        });

        if (identityApplied) {
          window.dispatchEvent(new Event('storage')); // Notify other components
        }
      } catch (error) {
        console.error("Failed to fetch settings from API:", error);
      }

      // Fallback
      const stored = localStorage.getItem('admin_site_identity');
      if (stored) {
        try {
          applySiteIdentity(JSON.parse(stored));
        } catch (e) { }
      }
    };

    loadSettings();

    const handleStorageChange = () => {
      const stored = localStorage.getItem('admin_site_identity');
      if (stored) {
        try {
          applySiteIdentity(JSON.parse(stored));
        } catch (e) { }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <PageTransitionProvider>
        <ScrollToTop />
        <SEO
          title="GreenRevotec - Sustainable Agriculture & Innovation"
          description="GreenRevotec offers modern agricultural products, services, and sustainable innovations for a greener tomorrow. Explore our fertilizers, pesticides, and smart farming solutions."
          keywords="agriculture, farming, sustainable, greenrevotec, fertilizers, pesticides"
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductCatalog />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="services/:id" element={<ServicesPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="careers" element={<CareersPage />} />
            {/* Legal Pages */}
            <Route path="privacy-policy" element={<PrivacyPolicy />} />
            <Route path="terms-of-service" element={<TermsOfService />} />
            <Route path="cookie-policy" element={<CookiePolicy />} />
          </Route>

          {/* Admin Public Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/leads" replace />} />
              <Route path="hero" element={<HeroManagement />} />
              <Route path="settings" element={<Settings />} />
              <Route path="leads" element={<Leads />} />
              <Route path="products/categories" element={<ProductCategories />} />
              <Route path="products/all" element={<AllProducts />} />
              <Route path="products/crops" element={<CropManagement />} />
              <Route path="services/all" element={<AllServices />} />
              <Route path="services/categories" element={<ServiceCategories />} />
              <Route path="projects/all" element={<AllProjects />} />
              <Route path="trusted-by" element={<BrandsManagement />} />
              <Route path="gallery" element={<GalleryManagement />} />
              <Route path="recognition" element={<RecognitionManagement />} />
              <Route path="voice-of-customer" element={<TestimonialsManagement />} />
              <Route path="pricing-plans" element={<PricingManagement />} />
              <Route path="why-choose-us" element={<WhyChooseUsManagement />} />
              <Route path="join-revolution" element={<OnboardManagement />} />
              <Route path="contact" element={<ContactManagement />} />
              <Route path="social" element={<SocialManagement />} />
              <Route path="footer" element={<FooterManagement />} />
              <Route path="visibility" element={<SectionVisibility />} />
              <Route path="site-identity" element={<SiteIdentityManagement />} />
              <Route path="settings/languages" element={<LanguageManagement />} />
              <Route path="careers/management" element={<CareersManagement />} />
              <Route path="careers/leads" element={<JobLeads />} />
            </Route>
          </Route>

          {/* Catch-all for any unknown routes - Standalone Lightweight Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransitionProvider>
    </Router>
  );
}

export default App;


