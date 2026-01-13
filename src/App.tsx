import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { LocationProvider } from './contexts/LocationContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import DeliveriesListScreen from './screens/DeliveriesListScreen';
import DeliveryDetailsScreen from './screens/DeliveryDetailsScreen';
import MapScreen from './screens/MapScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';

/**
 * Web Spider Driver PWA
 * Application Web Progressive pour les livreurs
 * 
 * Fonctionnalités:
 * - Authentification sécurisée
 * - GPS tracking en temps réel
 * - Notifications Socket.IO
 * - Mode offline
 * - Installation PWA
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <LocationProvider>
            <Routes>
              {/* Route publique */}
              <Route path="/login" element={<LoginScreen />} />

              {/* Routes protégées */}
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardScreen />
                </ProtectedRoute>
              } />
              
              <Route path="/deliveries" element={
                <ProtectedRoute>
                  <DeliveriesListScreen />
                </ProtectedRoute>
              } />

              <Route path="/delivery/:id" element={
                <ProtectedRoute>
                  <DeliveryDetailsScreen />
                </ProtectedRoute>
              } />

              <Route path="/map/:id?" element={
                <ProtectedRoute>
                  <MapScreen />
                </ProtectedRoute>
              } />

              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfileScreen />
                </ProtectedRoute>
              } />

              <Route path="/history" element={
                <ProtectedRoute>
                  <DeliveriesListScreen />
                </ProtectedRoute>
              } />

              {/* Redirection par défaut */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Navigation inférieure globale */}
            <BottomNav />

            {/* Notifications toast */}
            <Toaster
              position="top-center"
              reverseOrder={false}
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </LocationProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
