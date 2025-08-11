
'use client';

import {
  PenLine, BrainCircuit, ListTree, FileText, GitCompare, BookOpen, MessageSquare, ListTodo,
  Sparkles, MoreHorizontal, ChevronRight, FileEdit
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const AiAssistantMenu = () => {
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
