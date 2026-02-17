'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { ApiMethodBadge } from "@/components/ui/api-badge";
import { CodeBlock } from "./CodeBlock";
import { ApiTester } from "./ApiTester";
import { Shield, Key } from "lucide-react";
import { type ApiEndpoint } from "@/config/api-docs";

interface EndpointCardProps {
  endpoint: ApiEndpoint;
}

function AuthBadge({ auth }: { auth: 'admin' | 'user' | 'public' }) {
    const Icon = auth === 'admin' ? Shield : Key;
    const text = auth === 'admin' ? 'Admin Only' : 'Auth Required';
    
    if (auth === 'public') return null;

    return (
        <span className="flex items-center text-xs text-muted-foreground gap-1.5 ml-4">
            <Icon className="h-3.5 w-3.5" />
            {text}
        </span>
    );
}

export function EndpointCard({ endpoint }: EndpointCardProps) {
  return (
    <Card>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-b-0">
          <AccordionTrigger className="p-4 hover:no-underline hover:bg-muted/50 rounded-t-lg transition-colors [&[data-state=open]]:border-b">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    <ApiMethodBadge variant={endpoint.method} />
                    <span className="font-mono text-sm">{endpoint.path}</span>
                </div>
                <div className="flex items-center">
                    <span className="text-sm text-muted-foreground hidden md:inline-block mr-4 truncate max-w-xs">{endpoint.description}</span>
                     <AuthBadge auth={endpoint.auth} />
                </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-6 space-y-6">
            <p className="text-muted-foreground">{endpoint.description}</p>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side: Parameters and Examples */}
              <div className="space-y-6">
                {endpoint.parameters && (
                    <CodeBlock title="Parameters" data={endpoint.parameters} />
                )}
                {endpoint.requestBody && (
                    <CodeBlock title="Request Body" data={endpoint.requestBody} />
                )}
                {endpoint.responseBody && (
                    <CodeBlock title="Example Response" data={endpoint.responseBody} />
                )}
              </div>

              {/* Right Side: API Tester */}
              <div className="space-y-6">
                <ApiTester endpoint={endpoint} />
              </div>
            </div>

          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
