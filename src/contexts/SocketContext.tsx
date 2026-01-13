import { createContext, useContext, useEffect, useState, ReactNode, FC } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// 🌐 Utiliser variable d'environnement au lieu de localhost hardcódé
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emitDriverOnline: () => void;
  emitDriverOffline: () => void;
  emitLocationUpdate: (lat: number, lng: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Déconnecter si l'utilisateur n'est pas authentifié
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Créer la connexion Socket.IO
    const token = localStorage.getItem('authToken') || 
                  localStorage.getItem('auth_token') || 
                  localStorage.getItem('token');
    
    // ✅ NOUVEAU: Ne pas se connecter si pas de token (évite erreurs WebSocket)
    if (!token) {
      console.warn('⚠️ Pas de token - Connexion Socket.IO annulée');
      return;
    }
    
    const newSocket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: false, // ✅ DÉSACTIVÉ: Évite les tentatives répétées
      reconnectionAttempts: 0,
      reconnectionDelay: 2000,
    });

    // Événements de connexion
    newSocket.on('connect', () => {
      console.log('✅ Socket connecté:', newSocket.id);
      setIsConnected(true);
      toast.success('Connexion temps réel établie');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket déconnecté');
      setIsConnected(false);
      toast.error('Connexion temps réel perdue');
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnexion réussie (tentative ${attemptNumber})`);
      toast.success('Connexion rétablie');
    });

    newSocket.on('error', (error) => {
      console.error('❌ Erreur Socket:', error);
      toast.error('Erreur de connexion temps réel');
    });

    // Événements métier
    newSocket.on('new-delivery', (delivery) => {
      console.log('📦 Nouvelle livraison:', delivery);
      toast.success('Nouvelle livraison disponible !', {
        duration: 5000,
        icon: '📦',
      });
      
      // Son de notification (si autorisé)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nouvelle livraison', {
          body: `${delivery.pickupAddress?.city || 'Livraison'} • ${delivery.distance || '?'} km`,
          icon: '/icons/icon-192x192.png',
          tag: 'new-delivery',
        });
      }
    });

    newSocket.on('delivery-assigned', (data) => {
      console.log('✅ Livraison assignée:', data);
      toast.success('Livraison acceptée !');
    });

    newSocket.on('delivery-cancelled', (data) => {
      console.log('❌ Livraison annulée:', data);
      toast.error('Livraison annulée');
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  const emitDriverOnline = () => {
    if (socket && isConnected) {
      socket.emit('driver-online', { driverId: user?.id });
      console.log('🟢 Livreur en ligne');
    }
  };

  const emitDriverOffline = () => {
    if (socket && isConnected) {
      socket.emit('driver-offline', { driverId: user?.id });
      console.log('🔴 Livreur hors ligne');
    }
  };

  const emitLocationUpdate = (lat: number, lng: number) => {
    if (socket && isConnected) {
      socket.emit('location-update', {
        driverId: user?.id,
        location: { lat, lng },
        timestamp: new Date().toISOString(),
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        emitDriverOnline,
        emitDriverOffline,
        emitLocationUpdate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket doit être utilisé dans un SocketProvider');
  }
  return context;
};

export default SocketProvider;
