
'use client';

import React, { useState } from 'react';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, ArrowDownUp, AreaChart as AreaChartIcon,
  BookA, BookCopy, BookMarked, BookOpen, BookOpenCheck, Box, BrainCircuit, Bold, CaseSensitive, CaseUpper,
  Camera, CheckCircle2, Clapperboard, CloudUpload, Combine, Columns, Columns2, Copy, Droplets, Eraser,
  Expand, ExternalLink, Eye, FileDigit, FileEdit, FileImage, FileLock, FileSymlink, FileText, FileUp,
  Folder, GitCompare, Globe, Heading1, Highlighter, History, Image as ImageIcon,
  Italic, Languages, LayoutGrid, Library, Link as LinkIcon, Link2, List, ListOrdered, ListTodo, ListTree,
  Loader, LogOut, Mail, Maximize, MessageSquare, MessageSquarePlus, MessageSquarePlus as MessageSquarePlusIcon,
  Mic, Minus, MoreHorizontal, Newspaper, Paintbrush, Palette, PanelLeft, Paperclip, Pen, PenLine,
  PieChart, Pilcrow, Pilcrow as PilcrowIcon, PictureInPicture, Play, Plus, PlusCircle, Printer,
  RectangleHorizontal, Redo, Rows, Save, SaveAll, Scan, Scissors, Search, Send, Settings, Shapes, Share,
  Shield, Sigma, Sparkles, Split, SplitSquareHorizontal, SquareSigma, Star, Strikethrough, Subscript,
  Superscript, Table as TableIcon, Text, TextQuote, ThumbsDown, ThumbsUp, Trash2, Type,
  Type as TypeIcon, Underline, Undo, Unlink, View, Wand2, WrapText, X, XCircle, FunctionSquare, Braces,
  AppWindow,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AiAssistantMenu } from '../AiAssistantMenu';
import { Separator } from '@/components/ui/separator';


export function DocumentToolbar({ onTranslateClick }: { onTranslateClick: () => void }) {
    const [activeTab, setActiveTab] = useState('Home');

    const toolbarTabs = [
        { name: 'Home' },
        { name: 'Insert' },
        { name: 'Page Layout' },
        { name: 'References' },
        { name: 'Review' },
        { name: 'View' },
        { name: 'Tools' },
        { name: 'WPS AI', icon: <Wand2 className="w-4 h-4 mr-1"/> },
    ];
    
    // Placeholder logic for panels, will be implemented later
    const onSpellCheckClick = () => alert('Spell Check Panel Coming Soon');
    const onChatBotClick = () => alert('Chat Bot Panel Coming Soon');

    const renderContent = () => {
        switch (activeTab) {
            case 'WPS AI':
                return (
                    <div className="flex items-center gap-4 flex-wrap p-2 text-purple-600">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild><Popover><PopoverTrigger asChild><Button variant="ghost" className="flex flex-col h-auto p-2 items-center gap-1"><Sparkles className="w-5 h-5" /><span className="text-xs">Smart Create</span></Button></PopoverTrigger><PopoverContent className="w-auto p-0 border-none shadow-none"><AiAssistantMenu /></PopoverContent></Popover></TooltipTrigger>
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
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><Rows className="w-4 h-4 mr-1"/> Rearrange Panes <ChevronDown className="w-3 h-3 inline ml-auto"/></Button>
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><SplitSquareHorizontal className="w-4 h-4 mr-1"/> Split Window <ChevronDown className="w-3 h-3 inline ml-auto"/></Button>
                        </div>
                        <Separator orientation="vertical" className="h-16 mx-1" />
                        <div className="flex flex-col gap-1">
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><Columns2 className="w-4 h-4 mr-1"/> View Side by Side</Button>
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><RefreshCw className="w-4 h-4 mr-1"/> Synchronous Scrolling</Button>
                            <Button variant="ghost" className="text-xs h-auto p-1 justify-start"><Expand className="w-4 h-4 mr-1"/> Reset Window Position</Button>
                        </div>
                    </div>
                );
            // More cases...
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
    
    return (
        <div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 flex-wrap">
                    {toolbarTabs.map((tab) => (
                        <Button 
                            key={tab.name}
                            variant={activeTab === tab.name ? 'secondary' : 'ghost'} 
                            className={`h-9 px-3 ${activeTab === tab.name && tab.name === 'WPS AI' ? 'text-purple-600' : ''}`}
                            onClick={() => setActiveTab(tab.name)}
                        >
                            {tab.icon}
                            {tab.name}
                        </Button>
                    ))}
                </div>
            </div>
            <div className="p-2 bg-white rounded-b-lg shadow-inner">
                 {renderContent()}
            </div>
        </div>
    )
}
