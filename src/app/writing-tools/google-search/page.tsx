import { GoogleSearchTool } from '@/components/writing-tools/GoogleSearchTool';

export const metadata = {
  title: 'Google Search Tool | Arkan',
  description: 'Access real-time search results from Google including web, images, maps, shopping, and news',
};

export default function GoogleSearchPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <GoogleSearchTool />
    </div>
  );
}
