
'use client';

import React, { useState, useEffect, useImperativeHandle } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const CommandList = React.forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <ScrollArea className="z-50 max-h-80 w-72 overflow-y-auto rounded-lg border bg-background shadow-lg">
      <div className="p-1">
        {props.items.length ? (
          props.items.map((item: any, index: number) => (
            <button
              className={`flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-muted ${index === selectedIndex ? 'bg-muted' : ''
                }`}
              key={index}
              onClick={() => selectItem(index)}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted text-muted-foreground shrink-0">
                {item.icon}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="font-medium text-sm truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
            </button>
          ))
        ) : (
          <div className="p-2 text-sm text-center text-muted-foreground">No results</div>
        )}
      </div>
    </ScrollArea>
  );
});

CommandList.displayName = 'CommandList';

export default CommandList;
