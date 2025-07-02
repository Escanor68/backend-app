export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    MODERATOR = 'moderator',
}

export interface UserData {
    id: string;
    email: string;
    name: string;
    roles: UserRole[];
    notificationPreferences?: {
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
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
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
    userId: string;
    fieldId: number;
}

export interface NotificationDto {
    userId: number;
    message: string;
    isRead: boolean;
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    roles: UserRole[];
}
