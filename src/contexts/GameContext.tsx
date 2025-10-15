import React, { createContext, useContext, useState, useCallback } from 'react';

// ... (interfaces remain the same)
export interface GraffitiDesign {
  id: string;
  name: string;
  type: 'tag' | 'throwup' | 'piece';
  complexity: number;
  unlocked: boolean;
  cost: number;
  fameRequired: number;
}

export interface SprayColor {
  id: string;
  name: string;
  color: string;
  unlocked: boolean;
  cost: number;
}

export interface Spot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  fameReward: number;
  moneyReward: number;
  hasGuard: boolean;
  painted: boolean;
  playerPiece?: string;
  heading?: number, 
  pitch?: number
}

export interface SpotGalleryItem {
    id: string;
    spotName: string;
    imageUrl: string;
    riskLevel: number;
    timestamp: number;
}

interface GameState {
  fame: number;
  money: number;
  wantedLevel: number;
  currentSpot: Spot | null;
  inventory: {
    colors: { [colorId: string]: number }; // Maps color hex to amount (0-100)
    designs: string[];
    selectedColor: string;
    selectedDesign: string;
  };
  spots: Spot[];
  spotGallery: SpotGalleryItem[];
  stats: {
    totalPieces: number;
    spotsPainted: number;
    timesArrested: number;
    bestFame: number;
  };
}

interface GameContextType {
  gameState: GameState;
  addFame: (amount: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  increaseWanted: () => void;
  decreaseWanted: () => void;
  selectSpot: (spot: Spot | null) => void;
  paintSpot: (spotId: string, quality: number) => void;
  purchaseColor: (colorId: string, cost: number) => boolean;
  usePaint: (amount: number) => void;
  unlockDesign: (designId: string) => void;
  selectColor: (colorId: string) => void;
  selectDesign: (designId: string) => void;
  resetWanted: () => void;
  getArrested: () => void;
  addToSpotGallery: (item: SpotGalleryItem) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialSpots: Spot[] = [
    { id: 's1', name: 'Hinterhof Alley', lat: 40.714, lng: -74.005, difficulty: 'easy', fameReward: 10, moneyReward: 5, hasGuard: false, painted: false, heading: 90, pitch: 0 },
    { id: 's2', name: 'Park Mauer', lat: 40.716, lng: -74.002, difficulty: 'easy', fameReward: 15, moneyReward: 8, hasGuard: false, painted: false, heading: 200, pitch: 5 },
    { id: 's3', name: 'U-Bahn Station', lat: 40.718, lng: -74.008, difficulty: 'medium', fameReward: 30, moneyReward: 15, hasGuard: true, painted: false, heading: 120, pitch: -10 },
    { id: 's4', name: 'Hauptstraße', lat: 40.712, lng: -74.009, difficulty: 'medium', fameReward: 40, moneyReward: 20, hasGuard: true, painted: false, heading: 300, pitch: 0 },
    { id: 's5', name: 'Shopping Mall', lat: 40.710, lng: -74.001, difficulty: 'hard', fameReward: 60, moneyReward: 35, hasGuard: true, painted: false, heading: 45, pitch: -5 },
    { id: 's6', name: 'Bahnhof Gleis', lat: 40.720, lng: -74.003, difficulty: 'extreme', fameReward: 100, moneyReward: 60, hasGuard: true, painted: false, heading: 180, pitch: 10 },
    { id: 's7', name: 'Polizeiwache', lat: 40.713, lng: -74.012, difficulty: 'extreme', fameReward: 150, moneyReward: 100, hasGuard: true, painted: false, heading: 270, pitch: 0 },
];

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState>({
    fame: 0,
    money: 50,
    wantedLevel: 0,
    currentSpot: null,
    inventory: {
      colors: { '#FF1493': 100, '#00FFFF': 100 }, // Start with 2 full cans
      designs: ['simple-tag'],
      selectedColor: '#FF1493',
      selectedDesign: 'simple-tag',
    },
    spots: initialSpots,
    spotGallery: [],
    stats: {
      totalPieces: 0,
      spotsPainted: 0,
      timesArrested: 0,
      bestFame: 0,
    },
  });

  const addFame = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, fame: prev.fame + amount }));
  }, []);

  const addMoney = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, money: prev.money + amount }));
  }, []);

  const spendMoney = useCallback((amount: number): boolean => {
    if (gameState.money >= amount) {
      setGameState(prev => ({ ...prev, money: prev.money - amount }));
      return true;
    }
    return false;
  }, [gameState.money]);

  const increaseWanted = useCallback(() => {
    setGameState(prev => ({ ...prev, wantedLevel: Math.min(prev.wantedLevel + 1, 5) }));
  }, []);

  const decreaseWanted = useCallback(() => {
    setGameState(prev => ({ ...prev, wantedLevel: Math.max(prev.wantedLevel - 1, 0) }));
  }, []);

  const resetWanted = useCallback(() => {
    setGameState(prev => ({ ...prev, wantedLevel: 0 }));
  }, []);

  const selectSpot = useCallback((spot: Spot | null) => {
    setGameState(prev => ({ ...prev, currentSpot: spot }));
  }, []);

  const paintSpot = useCallback((spotId: string, quality: number) => {
    setGameState(prev => {
      const spot = prev.spots.find(s => s.id === spotId);
      if (!spot) return prev;

      const fameEarned = Math.floor(spot.fameReward * quality);
      const moneyEarned = Math.floor(spot.moneyReward * quality);

      return {
        ...prev,
        fame: prev.fame + fameEarned,
        money: prev.money + moneyEarned,
        spots: prev.spots.map(s => 
          s.id === spotId ? { ...s, painted: true } : s
        ),
        stats: {
          ...prev.stats,
          totalPieces: prev.stats.totalPieces + 1,
          spotsPainted: prev.stats.spotsPainted + 1,
          bestFame: Math.max(prev.stats.bestFame, prev.fame + fameEarned),
        },
      };
    });
  }, []);

 const purchaseColor = useCallback((colorId: string, cost: number): boolean => {
    if (gameState.money >= cost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - cost,
        inventory: {
          ...prev.inventory,
          colors: {
            ...prev.inventory.colors,
            [colorId]: 100, // Add or refill to 100%
          },
        },
      }));
      return true;
    }
    return false;
  }, [gameState.money]);

  const usePaint = useCallback((amount: number) => {
    setGameState(prev => {
        const currentAmount = prev.inventory.colors[prev.inventory.selectedColor] || 0;
        const newAmount = Math.max(0, currentAmount - amount);
        return {
            ...prev,
            inventory: {
                ...prev.inventory,
                colors: {
                    ...prev.inventory.colors,
                    [prev.inventory.selectedColor]: newAmount,
                }
            }
        }
    })
  }, [])

  const unlockDesign = useCallback((designId: string) => {
    setGameState(prev => ({ ...prev, inventory: { ...prev.inventory, designs: [...prev.inventory.designs, designId] } }));
  }, []);

  const selectColor = useCallback((colorId: string) => {
    setGameState(prev => ({ ...prev, inventory: { ...prev.inventory, selectedColor: colorId } }));
  }, []);

  const selectDesign = useCallback((designId: string) => {
    setGameState(prev => ({ ...prev, inventory: { ...prev.inventory, selectedDesign: designId } }));
  }, []);

  const getArrested = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      money: Math.floor(prev.money * 0.7),
      wantedLevel: 0,
      stats: { ...prev.stats, timesArrested: prev.stats.timesArrested + 1 },
    }));
  }, []);

  const addToSpotGallery = useCallback((item: SpotGalleryItem) => {
      setGameState(prev => ({
          ...prev,
          spotGallery: [item, ...prev.spotGallery],
      }));
  }, []);

  return (
    <GameContext.Provider
      value={{
        gameState,
        addFame,
        addMoney,
        spendMoney,
        increaseWanted,
        decreaseWanted,
        selectSpot,
        paintSpot,
        purchaseColor,
        usePaint,
        unlockDesign,
        selectColor,
        selectDesign,
        resetWanted,
        getArrested,
        addToSpotGallery,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
