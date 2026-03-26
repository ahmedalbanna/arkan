'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { useEffect, useState } from 'react';
import pako from 'pako';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useDebounce } from '@/hooks';
import { encode64 } from '@/infrastructure/utils/encode64';

const PlantUMLComponent = (props: any) => {
  const [code, setCode] = useState(props.node.attrs.code || '@startuml\nactor User\nUser -> System: Do something\n@enduml');
  const debouncedCode = useDebounce(code, 500); // Debounce updates to avoid excessive requests

  const updateCode = (newCode: string) => {
    setCode(newCode);
    props.updateAttributes({ code: newCode });
  };

  const imageUrl = (() => {
    try {
      const data = new TextEncoder().encode(debouncedCode);
      const compressed = pako.deflate(data, { level: 9 });
      const encoded = encode64(compressed);
      return `https://www.plantuml.com/plantuml/png/~1${encoded}`;
    } catch (e) {
      console.error("Failed to generate PlantUML URL", e);
      return '';
    }
  })();

  return (
    <NodeViewWrapper className="plantuml-node-view grid grid-cols-2 gap-4 my-4 p-2 border rounded-lg bg-muted/50">
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-muted-foreground mb-1">PlantUML Code</label>
        <Textarea
          value={code}
          onChange={(e) => updateCode(e.target.value)}
          className="font-mono text-xs w-full h-full min-h-[200px] resize-y"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs font-semibold text-muted-foreground mb-1">Preview</label>
        <div className="relative w-full h-full min-h-[200px] border rounded-md bg-background flex items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="PlantUML Diagram Preview"
              layout="fill"
              objectFit="contain"
              unoptimized // Necessary for external URLs that can change
            />
          ) : (
            <p className="text-sm text-muted-foreground">Invalid Code</p>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

const PlantUML = Node.create({
  name: 'plantUML',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      code: {
        default: '@startuml\nactor User\nUser -> (Use Case)\n@enduml',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'plant-uml' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['plant-uml', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PlantUMLComponent);
  },

  addCommands() {
    return {
      insertPlantUML: () => ({ commands }: any) => {
        return commands.insertContent('<plant-uml></plant-uml>');
      },
    } as any;
  },
});

export default PlantUML;
