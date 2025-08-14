
'use client';

import React, { useState } from 'react';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, CaseSensitive, ChevronDown, Copy,
  Eraser, ImageIcon, Italic, LayoutGrid, List, ListOrdered, Paintbrush, Play, RefreshCw,
  Shapes, Split, Strikethrough, Text, Type, Underline, BookCopy, Box, Link2, Pen, Settings,
  Wand2, Sparkles, FileText, FileEdit, Languages,
  ArrowDownUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function PresentationToolbar({ onTranslateClick, onCreateWithAiClick }: { onTranslateClick: () => void, onCreateWithAiClick: () => void }) {
    const [activeTab, setActiveTab] = useState('Home');
    
     const toolbarTabs = [
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
    ];

    const renderContent = () => {
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
            default:
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
