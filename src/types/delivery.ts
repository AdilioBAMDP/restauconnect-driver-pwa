// Types partagés pour les livraisons

export type DeliveryStatus = 
  | 'pending'           // En attente d'assignation
  | 'assigned'          // Assignée au livreur (backend utilise 'assigned' pas 'accepted')
  | 'pickup_pending'    // En attente de récupération
  | 'picked_up'         // Colis récupéré
  | 'in_transit'        // En cours de livraison
  | 'delivered'         // Livrée
  | 'cancelled';        // Annulée

export interface DeliveryItem {
  name: string;
  quantity: number;
  unit: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  city: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  contactName?: string;
  contactPhone?: string;
  _id?: string;
}

export interface TrackingHistoryItem {
  status: DeliveryStatus;
  timestamp: string;
  location?: Coordinates;
  note?: string;
}

export interface Delivery {
  _id: string;
  deliveryNumber?: string;
  requesterId: string;
  supplierId: string;
  driverId?: string;
  status: DeliveryStatus;
  pickupAddress: string | Address;
  deliveryAddress: string | Address;
  pickupCoordinates?: Coordinates;
  deliveryCoordinates?: Coordinates;
  items: DeliveryItem[];
  notes?: string;
  scheduledPickupTime?: string;
  scheduledDeliveryTime?: string;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  trackingHistory: TrackingHistoryItem[];
  createdAt: string;
  updatedAt: string;
  // Codes de confirmation et signatures
  pickupCode?: string;
  pickupCodeValidated?: boolean;
  pickupSignature?: string;
  deliveryCode?: string;
  deliveryCodeValidated?: boolean;
  deliverySignature?: string;
  // Champs optionnels supplémentaires
  deliveryFee?: number;
  estimatedDuration?: number; // en minutes
  estimatedDistance?: number; // en km
}

export interface DeliveryResponse {
  success: boolean;
  delivery?: Delivery;
  deliveries?: Delivery[];
  message?: string;
  error?: string;
}
