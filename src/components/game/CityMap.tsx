import React, { useState, useCallback, useRef, MouseEvent } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGame, Spot } from '@/contexts/GameContext';
import { getGoogleMapsApiKey } from '@/lib/googleApi';
import { Button } from '@/components/ui/button';
import { Camera, Crop, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface CityMapProps {
  onSelectSpot: (spot: Spot, image?: string, riskLevel?: number) => void;
}

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative' as 'relative',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeId: "satellite",
  streetViewControl: false,
};

export const CityMap: React.FC<CityMapProps> = ({ onSelectSpot }) => {
  const { gameState, addToSpotGallery } = useGame();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeSpot, setActiveSpot] = useState<Spot | null>(null);
  const [isStreetViewVisible, setIsStreetViewVisible] = useState(false);
  const [croppingState, setCroppingState] = useState<{ imageUrl: string | null; spot: Spot | null }>({ imageUrl: null, spot: null });
  
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 0, height: 0 });
  const [isCropping, setIsCropping] = useState(false);
  const [riskLevel, setRiskLevel] = useState(5);
  const imageRef = useRef<HTMLImageElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (spot: Spot) => {
    if (!map) return;
    setActiveSpot(spot);
    const panorama = map.getStreetView();
    if (!panorama) return;

    const showDialogOnClose = () => {
      if (!panorama.getVisible()) {
        google.maps.event.clearListeners(panorama, 'visible_changed');
        setIsStreetViewVisible(false);
        if (!croppingState.imageUrl) {
          onSelectSpot(spot);
        }
        setActiveSpot(null);
      }
    };

    google.maps.event.clearListeners(panorama, 'visible_changed');
    panorama.addListener('visible_changed', showDialogOnClose);

    panorama.setPosition({ lat: spot.lat, lng: spot.lng });
    panorama.setPov({ heading: spot.heading || 165, pitch: spot.pitch || 0 });
    panorama.setVisible(true);
    setIsStreetViewVisible(true);
  };

  const handleScreenshot = () => {
    if (!map || !activeSpot) return;
    const panorama = map.getStreetView();
    if (!panorama || !panorama.getVisible()) return;
    
    google.maps.event.clearListeners(panorama, 'visible_changed');

    const pov = panorama.getPov();
    const position = panorama.getPosition();
    if (!position) return;

    const apiKey = getGoogleMapsApiKey();
    const url = `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${position.lat()},${position.lng()}&heading=${pov.heading}&pitch=${pov.pitch}&fov=90&key=${apiKey}`;
    
    setCroppingState({ imageUrl: url, spot: activeSpot });
    panorama.setVisible(false);
    setIsStreetViewVisible(false);
  };
  
  const handleCropAndUse = () => {
    if (!imageRef.current || !croppingState.spot) return;

    const canvas = document.createElement('canvas');
    const image = imageRef.current;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const croppedX = crop.x * scaleX;
    const croppedY = crop.y * scaleY;
    const croppedWidth = crop.width * scaleX;
    const croppedHeight = crop.height * scaleY;

    canvas.width = croppedWidth;
    canvas.height = croppedHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(image, croppedX, croppedY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
    
    const dataUrl = canvas.toDataURL('image/jpeg');

    const galleryItem = {
        id: `${croppingState.spot.id}-${Date.now()}`,
        spotName: croppingState.spot.name,
        imageUrl: dataUrl,
        riskLevel: riskLevel,
        timestamp: Date.now(),
    };
    addToSpotGallery(galleryItem);

    onSelectSpot(croppingState.spot, dataUrl, riskLevel);
    handleCancelCrop();
  };
  
  const handleCancelCrop = () => {
    setCroppingState({ imageUrl: null, spot: null });
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
    setActiveSpot(null);
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    setIsCropping(true);
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    startPos.current = { x, y };
    setCrop({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isCropping || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    setCrop({
        x: Math.min(startPos.current.x, currentX),
        y: Math.min(startPos.current.y, currentY),
        width: Math.abs(currentX - startPos.current.x),
        height: Math.abs(currentY - startPos.current.y),
    });
  };

  const handleMouseUp = () => {
    setIsCropping(false);
  };
  
  if (croppingState.imageUrl) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center p-4 gap-4">
        <div 
            className="relative select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
          <img ref={imageRef} src={croppingState.imageUrl} alt="Crop" className="max-w-full max-h-[60vh]" crossOrigin="anonymous"/>
          {crop.width > 0 && crop.height > 0 && (
            <div 
              className="absolute border-2 border-dashed border-primary bg-primary/20"
              style={{ left: crop.x, top: crop.y, width: crop.width, height: crop.height }}
            />
          )}
        </div>
        
        <div className="w-full max-w-md bg-urban-surface/20 p-4 rounded-lg">
            <div className='text-center text-white mb-2 font-bold'>Set Risk Level: <span className='text-primary text-xl'>{riskLevel}</span></div>
            <Slider
                defaultValue={[5]}
                value={[riskLevel]}
                max={10}
                step={1}
                onValueChange={(value) => setRiskLevel(value[0])}
            />
        </div>

        <div className="flex gap-4">
            <Button onClick={handleCancelCrop} variant="outline"><X className="mr-2 h-4 w-4"/> Cancel</Button>
            <Button onClick={handleCropAndUse} disabled={crop.width === 0 || crop.height === 0}><Crop className="mr-2 h-4 w-4"/> Accept & Crop</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={13}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {gameState.spots.map((spot) => (
          <Marker
            key={spot.id}
            position={{ lat: spot.lat, lng: spot.lng }}
            onClick={() => handleMarkerClick(spot)}
            icon={{
              url: `data:image/svg+xml;utf8,${encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${spot.painted ? '#34D399' : '#F97316'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`
              )}`,
              scaledSize: new window.google.maps.Size(48, 48),
            }}
          />
        ))}
        {isStreetViewVisible && (
          <div className="absolute top-4 right-4 z-10">
            <Button onClick={handleScreenshot} size="icon">
              <Camera />
            </Button>
          </div>
        )}
      </GoogleMap>
    </div>
  );
};
