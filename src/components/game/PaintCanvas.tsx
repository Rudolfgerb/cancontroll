import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Home, AlertTriangle, ShieldCheck, Clock, MapPin, Star } from 'lucide-react';
import { GraffitiToolbar } from './painting/GraffitiToolbar';
import { useNavigate } from 'react-router-dom';

// Tool type is now defined here as the central controller
export type Tool = 'spraycan' | 'marker' | 'fatcap' | 'skinnycap' | 'roller' | 'stencil';

interface PaintCanvasProps {
  onComplete: (quality: number) => void;
  onBusted: () => void;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  backgroundImage?: string;
  riskLevel: number;
}

const toolProperties = {
    spraycan: { size: 30, opacity: 0.7, consumption: 0.1 },
    marker: { size: 10, opacity: 1.0, consumption: 0.02 },
    fatcap: { size: 80, opacity: 0.5, consumption: 0.25 },
    skinnycap: { size: 5, opacity: 1.0, consumption: 0.01 },
    roller: { size: 120, opacity: 1.0, consumption: 0.4 },
    stencil: { size: 0, opacity: 0, consumption: 0 },
};

export const PaintCanvas: React.FC<PaintCanvasProps> = ({ onComplete, onBusted, backgroundImage, riskLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, selectColor, usePaint } = useGame();
  const navigate = useNavigate();
  
  // State
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTool, setSelectedTool] = useState<Tool>('spraycan');
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const lastPos = useRef({ x: 0, y: 0 });

  // Game State (mocked for now)
  const [stealth, setStealth] = useState(65);
  const [progress, setProgress] = useState(35);
  const [time, setTime] = useState(84);

  const getContext = () => canvasRef.current?.getContext('2d') || null;

  const saveState = useCallback(() => {
    const ctx = getContext();
    if (ctx && canvasRef.current) {
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        setUndoStack(prev => [...prev, imageData]);
    }
  }, [canvasRef.current]);

  const loadBackgroundImage = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if(canvas && ctx && backgroundImage){
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = backgroundImage;
          img.onload = () => {
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              saveState(); // Save the initial state
          };
      }
  }, [backgroundImage, saveState]);

  useEffect(() => {
    loadBackgroundImage();
  }, [loadBackgroundImage]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent): {x: number, y: number} => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (gameState.inventory.colors[gameState.inventory.selectedColor] <= 0) return;
    saveState(); // Save state before drawing
    setIsDrawing(true);
    const { x, y } = getCoords(e);
    lastPos.current = { x, y };
  }, [gameState.inventory.selectedColor, gameState.inventory.colors, saveState]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = getContext();
    if (!ctx) return;

    if (gameState.inventory.colors[gameState.inventory.selectedColor] <= 0) {
        setIsDrawing(false);
        return;
    }

    const { x, y } = getCoords(e);
    const properties = toolProperties[selectedTool];

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = gameState.inventory.selectedColor;
    ctx.lineWidth = properties.size;
    ctx.globalAlpha = properties.opacity;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    const distance = Math.sqrt(Math.pow(x - lastPos.current.x, 2) + Math.pow(y - lastPos.current.y, 2));
    console.log(`Tool: ${selectedTool}, Distance: ${distance}, Consumption: ${properties.consumption}`);
    usePaint(distance * properties.consumption);

    lastPos.current = { x, y };
  }, [isDrawing, gameState.inventory.selectedColor, selectedTool, usePaint, gameState.inventory.colors]);

  const stopDrawing = useCallback(() => setIsDrawing(false), []);

  const handleUndo = () => {
      const ctx = getContext();
      if(ctx && undoStack.length > 1) { // Need at least 2 states: current and previous
          const newStack = [...undoStack];
          newStack.pop(); // remove current state
          const lastImage = newStack[newStack.length - 1]; // get previous state
          ctx.putImageData(lastImage, 0, 0);
          setUndoStack(newStack);
      }
  };

  const handleClear = () => {
      const ctx = getContext();
      if(ctx && canvasRef.current){
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        loadBackgroundImage();
        // Reset undo stack to only have the background
        const initialStack = undoStack.length > 0 ? [undoStack[0]] : [];
        setUndoStack(initialStack);
      }
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds/60)}:${(seconds%60).toString().padStart(2,'0')}`;

  const goToAuth = () => {
    navigate('/auth');
  };

  return (
    <div className="flex h-screen w-screen bg-neutral-800 text-white font-sans">
      <GraffitiToolbar 
        selectedTool={selectedTool}
        onSelectTool={setSelectedTool}
        selectedColor={gameState.inventory.selectedColor}
        onSelectColor={selectColor}
        colorInventory={gameState.inventory.colors}
        onUndo={handleUndo}
        onClear={handleClear}
      />

      <div className="flex flex-col flex-1">
        <main 
          className="flex-1 flex items-center justify-center p-4 bg-black/50 overflow-hidden touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        >
          <canvas
            ref={canvasRef}
            width={1200} // Increased resolution
            height={800}
            className="rounded-lg shadow-lg max-w-full max-h-full"
          />
        </main>

        <footer className="bg-neutral-900 border-t-2 border-black p-3 space-y-3">
            <div className="flex items-center justify-between gap-4">
                {/* Left Side: Game Info */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <p className="font-bold text-sm truncate">Bürgersteig, Berlin-Mitte</p>
                        <div className="flex items-center gap-1 text-xs text-amber-400">
                            <AlertTriangle className="h-3 w-3"/>
                            <span>Risk: {riskLevel}</span>
                        </div>
                    </div>
                     <div className="flex items-center gap-2 text-sm font-bold">
                        <Star className="h-5 w-5 text-yellow-400" />
                        <span className="font-mono text-lg">{gameState.fame}</span>
                    </div>
                </div>

                {/* Right Side: Action Buttons */}
                <div className="flex items-center gap-4">
                     <Button className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 text-md" onClick={onBusted}>
                        🏃 RUN!
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 text-md" onClick={() => onComplete(progress / 100)}>
                        ✅ ACCEPT
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onBusted}><Home className="h-5 w-5" /></Button>
                    <Button onClick={goToAuth}>Start Painting</Button>
                </div>
            </div>

             {/* Bottom Bar: Progress */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-2.5 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                        <span className="flex items-center gap-1.5 text-green-400"><ShieldCheck className="h-4 w-4"/> STEALTH</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4"/> {formatTime(time)}</span>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full" style={{width: `${stealth}%`}}></div>
                    </div>
                </div>
                <div className="bg-black/30 p-2.5 rounded-lg space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                        <span>PROGRESS</span>
                        <span className="text-cyan-400">{progress}%</span>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{width: `${progress}%`}}></div>
                    </div>
                </div>
            </div>
        </footer>
      </div>
    </div>
  );
};
