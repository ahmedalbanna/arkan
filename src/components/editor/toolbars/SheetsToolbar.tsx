
'use client';

import React, { useState } from 'react';
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Copy, Italic, Paintbrush,
  Sigma, Filter, SortAsc, Text, Underline, Type, Combine, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

export function SheetsToolbar() {
    const [activeTab, setActiveTab] = useState('Home');
    
    const toolbarTabs = [
        { name: 'Home' },
        { name: 'Insert' },
        { name: 'Page Layout' },
        { name: 'Formulas' },
        { name: 'Data' },
        { name: 'Review' },
        { name: 'View' },
        { name: 'Tools' },
        { name: 'Smart Toolbox' },
    ];

    const renderContent = () => {
        switch (activeTab) {
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
                            className="h-9 px-3"
                            onClick={() => setActiveTab(tab.name)}
                        >
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
