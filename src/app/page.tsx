import HomePageContent from '@/components/home/HomePageContent';
import Script from 'next/script';

// This page is now a Server Component by default.
export default function Home() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Arkan Intelligence Suite',
        description: 'Professional grade document architecture, research synthesis, and AI-driven production protocols.',
        applicationCategory: 'BusinessApplication, AcademicSoftware',
        operatingSystem: 'Web-based',
        offers: {
            '@type': 'Offer',
            price: '0.00',
            priceCurrency: 'USD',
        },
        featureList: [
            'AI Document Synthesis',
            'Retrieval-Augmented Generation (RAG)',
            'Multi-node Project Orchestration',
            'Professional DOCX and PPTX Export',
            'Spectral Research Analysis'
        ],
        author: {
            '@type': 'Organization',
            name: 'Arkan Intelligence'
        }
    };

    return (
        <>
            <Script
                id="json-ld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomePageContent />
        </>
    );
}
