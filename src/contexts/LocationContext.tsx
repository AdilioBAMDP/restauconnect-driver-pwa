import { createContext, useContext, useEffect, useState, ReactNode, FC } from 'react';
import { useSocket } from './SocketContext';
import toast from 'react-hot-toast';

interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: string;
}

interface LocationContextType {
  currentLocation: Location | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
  requestPermission: () => Promise<boolean>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { emitLocationUpdate } = useSocket();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);

  const requestPermission = async (): Promise<boolean> => {
    if (!('geolocation' in navigator)) {
      setError('La géolocalisation n\'est pas supportée');
      toast.error('Géolocalisation non disponible');
      return false;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      
      if (result.state === 'granted') {
        return true;
      } else if (result.state === 'prompt') {
        // L'utilisateur sera invité à autoriser
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => {
              resolve(true);
            },
            (error) => {
              console.error('Erreur géolocalisation:', error);
              setError('Permission refusée');
              toast.error('Permission de localisation refusée');
              resolve(false);
            }
          );
        });
      } else {
        setError('Permission de localisation refusée');
        toast.error('Veuillez autoriser la localisation dans les paramètres');
        return false;
      }
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      return false;
    }
  };

  const startTracking = () => {
    if (!('geolocation' in navigator)) {
      setError('Géolocalisation non disponible');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const location: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        };

        setCurrentLocation(location);
        setError(null);

        // Envoyer la position via Socket.IO
        emitLocationUpdate(location.lat, location.lng);
      },
      (error) => {
        console.error('Erreur watchPosition:', error);
        
        // Ne pas désactiver le tracking sur les erreurs réseau ou timeout
        if (error.code === 1) {
          // Permission refusée - seule erreur critique
          setError(error.message);
          toast.error('Permission de localisation refusée');
          setIsTracking(false);
        } else if (error.code === 2) {
          // Position indisponible (réseau) - juste logger
          console.warn('⚠️ Position temporairement indisponible (réseau)');
        } else if (error.code === 3) {
          // Timeout - juste logger, continuer à essayer
          console.warn('⚠️ Timeout de localisation, nouvelle tentative...');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // Augmenté à 30s
        maximumAge: 10000, // Cache de 10s accepté
      }
    );

    setWatchId(id);
    setIsTracking(true);
    console.log('🗺️ Tracking GPS démarré');
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
      setIsTracking(false);
      console.log('🛑 Tracking GPS arrêté');
    }
  };

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        isTracking,
        error,
        startTracking,
        stopTracking,
        requestPermission,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useDriverLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useDriverLocation doit être utilisé dans un LocationProvider');
  }
  return context;
};

export default LocationProvider;
