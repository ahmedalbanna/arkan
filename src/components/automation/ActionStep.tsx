'use client';

import React from 'react';
import { ArrowDown } from 'lucide-react';

export const ActionStep = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="w-px h-6 bg-slate-300" />
      <div className="rounded-full bg-slate-300 p-1">
        <ArrowDown className="h-3 w-3 text-slate-500" />
      </div>
      <div className="w-px h-6 bg-slate-300" />
    </div>
  );
};
