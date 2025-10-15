import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface ColorPaletteProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
  colorInventory: { [colorId: string]: number };
}

const primaryColors = ["#FF3B30", "#FF9500", "#FFCC00", "#4CD964", "#007AFF", "#AF52DE"];
const flatColors = ["#000000", "#FFFFFF", "#8E8E93"];

const ColorButton = ({ color, selectedColor, onSelectColor, amount }: { color: string; selectedColor: string; onSelectColor: (color: string) => void; amount: number }) => {
    const hasPaint = amount > 0;

    return (
        <div className="relative flex flex-col items-center gap-1">
            <Button
                variant="outline"
                className="w-12 h-12 rounded-full border-2 p-0 relative overflow-hidden transition-all duration-200"
                style={{
                    backgroundColor: color,
                    borderColor: selectedColor === color ? '#E94560' : 'rgba(255,255,255,0.8)',
                    opacity: hasPaint ? 1 : 0.4,
                    transform: selectedColor === color ? 'scale(1.1)' : 'scale(1)',
                }}
                onClick={() => hasPaint && onSelectColor(color)}
                disabled={!hasPaint}
            >
                <div
                    className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm"
                    style={{ height: `${100 - amount}%`, transition: 'height 0.3s ease-in-out' }}
                />
                {selectedColor === color && <Check className="w-6 h-6 text-white" style={{ filter: 'drop-shadow(0 0 3px black)'}} />}
            </Button>
            <div className={`text-xs font-mono transition-colors ${hasPaint ? 'text-white' : 'text-red-500'}`}>
                {amount}%
            </div>
        </div>
    )
}

const ColorGroup = ({ title, colors, selectedColor, onSelectColor, colorInventory }: { title: string, colors: string[], selectedColor: string, onSelectColor: (color: string) => void, colorInventory: { [colorId: string]: number } }) => {
    const ownedColors = colors.filter(c => colorInventory.hasOwnProperty(c));
    if (ownedColors.length === 0) return null;

    return (
        <div className="space-y-3">
            <p className="text-sm font-bold text-muted-foreground text-center">{title}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-5">
                {ownedColors.map(color => (
                    <ColorButton 
                        key={color} 
                        color={color} 
                        selectedColor={selectedColor} 
                        onSelectColor={onSelectColor} 
                        amount={colorInventory[color] || 0} 
                    />
                ))}
            </div>
        </div>
    )
}

export const ColorPalette: React.FC<ColorPaletteProps> = ({ selectedColor, onSelectColor, colorInventory }) => {
    const allOwnedColors = Object.keys(colorInventory);

    return (
        <div className="bg-black/30 p-3 rounded-lg space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            <p className="text-xs text-muted-foreground uppercase text-center font-bold tracking-wider">Your Cans</p>
            
            {allOwnedColors.length > 0 ? (
                <div className="space-y-4">
                    <ColorGroup title="Colors" colors={primaryColors} selectedColor={selectedColor} onSelectColor={onSelectColor} colorInventory={colorInventory} />
                    <ColorGroup title="Standard" colors={flatColors} selectedColor={selectedColor} onSelectColor={onSelectColor} colorInventory={colorInventory} />
                </div>
            ) : (
                <p className="text-center text-muted-foreground p-4">You have no paint! Go to the Shop to buy some cans.</p>
            )}
        </div>
    );
};
