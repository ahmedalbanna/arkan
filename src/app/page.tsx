'use client';

import HomePageContent from '@/components/home/HomePageContent';

export default function Home() {
    // This component is now fully client-side.
    // The featuredProjects data is no longer fetched on the server.
    const featuredProjects = [];

    return (
        <HomePageContent featuredProjects={featuredProjects} />
    );
}
