import React, { useEffect, useRef } from 'react';
import { getGoogleMapsApiKey } from '@/lib/googleApi';

declare global {
    interface Window {
        google: any;
    }
}

const StreetView: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${getGoogleMapsApiKey()}&loading=async`;
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        script.onload = () => {
            if (ref.current) {
                new window.google.maps.StreetViewPanorama(ref.current, {
                    position: { lat: 40.72, lng: -74.00 },
                    pov: { heading: 165, pitch: 0 },
                    zoom: 1,
                });
            }
        };
    }, []);

    return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

export default StreetView;
