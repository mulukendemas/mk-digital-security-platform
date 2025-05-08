import { useEffect, useRef } from 'react';

interface GoogleMapProps {
  apiKey: string;
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markerPosition?: {
    lat: number;
    lng: number;
  };
  height?: string;
}

const GoogleMap = ({ 
  apiKey, 
  center, 
  zoom, 
  markerPosition = center,
  height = '100%'
}: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    // Load Google Maps API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    
    // Define the callback function
    window.initMap = () => {
      if (mapRef.current && !mapInstanceRef.current) {
        // Create map instance
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        
        // Add marker
        new google.maps.Marker({
          position: markerPosition,
          map: mapInstanceRef.current,
          animation: google.maps.Animation.DROP,
        });
      }
    };
    
    // Add script to document
    document.head.appendChild(script);
    
    return () => {
      // Clean up
      window.initMap = undefined;
      document.head.removeChild(script);
    };
  }, [apiKey, center, zoom, markerPosition]);

  return <div ref={mapRef} style={{ width: '100%', height }} />;
};

// Add this to make TypeScript happy with the global initMap function
declare global {
  interface Window {
    initMap: () => void;
  }
}

export default GoogleMap;