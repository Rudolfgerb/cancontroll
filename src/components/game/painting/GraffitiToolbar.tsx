import React from 'react';
import { Button } from '@/components/ui/button';
import { SprayCan, Brush, RollerCoaster, Pencil, VenetianMask, Undo, Trash2 } from 'lucide-react';
import { Tool } from './PaintCanvas'; // We will move the type definition here

interface GraffitiToolbarProps {
  selectedTool: Tool;
  onSelectTool: (tool: Tool) => void;
  selectedColor: string;
  onSelectColor: (color: string) => void;
  colorInventory: { [colorId: string]: number };
  onUndo: () => void;
  onClear: () => void;
}

const tools: { id: Tool; name: string; icon: React.ReactNode }[] = [
    { id: 'spraycan', name: 'Spraycan', icon: <SprayCan /> },
    { id: 'marker', name: 'Marker', icon: <Brush /> },
    { id: 'fatcap', name: 'Fat Cap', icon: <SprayCan className="w-8 h-8" strokeWidth={2.5}/> },
    { id: 'skinnycap', name: 'Skinny Cap', icon: <Pencil /> },
    { id: 'roller', name: 'Roller', icon: <RollerCoaster /> },
    { id: 'stencil', name: 'Stencil', icon: <VenetianMask /> },
];

const ColorSwatch = ({ color, amount, isSelected, onClick }: { color: string, amount: number, isSelected: boolean, onClick: () => void }) => (
    <button 
        className={`w-10 h-10 rounded-sm border-2 relative overflow-hidden transition-all ${isSelected ? 'border-yellow-400 scale-110' : 'border-white/20'}`}
        style={{ backgroundColor: color }}
        onClick={onClick}
        disabled={amount <= 0}
    >
        <div className='absolute top-0 right-0 px-1 text-xs font-mono bg-black/50 text-white'>
            {Math.round(amount)}
        </div>
        {amount <= 0 && <div className='absolute inset-0 bg-black/70'></div>}
    </button>
)

export const GraffitiToolbar: React.FC<GraffitiToolbarProps> = ({ 
    selectedTool, onSelectTool, selectedColor, onSelectColor, colorInventory, onUndo, onClear 
}) => {
  const ownedColors = Object.keys(colorInventory);

  return (
    <div className="w-48 bg-neutral-900 text-white flex flex-col p-2 gap-4 border-r-2 border-black">
      {/* Tools */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm uppercase text-neutral-400 px-2">Tools</h3>
        <div className="grid grid-cols-2 gap-1">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={selectedTool === tool.id ? 'secondary' : 'ghost'}
              className={`h-auto p-2 flex flex-col items-center justify-center gap-1 ${selectedTool === tool.id ? 'bg-yellow-400 text-black' : ''}`}
              onClick={() => onSelectTool(tool.id)}
            >
                {tool.icon}
                <span className="text-xs font-bold">{tool.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
        <h3 className="font-bold text-sm uppercase text-neutral-400 px-2">Colors</h3>
        <div className="grid grid-cols-3 gap-2">
            {ownedColors.map(color => (
                <ColorSwatch 
                    key={color}
                    color={color}
                    amount={colorInventory[color]}
                    isSelected={selectedColor === color}
                    onClick={() => onSelectColor(color)}
                />
            ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2">
         <h3 className="font-bold text-sm uppercase text-neutral-400 px-2">Actions</h3>
         <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="border-neutral-600 flex-col h-auto py-2" onClick={onUndo}><Undo /><span className="text-xs mt-1">Undo</span></Button>
            <Button variant="outline" className="border-neutral-600 text-red-500 flex-col h-auto py-2" onClick={onClear}><Trash2 /><span className="text-xs mt-1">Clear</span></Button>
         </div>
      </div>
    </div>
  );
};
