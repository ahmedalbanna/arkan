
"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDownUp,
  AreaChart,
  AreaChart as AreaChartIcon,
  ArrowLeft,
  ArrowRight,
  AppWindow,
  BarChart,
  Bookmark,
  Bookmark as BookmarkIcon,
  Book,
  BookA,
  BookCopy,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Box,
  BrainCircuit,
  Bold,
  CaseSensitive,
  CaseUpper,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight,
  ChevronUp,
  Clapperboard,
  CloudUpload,
  Combine,
  Columns,
  Columns2,
  Copy,
  Droplets,
  Eraser,
  Expand,
  ExternalLink,
  Eye,
  File as FileIcon,
  FileDigit,
  FileEdit,
  FileImage,
  FileLock,
  FileSymlink,
  FileText,
  FileUp,
  Footprints,
  Folder,
  GripVertical,
  GitCompare,
  Globe,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Header,
  HelpCircle,
  Highlighter,
  History,
  Image as ImageIcon,
  Italic,
  Languages,
  LayoutGrid,
  Library,
  Link,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  ListTree,
  Loader,
  LogOut,
  Mail,
  Maximize,
  MessageSquare,
  MessageSquarePlus,
  MessageSquarePlus as MessageSquarePlusIcon,
  Mic,
  Minus,
  MoreHorizontal,
  Newspaper,
  Paintbrush,
  Palette,
  PanelLeft,
  Paperclip,
  Pen,
  PenLine,
  PieChart,
  Pilcrow,
  Pilcrow as PilcrowIcon,
  PictureInPicture,
  Play,
  Plus,
  PlusCircle,
  Printer,
  RectangleHorizontal,
  Redo,
  RefreshCw,
  Rows,
  Save,
  SaveAll,
  Scan,
  Scissors,
  Search,
  Send,
  Settings,
  Shapes,
  Share,
  Shield,
  Sigma,
  Sparkles,
  Split,
  SplitSquareHorizontal,
  SquareSigma,
  Star,
  Strikethrough,
  Subscript,
  Superscript,
  Table as TableIcon,
  TableProperties,
  Text,
  TextQuote,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  Type,
  Type as TypeIcon,
  Underline,
  Undo,
  Unlink,
  View,
  Wand2,
  WrapText,
  X,
  XCircle,
  FunctionSquare,
  Braces,
  Calendar,
  Filter,
  SortAsc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { generateText, type GenerateTextInput, type GenerateTextOutput } from '@/ai/flows/generate-text';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { generatePresentationOutline, type GeneratePresentationOutlineInput, type GeneratePresentationOutlineOutput } from '@/ai/flows/generate-presentation-outline';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

function WLogo() {
  return <div className="w-4 h-4 bg-[#2E68EB] text-white flex items-center justify-center rounded-sm text-xs font-bold">W</div>;
}

type OutlineItem = {
    title: string;
    content: string;
    children?: OutlineItem[];
};

type Slide = {
    id: number;
    title: string;
    content: string;
    imgSrc?: string;
    dataAiHint?: string;
};

const OutlineView = ({ outline, onBack }: { outline: GeneratePresentationOutlineOutput, onBack: () => void }) => {
    
    const renderOutline = (items: OutlineItem[], level = 0) => {
        return (
            <ul className={level > 0 ? 'pl-6' : ''}>
                {items.map((item, index) => (
                    <li key={index} className="mb-2">
                        {item.children ? (
                            <Accordion type="single" collapsible defaultValue="item-0">
                                <AccordionItem value={`item-${index}`} className="border-none">
                                    <AccordionTrigger className="p-1 text-sm hover:no-underline hover:bg-slate-100 rounded-md">
                                        <div className="flex items-start text-left gap-2">
                                            <span className="font-semibold">{level > 0 ? `${level}.${index + 1}` : item.title}</span>
                                            {level > 0 && <span>{item.title}</span>}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-0 pl-2">
                                        <p className="text-xs text-slate-600 mb-2">{item.content}</p>
                                        {renderOutline(item.children, level + 1)}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        ) : (
                            <div className="p-1">
                                 <div className="flex items-start gap-2">
                                     <span className="font-semibold">{level}.{index + 1}</span>
                                    <span>{item.title}</span>
                                </div>
                                <p className="text-xs text-slate-600 ml-6">{item.content}</p>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        )
    };
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={onBack}><ChevronLeftIcon className="mr-2" /> Back</Button>
                <button className="text-sm font-medium">Collapse Body <ChevronUp className="inline-block ml-1 w-4 h-4" /></button>
            </div>
            <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
                <h3 className="font-semibold mb-2">Cover: {outline.cover.title}</h3>
                <h4 className="font-semibold mb-2">Proposal Automation</h4>
                {renderOutline(outline.outline, 1)}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-4 h-4"/>
                <span>The content generated by AI is used only for reference. We recommend that you verify its accuracy.</span>
            </div>
        </div>
    );
};

const TemplateSelector = ({ onBack, onCreate }: { onBack: () => void, onCreate: (templateName: string) => void }) => {
    const templates = [
        { name: 'Green Gradient Minima...', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'green gradient' },
        { name: 'Blue Minimalist', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'blue minimalist' },
        { name: 'Purple Minimalist', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'purple abstract' },
        { name: 'Red Minimalist', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'red minimalist' },
        { name: 'Purple Minimalist', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'purple technology' },
        { name: 'Blue Minimalist Business', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'blue business' },
        { name: 'The title goes here', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'abstract texture' },
        { name: 'Your title here', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'dark modern' },
    ];
    const [selectedTemplate, setSelectedTemplate] = useState(templates[0].name);

    return (
        <div className="space-y-4">
            <h3 className="font-semibold">Choose Slide Template</h3>
            <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                {templates.map((template, index) => (
                    <div key={index} className="space-y-1 cursor-pointer" onClick={() => setSelectedTemplate(template.name)}>
                        <div className={`rounded-md border-2 ${selectedTemplate === template.name ? 'border-purple-600' : 'border-transparent'}`}>
                             <Image src={template.imgSrc} width={200} height={112} alt={template.name} data-ai-hint={template.dataAiHint} className="rounded-sm" />
                        </div>
                        <p className="text-xs text-center">{template.name}</p>
                    </div>
                ))}
            </div>
            <DialogFooter className="p-0 pt-4">
                 <Button variant="ghost" onClick={onBack}>
                    <ChevronLeftIcon className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button type="button" onClick={() => onCreate(selectedTemplate)} className="bg-purple-600 hover:bg-purple-700">Create Slides</Button>
            </DialogFooter>
        </div>
    );
};


const CreateWithAiDialog = ({ isOpen, onOpenChange, onCreateSlides }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onCreateSlides: (outline: GeneratePresentationOutlineOutput) => void }) => {
    type Step = 'prompt' | 'outline' | 'template';
    const [step, setStep] = useState<Step>('prompt');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [outline, setOutline] = useState<GeneratePresentationOutlineOutput | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        try {
            const result = await generatePresentationOutline({ prompt });
            setOutline(result);
            setStep('outline');
        } catch (error) {
            console.error("Failed to generate outline", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClose = () => {
        setStep('prompt');
        setPrompt('');
        setOutline(null);
        setIsLoading(false);
        onOpenChange(false);
    }
    
    const handleCreateSlides = (templateName: string) => {
        if (outline) {
            onCreateSlides(outline);
        }
        handleClose();
    }


    const renderContent = () => {
        switch (step) {
            case 'template':
                return (
                    <div className="p-6">
                        <TemplateSelector
                            onBack={() => setStep('outline')}
                            onCreate={handleCreateSlides}
                        />
                    </div>
                );
            case 'outline':
                return (
                     <>
                        <div className="p-6">
                            {outline && <OutlineView outline={outline} onBack={() => setStep('prompt')} />}
                        </div>
                        <DialogFooter className="p-6 pt-0">
                            <Button type="button" onClick={() => setStep('template')} className="bg-purple-600 hover:bg-purple-700 w-full">Next</Button>
                        </DialogFooter>
                     </>
                );
            case 'prompt':
            default:
                return (
                    <>
                        <div className="px-6">
                            <div className="flex border-b">
                                <button 
                                    className={'px-3 py-2 text-sm font-medium text-slate-800 border-b-2 border-slate-800'}
                                >
                                    Create with AI
                                </button>
                                <button
                                    className={'px-3 py-2 text-sm font-medium text-slate-500'}
                                >
                                    Create from File
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <Textarea 
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder='Enter a presentation topic to intelligently generate an outline, such as "AI Development"'
                                className="h-32 resize-none"
                                disabled={isLoading}
                            />
                             <div className="flex justify-between items-center text-xs text-slate-500">
                                <span>{prompt.length}/1500</span>
                            </div>
                        </div>
                        <DialogFooter className="p-6 pt-0">
                            <Button type="button" onClick={handleGenerate} className="bg-purple-600 hover:bg-purple-700 w-full" disabled={isLoading || !prompt.trim()}>
                                {isLoading ? (
                                    <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : 'Generate'}
                            </Button>
                        </DialogFooter>
                    </>
                );
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[525px] p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        WPS AI
                    </DialogTitle>
                </DialogHeader>
                {renderContent()}
            </DialogContent>
        </Dialog>
    );
};

const SetGoalsDialog = ({ isOpen, onOpenChange }: { isOpen: boolean, onOpenChange: (open: boolean) => void }) => {
    const [domain, setDomain] = useState('General');
    const [intent, setIntent] = useState('Describe');
    const [audience, setAudience] = useState('Knowledgeable');
    const [formality, setFormality] = useState('Neutral');
    
    const descriptions = {
      domain: {
        Academic: 'For formal research papers and scholarly articles.',
        Business: 'For professional communication, reports, and presentations.',
        General: 'Suitable for various types of writing without specific tone or formatting requirements.',
        Email: 'For casual and formal email correspondence.',
        Creative: 'For fiction, storytelling, and artistic expression.',
      },
      intent: {
        Inform: 'To provide factual information and explanations.',
        Describe: 'To portray things, phenomena, events, or experiments, such as describing scenery and portraying characters.',
        Convince: 'To persuade or argue a point with supporting evidence.',
        'Tell A Story': 'To narrate a sequence of events, real or imaginary.',
      },
      audience: {
        General: 'Broad audience with little to no prior knowledge.',
        Knowledgeable: 'Needs concentration to read and understand.',
        Expert: 'For specialists in a particular field.',
      },
      formality: {
        Informal: 'Casual language, slang, and colloquialisms are acceptable.',
        Neutral: 'Doesn\'t allow slang but permits standard casual phrases.',
        Formal: 'Strict adherence to grammatical rules and professional tone.',
      }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px] p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle>Set Goals</DialogTitle>
                    <p className="text-sm text-muted-foreground">Get tailored writing suggestions based on your goals</p>
                </DialogHeader>
                <div className="p-6 space-y-6">
                    <div>
                        <Label className="font-semibold">Domain</Label>
                        <ToggleGroup type="single" value={domain} onValueChange={(v) => v && setDomain(v)} className="justify-start mt-2">
                            <ToggleGroupItem value="Academic">Academic</ToggleGroupItem>
                            <ToggleGroupItem value="Business">Business</ToggleGroupItem>
                            <ToggleGroupItem value="General">General</ToggleGroupItem>
                            <ToggleGroupItem value="Email">Email</ToggleGroupItem>
                            <ToggleGroupItem value="Creative">Creative</ToggleGroupItem>
                        </ToggleGroup>
                        <p className="text-xs text-muted-foreground mt-2">{descriptions.domain[domain as keyof typeof descriptions.domain]}</p>
                    </div>
                     <div>
                        <Label className="font-semibold">Intent</Label>
                        <ToggleGroup type="single" value={intent} onValueChange={(v) => v && setIntent(v)} className="justify-start mt-2">
                            <ToggleGroupItem value="Inform">Inform</ToggleGroupItem>
                            <ToggleGroupItem value="Describe">Describe</ToggleGroupItem>
                            <ToggleGroupItem value="Convince">Convince</ToggleGroupItem>
                            <ToggleGroupItem value="Tell A Story">Tell A Story</ToggleGroupItem>
                        </ToggleGroup>
                         <p className="text-xs text-muted-foreground mt-2">{descriptions.intent[intent as keyof typeof descriptions.intent]}</p>
                    </div>
                     <div>
                        <Label className="font-semibold">Audience</Label>
                        <ToggleGroup type="single" value={audience} onValueChange={(v) => v && setAudience(v)} className="justify-start mt-2">
                            <ToggleGroupItem value="General">General</ToggleGroupItem>
                            <ToggleGroupItem value="Knowledgeable">Knowledgeable</ToggleGroupItem>
                            <ToggleGroupItem value="Expert">Expert</ToggleGroupItem>
                        </ToggleGroup>
                         <p className="text-xs text-muted-foreground mt-2">{descriptions.audience[audience as keyof typeof descriptions.audience]}</p>
                    </div>
                     <div>
                        <Label className="font-semibold">Formality</Label>
                        <ToggleGroup type="single" value={formality} onValueChange={(v) => v && setFormality(v)} className="justify-start mt-2">
                            <ToggleGroupItem value="Informal">Informal</ToggleGroupItem>
                            <ToggleGroupItem value="Neutral">Neutral</ToggleGroupItem>
                            <ToggleGroupItem value="Formal">Formal</ToggleGroupItem>
                        </ToggleGroup>
                         <p className="text-xs text-muted-foreground mt-2">{descriptions.formality[formality as keyof typeof descriptions.formality]}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Checkbox id="show-goals" />
                        <label htmlFor="show-goals" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Show Set Goals when I start a new document
                        </label>
                    </div>
                </div>
                <DialogFooter className="p-6 pt-0">
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button type="button" onClick={() => onOpenChange(false)} className="bg-purple-600 hover:bg-purple-700">Done</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


const AiChatPanel = ({ onClose }: { onClose: () => void }) => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'ai', text: 'Hello! How can I assist you today?' },
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;
        const userMessage = { id: messages.length + 1, sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        
        // Simulate AI response
        setTimeout(() => {
             const aiResponse = { id: messages.length + 2, sender: 'ai', text: 'I am a large language model, trained by Google.' };
             setMessages(prev => [...prev, aiResponse]);
        }, 1000);
    };

    return (
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-lg">
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><path d="M11.25 15.6667L8 12.4167L4.75 15.6667" /><path d="M8 12.4167V4.75" /><path d="M12.75 4.75H16.25" /><path d="M14.5 4.75V8.25" /><path d="M19.25 8.33333L16 11.5833L12.75 8.33333" /><path d="M16 11.5833V19.25" /></svg>
                </div>
                <Button variant="ghost" size="icon" className="w-6 h-6" onClick={onClose}><X /></Button>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map(message => (
                    <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {message.sender === 'user' ? (
                            <div className="bg-purple-100 text-purple-900 rounded-lg p-3 max-w-xs">
                                <p>{message.text}</p>
                            </div>
                        ) : (
                            <div className="border border-slate-200 rounded-lg p-3 max-w-xs">
                                <p className="text-slate-800">{message.text}</p>
                                <div className="flex items-center gap-4 text-slate-500 mt-3 text-xs">
                                    <div className="flex items-center gap-2">
                                        <button><ThumbsUp className="w-4 h-4" /></button>
                                        <button><ThumbsDown className="w-4 h-4" /></button>
                                    </div>
                                    <button className="flex items-center gap-1"><AlignLeft className="w-4 h-4"/> Insert</button>
                                    <button><MoreHorizontal className="w-4 h-4"/></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                     <button className="text-xs text-slate-500 flex items-center gap-1"><Eraser className="w-3 h-3"/> Clear</button>
                     <span className="text-xs text-pink-600">Chat</span>
                </div>
                <Textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="How are you"
                    className="resize-none"
                    onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">{input.length}/1000</span>
                    <Button size="sm" onClick={handleSend} disabled={!input.trim()}>Send</Button>
                </div>
            </div>
        </div>
    )
}

const AiSpellCheckPanel = ({ onClose }: { onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState('Correctness');
    const [isSetGoalsOpen, setIsSetGoalsOpen] = useState(false);

    const issues = [
        { type: 'Correctness · Grammar', text: 'real time', suggestion: 'real-time' },
        { type: 'Correctness · Spelling', text: 'analzsis', suggestion: 'analysis' },
    ];
    
    const refinements = [
        { text: "Automated report generation involves the use of ..."}
    ]

    return (
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-lg">
             <SetGoalsDialog isOpen={isSetGoalsOpen} onOpenChange={setIsSetGoalsOpen} />
            <div className="p-3 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">AI Spell Check</h3>
                <div className="flex items-center gap-2">
                    <Select defaultValue="en-us">
                        <SelectTrigger className="h-7 w-auto text-xs border-none focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="en-us">English (US)</SelectItem>
                            <SelectItem value="en-gb">English (UK)</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="w-6 h-6"><Minus /></Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6"><Maximize /></Button>
                    <Button variant="ghost" size="icon" className="w-6 h-6" onClick={onClose}><X /></Button>
                </div>
            </div>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                <div>
                    <div className="flex justify-between text-xs text-slate-500 px-1 mb-1">
                        <span>Average</span>
                        <span>Good</span>
                        <span>Excellent</span>
                    </div>
                    <Slider defaultValue={[85]} max={100} step={1} />
                </div>
                <div className="text-sm">
                    <p>We've found 17 more writing issues in your text. <a href="#" className="text-blue-600 font-medium">Try AI Refinements to fix them now.</a></p>
                </div>
                <div>
                    <div className="flex items-center justify-between border-b border-slate-200 text-sm">
                        <div className="flex">
                            <button onClick={() => setActiveTab('Correctness')} className={`py-2 px-3 ${activeTab === 'Correctness' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-slate-500'}`}>Correctness</button>
                            <button onClick={() => setActiveTab('Refinements')} className={`py-2 px-3 ${activeTab === 'Refinements' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-slate-500'}`}>Refinements</button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">AI Capability</span>
                            <Switch defaultChecked/>
                        </div>
                    </div>
                    
                    {activeTab === 'Correctness' && (
                        <div className="space-y-3 mt-4">
                            {issues.map((issue, index) => (
                                <div key={index} className="p-2 border border-slate-200 rounded-md">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                        <Sparkles className="w-4 h-4 text-pink-500" />
                                        <span>{issue.type}</span>
                                    </div>
                                    <p className="text-slate-800 font-medium">{issue.suggestion}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'Refinements' && (
                         <div className="space-y-3 mt-4">
                             <Button variant="outline" className="w-full justify-between items-center" onClick={() => setIsSetGoalsOpen(true)}>
                                 <div className="text-left">
                                    <p className="font-semibold">Set goals</p>
                                    <p className="text-xs text-slate-500 font-normal">General, Describe, Knowledgeable, ...</p>
                                 </div>
                                 <ChevronRight className="w-4 h-4 text-slate-400" />
                             </Button>
                            {refinements.map((item, index) => (
                                <div key={index} className="p-3 border border-slate-200 rounded-md">
                                    <div className="flex items-start gap-2 text-xs text-slate-500 mb-2">
                                        <Sparkles className="w-4 h-4 text-purple-500 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-purple-600">Refinement</p>
                                            <p className="text-slate-700 mt-1">{item.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
            <div className="p-4 border-t border-slate-200">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Accept All</Button>
            </div>
        </div>
    )
}

const ParallelTranslatePanel = ({ content, onClose }: { content: string, onClose: () => void }) => {
  const translatedContent = "Die automatisierte Berichtserstellung umfasst die Verwendung von Software, um Daten in einem strukturierten Format zusammenzustellen und darzustellen, ohne dass ein manueller Eingriff erforderlich ist. Dieser Prozess kann erheblich Zeit sparen und Fehler reduzieren, die mit der manuellen Berichterstellung verbunden sind. Zu den typischen Funktionen automatisierter Berichtswerkzeuge gehören Datenextraktion, Vorlagenerstellung und Echtzeit-Datenanalyse, die es Benutzern ermöglichen, Berichte schnell und effizient zu erstellen. Unternehmen nutzen diese Tools häufig, um ihre Entscheidungsprozesse auf der Grundlage zeitnaher Erkenntnisse aus ihren Daten zu verbessern.";
  
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-shrink-0 bg-white border-b border-slate-200 p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5"/></Button>
            <span className="font-semibold">Parallel Translate</span>
        </div>
        <div className="flex-grow flex items-center justify-center gap-4">
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
      <div className="flex-grow flex p-4 gap-4 overflow-y-auto">
        <aside className="w-16 flex-shrink-0 flex flex-col items-center gap-4 py-4 bg-white border rounded-lg">
            <Button variant="ghost" size="icon"><FileImage className="w-5 h-5 text-slate-600"/></Button>
            <Button variant="ghost" size="icon"><ListTree className="w-5 h-5 text-slate-600"/></Button>
            <div className="flex-grow"/>
            <div className="flex flex-col items-center text-sm text-slate-600">
                <Button variant="ghost" size="icon"><ChevronUp className="w-5 h-5"/></Button>
                <Input defaultValue="1" className="w-10 h-8 text-center p-0"/>
                <span>of</span>
                <span>1</span>
                <Button variant="ghost" size="icon"><ChevronDown className="w-5 h-5"/></Button>
            </div>
            <div className="flex-grow"/>
             <Button variant="ghost" size="icon"><Expand className="w-5 h-5 text-slate-600"/></Button>
        </aside>
        <div className="grid grid-cols-2 gap-4 flex-grow">
          <div className="bg-white p-8 rounded-lg border shadow-sm">
            <p className="leading-loose">{content}</p>
          </div>
          <div className="bg-white p-8 rounded-lg border shadow-sm">
            <p className="leading-loose">{translatedContent}</p>
          </div>
        </div>
      </div>
    </div>
  )
}


const AiAssistantMenu = () => {
  const smartCreateItems = [
    { icon: <PenLine className="w-4 h-4" />, label: 'Continue Writing' },
    { icon: <BrainCircuit className="w-4 h-4" />, label: 'Brainstorm' },
    { icon: <ListTree className="w-4 h-4" />, label: 'Outline' },
    { icon: <FileText className="w-4 h-4" />, label: 'Essay' },
    { icon: <GitCompare className="w-4 h-4" />, label: 'Pros and cons list' },
    { icon: <BookOpen className="w-4 h-4" />, label: 'Blog post' },
    { icon: <MessageSquare className="w-4 h-4" />, label: 'Social media post' },
    { icon: <ListTodo className="w-4 h-4" />, label: 'To-do list' },
    { icon: <Sparkles className="w-4 h-4" />, label: 'Creative story' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-xl border w-64 text-sm">
      <div className="p-2">
        <p className="text-xs text-slate-500 px-2 py-1">Smart Create</p>
        {smartCreateItems.map((item, index) => (
          <button key={index} className="w-full flex items-center gap-3 text-left p-2 rounded-md hover:bg-slate-100">
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      <Separator />
      <div className="p-2">
        <button className="w-full flex items-center justify-between text-left p-2 rounded-md hover:bg-slate-100">
          <div className="flex items-center gap-3">
            <MoreHorizontal className="w-4 h-4" />
            <span>More</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <Separator />
      <div className="p-2">
        <button className="w-full flex items-center justify-between text-left p-2 rounded-md hover:bg-slate-100">
          <div className="flex items-center gap-3">
            <FileEdit className="w-4 h-4" />
            <span>Smart Edit</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  )
}

const AiPrompt = ({ onGenerate, onCancel }: { onGenerate: (text: string) => void, onCancel: () => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isGenerating && !generatedText) {
      inputRef.current?.focus();
    }
  }, [isGenerating, generatedText]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleCancel();
        }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedText('');
    try {
      const result = await generateText({ prompt });
      setGeneratedText(result.generatedText);
    } catch (error) {
      console.error('Error generating text:', error);
      // Handle error (e.g., show a toast notification)
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCancel = () => {
    setIsGenerating(false);
    setGeneratedText('');
    setPrompt('');
    onCancel();
  };
  
  const handleRetain = () => {
    onGenerate(generatedText);
    handleCancel();
  }
  
  const handleDiscard = () => {
    setGeneratedText('');
  }
  
  const handleBackToPrompt = () => {
    setGeneratedText('');
    inputRef.current?.focus();
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  }

  if (generatedText) {
    return (
      <div className="bg-white rounded-lg shadow-lg border p-3 w-full max-w-2xl mx-auto my-4 flex flex-col gap-2">
        <div className="border rounded-lg p-4 relative">
          <p className="text-sm text-slate-700">{generatedText}</p>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 rounded-t-lg"></div>
           <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>For reference only. Please verify its accuracy.</span>
                </div>
                <div className="flex items-center gap-2">
                    <button><ThumbsUp className="w-4 h-4" /></button>
                    <button><Copy className="w-4 h-4" /></button>
                    <button><MoreHorizontal className="w-4 h-4" /></button>
                </div>
            </div>
        </div>
        <div className="bg-white rounded-lg shadow-md border p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleBackToPrompt}><ArrowLeft className="w-4 h-4" /></Button>
                <span className="text-sm text-slate-600 truncate">{prompt}</span>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" disabled><ChevronLeftIcon className="w-4 h-4" /></Button>
                <span className="text-xs">1 / 1</span>
                <Button variant="ghost" size="icon" disabled><ChevronRight className="w-4 h-4" /></Button>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="flex-1 justify-start pr-2">
                Continue...
                <div className="ml-auto w-6 h-6 rounded-md bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center">
                    <Send className="w-3 h-3 text-white" />
                </div>
            </Button>
            <Button variant="outline">
                <Wand2 className="w-4 h-4 mr-2"/>
                Adjust
                <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline"><RefreshCw className="w-4 h-4 mr-2"/>Rewrite</Button>
            <Button variant="outline" onClick={handleDiscard}><Trash2 className="w-4 h-4 mr-2"/>Discard</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleRetain}>Retain</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border p-3 relative w-full max-w-2xl mx-auto my-4 flex items-center justify-center min-h-[52px]">
       {isGenerating ? (
         <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-slate-600">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
            </div>
            <Button variant="ghost" onClick={handleCancel} className="text-slate-600">
                Stop (Esc)
            </Button>
         </div>
       ) : (
        <>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 rounded-b-lg"></div>
            <div className="flex items-center gap-2 w-full">
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <Input 
                    ref={inputRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='Type "@ai" and press Enter to invoke the WPS AI assistant'
                    className="flex-grow border-none focus-visible:ring-0 shadow-none text-base"
                    disabled={isGenerating}
                />
                 <Button variant="ghost" size="icon" className="w-7 h-7" onClick={onCancel} disabled={isGenerating}>
                    <X className="w-4 h-4 text-slate-400" />
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7" disabled={isGenerating}>
                    <Wand2 className="w-4 h-4 text-slate-400" />
                </Button>
                 <Button variant="ghost" size="icon" className="w-7 h-7" onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
                    <Send className="w-4 h-4 text-purple-500" />
                </Button>
            </div>
        </>
       )}
    </div>
  )
}

const ParagraphTool = ({ position, onClose }: { position: { top: number, left: number }, onClose: () => void }) => {
    if (!position.top) return null;

    const menuRef = useRef<HTMLDivElement>(null);
    
    // Close the menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    return (
        <div 
            ref={menuRef}
            className="absolute z-10 bg-white rounded-lg shadow-lg border flex items-center p-1"
            style={{ top: position.top, left: position.left }}
        >
            <div className="flex flex-col gap-1 p-2">
                <div className="flex items-center gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-7 h-7"><TypeIcon className="w-4 h-4"/></Button>
                            </TooltipTrigger>
                            <TooltipContent>Text Style</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-7 h-7 font-bold">H1</Button>
                            </TooltipTrigger>
                            <TooltipContent>Heading 1</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-7 h-7 font-bold">H2</Button>
                            </TooltipTrigger>
                            <TooltipContent>Heading 2</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-7 h-7 font-bold">H3</Button>
                            </TooltipTrigger>
                            <TooltipContent>Heading 3</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-7 h-7 font-bold">H4</Button>
                            </TooltipTrigger>
                            <TooltipContent>Heading 4</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="flex items-center gap-1">
                    <ToggleGroup type="single" defaultValue="left">
                        <ToggleGroupItem value="left" className="h-7 px-2"><AlignLeft className="w-4 h-4"/></ToggleGroupItem>
                        <ToggleGroupItem value="center" className="h-7 px-2"><AlignCenter className="w-4 h-4"/></ToggleGroupItem>
                        <ToggleGroupItem value="right" className="h-7 px-2"><AlignRight className="w-4 h-4"/></ToggleGroupItem>
                        <ToggleGroupItem value="justify" className="h-7 px-2"><AlignJustify className="w-4 h-4"/></ToggleGroupItem>
                    </ToggleGroup>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="w-7 h-7"><Pilcrow className="w-4 h-4"/></Button>
                            </TooltipTrigger>
                            <TooltipContent>Paragraph tool</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Separator className="my-1"/>
                <Button variant="ghost" className="justify-start h-8 px-2">
                    <BookOpenCheck className="w-4 h-4 mr-2"/> Paragraph Layout <ExternalLink className="w-3 h-3 ml-auto"/>
                </Button>
                 <Button variant="ghost" className="justify-start h-8 px-2 text-purple-600">
                    <Sparkles className="w-4 h-4 mr-2"/> WPS AI
                </Button>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="p-1 cursor-grab">
                            <GripVertical className="w-5 h-5 text-slate-400"/>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>Paragraph tool</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
}

const RichTextEditor = () => {
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [editorContent, setEditorContent] = useState('Automated report generation involves the use of software to compile and present data in a structured format without the need for manual intervention. This process can significantly save time and reduce errors associated with manual reporting. Typical features of automated reporting tools include data extraction, template creation, and real time data analzsis, allowing users to generate reports quickly and efficiently. Organizations often use these tools to enhance their decision-making processes based on timely insights from their data.');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showParagraphTool, setShowParagraphTool] = useState(false);
  const [toolPosition, setToolPosition] = useState({ top: 0, left: 0 });

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.endsWith('@ai')) {
      const newText = text.slice(0, -3);
      setEditorContent(newText);
      setShowAiPrompt(true);
    } else {
      setEditorContent(text);
    }
  };

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        const editorDiv = textareaRef.current?.parentElement;
        if (editorDiv) {
            const editorRect = editorDiv.getBoundingClientRect();
            setToolPosition({
                top: rect.top - editorRect.top - 50, // Position above selection
                left: rect.left - editorRect.top,
            });
            setShowParagraphTool(true);
        }
    } else {
        // setShowParagraphTool(false); // This would hide it immediately, which might not be desired.
    }
  }, []);

  const handleGenerate = (generatedText: string) => {
    setEditorContent(prev => prev + generatedText);
    setShowAiPrompt(false);
  }

  useEffect(() => {
    if(!showAiPrompt && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [showAiPrompt]);
  
   const closeParagraphTool = useCallback(() => {
    setShowParagraphTool(false);
  }, []);

  return (
    <div className="bg-white rounded-b-lg shadow-lg p-8 flex-grow">
      <div className="max-w-4xl mx-auto bg-white p-16 h-full shadow-[0_0_10px_rgba(0,0,0,0.1)] relative" onMouseUp={handleTextSelection}>
        <div className="flex items-center gap-2 mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <div className="w-auto p-1.5 px-3 rounded-full border border-pink-300 bg-pink-50 flex items-center gap-2 cursor-pointer">
                <Wand2 className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-pink-700">Start Writing with WPS AI</span>
                <button className="text-pink-500 hover:text-pink-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto border-none shadow-none">
              <AiAssistantMenu />
            </PopoverContent>
          </Popover>
        </div>
        {showParagraphTool && <ParagraphTool position={toolPosition} onClose={closeParagraphTool}/>}
        {showAiPrompt ? (
          <AiPrompt onGenerate={handleGenerate} onCancel={() => setShowAiPrompt(false)} />
        ) : (
          <>
            <Textarea 
              ref={textareaRef}
              value={editorContent}
              onChange={handleTextareaChange}
              className="w-full h-auto border-none focus-visible:ring-0 resize-none leading-loose"
              placeholder='Type "@ai" and press Enter to invoke the WPS AI assistant'
              rows={10}
            />
          </>
        )}
      </div>
    </div>
  );
};

const FileMenu = ({ onClose, recentFiles }: { onClose: () => void, recentFiles: any[] }) => {
    const menuItems = [
        { icon: <PlusCircle className="w-5 h-5" />, label: "New", hasArrow: true },
        { icon: <Folder className="w-5 h-5" />, label: "Open", active: true },
        { icon: <Save className="w-5 h-5" />, label: "Save" },
        { icon: <Copy className="w-5 h-5" />, label: "Save As", hasArrow: true },
        { icon: <FileUp className="w-5 h-5" />, label: "Export to PDF" },
        { icon: <ImageIcon className="w-5 h-5" />, label: "Export to Picture" },
        { icon: <Printer className="w-5 h-5" />, label: "Print", hasArrow: true },
        { icon: <Share className="w-5 h-5" />, label: "Share", hasArrow: true },
        { icon: <Shield className="w-5 h-5" />, label: "Document Encryption", hasArrow: true },
        { icon: <RefreshCw className="w-5 h-5" />, label: "Backup and Recovery", hasArrow: true },
        { icon: <HelpCircle className="w-5 h-5" />, label: "Help", hasArrow: true },
        { icon: <Settings className="w-5 h-5" />, label: "Options" },
        { icon: <LogOut className="w-5 h-5" />, label: "Exit" },
    ];

    return (
        <div className="absolute top-0 left-0 h-full w-full bg-black/30 z-40" onClick={onClose}>
            <div className="absolute top-0 left-0 h-auto bg-white shadow-lg z-50 flex" onClick={(e) => e.stopPropagation()}>
                <div className="w-64 bg-slate-50 p-2">
                    <nav className="space-y-1">
                        {menuItems.map((item, index) => (
                            <Button
                                key={index}
                                variant={item.active ? 'secondary' : 'ghost'}
                                className={`w-full justify-start text-base font-normal h-11 ${item.active ? 'bg-blue-100 text-blue-700' : ''}`}
                            >
                                {item.icon}
                                <span className="flex-grow text-left">{item.label}</span>
                                {item.hasArrow && <ChevronRight className="w-4 h-4" />}
                            </Button>
                        ))}
                    </nav>
                </div>
                <div className="w-96 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-800">Recent list</h3>
                        <RefreshCw className="w-4 h-4 text-slate-500 cursor-pointer" />
                    </div>
                    <div className="space-y-2">
                        {recentFiles.map((file, index) => (
                            <button key={index} className="w-full text-left p-2 rounded-md hover:bg-slate-100 flex items-start gap-3">
                                <div className="mt-1">{file.icon}</div>
                                <div>
                                    <p className="font-medium text-slate-800 text-sm">{file.name.split(' - ')[0]}</p>
                                    <p className="text-xs text-slate-500">{file.location}</p>
                                </div>
                                <span className="text-xs text-slate-400 ml-auto flex-shrink-0">{file.modified.split(' ')[1]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


const EditorToolbar = ({ onFileMenuClick, onSpellCheckClick, onChatBotClick, onTranslateClick, fileType, onCreateWithAiClick }: { onFileMenuClick: () => void; onSpellCheckClick: () => void; onChatBotClick: () => void; onTranslateClick: () => void; fileType: string; onCreateWithAiClick: () => void; }) => {
    const [activeTab, setActiveTab] = useState('Home');
    const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
    
    const renderExcelToolbarContent = () => {
        switch (activeTab) {
            case 'Home':
                return (
                    <div className="flex items-center gap-1 flex-wrap p-2">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2"><Paintbrush className="w-5 h-5"/><span className="text-xs">Format Painter</span></Button></TooltipTrigger>
                                <TooltipContent>Format Painter</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2"><Copy className="w-5 h-5"/><span className="text-xs">Paste</span></Button></TooltipTrigger>
                                <TooltipContent>Paste</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col gap-1">
                            <div className="flex">
                                 <Select defaultValue="calibri">
                                    <SelectTrigger className="h-7 w-36 text-xs">
                                        <SelectValue placeholder="Font" />
                                    </SelectTrigger>
                                    <SelectContent><SelectItem value="calibri">Calibri</SelectItem></SelectContent>
                                </Select>
                                <Select defaultValue="11">
                                    <SelectTrigger className="h-7 w-16 text-xs"><SelectValue placeholder="Size" /></SelectTrigger>
                                    <SelectContent><SelectItem value="11">11</SelectItem></SelectContent>
                                </Select>
                                <ToggleGroup type="single">
                                    <ToggleGroupItem value="increase" className="h-7 px-2"><Text className="w-4 h-4" />+</ToggleGroupItem>
                                    <ToggleGroupItem value="decrease" className="h-7 px-2"><Text className="w-4 h-4" />-</ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <div className="flex">
                                <ToggleGroup type="multiple">
                                    <ToggleGroupItem value="bold" className="h-7 px-2"><Bold className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="italic" className="h-7 px-2"><Italic className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="underline" className="h-7 px-2"><Underline className="w-4 h-4"/></ToggleGroupItem>
                                </ToggleGroup>
                                 <Button variant="ghost" size="icon" className="h-7 w-7"><Type className="w-4 h-4"/></Button>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col gap-1">
                            <div className="flex">
                                <ToggleGroup type="single" defaultValue="left">
                                    <ToggleGroupItem value="left" className="h-7 px-2"><AlignLeft className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="center" className="h-7 px-2"><AlignCenter className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="right" className="h-7 px-2"><AlignRight className="w-4 h-4"/></ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                             <div className="flex">
                               <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><Combine className="w-4 h-4 mr-1"/> Merge and Center <ChevronDown className="w-3 h-3 inline"/></Button>
                             </div>
                         </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex items-center gap-2">
                           <Button variant="ghost" className="flex flex-col h-auto p-2"><Sigma className="w-5 h-5"/><span className="text-xs">Sum</span></Button>
                           <Button variant="ghost" className="flex flex-col h-auto p-2"><Filter className="w-5 h-5"/><span className="text-xs">Filter</span></Button>
                           <Button variant="ghost" className="flex flex-col h-auto p-2"><SortAsc className="w-5 h-5"/><span className="text-xs">Sort</span></Button>
                        </div>
                    </div>
                )
            default:
                return <div className="p-4">Toolbar for {activeTab}</div>;
        }
    }

    const renderPresentationToolbarContent = () => {
         switch (activeTab) {
            case 'WPS AI':
                return (
                     <div className="flex items-center gap-4 flex-wrap p-2 text-purple-600">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><FileText className="w-5 h-5" /><span className="text-xs">Create from Doc</span></Button></TooltipTrigger>
                                <TooltipContent>Create from Doc</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1" onClick={onCreateWithAiClick}><Sparkles className="w-5 h-5" /><span className="text-xs">Create with AI</span></Button></TooltipTrigger>
                                <TooltipContent>Create with AI</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Wand2 className="w-5 h-5" /><span className="text-xs">Smart Content Creation</span></Button></TooltipTrigger>
                                <TooltipContent>Smart Content Creation</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><FileEdit className="w-5 h-5" /><span className="text-xs">Smart Content Edit</span></Button></TooltipTrigger>
                                <TooltipContent>Smart Content Edit</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1" onClick={onTranslateClick}><Languages className="w-5 h-5" /><span className="text-xs">Parallel Translate</span></Button></TooltipTrigger>
                                <TooltipContent>Parallel Translate</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Settings className="w-5 h-5" /><span className="text-xs">Settings</span></Button></TooltipTrigger>
                                <TooltipContent>Settings</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            case 'Home':
                return (
                     <div className="flex items-center gap-1 flex-wrap p-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2"><Paintbrush className="w-5 h-5"/><span className="text-xs">Format Painter</span></Button></TooltipTrigger>
                                <TooltipContent>Format Painter</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2"><Copy className="w-5 h-5"/><span className="text-xs">Paste</span></Button></TooltipTrigger>
                                <TooltipContent>Paste</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                         <div className="flex items-center gap-1">
                             <Button variant="ghost" className="flex flex-col h-auto p-2"><Play className="w-5 h-5"/><span className="text-xs">From Current Slide</span></Button>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col gap-1">
                           <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><LayoutGrid className="w-4 h-4 mr-1"/> New Slide <ChevronDown className="w-3 h-3 inline"/></Button>
                           <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><BookCopy className="w-4 h-4 mr-1"/> Layout <ChevronDown className="w-3 h-3 inline"/></Button>
                        </div>
                         <div className="flex flex-col gap-1">
                           <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><RefreshCw className="w-4 h-4 mr-1"/> Reset</Button>
                           <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><Split className="w-4 h-4 mr-1"/> Section <ChevronDown className="w-3 h-3 inline"/></Button>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                         <div className="flex flex-col gap-1">
                            <div className="flex">
                                 <Select defaultValue="calibri">
                                    <SelectTrigger className="h-7 w-36 text-xs">
                                        <SelectValue placeholder="Font" />
                                    </SelectTrigger>
                                    <SelectContent><SelectItem value="calibri">Calibri (Body)</SelectItem></SelectContent>
                                </Select>
                                <Select defaultValue="10">
                                    <SelectTrigger className="h-7 w-16 text-xs"><SelectValue placeholder="Size" /></SelectTrigger>
                                    <SelectContent><SelectItem value="10">10</SelectItem></SelectContent>
                                </Select>
                                <ToggleGroup type="single">
                                    <ToggleGroupItem value="increase" className="h-7 px-2"><Text className="w-4 h-4" />+</ToggleGroupItem>
                                    <ToggleGroupItem value="decrease" className="h-7 px-2"><Text className="w-4 h-4" />-</ToggleGroupItem>
                                </ToggleGroup>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Eraser className="w-4 h-4"/></Button>
                            </div>
                            <div className="flex">
                                <ToggleGroup type="multiple">
                                    <ToggleGroupItem value="bold" className="h-7 px-2"><Bold className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="italic" className="h-7 px-2"><Italic className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="underline" className="h-7 px-2"><Underline className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="strikethrough" className="h-7 px-2"><Strikethrough className="w-4 h-4"/></ToggleGroupItem>
                                </ToggleGroup>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><CaseSensitive className="w-4 h-4"/></Button>
                                 <Button variant="ghost" size="icon" className="h-7 w-7"><Type className="w-4 h-4"/></Button>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col gap-1">
                            <div className="flex">
                               <Button variant="ghost" size="icon" className="h-7 w-7"><ListOrdered className="w-4 h-4"/></Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7"><List className="w-4 h-4"/></Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7"><ArrowDownUp className="w-4 h-4"/></Button>
                            </div>
                            <div className="flex">
                                <ToggleGroup type="single" defaultValue="left">
                                    <ToggleGroupItem value="left" className="h-7 px-2"><AlignLeft className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="center" className="h-7 px-2"><AlignCenter className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="right" className="h-7 px-2"><AlignRight className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="justify" className="h-7 px-2"><AlignJustify className="w-4 h-4"/></ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                         </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="flex flex-col h-auto p-2"><Shapes className="w-5 h-5" /><span className="text-xs">Shapes <ChevronDown className="w-3 h-3 inline"/></span></Button>
                            <Button variant="ghost" className="flex flex-col h-auto p-2"><ImageIcon className="w-5 h-5" /><span className="text-xs">Picture <ChevronDown className="w-3 h-3 inline"/></span></Button>
                            <div className="flex flex-col">
                                <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><Box className="w-4 h-4 mr-1"/> Text Box</Button>
                                <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><Link2 className="w-4 h-4 mr-1"/> Hyperlink</Button>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" className="flex flex-col h-auto p-2"><Pen className="w-5 h-5" /><span className="text-xs">Student Tools</span></Button>
                             <Button variant="ghost" className="flex flex-col h-auto p-2"><Settings className="w-5 h-5" /><span className="text-xs">Settings <ChevronDown className="w-3 h-3 inline"/></span></Button>
                        </div>
                    </div>
                )
            default:
                return <div className="p-4">Toolbar for {activeTab}</div>;
         }
    }

    const renderDocumentToolbarContent = () => {
        switch (activeTab) {
            case 'WPS AI':
                return (
                    <div className="flex items-center gap-4 flex-wrap p-2 text-purple-600">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Sparkles className="w-5 h-5" /><span className="text-xs">Smart Create</span></Button></TooltipTrigger>
                                <TooltipContent>Smart Create</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><FileEdit className="w-5 h-5" /><span className="text-xs">Smart Edit</span></Button></TooltipTrigger>
                                <TooltipContent>Smart Edit</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <div className="flex flex-col items-start gap-1">
                            <Button variant="ghost" className="h-auto p-1 text-xs"><Pen className="w-4 h-4 mr-1" /> Continue Writing</Button>
                            <Button variant="ghost" className="h-auto p-1 text-xs"><Wand2 className="w-4 h-4 mr-1" /> Improve Writing <ChevronDown className="w-3 h-3 ml-1" /></Button>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            <Button variant="ghost" className="h-auto p-1 text-xs"><AlignJustify className="w-4 h-4 mr-1" /> Make Longer</Button>
                            <Button variant="ghost" className="h-auto p-1 text-xs"><AlignLeft className="w-4 h-4 mr-1" /> Make Shorter</Button>
                        </div>
                        <TooltipProvider>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1" onClick={onSpellCheckClick}><BookA className="w-5 h-5" /><span className="text-xs">AI Spell Check</span></Button></TooltipTrigger>
                                <TooltipContent>AI Spell Check</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><BookCopy className="w-5 h-5" /><span className="text-xs">AI Refinements</span></Button></TooltipTrigger>
                                <TooltipContent>AI Refinements</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <TooltipProvider>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1" onClick={onTranslateClick}><Languages className="w-5 h-5" /><span className="text-xs">Parallel Translate</span></Button></TooltipTrigger>
                                <TooltipContent>Parallel Translate</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><FileText className="w-5 h-5" /><span className="text-xs">AI Summarizer</span></Button></TooltipTrigger>
                                <TooltipContent>AI Summarizer</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><FileImage className="w-5 h-5" /><span className="text-xs">Create Slides from Doc</span></Button></TooltipTrigger>
                                <TooltipContent>Create Slides from Doc</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <TooltipProvider>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1" onClick={onChatBotClick}><MessageSquare className="w-5 h-5" /><span className="text-xs">Chat Bot</span></Button></TooltipTrigger>
                                <TooltipContent>Chat Bot</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Settings className="w-5 h-5" /><span className="text-xs">Settings</span></Button></TooltipTrigger>
                                <TooltipContent>Settings</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            case 'Tools':
                return (
                     <div className="flex items-center gap-4 flex-wrap p-2">
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <FileUp className="w-5 h-5"/>
                                        <span className="text-xs">Export to PDF</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Export to PDF</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <ImageIcon className="w-5 h-5"/>
                                        <span className="text-xs">Export to Picture</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Export to Picture</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <FileText className="w-5 h-5"/>
                                        <span className="text-xs">Extract Text</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Extract Text</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <FileImage className="w-5 h-5"/>
                                        <span className="text-xs">Picture to PDF</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Picture to PDF</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <FileSymlink className="w-5 h-5"/>
                                        <span className="text-xs">PDF to Word</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>PDF to Word</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <Combine className="w-5 h-5"/>
                                        <span className="text-xs">Split or Merge</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Split or Merge</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <CloudUpload className="w-5 h-5"/>
                                        <span className="text-xs">Auto Backup</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Auto Backup</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <Wand2 className="w-5 h-5"/>
                                        <span className="text-xs">Files Repair</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Files Repair</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <TooltipProvider>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <Clapperboard className="w-5 h-5"/>
                                        <span className="text-xs">Screen Recorder</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Screen Recorder</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                         <TooltipProvider>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <SaveAll className="w-5 h-5"/>
                                        <span className="text-xs">Save to <br/>Cloud Docs</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Save to Cloud Docs</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <FileSymlink className="w-5 h-5"/>
                                        <span className="text-xs">File Collect</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>File Collect</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <Scan className="w-5 h-5"/>
                                        <span className="text-xs">Scan to Mobile</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Scan to Mobile</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <Library className="w-5 h-5"/>
                                        <span className="text-xs">Design Library</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Design Library</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <TooltipProvider>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <CaseUpper className="w-5 h-5"/>
                                        <span className="text-xs">Batch Rename <br/> Files</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Batch Rename Files</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                    </div>
                );
            case 'View':
                return (
                     <div className="flex items-center gap-4 flex-wrap p-2">
                        <div className="flex items-center gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <Maximize className="w-5 h-5"/>
                                            <span className="text-xs">Full Screen</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Full Screen</TooltipContent>
                                </Tooltip>
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <BookOpen className="w-5 h-5"/>
                                            <span className="text-xs">Reading View</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reading View</TooltipContent>
                                </Tooltip>
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <Printer className="w-5 h-5"/>
                                            <span className="text-xs">Print Layout</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Print Layout</TooltipContent>
                                </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <ListTree className="w-5 h-5"/>
                                            <span className="text-xs">Outline</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Outline</TooltipContent>
                                </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <Globe className="w-5 h-5"/>
                                            <span className="text-xs">Web Layout</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Web Layout</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex items-center gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="text-xs h-auto p-1">
                                            <PanelLeft className="w-4 h-4 mr-1"/> Navigation Pane <ChevronDown className="w-3 h-3 inline"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Navigation Pane</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                             <div className="flex flex-col">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="ruler" />
                                    <label htmlFor="ruler" className="text-xs font-medium leading-none">Ruler</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="markup" defaultChecked />
                                    <label htmlFor="markup" className="text-xs font-medium leading-none">Markup</label>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="table-gridlines" defaultChecked/>
                                    <label htmlFor="table-gridlines" className="text-xs font-medium leading-none">Table Gridlines</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox id="task-window" />
                                    <label htmlFor="task-window" className="text-xs font-medium leading-none">Task Window</label>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="gridlines" />
                                <label htmlFor="gridlines" className="text-xs font-medium leading-none">Gridlines</label>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex items-center gap-2">
                           <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <Search className="w-5 h-5"/>
                                            <span className="text-xs">Zoom</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Zoom</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                             <div className="flex flex-col gap-1">
                               <Button variant="ghost" className="text-xs h-auto p-1 justify-start">100%</Button>
                               <Button variant="ghost" className="text-xs h-auto p-1 justify-start">Page Width</Button>
                             </div>
                             <div className="flex flex-col gap-1">
                               <Button variant="ghost" className="text-xs h-auto p-1 justify-start">One Page</Button>
                               <Button variant="ghost" className="text-xs h-auto p-1 justify-start">Multiple Page</Button>
                             </div>
                        </div>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <Eye className="w-5 h-5"/>
                                        <span className="text-xs">Eye Protection<br/>Mode <ChevronDown className="w-3 h-3 inline"/></span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Eye Protection Mode</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                         <div className="flex flex-col gap-1">
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><AppWindow className="w-4 h-4 mr-1"/> New Window</Button>
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><Rows className="w-4 h-4 mr-1"/> Rearrange Panes <ChevronDown className="w-3 h-3 inline"/></Button>
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><SplitSquareHorizontal className="w-4 h-4 mr-1"/> Split Window <ChevronDown className="w-3 h-3 inline"/></Button>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col gap-1">
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><Columns2 className="w-4 h-4 mr-1"/> View Side by Side</Button>
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><RefreshCw className="w-4 h-4 mr-1"/> Synchronous Scrolling</Button>
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><Expand className="w-4 h-4 mr-1"/> Reset Window Position</Button>
                        </div>

                    </div>
                );
            case 'Review':
                return (
                    <div className="flex items-center gap-4 flex-wrap p-2">
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1" onClick={onSpellCheckClick}>
                                            <Wand2 className="w-5 h-5"/>
                                            <span className="text-xs">AI Spell Check</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>AI Spell Check</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <FileDigit className="w-5 h-5"/>
                                            <span className="text-xs">Word Count</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Word Count</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <BookA className="w-5 h-5"/>
                                            <span className="text-xs">Thesaurus</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Thesaurus</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <GitCompare className="w-5 h-5"/>
                                            <span className="text-xs">Compare</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Compare</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <MessageSquarePlus className="w-5 h-5"/>
                                            <span className="text-xs">New Comment</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>New Comment</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <div className="text-xs space-y-1">
                                <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs h-auto p-1"><Trash2 className="w-3 h-3"/> Delete</Button>
                                <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs h-auto p-1"><Undo className="w-3 h-3 -scale-x-100"/> Previous</Button>
                                <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs h-auto p-1"><Redo className="w-3 h-3"/> Next</Button>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex items-center gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <FileEdit className="w-5 h-5"/>
                                            <span className="text-xs">Track Changes <ChevronDown className="w-3 h-3 inline"/></span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Track Changes</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                             <div className="flex flex-col gap-1">
                                <Select defaultValue="final-markup">
                                    <SelectTrigger className="h-7 w-36 text-xs">
                                        <SelectValue placeholder="Show Markup" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="final-markup">Show Final Markup</SelectItem>
                                        <SelectItem value="simple-markup">Show Simple Markup</SelectItem>
                                        <SelectItem value="all-markup">Show All Markup</SelectItem>
                                        <SelectItem value="no-markup">No Markup</SelectItem>
                                    </SelectContent>
                                </Select>
                                 <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><BookMarked className="w-4 h-4 mr-1"/> Show Markup <ChevronDown className="w-3 h-3 inline ml-auto"/></Button>
                            </div>
                             <Button variant="ghost" className="text-xs h-auto p-1 justify-start self-start"><PanelLeft className="w-4 h-4 mr-1"/> Review <ChevronDown className="w-3 h-3 inline ml-auto"/></Button>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <CheckCircle2 className="w-5 h-5 text-green-600"/>
                                            <span className="text-xs">Accept <ChevronDown className="w-3 h-3 inline"/></span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Accept</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <XCircle className="w-5 h-5 text-red-600"/>
                                            <span className="text-xs">Reject <ChevronDown className="w-3 h-3 inline"/></span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reject</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                             <div className="text-xs space-y-1">
                                <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs h-auto p-1"><Undo className="w-3 h-3 -scale-x-100"/> Previous</Button>
                                <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs h-auto p-1"><Redo className="w-3 h-3"/> Next</Button>
                            </div>
                        </div>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <Pen className="w-5 h-5"/>
                                        <span className="text-xs">Draw</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Draw</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col gap-1 text-xs">
                             <Button variant="ghost" className="h-auto p-1 justify-start">Simplified/Traditional<br/>Conversion</Button>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                         <div className="flex flex-col items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <FileLock className="w-5 h-5"/>
                                            <span className="text-xs">Restrict Editing</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Restrict Editing</TooltipContent>
                                </Tooltip>
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1" onClick={onTranslateClick}>
                                            <Languages className="w-5 h-5"/>
                                            <span className="text-xs">Parallel Translate</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Parallel Translate</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                );
            case 'References':
                return (
                     <div className="flex items-center gap-4 flex-wrap p-2">
                        <div className="flex flex-col items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <Newspaper className="w-5 h-5"/>
                                            <span className="text-xs">Table Of Contents <ChevronDown className="w-3 h-3 inline"/></span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Table Of Contents</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="text-xs h-auto p-1">
                                            <RefreshCw className="w-4 h-4 mr-1"/> Update Catalog
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Update Catalog</TooltipContent>
                                </Tooltip>
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="text-xs h-auto p-1">
                                            <BookCopy className="w-4 h-4 mr-1"/> Catalog Level <ChevronDown className="w-3 h-3 inline"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Catalog Level</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <span className="relative"><span className="font-serif italic text-lg">ab</span><span className="absolute -top-1 -right-1 text-xs">1</span></span>
                                            <span className="text-xs">Insert Footnote</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Insert Footnote</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                             <div className="text-xs space-y-1">
                                <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs h-auto p-1"><Undo className="w-3 h-3 -scale-x-100"/> Previous Footnote</Button>
                                <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs h-auto p-1"><Redo className="w-3 h-3"/> Next Footnote</Button>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <FileText className="w-5 h-5"/>
                                            <span className="text-xs">Insert Endnote</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Insert Endnote</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                             <div className="text-xs space-y-1">
                                <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs h-auto p-1"><Undo className="w-3 h-3 -scale-x-100"/> Previous Endnote</Button>
                                <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs h-auto p-1"><Redo className="w-3 h-3"/> Next Endnote</Button>
                            </div>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <List className="w-5 h-5"/>
                                        <span className="text-xs">Footnote/Endnote<br/>Separator</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Footnote/Endnote Separator</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <ImageIcon className="w-5 h-5"/>
                                            <span className="text-xs">Caption</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Caption</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                         <div className="flex flex-col items-start gap-1">
                             <Button variant="ghost" className="text-xs h-auto p-1 w-full justify-start"><TableIcon className="w-4 h-4 mr-1"/> Insert Table of Figures</Button>
                             <Button variant="ghost" className="text-xs h-auto p-1 w-full justify-start"><RectangleHorizontal className="w-4 h-4 mr-1"/> Cross-reference</Button>
                        </div>
                         <Separator orientation="vertical" className="h-16 mx-1" />

                        <div className="flex flex-col items-start gap-1">
                             <Button variant="ghost" className="text-xs h-auto p-1 w-full justify-start"><ListOrdered className="w-4 h-4 mr-1"/> Insert Index</Button>
                             <Button variant="ghost" className="text-xs h-auto p-1 w-full justify-start"><RefreshCw className="w-4 h-4 mr-1"/> Update Index</Button>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <BookCopy className="w-5 h-5"/>
                                        <span className="text-xs">Mark Entry</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Mark Entry</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                         <div className="flex flex-col items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <Mail className="w-5 h-5"/>
                                            <span className="text-xs">Mail<br/>Merge</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Mail Merge</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <Settings className="w-5 h-5"/>
                                            <span className="text-xs">Settings <ChevronDown className="w-3 h-3 inline"/></span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Settings</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                );
            case 'Page Layout':
                return (
                    <div className="flex items-center gap-4 flex-wrap p-2">
                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                            <TableIcon className="w-5 h-5"/>
                                            <span className="text-xs">Margins <ChevronDown className="w-3 h-3 inline"/></span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Margins</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <div className="text-xs space-y-1">
                                <div className="flex items-center gap-1">
                                    <span className="w-12 text-right">Top:</span>
                                    <Input type="number" defaultValue="1" className="h-6 w-20 text-xs"/>
                                    <span>in</span>
                                </div>
                                 <div className="flex items-center gap-1">
                                    <span className="w-12 text-right">Bottom:</span>
                                    <Input type="number" defaultValue="1" className="h-6 w-20 text-xs"/>
                                    <span>in</span>
                                </div>
                                 <div className="flex items-center gap-1">
                                    <span className="w-12 text-right">Left:</span>
                                    <Input type="number" defaultValue="1.25" className="h-6 w-20 text-xs"/>
                                     <span>in</span>
                                </div>
                                 <div className="flex items-center gap-1">
                                    <span className="w-12 text-right">Right:</span>
                                    <Input type="number" defaultValue="1.25" className="h-6 w-20 text-xs"/>
                                    <span>in</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-1 w-full justify-start">
                                            <ImageIcon className="w-4 h-4"/>
                                            <span className="text-xs">Orientation</span>
                                            <ChevronDown className="w-3 h-3 ml-auto"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Orientation</TooltipContent>
                                </Tooltip>
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-1 w-full justify-start">
                                            <FileText className="w-4 h-4"/>
                                            <span className="text-xs">Size</span>
                                            <ChevronDown className="w-3 h-3 ml-auto"/>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Size</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                         <div className="flex flex-col gap-2">
                             <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-1 w-full justify-start">
                                            <Columns className="w-4 h-4"/>
                                            <span className="text-xs">Columns</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Columns</TooltipContent>
                                </Tooltip>
                                 <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-1 w-full justify-start">
                                            <ArrowDownUp className="w-4 h-4"/>
                                            <span className="text-xs">Text Direction</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Text Direction</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col gap-2">
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><Palette className="w-4 h-4"/>Themes</Button>
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><BookCopy className="w-4 h-4"/>Cover Page</Button>
                        </div>
                         <div className="flex flex-col gap-2">
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><RectangleHorizontal className="w-4 h-4"/>Page Borders</Button>
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><Droplets className="w-4 h-4"/>Page Color</Button>
                        </div>
                         <div className="flex flex-col gap-2">
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><ImageIcon className="w-4 h-4"/>Watermark</Button>
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><ListOrdered className="w-4 h-4"/>Line Numbers</Button>
                        </div>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                         <div className="flex flex-col gap-2">
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><FileUp className="w-4 h-4"/>Blank Page</Button>
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><Split className="w-4 h-4"/>Breaks</Button>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><Newspaper className="w-4 h-4"/>Table Of Contents</Button>
                             <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><PanelLeft className="w-4 h-4"/>Section Navigation Pane</Button>
                             <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><Trash2 className="w-4 h-4"/>Delete Section</Button>
                        </div>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                         <div className="flex flex-col gap-2">
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><BookOpenCheck className="w-4 h-4"/>Header and Footer</Button>
                            <Button variant="ghost" className="flex items-center gap-1 w-full justify-start text-xs"><FileDigit className="w-4 h-4"/>Page Number</Button>
                        </div>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                         <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1">
                                        <Settings className="w-5 h-5"/>
                                        <span className="text-xs">Settings<ChevronDown className="w-3 h-3 inline"/></span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Settings</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                );
            case 'Insert':
                return (
                    <div className="flex items-center gap-2 flex-wrap p-2">
                        <div className="flex flex-col items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><FileIcon className="w-5 h-5" /><span className="text-xs">Blank Page <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                    <TooltipContent>Blank Page</TooltipContent>
                                </Tooltip>
                                 <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><BookCopy className="w-5 h-5" /><span className="text-xs">Cover Page <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                    <TooltipContent>Cover Page</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                         <div className="flex flex-col items-center gap-1">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="text-xs h-auto p-1"><Split className="w-4 h-4 mr-1" /> Breaks <ChevronDown className="w-3 h-3 inline-block ml-1" /></Button></TooltipTrigger>
                                    <TooltipContent>Breaks</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="text-xs h-auto p-1"><BookOpenCheck className="w-4 h-4 mr-1" /> Header and Footer</Button></TooltipTrigger>
                                    <TooltipContent>Header and Footer</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                         <div className="flex flex-col items-center gap-1 justify-start h-full">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="text-xs h-auto p-1"><FileDigit className="w-4 h-4 mr-1" /> Page Number <ChevronDown className="w-3 h-3 inline-block ml-1" /></Button></TooltipTrigger>
                                    <TooltipContent>Page Number</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><TableIcon className="w-5 h-5" /><span className="text-xs">Table <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                <TooltipContent>Table</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><ImageIcon className="w-5 h-5" /><span className="text-xs">Picture <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                <TooltipContent>Picture</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Camera className="w-5 h-5" /><span className="text-xs">Screenshot <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                <TooltipContent>Screenshot</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Shapes className="w-5 h-5" /><span className="text-xs">Shapes <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                <TooltipContent>Shapes</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Library className="w-5 h-5" /><span className="text-xs">Icon<br/>Library</span></Button></TooltipTrigger>
                                <TooltipContent>Icon Library</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Box className="w-5 h-5" /><span className="text-xs">Text Box <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                <TooltipContent>Text Box</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><TypeIcon className="w-5 h-5" /><span className="text-xs">WordArt <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                <TooltipContent>WordArt</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Library className="w-5 h-5" /><span className="text-xs">Chart<br/>Library</span></Button></TooltipTrigger>
                                <TooltipContent>Chart Library</TooltipContent>
                            </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><BarChart className="w-5 h-5" /><span className="text-xs">Chart</span></Button></TooltipTrigger>
                                <TooltipContent>Chart</TooltipContent>
                            </Tooltip>
                               <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><AreaChartIcon className="w-5 h-5" /><span className="text-xs">SmartArt</span></Button></TooltipTrigger>
                                <TooltipContent>SmartArt</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Sigma className="w-5 h-5" /><span className="text-xs">Symbol <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                <TooltipContent>Symbol</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><PieChart className="w-5 h-5" /><span className="text-xs">Equation <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                <TooltipContent>Equation</TooltipContent>
                            </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><SquareSigma className="w-5 h-5" /><span className="text-xs">LaTeX</span></Button></TooltipTrigger>
                                <TooltipContent>LaTeX</TooltipContent>
                            </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><PenLine className="w-5 h-5" /><span className="text-xs">Sign <ChevronDown className="w-3 h-3 inline-block ml-1" /></span></Button></TooltipTrigger>
                                <TooltipContent>Sign</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col gap-1">
                            <TooltipProvider>
                                 <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="text-xs h-auto p-1"><MessageSquarePlusIcon className="w-4 h-4 mr-1" /> Comment</Button></TooltipTrigger>
                                    <TooltipContent>Comment</TooltipContent>
                                </Tooltip>
                                 <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="text-xs h-auto p-1"><Mail className="w-4 h-4 mr-1" /> Envelopes</Button></TooltipTrigger>
                                    <TooltipContent>Envelopes</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                        <div className="flex flex-col gap-1">
                            <TooltipProvider>
                                 <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="text-xs h-auto p-1"><Link2 className="w-4 h-4 mr-1" /> Hyperlink</Button></TooltipTrigger>
                                    <TooltipContent>Hyperlink</TooltipContent>
                                </Tooltip>
                                 <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="text-xs h-auto p-1"><BookmarkIcon className="w-4 h-4 mr-1" /> Bookmark</Button></TooltipTrigger>
                                    <TooltipContent>Bookmark</TooltipContent>
                                </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="text-xs h-auto p-1"><TextQuote className="w-4 h-4 mr-1" /> Quick Parts <ChevronDown className="w-3 h-3 inline-block ml-1" /></Button></TooltipTrigger>
                                    <TooltipContent>Quick Parts</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col gap-1">
                             <TooltipProvider>
                                 <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="text-xs h-auto p-1"><FileText className="w-4 h-4 mr-1" /> File Object <ChevronDown className="w-3 h-3 inline-block ml-1" /></Button></TooltipTrigger>
                                    <TooltipContent>File Object</TooltipContent>
                                </Tooltip>
                                 <Tooltip>
                                    <TooltipTrigger asChild><Button variant="ghost" className="text-xs h-auto p-1"><PilcrowIcon className="w-4 h-4 mr-1" /> Drop Cap</Button></TooltipTrigger>
                                    <TooltipContent>Drop Cap</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                );
            case 'Home':
            default:
                return (
                    <div className="flex items-center gap-1 flex-wrap p-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" className="flex flex-col h-auto p-2">
                                        <Paintbrush className="w-5 h-5"/>
                                        <span className="text-xs">Format Painter</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Format Painter</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="ghost" className="flex flex-col h-auto p-2">
                                        <Copy className="w-5 h-5"/>
                                        <span className="text-xs">Paste</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Paste</TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                     <Button variant="ghost" className="flex flex-col h-auto p-2">
                                        <Scissors className="w-5 h-5"/>
                                        <span className="text-xs">Cut</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cut</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        
                        <div className="flex flex-col gap-1">
                            <div className="flex">
                                 <Select defaultValue="calibri">
                                    <SelectTrigger className="h-7 w-36 text-xs">
                                        <SelectValue placeholder="Font" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="calibri">Calibri (Body)</SelectItem>
                                        <SelectItem value="arial">Arial</SelectItem>
                                        <SelectItem value="times">Times New Roman</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select defaultValue="10">
                                    <SelectTrigger className="h-7 w-16 text-xs">
                                        <SelectValue placeholder="Size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="12">12</SelectItem>
                                        <SelectItem value="14">14</SelectItem>
                                        <SelectItem value="16">16</SelectItem>
                                    </SelectContent>
                                </Select>
                                <ToggleGroup type="single">
                                    <ToggleGroupItem value="increase" className="h-7 px-2"><Text className="w-4 h-4" />+</ToggleGroupItem>
                                    <ToggleGroupItem value="decrease" className="h-7 px-2"><Text className="w-4 h-4" />-</ToggleGroupItem>
                                </ToggleGroup>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><CaseSensitive className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Eraser className="w-4 h-4"/></Button>

                            </div>
                            <div className="flex">
                                <ToggleGroup type="multiple">
                                    <ToggleGroupItem value="bold" className="h-7 px-2"><Bold className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="italic" className="h-7 px-2"><Italic className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="underline" className="h-7 px-2"><Underline className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="strikethrough" className="h-7 px-2"><Strikethrough className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="subscript" className="h-7 px-2"><Subscript className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="superscript" className="h-7 px-2"><Superscript className="w-4 h-4"/></ToggleGroupItem>
                                </ToggleGroup>
                                 <Button variant="ghost" size="icon" className="h-7 w-7"><Wand2 className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Highlighter className="w-4 h-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><Type className="w-4 h-4"/></Button>
                            </div>
                        </div>
                         <Separator orientation="vertical" className="h-16 mx-1" />
                         <div className="flex flex-col gap-1">
                            <div className="flex">
                               <Button variant="ghost" size="icon" className="h-7 w-7"><List className="w-4 h-4"/></Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7"><ListOrdered className="w-4 h-4"/></Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7"><WrapText className="w-4 h-4"/></Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7"><Pilcrow className="w-4 h-4"/></Button>
                            </div>
                            <div className="flex">
                                <ToggleGroup type="single" defaultValue="left">
                                    <ToggleGroupItem value="left" className="h-7 px-2"><AlignLeft className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="center" className="h-7 px-2"><AlignCenter className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="right" className="h-7 px-2"><AlignRight className="w-4 h-4"/></ToggleGroupItem>
                                    <ToggleGroupItem value="justify" className="h-7 px-2"><AlignJustify className="w-4 h-4"/></ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                         </div>
                          <Separator orientation="vertical" className="h-16 mx-1" />
                           <div className="flex gap-2">
                               <Button variant="ghost" className="h-auto p-1 font-normal border border-transparent hover:border-slate-300">
                                   <div className="flex items-center">
                                       <div className="text-left ml-2">
                                            <p className="font-bold">Normal</p>
                                       </div>
                                   </div>
                               </Button>
                               <Button variant="ghost" className="h-auto p-1 font-normal border border-transparent hover:border-slate-300 bg-slate-100">
                                   <div className="flex items-center">
                                       <Heading1 className="w-8 h-8"/>
                                       <div className="text-left ml-2">
                                            <p className="font-bold text-blue-600">Heading 1</p>
                                       </div>
                                   </div>
                               </Button>
                           </div>
                    </div>
                );
        }
    };

    const docToolbarTabs = [
        { name: 'File', action: onFileMenuClick },
        { name: 'Home' },
        { name: 'Insert' },
        { name: 'Page Layout' },
        { name: 'References' },
        { name: 'Review' },
        { name: 'View' },
        { name: 'Tools' },
        { name: 'WPS AI', icon: <Wand2 className="w-4 h-4 mr-1"/> },
    ]

    const presentationToolbarTabs = [
        { name: 'File', action: onFileMenuClick },
        { name: 'Home' },
        { name: 'Insert' },
        { name: 'Design' },
        { name: 'Transitions' },
        { name: 'Animation' },
        { name: 'Slide Show' },
        { name: 'Review' },
        { name: 'View' },
        { name: 'Tools' },
        { name: 'Student Tools' },
        { name: 'WPS AI', icon: <Wand2 className="w-4 h-4 mr-1"/> },
    ]
    
    const excelToolbarTabs = [
        { name: 'File', action: onFileMenuClick },
        { name: 'Home' },
        { name: 'Insert' },
        { name: 'Page Layout' },
        { name: 'Formulas' },
        { name: 'Data' },
        { name: 'Review' },
        { name: 'View' },
        { name: 'Tools' },
        { name: 'Smart Toolbox' },
    ]

    const toolbarTabs = fileType === 'powerpoint' ? presentationToolbarTabs : (fileType === 'excel' ? excelToolbarTabs : docToolbarTabs);
    
    return (
        <div className="bg-slate-50 p-2 rounded-t-lg border-b border-slate-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><FileIcon className="w-4 h-4" /></Button>
                    <Separator orientation="vertical" className="h-6" />
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Save className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Undo className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Redo className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Printer className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center gap-2">
                    <Input placeholder="Search" className="h-8 w-40 text-xs hidden md:block" />
                    <Button>Share <ChevronDown className="w-4 h-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}>
                        {isToolbarCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {!isToolbarCollapsed && (
                <>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 flex-wrap">
                            {toolbarTabs.map((tab) => (
                                <Button 
                                    key={tab.name}
                                    variant={activeTab === tab.name ? 'secondary' : 'ghost'} 
                                    className={`h-9 px-3 ${activeTab === tab.name && tab.name === 'WPS AI' ? 'text-purple-600' : ''}`}
                                    onClick={() => { setActiveTab(tab.name); tab.action?.(); }}
                                >
                                    {tab.icon}
                                    {tab.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="p-2 bg-white rounded-b-lg shadow-inner">
                         {
                             fileType === 'powerpoint' ? renderPresentationToolbarContent() :
                             fileType === 'excel' ? renderExcelToolbarContent() :
                             renderDocumentToolbarContent()
                         }
                    </div>
                </>
            )}
        </div>
    )
}

function EditorFooter() {
    return (
        <div className="bg-slate-100 p-1 flex justify-between items-center text-xs text-slate-600 border-t border-slate-200">
            <div className="flex items-center gap-4">
                <span>Page: 1/1</span>
                <span>Words: 0</span>
                <div className="flex items-center gap-1">
                    <Toggle defaultPressed size="sm" className="h-5 w-9 p-0.5 data-[state=on]:bg-blue-500">
                        <div className="h-4 w-4 rounded-full bg-white shadow-sm" />
                    </Toggle>
                    <span>AI Spell Check</span>
                </div>
            </div>
             <div className="flex items-center gap-2">
                <Search className="w-4 h-4"/>
                <Separator orientation="vertical" className="h-4"/>
                <span>93%</span>
                 <Separator orientation="vertical" className="h-4"/>
                 <List className="w-4 h-4"/>
            </div>
        </div>
    )
}

const PresentationFooter = () => (
    <div className="bg-slate-100 p-1 flex justify-between items-center text-xs text-slate-600 border-t border-slate-200">
        <div className="flex items-center gap-4">
            <span>Slide: 1/17</span>
            <span>1_Office 主題</span>
             <span className="text-yellow-600">Font Missing</span>
        </div>
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs">Notes</Button>
            <Button variant="ghost" size="sm" className="text-xs">Comment</Button>
            <Separator orientation="vertical" className="h-4"/>
            <Button variant="ghost" size="icon" className="h-6 w-6"><LayoutGrid className="w-4 h-4"/></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6"><BookOpen className="w-4 h-4"/></Button>
            <Button variant="ghost" size="icon" className="h-6 w-6"><Play className="w-4 h-4"/></Button>
            <Separator orientation="vertical" className="h-4"/>
            <Slider defaultValue={[81]} max={100} step={1} className="w-32"/>
            <span>81%</span>
            <Separator orientation="vertical" className="h-4"/>
            <Button variant="ghost" size="icon" className="h-6 w-6"><Expand className="w-4 h-4"/></Button>
        </div>
    </div>
)

const SheetsFooter = () => (
    <div className="bg-slate-100 p-1 flex justify-between items-center text-xs text-slate-600 border-t border-slate-200">
        <div className="flex items-center">
            <Button variant="ghost" size="sm" className="text-xs font-semibold bg-white border-r border-slate-200">Template</Button>
            <Button variant="ghost" size="sm" className="text-xs">Instructions</Button>
             <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="w-4 h-4"/></Button>
        </div>
         <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6"><List className="w-4 h-4"/></Button>
            <Separator orientation="vertical" className="h-4"/>
            <Slider defaultValue={[64]} max={100} step={1} className="w-32"/>
            <span>64%</span>
            <Separator orientation="vertical" className="h-4"/>
            <Button variant="ghost" size="icon" className="h-6 w-6"><Expand className="w-4 h-4"/></Button>
        </div>
    </div>
)

const initialSlides: Slide[] = [
  { id: 1, title: 'Dental Health PPT', content: 'Enter your text here, or paste your text here.', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'dental health' },
  { id: 2, title: 'CONTENTS', content: '', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'contents page' },
  { id: 3, title: 'Part 1', content: '', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'section slide' },
  { id: 4, title: 'Keyword', content: '', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'infographic slide' },
  { id: 5, title: 'Enter title', content: '', imgSrc: 'https://placehold.co/400x225.png', dataAiHint: 'tree diagram' },
]

const SlideSidebar = ({ slides, activeSlide, onSelectSlide }: { slides: Slide[], activeSlide: number, onSelectSlide: (id: number) => void}) => {
    const [activeTab, setActiveTab] = useState('Slides');

    return (
        <div className="w-60 bg-white border-r border-slate-200 flex flex-col">
            <div className="flex-shrink-0 border-b border-slate-200">
                <div className="flex items-center">
                    <button onClick={() => setActiveTab('Outline')} className={`flex-1 py-2 text-sm text-center ${activeTab === 'Outline' ? 'font-semibold text-slate-800 border-b-2 border-slate-800' : 'text-slate-500'}`}>Outline</button>
                    <button onClick={() => setActiveTab('Slides')} className={`flex-1 py-2 text-sm text-center ${activeTab === 'Slides' ? 'font-semibold text-slate-800 border-b-2 border-slate-800' : 'text-slate-500'}`}>Slides</button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><ChevronLeftIcon className="w-4 h-4"/></Button>
                </div>
            </div>
            <div className="flex-grow overflow-y-auto p-2 space-y-2">
                {slides.map(slide => (
                    <div key={slide.id} className="flex items-start gap-2 group cursor-pointer" onClick={() => onSelectSlide(slide.id)}>
                        <div className="flex flex-col items-center">
                           <span className="text-xs text-slate-500">{slide.id}</span>
                           <button><Star className="w-3 h-3 text-slate-400 hover:text-yellow-500"/></button>
                        </div>
                        <div className={`w-full h-auto bg-slate-100 rounded border-2 p-1 ${activeSlide === slide.id ? 'border-orange-500' : 'border-transparent'}`}>
                            <Image src={slide.imgSrc || 'https://placehold.co/160x90.png'} width={160} height={90} alt={slide.title} data-ai-hint={slide.dataAiHint || 'slide content'} className="rounded-sm" />
                        </div>
                    </div>
                ))}
                <div className="flex items-center justify-center pt-2">
                    <Button variant="outline" size="icon"><Plus className="w-4 h-4"/></Button>
                </div>
            </div>
        </div>
    )
}

const GeneratingSlidesIndicator = ({ progress, total }: { progress: number, total: number }) => (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1 pl-3 pr-2 flex items-center gap-2 text-sm shadow-lg border">
        <Loader className="w-4 h-4 animate-spin text-purple-600" />
        <span>Creating the slide {progress}/{total}...</span>
        <Button variant="ghost" size="sm" className="text-xs">Stop (Esc)</Button>
    </div>
)

const PresentationEditor = ({ isCreateWithAiOpen, onCreateWithAiOpenChange }: { isCreateWithAiOpen: boolean, onCreateWithAiOpenChange: (open: boolean) => void }) => {
    const [slides, setSlides] = useState<Slide[]>(initialSlides);
    const [activeSlide, setActiveSlide] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);

    const handleCreateSlides = (outline: GeneratePresentationOutlineOutput) => {
        const flattenOutline = (items: OutlineItem[], prefix = ''): { title: string, content: string }[] => {
            let allItems: { title: string, content: string }[] = [];
            items.forEach((item, index) => {
                const currentTitle = prefix ? `${prefix}.${index + 1} ${item.title}` : item.title;
                allItems.push({ title: currentTitle, content: item.content });
                if (item.children) {
                    allItems = allItems.concat(flattenOutline(item.children, prefix ? `${prefix}.${index + 1}` : `${index + 1}`));
                }
            });
            return allItems;
        };

        const newSlideData: { title: string, content: string }[] = [
            { title: outline.cover.title, content: 'Proposal Automation for Presentation Generation' },
            ...flattenOutline(outline.outline)
        ];
        
        const totalSlides = newSlideData.length;
        setGenerationProgress(0);
        setIsGenerating(true);
        setSlides([]);

        const interval = setInterval(() => {
            setGenerationProgress(prev => {
                const nextProgress = prev + 1;
                if (nextProgress <= totalSlides) {
                    const newSlide: Slide = {
                        id: nextProgress,
                        title: newSlideData[nextProgress - 1].title,
                        content: newSlideData[nextProgress - 1].content,
                        imgSrc: `https://placehold.co/400x225.png`,
                        dataAiHint: 'presentation slide'
                    };
                    setSlides(s => [...s, newSlide]);
                }
                if (nextProgress >= totalSlides) {
                    clearInterval(interval);
                    setIsGenerating(false);
                    setActiveSlide(1);
                }
                return nextProgress;
            });
        }, 500);
    };

    const currentSlide = slides.find(s => s.id === activeSlide);

    return (
        <div className="flex-grow flex items-center justify-center p-8 bg-slate-200 relative">
             <CreateWithAiDialog isOpen={isCreateWithAiOpen} onOpenChange={onCreateWithAiOpenChange} onCreateSlides={handleCreateSlides} />
            <div className="bg-white w-full h-full shadow-lg flex items-center justify-center relative">
                 {isGenerating && <GeneratingSlidesIndicator progress={generationProgress} total={slides.length} />}
                 {currentSlide ? (
                     <>
                        <Image src={currentSlide.imgSrc || "https://placehold.co/800x450.png"} alt={currentSlide.title} width={800} height={450} data-ai-hint={currentSlide.dataAiHint || 'slide content'} />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                             <h1 className="text-4xl font-bold">{currentSlide.title}</h1>
                             <p className="mt-2">{currentSlide.content}</p>
                         </div>
                     </>
                 ) : (
                    <div className="text-center text-slate-500">
                        <p>No slides to display. Create new slides to get started.</p>
                    </div>
                 )}
            </div>
            <SlideSidebar slides={slides} activeSlide={activeSlide} onSelectSlide={setActiveSlide} />
        </div>
    )
}

const PresentationRightSidebar = () => (
     <div className="w-12 bg-slate-50 border-l border-slate-200 flex flex-col items-center py-4 gap-4">
        <Button variant="ghost" size="icon"><Star className="w-5 h-5"/></Button>
        <Button variant="ghost" size="icon"><Share className="w-5 h-5"/></Button>
        <Button variant="ghost" size="icon"><History className="w-5 h-5"/></Button>
        <Button variant="ghost" size="icon"><MessageSquare className="w-5 h-5"/></Button>
        <Button variant="ghost" size="icon"><HelpCircle className="w-5 h-5"/></Button>
        <div className="flex-grow"/>
        <Button variant="ghost" size="icon"><MoreHorizontal className="w-5 h-5"/></Button>
    </div>
)

const SheetsEditor = () => {
    return (
        <div className="flex-grow flex flex-col bg-slate-200 overflow-auto">
            <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 p-1 flex items-center gap-2">
                <Input defaultValue="A1" className="w-24 h-8 text-center" />
                <Button variant="ghost" size="icon" className="h-8 w-8"><X className="w-4 h-4"/></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8"><CheckCircle2 className="w-4 h-4"/></Button>
                <FunctionSquare className="w-5 h-5 text-slate-500" />
                <Input className="flex-grow h-8 bg-white" />
            </div>
            <div className="flex-grow p-4">
                 <Image src="https://placehold.co/1200x600.png" alt="Budget Report" width={1200} height={600} data-ai-hint="budget report" />
            </div>
        </div>
    )
}

const editorRecentFiles = [
  { icon: <FileIcon className="w-6 h-6 text-blue-500" />, name: 'Co-op Final Report - ... -Osaimi - Report.wps', location: 'Desktop/', modified: 'Today 0:41:45' },
  { icon: <WLogo />, name: 'Co-op Final Report - ... -Osaimi - Report.docx', location: 'Downloads/', modified: 'Yesterday 23:58:47' },
  { icon: <WLogo />, name: 'WPS Docs Quick Start Guide.docx', location: 'C:/Users/ahmed/AppData/Roaming/kingso...', modified: 'Yesterday 23:56:23' },
];


export default function EditorPage({ fileType }: { fileType: string }) {
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isSpellCheckPanelOpen, setIsSpellCheckPanelOpen] = useState(false);
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);
  const [isTranslatePanelOpen, setIsTranslatePanelOpen] = useState(false);
  const [isCreateWithAiOpen, setIsCreateWithAiOpen] = useState(false);
  const editorContentForTranslate = 'Automated report generation involves the use of software to compile and present data in a structured format without the need for manual intervention. This process can significantly save time and reduce errors associated with manual reporting. Typical features of automated reporting tools include data extraction, template creation, and real time data analzsis, allowing users to generate reports quickly and efficiently. Organizations often use these tools to enhance their decision-making processes based on timely insights from their data.';
  
  const handleSpellCheckClick = () => {
    setIsSpellCheckPanelOpen(true);
    setIsChatPanelOpen(false);
    setIsTranslatePanelOpen(false);
  }
  
  const handleChatBotClick = () => {
    setIsChatPanelOpen(true);
    setIsSpellCheckPanelOpen(false);
    setIsTranslatePanelOpen(false);
  }

  const handleTranslateClick = () => {
    setIsTranslatePanelOpen(true);
    setIsChatPanelOpen(false);
    setIsSpellCheckPanelOpen(false);
  }

  const handleCreateWithAiClick = () => {
    setIsCreateWithAiOpen(true);
  }

  if (isTranslatePanelOpen) {
    return <ParallelTranslatePanel content={editorContentForTranslate} onClose={() => setIsTranslatePanelOpen(false)} />
  }

  const renderEditorLayout = () => {
    if (fileType === 'excel') {
      return (
        <div className="flex flex-col flex-grow bg-white">
          <EditorToolbar 
              onFileMenuClick={() => setIsFileMenuOpen(true)} 
              onSpellCheckClick={handleSpellCheckClick}
              onChatBotClick={handleChatBotClick}
              onTranslateClick={handleTranslateClick}
              onCreateWithAiClick={handleCreateWithAiClick}
              fileType={fileType}
          />
          <SheetsEditor />
          <SheetsFooter />
        </div>
      );
    }
  
    if (fileType === 'powerpoint') {
      return (
        <div className="flex flex-col flex-grow bg-white">
          <EditorToolbar 
              onFileMenuClick={() => setIsFileMenuOpen(true)} 
              onSpellCheckClick={handleSpellCheckClick}
              onChatBotClick={handleChatBotClick}
              onTranslateClick={handleTranslateClick}
              onCreateWithAiClick={handleCreateWithAiClick}
              fileType={fileType}
          />
          <div className="flex flex-grow overflow-y-auto">
              <PresentationEditor isCreateWithAiOpen={isCreateWithAiOpen} onCreateWithAiOpenChange={setIsCreateWithAiOpen} />
              <PresentationRightSidebar />
          </div>
          <PresentationFooter />
        </div>
      );
    }
  
    // Default to 'word' layout
    return (
      <div className="flex flex-col flex-grow bg-slate-200">
        <EditorToolbar 
            onFileMenuClick={() => setIsFileMenuOpen(true)} 
            onSpellCheckClick={handleSpellCheckClick}
            onChatBotClick={handleChatBotClick}
            onTranslateClick={handleTranslateClick}
            onCreateWithAiClick={handleCreateWithAiClick}
            fileType={fileType}
        />
        <div className="flex flex-grow overflow-y-auto bg-white">
          <RichTextEditor />
          {isSpellCheckPanelOpen && <AiSpellCheckPanel onClose={() => setIsSpellCheckPanelOpen(false)} />}
          {isChatPanelOpen && <AiChatPanel onClose={() => setIsChatPanelOpen(false)} />}
        </div>
        <EditorFooter/>
      </div>
    );
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-white">
      {isFileMenuOpen && <FileMenu onClose={() => setIsFileMenuOpen(false)} recentFiles={editorRecentFiles}/>}
      {renderEditorLayout()}
    </div>
  );
}
