export class LoginDto {
    email: string;
    password: string;
}

export class RefreshTokenDto {
    refreshToken: string;
}

export class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export class RequestPasswordResetDto {
    email: string;
}

export class ResetPasswordDto {
    token: string;
    newPassword: string;
}
