import axios from 'axios';

// 🌐 Utiliser variable d'environnement au lieu de localhost hardcódé
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Instance Axios configurée
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('auth_token') || 
                  localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token invalide ou expiré
      localStorage.removeItem('authToken');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Rediriger vers login
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// ===== TYPES =====
export interface DriverStats {
  today: {
    deliveries: number;
    earnings: number;
    distance: number;
    rating: number;
  };
  total: {
    deliveries: number;
    earnings: number;
  };
}

export interface Delivery {
  _id: string;
  deliveryNumber: string;
  status: string;
  pickupAddress: any;
  deliveryAddress: any;
  items?: any[];
  pricing?: {
    deliveryFee: number;
  };
}

// ===== API FUNCTIONS =====

/**
 * Récupérer les statistiques du driver connecté
 */
export const getDriverStats = async (): Promise<DriverStats> => {
  const response = await apiClient.get('/tms/driver/stats');
  return response.data.data;
};

/**
 * Récupérer les livraisons du driver connecté
 */
export const getMyDeliveries = async (): Promise<Delivery[]> => {
  const response = await apiClient.get('/tms/deliveries/my-deliveries');
  return response.data.deliveries || [];
};

export default apiClient;
