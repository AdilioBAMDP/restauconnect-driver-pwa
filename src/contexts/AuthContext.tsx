import { createContext, useContext, useState, useEffect, ReactNode, FC } from 'react';
import { apiClient } from '../services/api';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  vehicle?: {
    type: string;
    model: string;
    plate: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si un utilisateur est déjà connecté
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erreur parsing user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Vérifier que l'utilisateur est un livreur
      if (userData.role !== 'driver' && userData.role !== 'livreur') {
        toast.error('Accès réservé aux livreurs uniquement');
        return false;
      }

      // Sauvegarder les données
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      toast.success('Connexion réussie !');
      return true;

    } catch (error: any) {
      console.error('Erreur login:', error);
      
      if (error.response?.status === 401) {
        toast.error('Email ou mot de passe incorrect');
      } else if (error.response?.status === 403) {
        toast.error('Accès non autorisé');
      } else {
        toast.error('Erreur de connexion');
      }
      
      return false;
    }
  };

  const logout = async () => {
    try {
      // Nettoyer le localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setUser(null);
      
      toast.success('Déconnexion réussie');
      
      // Rediriger vers login
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Erreur logout:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export default AuthProvider;
