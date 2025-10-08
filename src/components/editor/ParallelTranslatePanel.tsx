
'use client';

import { ArrowRight, ChevronDown, Copy, Minus, Plus, Printer, Search, Sparkles, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ParallelTranslatePanel({ content, onClose }: { content: string, onClose: () => void }) {
  const translatedContent = "Die automatisierte Berichtserstellung umfasst die Verwendung von Software, um Daten in einem strukturierten Format zusammenzustellen und darzustellen, ohne dass ein manueller Eingriff erforderlich ist. Dieser Prozess kann erheblich Zeit sparen und Fehler reduzieren, die mit der manuellen Berichterstellung verbunden sind. Zu den typischen Funktionen automatisierter Berichtswerkzeuge gehören Datenextraktion, Vorlagenerstellung und Echtzeit-Datenanalyse, die es Benutzern ermöglichen, Berichte schnell und effizient zu erstellen. Unternehmen nutzen diese Tools häufig, um ihre Entscheidungsprozesse auf der Grundlage zeitnaher Erkenntnisse aus ihren Daten zu verbessern.";
  
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="shrink-0 bg-white border-b border-slate-200 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5"/></Button>
            <span className="font-semibold">Parallel Translate</span>
        </div>
        <div className="grow flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
                 <span className="text-sm">Translation Service:</span>
                 <Select defaultValue="gemini">
                    <SelectTrigger className="w-40 h-8 text-sm">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="gemini">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-500" /> Google Gemini
                            </div>
                        </SelectItem>
                    </SelectContent>
                 </Select>
            </div>
             <Select defaultValue="auto">
                <SelectTrigger className="w-40 h-8 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="auto">Detect language</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
            </Select>
            <ArrowRight className="w-5 h-5 text-slate-400"/>
             <Select defaultValue="de">
                <SelectTrigger className="w-40 h-8 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">German (Deutsch)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><Copy className="w-5 h-5"/></Button>
            <Button variant="ghost" size="icon"><Search className="w-5 h-5"/></Button>
            <Button variant="ghost" size="icon"><Minus className="w-5 h-5"/></Button>
             <Select defaultValue="auto">
                <SelectTrigger className="w-28 h-8 text-sm">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="auto">Automat...</SelectItem>
                </SelectContent>
            </Select>
            <Button variant="ghost" size="icon"><Plus className="w-5 h-5"/></Button>
            <Button className="bg-purple-600 hover:bg-purple-700">Download <ChevronDown className="w-4 h-4 ml-2"/></Button>
            <Button variant="ghost" size="icon"><Printer className="w-5 h-5"/></Button>
        </div>
      </div>
      <div className="grow flex p-4 gap-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 grow">
          <div className="bg-white p-8 rounded-lg border shadow-xs">
            <p className="leading-loose">{content}</p>
          </div>
          <div className="bg-white p-8 rounded-lg border shadow-xs">
            <p className="leading-loose">{translatedContent}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
