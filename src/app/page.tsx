
'use client';

// The HomePageContent component will now render without project data.
// It has been updated to remove references to 'featuredProjects'.
import HomePageContent from '@/components/HomePageContent';

export default function Home() {
  return <HomePageContent featuredProjects={[]} />;
}
