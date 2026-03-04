import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    type?: string;
    name?: string;
    image?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    keywords,
    type = 'website',
    name = 'GreenRevotec',
    image
}) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Facebook & LinkedIn Open Graph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
};

export default SEO;
