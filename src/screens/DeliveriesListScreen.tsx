import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Clock, FileText } from 'lucide-react';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';
import { Delivery, Address } from '../types/delivery';

function DeliveriesListScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHistoryPage = location.pathname === '/history';
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper pour formater les adresses
  const formatAddress = (address: string | Address): string => {
    if (typeof address === 'string') {
      return address;
    }
    return `${address.street}, ${address.city}`;
  };

  // ✅ Voir la lettre de voiture PDF
  const handleViewWaybill = (deliveryId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Empêcher la navigation vers la page de détail
    try {
      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('authToken') || 
                    localStorage.getItem('auth_token') || 
                    localStorage.getItem('token');
      
      if (!token) {
        toast.error('Token d\'authentification manquant');
        return;
      }
      
      // Créer l'URL avec le token en paramètre
      const url = `${apiClient.defaults.baseURL}/tms/delivery/${deliveryId}/waybill?token=${encodeURIComponent(token)}`;
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('Erreur ouverture lettre de voiture:', error);
      toast.error('Impossible d\'ouvrir la lettre de voiture');
    }
  };

  useEffect(() => {
    fetchAvailableDeliveries();
  }, [isHistoryPage]); // Recharger quand on change de page

  const fetchAvailableDeliveries = async () => {
    try {
      setLoading(true);
      if (isHistoryPage) {
        // Page historique : récupérer les livraisons terminées
        const response = await apiClient.get('/tms/deliveries/my-deliveries', {
          params: { status: 'delivered' }
        });
        setDeliveries(response.data.deliveries || []);
      } else {
        // Page livraisons : récupérer les vraies livraisons disponibles
        console.log('📦 PWA: Récupération livraisons disponibles...');
        const response = await apiClient.get('/tms/deliveries/available');
        console.log('📦 PWA: Réponse reçue:', response.data);
        setDeliveries(response.data.deliveries || []);
      }
    } catch (error: any) {
      console.error('Erreur chargement livraisons:', error);
      console.error('Détails erreur:', error.response?.data);
      toast.error('Erreur lors du chargement des livraisons');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm safe-top sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {isHistoryPage ? 'Historique' : 'Livraisons disponibles'}
            </h1>
            <p className="text-sm text-gray-600">{deliveries.length} livraison(s)</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : deliveries.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="mx-auto text-gray-400 mb-4" size={64} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {isHistoryPage ? 'Aucune livraison terminée' : 'Aucune livraison'}
            </h2>
            <p className="text-gray-600">
              {isHistoryPage ? 'Vos livraisons terminées apparaîtront ici' : 'Passez en ligne pour recevoir des livraisons'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map((delivery) => (
              <div
                key={delivery._id}
                onClick={() => navigate(`/delivery/${delivery._id}`)}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    delivery.status === 'pending' 
                      ? 'bg-blue-100 text-blue-800' 
                      : delivery.status === 'assigned' || delivery.status === 'pickup_pending'
                      ? 'bg-amber-100 text-amber-800'
                      : delivery.status === 'picked_up'
                      ? 'bg-purple-100 text-purple-800'
                      : delivery.status === 'in_transit'
                      ? 'bg-orange-100 text-orange-800'
                      : delivery.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {delivery.status === 'pending' 
                      ? 'Disponible' 
                      : delivery.status === 'assigned' || delivery.status === 'pickup_pending'
                      ? 'Acceptée'
                      : delivery.status === 'picked_up'
                      ? 'Récupérée'
                      : delivery.status === 'in_transit'
                      ? 'En cours'
                      : delivery.status === 'delivered'
                      ? 'Terminée'
                      : delivery.status === 'cancelled'
                      ? 'Annulée'
                      : delivery.status === 'failed'
                      ? 'Échouée'
                      : delivery.status}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {delivery.deliveryFee ? `${delivery.deliveryFee}€` : 'N/A'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Package className="text-blue-600 flex-shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Récupération</p>
                      <p className="text-sm text-gray-600">
                        {formatAddress(delivery.pickupAddress)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <MapPin className="text-green-600 flex-shrink-0 mt-1" size={18} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Livraison</p>
                      <p className="text-sm text-gray-600">
                        {formatAddress(delivery.deliveryAddress)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Clock size={14} className="mr-1" />
                    {delivery.estimatedDuration ? `${delivery.estimatedDuration} min` : 'N/A'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {delivery.estimatedDistance ? `${delivery.estimatedDistance.toFixed(1)} km` : 'N/A'}
                  </span>
                </div>

                {/* Bouton Lettre de voiture */}
                <div className="mt-3">
                  <button
                    onClick={(e) => handleViewWaybill(delivery._id, e)}
                    className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-md flex items-center justify-center space-x-2 transition-colors text-sm border border-gray-200"
                  >
                    <FileText size={16} />
                    <span>Voir la lettre de voiture</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveriesListScreen;
