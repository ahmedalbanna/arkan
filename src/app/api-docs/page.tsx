'use client';

import { useState } from 'react';
import { apiDocsConfig, type ApiSection } from '@/config/api-docs';
import { EndpointCard } from '@/components/api-docs/EndpointCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function ApiDocsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = apiDocsConfig.map(section => ({
    ...section,
    endpoints: section.endpoints.filter(endpoint => 
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(section => section.endpoints.length > 0);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-bold font-headline text-primary">API Documentation</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Explore and test the Arkan platform's API endpoints.
        </p>
      </header>

      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm py-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search endpoints (e.g., /api/projects, get all users)"
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-12">
        {filteredDocs.map((section: ApiSection) => (
          <section key={section.id}>
            <h2 className="text-3xl font-headline font-semibold border-b pb-4 mb-8 flex items-center gap-3">
              <section.icon className="w-7 h-7 text-primary" />
              {section.title}
            </h2>
            <div className="space-y-6">
              {section.endpoints.map(endpoint => (
                <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
