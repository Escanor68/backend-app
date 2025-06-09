export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    MANAGER = 'manager',
}

export interface UserData {
    id: number;
    name: string;
    email: string;
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
    isBlocked: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserResponse {
    user: UserData;
    token: string;
}

export interface LoginResult {
    user: UserData;
    token: string;
    refreshToken: string;
}

export interface UpdateUserDto {
    name?: string;
    email?: string;
    phone?: string;
    preferredLocation?: {
        lat: number;
        lng: number;
    };
    notificationPreferences?: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
}

export interface FavoriteFieldDto {
    userId: number;
    fieldId: number;
}

export interface NotificationDto {
    userId: number;
    message: string;
    isRead: boolean;
}

export interface AuthenticatedUser {
    id: number;
    email: string;
    roles: UserRole[];
}
