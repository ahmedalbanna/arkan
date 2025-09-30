'use client';

import HomePageContent from '@/components/HomePageContent';

// This is a server-side function that could be used to fetch data
// In this case, we're not fetching any projects, so we pass an empty array.
// This structure is kept for potential future use.
async function getFeaturedProjects() {
    // Example of how you might fetch data in a real scenario:
    // const projectsSnapshot = await adminDb.collection('projects').where('isFeatured', '==', true).limit(3).get();
    // const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // return projects;
    return [];
}

export default function Home() {
    // Although we're not fetching projects, we keep the prop for structural consistency
    const featuredProjects = [];

    return (
        <HomePageContent featuredProjects={featuredProjects} />
    );
}
