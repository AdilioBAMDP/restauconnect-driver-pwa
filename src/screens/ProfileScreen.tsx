import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, Mail, Phone, Truck, LogOut, Star, Package, DollarSign } from 'lucide-react';

function ProfileScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm safe-top">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Mon profil</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Avatar et nom */}
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <User size={48} className="text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{user?.name || 'Livreur'}</h2>
          <p className="text-gray-600">{user?.email}</p>
          
          <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-gray-200">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">4.8</p>
              <p className="text-sm text-gray-600">Note</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">156</p>
              <p className="text-sm text-gray-600">Livraisons</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-800">1,240€</p>
              <p className="text-sm text-gray-600">Gains</p>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <h3 className="font-semibold text-gray-800 mb-3">Informations</h3>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Mail size={20} className="text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Phone size={20} className="text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Téléphone</p>
              <p className="font-medium text-gray-800">{user?.phone || '+33 6 12 34 56 78'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <Truck size={20} className="text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Véhicule</p>
              <p className="font-medium text-gray-800">
                {user?.vehicle?.model || 'Scooter'} • {user?.vehicle?.plate || 'AB-123-CD'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Statistiques</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Star size={18} className="text-amber-500" />
                <span className="text-gray-700">Note moyenne</span>
              </div>
              <span className="font-semibold text-gray-800">4.8 / 5</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package size={18} className="text-blue-600" />
                <span className="text-gray-700">Livraisons totales</span>
              </div>
              <span className="font-semibold text-gray-800">156</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign size={18} className="text-green-600" />
                <span className="text-gray-700">Gains totaux</span>
              </div>
              <span className="font-semibold text-gray-800">1,240€</span>
            </div>
          </div>
        </div>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <LogOut size={20} />
          <span>Se déconnecter</span>
        </button>

        {/* Version */}
        <div className="text-center text-sm text-gray-500 pb-4">
          Web Spider Driver v2.0.0
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
