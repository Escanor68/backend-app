// Tipos para usuarios
export interface UserProfile {
    id: string;
    email: string;
    name: string;
    phone?: string;
    roles: string[];
    preferredLocation?: {
        lat: number;
        lng: number;
    };
    notificationPreferences: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
}

// Tipos para notificaciones
export type NotificationType = 'booking_reminder' | 'payment_pending' | 'booking_cancelled';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    read: boolean;
    createdAt: string;
}

// Tipos para campos favoritos
export interface FavoriteField {
    id: string;
    fieldId: string;
    name: string;
    createdAt: string;
} 