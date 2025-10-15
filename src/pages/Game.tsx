import React, { useState } from 'react';
import { Spot } from '@/types';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { getGoogleMapsApiKey } from '@/lib/googleApi';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import Hideout from '@/components/game/Hideout';
import { CityMap } from '@/components/game/CityMap';
import Shop from '@/components/game/Shop';
import CityMap from '@/components/game/CityMap';


type GameView = 'hideout' | 'city' | 'spot';

const Game: React.FC = () => {
  const [currentView, setCurrentView] = useState<GameView>('hideout');
  const [selectedSpot, setSelectedSpot] = useState<{ spot: Spot; image?: string; riskLevel?: number } | null>(null);
  const [showSpotDialog, setShowSpotDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [paintResult, setPaintResult] = useState<{ quality: number; fame: number; money: number } | null>(null);
  
  const { gameState, selectSpot, paintSpot, resetWanted, getArrested } = useGame();
  console.log("Game Page - GameState:", gameState);
  const { playClick, playSuccess, playBusted } = useSoundEffects();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: getGoogleMapsApiKey(),
    libraries: ['marker'],
  });

  const handleSpotSelect = (spot: Spot, image?: string, riskLevel?: number) => {
    if (spot.painted) {
      toast.error('Dieser Spot wurde bereits bemalt!');
      return;
    }
    selectSpot(spot);
    setSelectedSpot({ spot, image, riskLevel });
    setShowSpotDialog(true);
    playClick();
  };

  const handlePaint = async (quality: number) => {
    if (!selectedSpot?.spot) return;

    paintSpot(selectedSpot.spot.id, quality);
    setShowSpotDialog(false);
    setShowResultDialog(true);

    //Calculate fame and money based on quality
    const fameEarned = Math.floor(selectedSpot.spot.fameReward * quality);
    const moneyEarned = Math.floor(selectedSpot.spot.moneyReward * quality);
    setPaintResult({ quality, fame: fameEarned, money: moneyEarned });
    playSuccess();
  };

  const handleArrest = () => {
    getArrested();
    setShowSpotDialog(false);
    setShowResultDialog(true);
    setPaintResult({ quality: 0, fame: 0, money: 0 });
    playBusted();
  };

  const handleResultConfirm = () => {
    setShowResultDialog(false);
    resetWanted();
  };

  const handleCloseSpotDialog = () => {
    setShowSpotDialog(false);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-2xl font-bold">Graffiti Game</h1>
      </header>

      {/* Game Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-700 text-white p-4">
          <nav>
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentView('hideout')}>
                  Hideout
                </Button>
              </li>
              <li>
                <Button variant="ghost" className="w-full justify-start" onClick={() => setCurrentView('city')}>
                  City
                </Button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">
          {currentView === 'hideout' && (
            <div className="grid grid-cols-2 gap-4">
              <Hideout />
              <Shop />
            </div>
          )}
          {currentView === 'city' && (
            <CityMap
              handleSpotSelect={handleSpotSelect}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default Game;
