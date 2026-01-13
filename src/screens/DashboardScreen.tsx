import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useDriverLocation } from '../contexts/LocationContext';
import { getDriverStats, DriverStats } from '../services/api';
import { 
  Truck, MapPin, Package, DollarSign, Star, Menu, 
  Power, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';

function DashboardScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isConnected, emitDriverOnline, emitDriverOffline } = useSocket();
  const { currentLocation, isTracking, startTracking, stopTracking, requestPermission } = useDriverLocation();
  
  const [isOnline, setIsOnline] = useState(() => {
    const saved = localStorage.getItem('driver_online_status');
    return saved === 'true';
  });
  const [stats, setStats] = useState<DriverStats['today']>({
    deliveries: 0,
    earnings: 0,
    rating: 0,
    distance: 0,
  });
  const [totalStats, setTotalStats] = useState<DriverStats['total']>({
    deliveries: 0,
    earnings: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Charger les statistiques
  useEffect(() => {
    loadStats();
    // Recharger toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDriverStats();
      setStats(data.today);
      setTotalStats(data.total);
      setIsLoadingStats(false);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      setIsLoadingStats(false);
    }
  };

  // Demander la permission de localisation au montage
  useEffect(() => {
    requestPermission();
  }, []);

  // Restaurer l'état en ligne au chargement
  useEffect(() => {
    if (isOnline && isConnected) {
      // Ré-émettre l'état en ligne si la page a été rechargée
      emitDriverOnline();
      if (!isTracking) {
        startTracking();
      }
    }
  }, [isConnected]);

  const toggleOnlineStatus = async () => {
    if (!isOnline) {
      // Vérifier la localisation avant de passer en ligne
      if (!isTracking) {
        const hasPermission = await requestPermission();
        if (hasPermission) {
          startTracking();
        } else {
          toast.error('La localisation est requise pour passer en ligne');
          return;
        }
      }
      
      emitDriverOnline();
      setIsOnline(true);
      localStorage.setItem('driver_online_status', 'true');
      toast.success('Vous êtes maintenant en ligne 🟢');
    } else {
      emitDriverOffline();
      stopTracking();
      setIsOnline(false);
      localStorage.setItem('driver_online_status', 'false');
      toast.success('Vous êtes maintenant hors ligne 🔴');
    }
  };

  const handleLogout = async () => {
    if (isOnline) {
      emitDriverOffline();
      stopTracking();
    }
    // Garder le statut en ligne dans localStorage pour persister entre les sessions
    // localStorage.removeItem('driver_online_status'); // ❌ Supprimé - cause perte de statut
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm safe-top">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Truck className="text-primary-600" size={28} />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Web Spider Driver</h1>
              <p className="text-sm text-gray-600">{user?.name || 'Livreur'}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell size={20} />
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Statut en ligne/hors ligne */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`}></div>
            <div>
              <p className="font-semibold text-gray-800">
                {isOnline ? '🟢 En ligne' : '🔴 Hors ligne'}
              </p>
              <p className="text-sm text-gray-600">
                {isOnline ? 'Disponible pour les livraisons' : 'Indisponible'}
              </p>
            </div>
          </div>
          
          <button
            onClick={toggleOnlineStatus}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              isOnline 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isOnline ? 'Passer hors ligne' : 'Passer en ligne'}
          </button>
        </div>
      </div>

      {/* Statistiques du jour */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Statistiques du jour</h2>
        {isLoadingStats ? (
          <div className="text-center text-gray-500 py-8">Chargement des statistiques...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Livraisons */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <Package className="text-blue-600" size={24} />
                <span className="text-sm text-green-600 font-semibold">+{stats.deliveries}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.deliveries}</p>
              <p className="text-sm text-gray-600">Livraisons</p>
            </div>

            {/* Gains */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="text-green-600" size={24} />
                <span className="text-sm text-green-600 font-semibold">+{stats.earnings}€</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.earnings}€</p>
              <p className="text-sm text-gray-600">Gains</p>
            </div>

            {/* Note */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <Star className="text-amber-500" size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.rating.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Note moyenne</p>
            </div>

            {/* Distance */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="text-purple-600" size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.distance} km</p>
              <p className="text-sm text-gray-600">Distance</p>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques globales */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Statistiques totales</h2>
        {isLoadingStats ? (
          <div className="text-center text-gray-500 py-8">Chargement...</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {/* Total Livraisons */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Package size={32} />
              </div>
              <p className="text-3xl font-bold">{totalStats.deliveries}</p>
              <p className="text-sm opacity-90 mt-1">Livraisons complétées</p>
            </div>

            {/* Total Gains */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={32} />
              </div>
              <p className="text-3xl font-bold">{totalStats.earnings.toFixed(2)}€</p>
              <p className="text-sm opacity-90 mt-1">Gains totaux</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Actions rapides</h2>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/deliveries')}
            className="bg-white hover:bg-gray-50 rounded-lg shadow p-6 text-left transition-colors"
          >
            <Package className="text-primary-600 mb-2" size={28} />
            <h3 className="font-semibold text-gray-800">Mes livraisons</h3>
            <p className="text-sm text-gray-600 mt-1">Voir toutes les livraisons</p>
          </button>

          <button
            onClick={() => navigate('/map')}
            className="bg-white hover:bg-gray-50 rounded-lg shadow p-6 text-left transition-colors"
          >
            <MapPin className="text-green-600 mb-2" size={28} />
            <h3 className="font-semibold text-gray-800">Carte</h3>
            <p className="text-sm text-gray-600 mt-1">Voir la carte</p>
          </button>
        </div>
      </div>

      {/* Info Socket */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-gray-100 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-700">
              {isConnected ? 'Temps réel connecté' : 'Temps réel déconnecté'}
            </span>
          </div>
          {currentLocation && (
            <span className="text-xs text-gray-600">
              📍 {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      {/* Footer Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex justify-around">
            <button className="flex flex-col items-center py-2 text-primary-600">
              <Truck size={24} />
              <span className="text-xs mt-1">Accueil</span>
            </button>
            <button 
              onClick={() => navigate('/deliveries')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <Package size={24} />
              <span className="text-xs mt-1">Livraisons</span>
            </button>
            <button 
              onClick={() => navigate('/map')}
              className="flex flex-col items-center py-2 text-gray-600"
            >
              <MapPin size={24} />
              <span className="text-xs mt-1">Carte</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex flex-col items-center py-2 text-red-600"
            >
              <Power size={24} />
              <span className="text-xs mt-1">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DashboardScreen;
