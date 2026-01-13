import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Truck, Package, Zap, MapPin, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginScreen() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Rediriger si déjà authentifié
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      const success = await login(email, password);

      if (success) {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Erreur login:', error);
    } finally {
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail('driver1@test.fr');
    setPassword('password123');
    toast.success('Identifiants de test remplis');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-500 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header avec logo */}
        <div className="text-center pt-12 pb-8 px-4 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-3xl shadow-2xl mb-6 animate-scaleIn">
            <Truck size={56} className="text-blue-600" />
          </div>
          
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Web Spider
          </h1>
          <p className="text-xl font-semibold text-blue-200 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            Driver App
          </p>
          <p className="text-sm text-blue-300 mt-2 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            Livrez. Gagnez. Excellez.
          </p>
        </div>

        {/* Features badges */}
        <div className="flex justify-center gap-3 px-4 mb-8 animate-slideUp" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <Zap size={16} className="text-yellow-300" />
            <span className="text-white text-xs font-semibold">Rapide</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <MapPin size={16} className="text-green-300" />
            <span className="text-white text-xs font-semibold">GPS Live</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <CheckCircle size={16} className="text-blue-300" />
            <span className="text-white text-xs font-semibold">Sécurisé</span>
          </div>
        </div>

        {/* Formulaire de connexion - Style mobile moderne */}
        <div className="flex-1 bg-white rounded-t-[2.5rem] shadow-2xl px-6 py-8 animate-slideUp" style={{ animationDelay: '0.6s' }}>
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bon retour ! 👋
            </h2>
            <p className="text-gray-600 mb-8">
              Connectez-vous pour commencer vos livraisons
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input - Mobile style */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-base"
                  placeholder="livreur@exemple.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>

              {/* Password Input - Mobile style */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-base"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              {/* Bouton de connexion - Style app mobile */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 active:scale-98 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Connexion en cours...</span>
                  </>
                ) : (
                  <>
                    <Package size={22} />
                    <span>Commencer mes livraisons</span>
                  </>
                )}
              </button>
            </form>

            {/* Bouton de test */}
            <div className="mt-6">
              <button
                type="button"
                onClick={fillTestCredentials}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-xl transition-all border-2 border-blue-200"
              >
                🧪 Mode Test
              </button>
            </div>

            {/* Stats preview */}
            <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">10K+</p>
                <p className="text-xs text-gray-600">Livreurs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">500K+</p>
                <p className="text-xs text-gray-600">Livraisons</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">4.8★</p>
                <p className="text-xs text-gray-600">Note app</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
