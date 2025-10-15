import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const SpotGallery: React.FC = () => {
  const { gameState } = useGame();

  if (gameState.spotGallery.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-urban-dark p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Your Spot Gallery is Empty</h2>
          <p className="text-muted-foreground mt-2">Take screenshots of spots in the city map to add them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-urban-dark p-4 md:p-8">
      <h1 className="text-3xl font-black uppercase text-white mb-6">Spot Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {gameState.spotGallery.map((item) => (
          <Card key={item.id} className="bg-urban-surface border-urban-border overflow-hidden">
            <CardContent className="p-0">
              <img src={item.imageUrl} alt={item.spotName} className="w-full h-48 object-cover"/>
              <div className="p-4">
                <h3 className="font-bold text-white truncate">{item.spotName}</h3>
                <p className="text-sm text-muted-foreground">Risk Level: <span className="font-bold text-primary">{item.riskLevel}</span></p>
                <Badge variant="outline" className="mt-2">{new Date(item.timestamp).toLocaleString()}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
