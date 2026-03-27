'use client';

import { useState } from 'react';
import { apiDocsConfig, type ApiSection } from '@/config/api-docs';
import { EndpointCard } from '@/components/api-docs/EndpointCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Code2, Terminal, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/infrastructure/utils/cn';

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
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Immersive Background */}
      <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
              background: 'radial-gradient(circle at 50% -20%, hsl(var(--primary) / 0.08), transparent 50%)'
          }}
      />
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container relative z-10 mx-auto max-w-[1600px] px-6 py-20 md:py-32">
        <div className="flex flex-col items-center text-center mb-24 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Badge variant="outline" className="h-5 text-[9px] uppercase tracking-widest font-bold border-primary/20 text-primary bg-background">Developer Portal</Badge>
              <div className="h-3 w-px bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary/80">API Reference V1.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter text-foreground leading-[0.9] flex items-center gap-6">
            <Code2 className="w-12 h-12 md:w-16 md:h-16 text-primary animate-pulse" />
            Interactive API Documentation
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl italic font-serif leading-relaxed opacity-80">
            Explore, validate, and test the Arkan platform's systematic intelligence endpoints in our interactive sandbox.
          </p>
        </div>

        <div className="sticky top-[65px] z-40 bg-background/80 backdrop-blur-xl border-b py-6 mb-16 -mx-6 px-6">
          <div className="relative max-w-3xl mx-auto group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search protocol nodes (e.g., /api/projects, identity management)..."
              className="pl-11 h-12 text-sm bg-muted/5 border-none shadow-inner focus-visible:ring-1 rounded-2xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-32">
          {filteredDocs.map((section: ApiSection, index) => (
            <section key={section.id} className="scroll-mt-48 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Logical Domain</h3>
                    </div>
                    <h2 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-4">
                        <section.icon className="w-10 h-10 text-primary/60" />
                        {section.title}
                    </h2>
                </div>
                <Badge variant="outline" className="h-6 text-[10px] px-2 font-bold uppercase tracking-widest border-primary/20 text-primary bg-primary/5">
                    {section.endpoints.length} Active Endpoints
                </Badge>
              </div>

              <div className="grid gap-10">
                {section.endpoints.map(endpoint => (
                  <EndpointCard key={`${endpoint.method}-${endpoint.path}`} endpoint={endpoint} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-48 pt-12 border-t border-border/40 text-center space-y-4">
            <div className="flex justify-center items-center gap-6 opacity-20 grayscale">
                <Terminal className="h-8 w-8" />
                <Code2 className="h-8 w-8" />
                <ShieldCheck className="h-8 w-8" />
            </div>
            <p className="text-[10px] text-muted-foreground/40 font-bold uppercase tracking-[0.4em]">
                Arkan Engineering • Secured Interface Node V1.0
            </p>
        </footer>
      </div>
    </div>
  );
}
