import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useGame, Spot } from '@/contexts/GameContext';
import { getGoogleMapsApiKey } from '@/lib/googleApi';
import { MapPin } from 'lucide-react';

interface CityMapProps {
  onSelectSpot: (spot: Spot) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
};

export const CityMap: React.FC<CityMapProps> = ({ onSelectSpot }) => {
  const { gameState } = useGame();

  return (
    <div className="h-full w-full">
      <LoadScript googleMapsApiKey={getGoogleMapsApiKey()}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
          options={mapOptions}
          mapTypeId="satellite"
        >
          {gameState.spots.map((spot) => (
            <Marker
              key={spot.id}
              position={{ lat: spot.lat, lng: spot.lng }}
              onClick={() => onSelectSpot(spot)}
              icon={{
                url: `data:image/svg+xml;utf8,${encodeURIComponent(
                  `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"${spot.painted ? '#34D399' : '#F97316'}\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"></path><circle cx=\"12\" cy=\"10\" r=\"3\"></circle></svg>`
                )}`,
                scaledSize: new window.google.maps.Size(48, 48),
              }}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};
