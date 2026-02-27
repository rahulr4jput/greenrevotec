import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import FloatingActions from './FloatingActions/FloatingActions';

const PublicLayout: React.FC = () => {
    return (
        <div className="App">
            <Navbar />
            <Outlet />
            <Footer />
            <FloatingActions />
        </div>
    );
};

export default PublicLayout;

