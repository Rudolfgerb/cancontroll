
import React from 'react';
import { Card } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { Trophy, DollarSign, Star, Target, UserX, Award } from 'lucide-react';

export const Hideout: React.FC = () => {
  const { gameState } = useGame();

  const stats = [
    {
      icon: Star,
      label: 'Total Fame',
      value: gameState.fame,
      color: 'text-neon-orange',
    },
    {
      icon: DollarSign,
      label: 'Money',
      value: `$${gameState.money}`,
      color: 'text-neon-lime',
    },
    {
      icon: Target,
      label: 'Total Pieces',
      value: gameState.stats.totalPieces,
      color: 'text-neon-cyan',
    },
    {
      icon: Award,
      label: 'Spots Painted',
      value: gameState.stats.spotsPainted,
      color: 'text-primary',
    },
    {
      icon: Trophy,
      label: 'Best Fame',
      value: gameState.stats.bestFame,
      color: 'text-neon-orange',
    },
    {
      icon: UserX,
      label: 'Times Busted',
      value: gameState.stats.timesArrested,
      color: 'text-destructive',
    },
  ];

  const getWantedStars = () => {
    return Array.from({ length: 5 }, (_, i) => i < gameState.wantedLevel);
  };

  return (
    <div className="h-full flex flex-col bg-urban-dark overflow-y-auto">
      {/* Header */}
      <div className="bg-urban-surface border-b-2 border-urban-border p-6">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Hideout</h2>
        <p className="text-sm text-muted-foreground">Deine Stats & Fortschritt</p>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Wanted Level */}
        <Card className="p-6 bg-card/50 backdrop-blur border-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black uppercase">Wanted Level</h3>
            <div className="flex gap-1">
              {getWantedStars().map((filled, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${filled ? 'fill-destructive text-destructive' : 'text-muted'}`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {gameState.wantedLevel === 0 && 'Alles ruhig. Du bist clean.'}
            {gameState.wantedLevel === 1 && 'Die Cops haben dich auf dem Radar.'}
            {gameState.wantedLevel === 2 && 'Moderate Fahndung. Pass auf!'}
            {gameState.wantedLevel === 3 && 'Hohe Alarmbereitschaft!'}
            {gameState.wantedLevel === 4 && 'Gefährlich! Sie sind überall!'}
            {gameState.wantedLevel === 5 && 'MAX WANTED! Extrem gefährlich!'}
          </p>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="p-4 bg-card/50 backdrop-blur border-2 hover:border-primary/50 transition-all group">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`w-12 h-12 rounded-full bg-background/50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Current Loadout */}
        <Card className="p-6 bg-card/50 backdrop-blur border-2">
          <h3 className="text-xl font-black uppercase mb-4">Current Loadout</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2 uppercase">Selected Color</div>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-border"
                  style={{ backgroundColor: gameState.inventory.selectedColor }}
                />
                <span className="font-bold">{gameState.inventory.selectedColor}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2 uppercase">Selected Design</div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border-2 border-border bg-muted flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <span className="font-bold capitalize">{gameState.inventory.selectedDesign.replace('-', ' ')}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Inventory Summary */}
        <Card className="p-6 bg-card/50 backdrop-blur border-2">
          <h3 className="text-xl font-black uppercase mb-4">Inventory</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Colors Unlocked</div>
              <div className="text-3xl font-black text-neon-cyan">{gameState.inventory.colors.length}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Designs Unlocked</div>
              <div className="text-3xl font-black text-primary">{gameState.inventory.designs.length}</div>
            </div>
          </div>
        </Card>

        {/* Progress */}
        <Card className="p-6 bg-card/50 backdrop-blur border-2">
          <h3 className="text-xl font-black uppercase mb-4">Progress</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Spots Painted</span>
                <span className="font-bold">{gameState.stats.spotsPainted} / {gameState.spots.length}</span>
              </div>
              <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-neon transition-all"
                  style={{ width: `${(gameState.stats.spotsPainted / gameState.spots.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
