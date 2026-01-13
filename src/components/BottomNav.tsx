import { Home, Package, History, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Navigation inférieure fixe
 * Navigation normale : 4 boutons (Accueil, Livraisons, Historique, Profil)
 */
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-t border-gray-200 shadow-2xl z-50 safe-bottom backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4 py-3">
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              isActive('/') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1 font-medium">Accueil</span>
          </button>

          <button
            onClick={() => navigate('/deliveries')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              isActive('/deliveries') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package size={24} />
            <span className="text-xs mt-1 font-medium">Livraisons</span>
          </button>

          <button
            onClick={() => navigate('/history')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              isActive('/history') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <History size={24} />
            <span className="text-xs mt-1 font-medium">Historique</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              isActive('/profile') 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User size={24} />
            <span className="text-xs mt-1 font-medium">Profil</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;
