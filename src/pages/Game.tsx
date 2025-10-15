import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CityMap } from '@/components/game/CityMap';
import { PaintCanvas } from '@/components/game/PaintCanvas';
import { Shop } from '@/components/game/Shop';
import { Hideout } from '@/components/game/Hideout';
import StreetView from '@/components/game/StreetView'; // Import StreetView component
import { useGame, Spot } from '@/contexts/GameContext';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { Map, ShoppingBag, Home, Star, DollarSign, AlertTriangle, Trophy, SprayCan, Globe } from 'lucide-react'; // Import Globe icon
import { toast } from 'sonner';

type GameView = 'hideout' | 'map' | 'shop' | 'painting' | 'streetview'; // Add 'streetview' to GameView type

const Game: React.FC = () => {
  const [currentView, setCurrentView] = useState<GameView>('hideout');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [showSpotDialog, setShowSpotDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [paintResult, setPaintResult] = useState<{ quality: number; fame: number; money: number } | null>(null);
  
  const { gameState, selectSpot, paintSpot, resetWanted, getArrested } = useGame();
  const { playClick, playSuccess, playBusted } = useSoundEffects();

  const handleSpotSelect = (spot: Spot) => {
    if (spot.painted) {
      toast.error('Dieser Spot wurde bereits bemalt!');
      return;
    }
    setSelectedSpot(spot);
    setShowSpotDialog(true);
    selectSpot(spot);
  };

  const handleStartPainting = () => {
    playClick();
    setShowSpotDialog(false);
    setCurrentView('painting');
  };

  const handlePaintComplete = (quality: number) => {
    if (!selectedSpot) return;

    const fameEarned = Math.floor(selectedSpot.fameReward * quality);
    const moneyEarned = Math.floor(selectedSpot.moneyReward * quality);

    paintSpot(selectedSpot.id, quality);
    setPaintResult({ quality, fame: fameEarned, money: moneyEarned });
    
    playSuccess();
    setShowResultDialog(true);
    setCurrentView('map');

    // Reset wanted level after successful paint
    if (gameState.wantedLevel > 0) {
      setTimeout(() => resetWanted(), 3000);
    }
  };

  const handleBusted = () => {
    playBusted();
    getArrested();
    toast.error(`Erwischt! Du verlierst 30% deines Geldes.`);
    setCurrentView('map');
    setSelectedSpot(null);
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors = {
      easy: 'bg-neon-lime/20 text-neon-lime border-neon-lime',
      medium: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan',
      hard: 'bg-neon-orange/20 text-neon-orange border-neon-orange',
      extreme: 'bg-primary/20 text-primary border-primary',
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  const getQualityText = (quality: number) => {
    if (quality >= 0.9) return { text: 'Masterpiece!', color: 'text-primary' };
    if (quality >= 0.7) return { text: 'Excellent!', color: 'text-neon-lime' };
    if (quality >= 0.5) return { text: 'Good!', color: 'text-neon-cyan' };
    if (quality >= 0.3) return { text: 'Okay', color: 'text-neon-orange' };
    return { text: 'Weak...', color: 'text-muted-foreground' };
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="bg-urban-surface border-b-2 border-urban-border px-4 py-3 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SprayCan className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-black uppercase tracking-tight">CanControl</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-neon-orange" />
              <span className="font-black">{gameState.fame}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-neon-lime" />
              <span className="font-black">{gameState.money}</span>
            </div>
            {gameState.wantedLevel > 0 && (
              <div className="flex items-center gap-2 bg-destructive/20 px-3 py-1 rounded-full">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <span className="font-black text-destructive text-sm">
                  {Array(gameState.wantedLevel).fill('★').join('')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        {/* Sidebar Navigation */}
        <div className="md:w-64 bg-urban-surface border-r-2 border-urban-border p-4 space-y-2">
          <Button
            variant={currentView === 'hideout' ? 'default' : 'outline'}
            className="w-full justify-start gap-3"
            onClick={() => {
              playClick();
              setCurrentView('hideout');
            }}
          >
            <Home className="w-5 h-5" />
            Hideout
          </Button>
          <Button
            variant={currentView === 'map' ? 'default' : 'outline'}
            className="w-full justify-start gap-3"
            onClick={() => {
              playClick();
              setCurrentView('map');
            }}
          >
            <Map className="w-5 h-5" />
            Stadt-Map
          </Button>
          <Button
            variant={currentView === 'shop' ? 'default' : 'outline'}
            className="w-full justify-start gap-3"
            onClick={() => {
              playClick();
              setCurrentView('shop');
            }}
          >
            <ShoppingBag className="w-5 h-5" />
            Shop
          </Button>
          <Button
            variant={currentView === 'streetview' ? 'default' : 'outline'}
            className="w-full justify-start gap-3"
            onClick={() => {
              playClick();
              setCurrentView('streetview');
            }}
          >
            <Globe className="w-5 h-5" />
            Street View
          </Button>

          {/* Quick Stats */}
          <Card className="p-4 mt-6">
            <div className="text-xs text-muted-foreground uppercase mb-2">Quick Stats</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pieces:</span>
                <span className="font-bold">{gameState.stats.totalPieces}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Spots:</span>
                <span className="font-bold">{gameState.stats.spotsPainted}/{gameState.spots.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Best Fame:</span>
                <span className="font-bold text-neon-orange">{gameState.stats.bestFame}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Main View */}
        <div className="flex-1 min-h-[600px]">
          {currentView === 'hideout' && <Hideout />}
          {currentView === 'map' && <CityMap onSelectSpot={handleSpotSelect} />}
          {currentView === 'shop' && <Shop />}
          {currentView === 'painting' && selectedSpot && (
            <PaintCanvas
              onComplete={handlePaintComplete}
              onBusted={handleBusted}
              difficulty={selectedSpot.difficulty}
            />
          )}
          {currentView === 'streetview' && <StreetView />}
        </div>
      </div>

      {/* Spot Selection Dialog */}
      <Dialog open={showSpotDialog} onOpenChange={setShowSpotDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase">{selectedSpot?.name}</DialogTitle>
            <DialogDescription>
              Bist du bereit für diesen Spot?
            </DialogDescription>
          </DialogHeader>
          {selectedSpot && (
            <div className="space-y-4">
              <div className={`px-3 py-2 rounded-lg border-2 inline-block ${getDifficultyBadge(selectedSpot.difficulty)}`}>
                <span className="font-bold uppercase text-sm">{selectedSpot.difficulty}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-neon-orange" />
                    <span className="text-sm text-muted-foreground">Fame</span>
                  </div>
                  <div className="text-2xl font-black text-neon-orange">+{selectedSpot.fameReward}</div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-neon-lime" />
                    <span className="text-sm text-muted-foreground">Money</span>
                  </div>
                  <div className="text-2xl font-black text-neon-lime">${selectedSpot.moneyReward}</div>
                </Card>
              </div>

              {selectedSpot.hasGuard && (
                <div className="bg-destructive/20 border border-destructive p-3 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span className="text-sm font-bold text-destructive">Dieser Spot wird bewacht!</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowSpotDialog(false)}>
                  Abbrechen
                </Button>
                <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleStartPainting}>
                  Los geht's!
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase flex items-center gap-2">
              <Trophy className="w-6 h-6 text-neon-orange" />
              Piece Complete!
            </DialogTitle>
          </DialogHeader>
          {paintResult && (
            <div className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-black mb-2 ${getQualityText(paintResult.quality).color}`}>
                  {getQualityText(paintResult.quality).text}
                </div>
                <div className="text-lg text-muted-foreground">
                  Quality: {(paintResult.quality * 100).toFixed(0)}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-neon-orange/10 border-neon-orange">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-neon-orange" />
                    <span className="text-sm text-muted-foreground">Fame Earned</span>
                  </div>
                  <div className="text-2xl font-black text-neon-orange">+{paintResult.fame}</div>
                </Card>
                <Card className="p-4 bg-neon-lime/10 border-neon-lime">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-neon-lime" />
                    <span className="text-sm text-muted-foreground">Money Earned</span>
                  </div>
                  <div className="text-2xl font-black text-neon-lime">+${paintResult.money}</div>
                </Card>
              </div>

              <Button className="w-full" onClick={() => setShowResultDialog(false)}>
                Weiter malen!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Game;
