export interface CreateUserDto {
    email: string;
    password: string;
    name: string;
}

export interface UpdateUserDto {
    email?: string;
    password?: string;
    name?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RequestPasswordResetDto {
    email: string;
}

export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}
