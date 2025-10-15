import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { SprayCan, Paintbrush, Gem } from 'lucide-react';
import { toast } from 'sonner';

const availableColors = [
    { id: '#FF3B30', name: 'Red', cost: 20 },
    { id: '#FF9500', name: 'Orange', cost: 20 },
    { id: '#FFCC00', name: 'Yellow', cost: 20 },
    { id: '#4CD964', name: 'Green', cost: 20 },
    { id: '#007AFF', name: 'Blue', cost: 20 },
    { id: '#AF52DE', name: 'Purple', cost: 20 },
    { id: '#000000', name: 'Black', cost: 15 },
    { id: '#FFFFFF', name: 'White', cost: 15 },
    { id: '#8E8E93', name: 'Grey', cost: 15 },
];

const availableDesigns = [
    { id: 'throwup-style', name: 'Throw-Up Style', cost: 150, fameRequired: 50 },
    { id: 'piece-style', name: 'Piece Style', cost: 400, fameRequired: 200 },
];

export const Shop: React.FC = () => {
  const { gameState, purchaseColor, unlockDesign } = useGame();
  const { playCash } = useSoundEffects();

  const handlePurchaseColor = (colorId: string, cost: number) => {
    const success = purchaseColor(colorId, cost);
    if (success) {
        playCash();
        toast.success(`Farbe gekauft! ${colorId}`);
    } else {
        toast.error('Nicht genug Geld!');
    }
  };

  const handleUnlockDesign = (designId: string, cost: number, fameRequired: number) => {
    if (gameState.fame < fameRequired) {
        toast.error('Nicht genug Fame!');
        return;
    }
    // This is a placeholder as unlockDesign doesn't handle cost yet
    // In a real scenario, you'd add cost handling to the context function.
    toast.info('Design-Käufe sind noch nicht implementiert.');
  };

  return (
    <div className="p-6 bg-urban-background/50 h-full overflow-y-auto custom-scrollbar">
      <h2 className="text-3xl font-black uppercase text-white mb-6">Black Market</h2>
      
      {/* --- Cans Section --- */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
            <SprayCan className="w-7 h-7 text-primary" />
            <h3 className="text-2xl font-bold text-white">Farbdosen</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableColors.map((color) => (
            <Card key={color.id} className="bg-urban-surface/80 border-urban-border text-white">
              <CardHeader className="flex-row items-center justify-between p-4">
                <CardTitle className="text-lg">{color.name}</CardTitle>
                <div className="w-8 h-8 rounded-full border-2 border-white/50" style={{ backgroundColor: color.id }} />
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-2xl font-black text-neon-lime">${color.cost}</p>
              </CardContent>
              <CardFooter className="p-4">
                <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => handlePurchaseColor(color.id, color.cost)}
                >
                   {gameState.inventory.colors[color.id] ? 'Nachfüllen' : 'Kaufen'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* --- Designs Section --- */}
      <div>
        <div className="flex items-center gap-3 mb-4">
            <Paintbrush className="w-7 h-7 text-neon-cyan" />
            <h3 className="text-2xl font-bold text-white">Graffiti Designs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableDesigns.map((design) => (
            <Card key={design.id} className="bg-urban-surface/80 border-urban-border text-white">
              <CardHeader>
                <CardTitle className="text-xl">{design.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-lg text-muted-foreground">Schalte einen komplett neuen Graffiti-Stil frei.</p>
                 <div className="flex justify-between items-center text-neon-lime font-bold">
                    <span>Kosten:</span>
                    <span>${design.cost}</span>
                </div>
                <div className="flex justify-between items-center text-neon-orange font-bold">
                    <span>Benötigter Fame:</span>
                    <span>{design.fameRequired}</span>
                </div>
              </CardContent>
              <CardFooter>
                 <Button 
                    className="w-full bg-neon-cyan hover:bg-neon-cyan/90 text-black"
                    onClick={() => handleUnlockDesign(design.id, design.cost, design.fameRequired)}
                    disabled={gameState.inventory.designs.includes(design.id)}
                >
                   {gameState.inventory.designs.includes(design.id) ? 'Freigeschaltet' : 'Freischalten'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
