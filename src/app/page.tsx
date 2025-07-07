import { getFeaturedProjects } from '@/lib/db/queries';
import HomePageContent from '@/components/HomePageContent';

export default async function Home() {
  const featuredProjects = await getFeaturedProjects();

  return <HomePageContent featuredProjects={featuredProjects} />;
}
