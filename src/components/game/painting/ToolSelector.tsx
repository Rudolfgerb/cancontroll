import React from 'react';
import { Button } from '@/components/ui/button';
import { SprayCan, Brush, RollerCoaster, Pencil, VenetianMask } from 'lucide-react';

export type Tool = 'spraycan' | 'marker' | 'fatcap' | 'skinnycap' | 'roller' | 'stencil';

interface ToolSelectorProps {
  selectedTool: Tool;
  onSelectTool: (tool: Tool) => void;
}

const tools: { id: Tool; name: string; icon: React.ReactNode }[] = [
  { id: 'spraycan', name: 'Sprühdose', icon: <SprayCan /> },
  { id: 'marker', name: 'Marker', icon: <Brush /> },
  { id: 'fatcap', name: 'Fat Cap', icon: <SprayCan className="w-8 h-8" strokeWidth={2.5}/> },
  { id: 'skinnycap', name: 'Skinny Cap', icon: <Pencil /> },
  { id: 'roller', name: 'Rolle', icon: <RollerCoaster /> },
  { id: 'stencil', name: 'Schablone', icon: <VenetianMask /> },
];

export const ToolSelector: React.FC<ToolSelectorProps> = ({ selectedTool, onSelectTool }) => {
  return (
    <div className="bg-black/30 p-2 rounded-lg">
        <p className="text-xs text-muted-foreground uppercase text-center mb-2">Tools</p>
        <div className="flex items-center justify-around gap-2 px-2 overflow-x-auto">
        {tools.map((tool) => (
            <Button
            key={tool.id}
            variant={selectedTool === tool.id ? 'default' : 'ghost'}
            className={`flex flex-col h-auto p-2 gap-1 rounded-lg ${selectedTool === tool.id ? 'bg-primary' : ''}`}
            onClick={() => onSelectTool(tool.id)}
            >
            <div className="w-8 h-8 flex items-center justify-center">{tool.icon}</div>
            <span className="text-xs font-bold">{tool.name}</span>
            </Button>
        ))}
        </div>
    </div>
  );
};
