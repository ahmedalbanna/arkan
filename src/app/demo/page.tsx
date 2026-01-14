'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Zap, 
  Database, 
  ArrowRight,
  Boxes,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function DemoIndexPage() {
  const demos = [
    {
      title: 'Flow Builder',
      description: 'Interactive visual flow builder with drag-and-drop interface',
      href: '/demo/flow-builder',
      icon: Boxes,
      color: 'bg-purple-500',
      features: ['7 Step Types', '3 Examples', 'JSON Export', 'Real-time Testing'],
      badge: 'NEW',
    },
    {
      title: 'Dynamic Flows Dashboard',
      description: 'Complete overview of 54 migrated flows and system statistics',
      href: '/demo/dynamic-flows',
      icon: Sparkles,
      color: 'bg-blue-500',
      features: ['54 Flows', '100% Complete', '9 Weeks', 'Production Ready'],
      badge: 'COMPLETE',
    },
    {
      title: 'RAG System',
      description: 'Retrieval-Augmented Generation with Qdrant vector database',
      href: '/demo/rag',
      icon: Database,
      color: 'bg-green-500',
      features: ['Vector Search', 'Reranking', 'Caching', 'Analytics'],
      badge: 'LIVE',
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Zap className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Interactive Demos</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore Arkan's powerful AI features through interactive demonstrations
        </p>
      </div>

      {/* Demo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <Card key={demo.href} className="hover:shadow-lg transition-shadow group">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-3 rounded-lg ${demo.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="secondary">{demo.badge}</Badge>
                </div>
                <CardTitle className="text-xl">{demo.title}</CardTitle>
                <CardDescription>{demo.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {demo.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Link href={demo.href}>
                  <Button className="w-full group-hover:translate-x-1 transition-transform">
                    Launch Demo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-center">System Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold">54</div>
              <div className="text-sm text-muted-foreground">AI Flows</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold">7</div>
              <div className="text-sm text-muted-foreground">Step Types</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold">100%</div>
              <div className="text-sm text-muted-foreground">Migration</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold">9.3K</div>
              <div className="text-sm text-muted-foreground">Lines of Code</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Section */}
      <div className="text-center text-sm text-muted-foreground">
        <p>All demos are running on production-ready infrastructure</p>
        <p className="mt-2">
          <Link href="/docs" className="text-primary hover:underline">
            View Documentation
          </Link>
          {' · '}
          <Link href="/admin/dashboard" className="text-primary hover:underline">
            Admin Dashboard
          </Link>
        </p>
      </div>
    </div>
  );
}
