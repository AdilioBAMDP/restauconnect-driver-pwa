import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Phone, Clock, DollarSign, CheckCircle, Truck, Navigation, FileText } from 'lucide-react';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';
import { Delivery, DeliveryStatus, Address } from '../types/delivery';
import { ConfirmationModal } from '../components/ConfirmationModal';

function DeliveryDetailsScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // ✅ Récupérer l'ID depuis l'URL
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<DeliveryStatus>('pending');
  const [showPickupConfirmation, setShowPickupConfirmation] = useState(false);
  const [showDeliveryConfirmation, setShowDeliveryConfirmation] = useState(false);

  // Helper pour formater les adresses
  const formatAddress = (address: string | Address): string => {
    if (typeof address === 'string') {
      return address;
    }
    return `${address.street}, ${address.city}`;
  };

  // ✅ Charger les détails de la livraison depuis l'API
  useEffect(() => {
    if (id) {
      fetchDeliveryDetails();
    }
  }, [id]);

  const fetchDeliveryDetails = async () => {
    try {
      setLoading(true);
      // 🧪 Utiliser l'endpoint de test temporairement
      console.log('🧪 PWA: Récupération détail livraison:', id);
      const response = await apiClient.get(`/tms/delivery/test/${id}`);
      
      if (response.data.delivery) {
        console.log('🧪 PWA: Détail reçu:', response.data.delivery);
        setDelivery(response.data.delivery);
        setStatus(response.data.delivery.status || 'pending');
      } else {
        toast.error('Livraison introuvable');
        navigate('/deliveries');
      }
    } catch (error: any) {
      console.error('Erreur chargement livraison:', error);
      console.error('Détails erreur:', error.response?.data);
      toast.error('Erreur lors du chargement des détails de la livraison');
      navigate('/deliveries');
      navigate('/deliveries');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Accepter la livraison (appel API)
  const handleAccept = async () => {
    if (!id) return;
    try {
      await apiClient.post(`/livreur/accept-delivery/${id}`);
      setStatus('assigned' as DeliveryStatus); // Backend retourne 'assigned' pas 'accepted'
      toast.success('Livraison acceptée !');
      fetchDeliveryDetails(); // Recharger les données
    } catch (error: any) {
      console.error('Erreur acceptation:', error);
      toast.error('Erreur lors de l\'acceptation');
    }
  };

  // ✅ Marquer comme récupéré (appel API avec confirmation)
  const handlePickupClick = () => {
    setShowPickupConfirmation(true);
  };

  const handlePickupConfirm = async (data: { code?: string; signature?: string }) => {
    if (!id) return;
    try {
      await apiClient.put(`/livreur/update-status/${id}`, { 
        status: 'picked_up',
        pickupCode: data.code,
        pickupSignature: data.signature
      });
      setStatus('picked_up');
      setShowPickupConfirmation(false);
      toast.success('Colis récupéré !');
      fetchDeliveryDetails();
    } catch (error: any) {
      console.error('Erreur récupération:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  // ✅ Démarrer la livraison (appel API)
  const handleStartDelivery = async () => {
    if (!id) return;
    try {
      await apiClient.put(`/livreur/update-status/${id}`, { status: 'in_transit' });
      setStatus('in_transit');
      toast.success('Livraison en cours !');
      navigate(`/map/${id}`); // Redirection vers la carte avec l'ID
    } catch (error: any) {
      console.error('Erreur démarrage:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // ✅ Terminer la livraison (appel API avec confirmation)
  const handleDeliverClick = () => {
    setShowDeliveryConfirmation(true);
  };

  const handleDeliverConfirm = async (data: { code?: string; signature?: string }) => {
    if (!id) return;
    try {
      await apiClient.put(`/livreur/update-status/${id}`, { 
        status: 'delivered',
        deliveryCode: data.code,
        deliverySignature: data.signature
      });
      setStatus('delivered');
      setShowDeliveryConfirmation(false);
      toast.success('Livraison terminée ! 🎉');
      setTimeout(() => navigate('/history'), 1500);
    } catch (error: any) {
      console.error('Erreur terminaison:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleReject = () => {
    toast.error('Livraison refusée');
    navigate('/deliveries');
  };

  // ✅ Voir la lettre de voiture PDF
  const handleViewWaybill = async () => {
    if (!id) return;
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
      const url = `${apiClient.defaults.baseURL}/tms/delivery/${id}/waybill?token=${encodeURIComponent(token)}`;
      window.open(url, '_blank');
    } catch (error: any) {
      console.error('Erreur ouverture lettre de voiture:', error);
      toast.error('Impossible d\'ouvrir la lettre de voiture');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!delivery) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm safe-top sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Détails livraison</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Gain */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white text-center">
          <DollarSign className="mx-auto mb-2" size={32} />
          <p className="text-3xl font-bold">
            {delivery.deliveryFee ? `${delivery.deliveryFee}€` : '12€'}
          </p>
          <p className="text-green-100">Gain estimé</p>
        </div>

        {/* Informations */}
        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex items-start space-x-3">
            <Package className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="font-semibold text-gray-800">Récupération</p>
              <p className="text-sm text-gray-600">
                {formatAddress(delivery.pickupAddress)}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-200"></div>

          <div className="flex items-start space-x-3">
            <MapPin className="text-green-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="font-semibold text-gray-800">Livraison</p>
              <p className="text-sm text-gray-600">
                {formatAddress(delivery.deliveryAddress)}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-200"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock size={20} className="text-gray-600" />
              <span className="text-gray-800">Temps estimé</span>
            </div>
            <span className="font-semibold text-gray-800">
              {delivery.estimatedDuration ? `${delivery.estimatedDuration} min` : '25 min'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin size={20} className="text-gray-600" />
              <span className="text-gray-800">Distance</span>
            </div>
            <span className="font-semibold text-gray-800">
              {delivery.estimatedDistance ? `${delivery.estimatedDistance} km` : '3.5 km'}
            </span>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Contact client</h3>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
            <Phone size={20} />
            <span>Appeler le client</span>
          </button>
        </div>

        {/* Actions selon le statut */}
        {status === 'pending' && (
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleReject}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-lg transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={handleAccept}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <CheckCircle size={20} />
              <span>Accepter</span>
            </button>
          </div>
        )}

        {(status === 'assigned' || status === 'pickup_pending') && (
          <button
            onClick={handlePickupClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Package size={20} />
            <span>Colis récupéré</span>
          </button>
        )}

        {status === 'picked_up' && (
          <button
            onClick={handleStartDelivery}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <Truck size={20} />
            <span>Démarrer la livraison</span>
          </button>
        )}

        {status === 'in_transit' && (
          <button
            onClick={handleDeliverClick}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center space-x-2 transition-colors animate-pulse"
          >
            <Navigation size={20} />
            <span>Livraison terminée</span>
          </button>
        )}

        {status === 'delivered' && (
          <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 text-center">
            <CheckCircle className="mx-auto text-green-600 mb-2" size={48} />
            <p className="text-green-800 font-semibold text-lg">Livraison terminée !</p>
            <p className="text-green-600 text-sm mt-1">Redirection en cours...</p>
          </div>
        )}

        {/* Bouton Lettre de voiture - toujours visible */}
        <button
          onClick={handleViewWaybill}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors border border-gray-300"
        >
          <FileText size={20} />
          <span>Voir la lettre de voiture</span>
        </button>
      </div>

      {/* Padding pour footer */}
      <div className="h-20"></div>

      {/* Modales de confirmation */}
      {showPickupConfirmation && delivery && (
        <ConfirmationModal
          title="Confirmer l'enlèvement"
          expectedCode={delivery.pickupCode || ''}
          onConfirm={handlePickupConfirm}
          onCancel={() => setShowPickupConfirmation(false)}
          type="pickup"
        />
      )}

      {showDeliveryConfirmation && delivery && (
        <ConfirmationModal
          title="Confirmer la livraison"
          expectedCode={delivery.deliveryCode || ''}
          onConfirm={handleDeliverConfirm}
          onCancel={() => setShowDeliveryConfirmation(false)}
          type="delivery"
        />
      )}
    </div>
  );
};

export default DeliveryDetailsScreen;
