import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, Navigation } from 'lucide-react';
import { useDriverLocation } from '../contexts/LocationContext';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>(); // ✅ Récupérer l'ID depuis l'URL
  const { currentLocation, isTracking, startTracking } = useDriverLocation();
  const mapRef = useRef<any>(null);
  const showDeliverButton = true; // ✅ Afficher bouton terminer

  // ✅ Terminer la livraison avec appel API
  const handleDeliver = async () => {
    if (!id) {
      toast.error('Aucune livraison en cours');
      return;
    }

    try {
      await apiClient.put(`/livreur/update-status/${id}`, { status: 'delivered' });
      toast.success('Livraison terminée ! 🎉');
      setTimeout(() => navigate('/history'), 1500);
    } catch (error: any) {
      console.error('Erreur terminaison:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  useEffect(() => {
    if (!isTracking) {
      startTracking();
    }
  }, []);

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.setView([currentLocation.lat, currentLocation.lng], 15);
    }
  }, [currentLocation]);

  const defaultCenter: [number, number] = [48.8566, 2.3522]; // Paris par défaut
  const center: [number, number] = currentLocation 
    ? [currentLocation.lat, currentLocation.lng] 
    : defaultCenter;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm safe-top z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Livraison en cours</h1>
          </div>
          
          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Navigation size={20} />
          </button>
        </div>
      </header>

      {/* Carte avec marges pour laisser place aux boutons */}
      <div className="flex-1 relative">
        {/* Carte avec padding pour éviter que les éléments ne soient cachés */}
        <div className="absolute inset-0" style={{ 
          paddingTop: '0px',
          paddingBottom: '180px', 
          paddingLeft: '16px',
          paddingRight: '16px'
        }}>
          <MapContainer
            center={center}
            zoom={15}
            style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {currentLocation && (
              <Marker position={[currentLocation.lat, currentLocation.lng]}>
                <Popup>
                  Votre position
                  <br />
                  Précision: {currentLocation.accuracy?.toFixed(0)}m
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        {!currentLocation && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-800">Recherche de votre position...</p>
            </div>
          </div>
        )}

        {/* Bouton "Livraison effectuée" superposé au-dessus du footer global */}
        {showDeliverButton && (
          <div className="absolute bottom-24 left-0 right-0 z-40 px-4">
            <button
              onClick={handleDeliver}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-5 rounded-xl flex items-center justify-center space-x-3 hover:from-green-600 hover:to-green-700 transition-all animate-pulse shadow-2xl"
            >
              <Navigation size={28} />
              <span className="text-xl">Livraison effectuée</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapScreen;
