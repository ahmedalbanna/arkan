
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, RefreshCw } from 'lucide-react';
import { Handwriting } from '@/lib/handwriting';
import { useLocalization } from '@/context/LocalizationContext';

const HANDWRITING_FONTS = [
  { name: 'Homemade Apple', value: "'Homemade Apple', cursive" },
  { name: 'Caveat', value: "'Caveat', cursive" },
  { name: 'Liu Jian Mao Cao', value: "'Liu Jian Mao Cao', cursive" },
  { name: 'Indie Flower', value: "'Indie Flower', cursive" },
  { name: 'Rabiohead', value: "'rabiohead', cursive" },
  { name: "Saurabh's Hand", value: "'Saurabh-Hand', cursive" },
];

export default function HandwritingGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useLocalization();
  const [text, setText] = useState('This is a sample text to get you started.');
  const [fontSize, setFontSize] = useState(30);
  const [fontFamily, setFontFamily] = useState(HANDWRITING_FONTS[0].value);
  const [fontWeight, setFontWeight] = useState(400);
  const [lineHeight, setLineHeight] = useState(45.2);
  const [fontColor, setFontColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [handwriting, setHandwriting] = useState<Handwriting | null>(null);


  useEffect(() => {
    if (canvasRef.current) {
      const hw = new Handwriting(canvasRef.current);
      setHandwriting(hw);

      const resizeObserver = new ResizeObserver(() => {
        hw.updateCanvasSize();
      });
      const parentElement = canvasRef.current?.parentNode;
      if (parentElement instanceof Element) {
          resizeObserver.observe(parentElement);
      }

      return () => {
        if (parentElement instanceof Element) {
          resizeObserver.unobserve(parentElement);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (handwriting) {
      handwriting.setText(text);
      handwriting.setFontFamily(fontFamily);
      handwriting.setFontSize(fontSize);
      handwriting.setFontWeight(fontWeight);
      handwriting.setLineHeight(lineHeight);
      handwriting.setFontColor(fontColor);
      handwriting.draw();
    }
  }, [handwriting, text, fontSize, fontWeight, lineHeight, fontColor, fontFamily]);

  useEffect(() => {
    if (handwriting) {
        handwriting.setBackground(backgroundColor);
        handwriting.draw();
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
            <CardTitle className="font-headline">{t('writingTools.handwriting.outputTitle')}</CardTitle>
            <CardDescription>
              {t('writingTools.handwriting.outputDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full border rounded-md">
              <canvas ref={canvasRef}></canvas>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>{t('writingTools.handwriting.controlsTitle')}</CardTitle>
            <CardDescription>{t('writingTools.handwriting.controlsDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">{t('writingTools.handwriting.textLabel')}</Label>
              <Textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
              />
            </div>
            <div className="space-y-2">
                <Label htmlFor="font-family">{t('writingTools.handwriting.fontLabel')}</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger id="font-family">
                        <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent>
                        {HANDWRITING_FONTS.map((font) => (
                            <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                {font.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">{t('writingTools.handwriting.fontSizeLabel')}</Label>
              <Input
                id="font-size"
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>
            {/* Added Font Weight Input */}
            <div className="space-y-2">
              <Label htmlFor="font-weight">{t('writingTools.handwriting.fontWeightLabel')}</Label>
              <Input
                id="font-weight"
                type="number"
                value={fontWeight}
                onChange={(e) => setFontWeight(Number(e.target.value))}
              />
            </div>
            {/* Added Line Height Input */}
            <div className="space-y-2">
              <Label htmlFor="line-height">{t('writingTools.handwriting.lineHeightLabel')}</Label>
              <Input
                id="line-height"
                type="number"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-color">{t('writingTools.handwriting.fontColorLabel')}</Label>
              <Input
                id="font-color"
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bg-color">{t('writingTools.handwriting.bgColorLabel')}</Label>
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
              <RefreshCw className="me-2 h-4 w-4" />
              {t('writingTools.handwriting.redrawButton')}
            </Button>
            <Button onClick={handleDownload} variant="secondary" className="w-full">
              <Download className="me-2 h-4 w-4" />
              {t('writingTools.handwriting.downloadButton')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
