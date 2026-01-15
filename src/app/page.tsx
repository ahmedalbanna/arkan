import HomePageContent from '@/components/home/HomePageContent';

// This page is now a Server Component by default.
export default function Home() {
    // Data fetching (if any) could happen here on the server.
    const featuredProjects: any[] = [];

    return (
        <HomePageContent featuredProjects={featuredProjects} />
    );
}
