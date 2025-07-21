
'use client';
import HomePageContent from '@/components/HomePageContent';

export default function Home() {
  // The featured projects logic has been removed as projects are no longer part of the app.
  // The HomePageContent component will now render without project data.
  return <HomePageContent featuredProjects={[]} />;
}
