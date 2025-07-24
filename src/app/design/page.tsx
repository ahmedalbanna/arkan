
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Palette } from 'lucide-react';

function CustomizationPanel() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Customize</CardTitle>
                <CardDescription>
                    Adjust the properties of your component.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="component-text">Text</Label>
                    <Input id="component-text" defaultValue="Hello World!" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="component-color">Color</Label>
                    <Input id="component-color" type="color" defaultValue="#60a5fa" />
                </div>
                <Button className="w-full">Update</Button>
            </CardContent>
        </Card>
    )
}

function PreviewPanel() {
    return (
        <Card className="h-full min-h-[500px]">
            <CardHeader>
                <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed bg-muted">
                    <p className="text-muted-foreground">Live preview will appear here</p>
                </div>
            </CardContent>
        </Card>
    )
}


export default function DesignPage() {
  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary flex items-center justify-center gap-4">
          <Palette className="w-10 h-10" />
          Design Studio
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Create and customize your new features here.
        </p>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <CustomizationPanel />
            </div>
            <div className="md:col-span-2">
                <PreviewPanel />
            </div>
        </div>
    </div>
  );
}
