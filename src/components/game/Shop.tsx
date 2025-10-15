import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { SprayCan, Paintbrush, Gem } from 'lucide-react';
import { toast } from 'sonner';

const availableColors = [
  { id: '#FF3B30', name: 'Red', cost: 10 },
  { id: '#FF9500', name: 'Orange', cost: 10 },
  { id: '#FFCC00', name: 'Yellow', cost: 10 },
  { id: '#4CD964', name: 'Green', cost: 10 },
  { id: '#007AFF', name: 'Blue', cost: 10 },
  { id: '#AF52DE', name: 'Purple', cost: 10 },
  { id: '#000000', name: 'Black', cost: 15 },
  { id: '#FFFFFF', name: 'White', cost: 15 },
  { id: '#8E8E93', name: 'Grey', cost: 12 },
];

const Shop = () => {
  const { fame, purchaseColor, money, removeMoney } = useGame();
  console.log("Shop component rendered");
  console.log("Money:", money);
  console.log("Fame:", fame);

  const { playPurchase } = useSoundEffects();

  const handlePurchase = (color: { id: string; name: string; cost: number }) => {
    if (money >= color.cost) {
      const success = purchaseColor(color.id, color.cost);
      if (success) {
        playPurchase();
        toast.success(`Purchased ${color.name} paint!`);
      } else {
        toast.error('Purchase failed!');
      }
    } else {
      toast.error('Not enough money!');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        {availableColors.map((color) => (
          <div key={color.id} className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-full shadow-md"
              style={{ backgroundColor: color.id }}
            />
            <Button variant="secondary" size="sm" onClick={() => handlePurchase(color)}>
              {color.name} ({color.cost})
            </Button>
          </div>
        ))}
      </CardContent>
      <CardFooter>Balance: {money}</CardFooter>
    </Card>
  );
};

export default Shop;
