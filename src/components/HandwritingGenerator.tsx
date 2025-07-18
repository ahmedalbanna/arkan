
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw } from 'lucide-react';
import { Handwriting } from '@/lib/handwriting.js';

export default function HandwritingGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('This is a sample text to get you started.');
  const [fontSize, setFontSize] = useState(30);
  const [fontColor, setFontColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [handwriting, setHandwriting] = useState<any>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const hw = new Handwriting(canvasRef.current, {
        font: {
          family: 'var(--font-handwriting)',
        },
      });
      setHandwriting(hw);
    }
  }, []);

  useEffect(() => {
    if (handwriting) {
      handwriting.setText(text);
      handwriting.setFontSize(fontSize);
      handwriting.setFontColor(fontColor);
      handwriting.draw();
    }
  }, [handwriting, text, fontSize, fontColor]);

  useEffect(() => {
    if (handwriting) {
        handwriting.setBackground(backgroundColor);
    }
  }, [handwriting, backgroundColor]);


  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = 'handwriting.png';
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };
  
  const handleRedraw = () => {
    if(handwriting) {
        handwriting.draw();
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Handwriting Output</CardTitle>
            <CardDescription>The generated handwriting will appear here. Click Redraw for a new variation.</CardDescription>
          </CardHeader>
          <CardContent>
            <canvas ref={canvasRef} width="800" height="1000" className="w-full border rounded-md"></canvas>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Adjust the settings for your text.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Text</Label>
              <Textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-color">Font Color</Label>
              <Input
                id="font-color"
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bg-color">Background Color</Label>
              <Input
                id="bg-color"
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={handleRedraw} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Redraw
            </Button>
            <Button onClick={handleDownload} variant="secondary" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
