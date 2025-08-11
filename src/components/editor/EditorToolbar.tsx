
'use client';

import React, { useState } from 'react';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, ArrowDownUp, AreaChart as AreaChartIcon, ArrowLeft,
  ArrowRight, AppWindow, BarChart, Bookmark, Bookmark as BookmarkIcon, Book, BookA, BookCopy, BookMarked,
  BookOpen, BookOpenCheck, Box, BrainCircuit, Bold, CaseSensitive, CaseUpper, Camera, CheckCircle2,
  ChevronDown, ChevronLeft as ChevronLeftIcon, ChevronRight, ChevronUp, Clapperboard, CloudUpload, Combine,
  Columns, Columns2, Copy, Droplets, Eraser, Expand, ExternalLink, Eye, File as FileIcon, FileDigit,
  FileEdit, FileImage, FileLock, FileSymlink, FileText, FileUp, Folder, GripVertical, GitCompare, Globe,
  Heading1, Heading2, Heading3, Heading4, Header, HelpCircle, Highlighter, History, Image as ImageIcon,
  Italic, Languages, LayoutGrid, Library, Link as LinkIcon, Link2, List, ListOrdered, ListTodo, ListTree,
  Loader, LogOut, Mail, Maximize, MessageSquare, MessageSquarePlus, MessageSquarePlus as MessageSquarePlusIcon,
  Mic, Minus, MoreHorizontal, Newspaper, Paintbrush, Palette, PanelLeft, Paperclip, Pen, PenLine,
  PieChart, Pilcrow, Pilcrow as PilcrowIcon, PictureInPicture, Play, Plus, PlusCircle, Printer,
  RectangleHorizontal, Redo, Rows, Save, SaveAll, Scan, Scissors, Search, Send, Settings, Shapes, Share,
  Shield, Sigma, Sparkles, Split, SplitSquareHorizontal, SquareSigma, Star, Strikethrough, Subscript,
  Superscript, Table as TableIcon, Text, TextQuote, ThumbsDown, ThumbsUp, Trash2, Type,
  Type as TypeIcon, Underline, Undo, Unlink, View, Wand2, WrapText, X, XCircle, FunctionSquare, Braces,
  Calendar, Filter, SortAsc
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AiAssistantMenu } from './AiAssistantMenu';

function WLogo() {
    return <div className="w-4 h-4 bg-[#2E68EB] text-white flex items-center justify-center rounded-sm text-xs font-bold">W</div>;
}

export default function EditorToolbar({ 
    onFileMenuClick, 
    onTranslateClick, 
    fileType, 
    onCreateWithAiClick 
}: { 
    onFileMenuClick: () => void; 
    onTranslateClick: () => void; 
    fileType: string; 
    onCreateWithAiClick: () => void; 
}) {
    const [activeTab, setActiveTab] = useState('Home');
    const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
    
    // Placeholder logic for panels, will be implemented later
    const onSpellCheckClick = () => alert('Spell Check Panel Coming Soon');
    const onChatBotClick = () => alert('Chat Bot Panel Coming Soon');
    
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
