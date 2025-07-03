import { IsEmail, IsString, MinLength, IsOptional, IsArray, IsEnum } from 'class-validator';
import { UserRole } from '../types/user.types';

export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}

export class RegisterDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsArray()
    @IsEnum(UserRole, { each: true })
    @IsOptional()
    roles?: UserRole[];
}

export class RefreshTokenDto {
    @IsString()
    refreshToken!: string;
}

export class ChangePasswordDto {
    @IsString()
    currentPassword!: string;

    @IsString()
    @MinLength(6)
    newPassword!: string;
}

export class RequestPasswordResetDto {
    @IsEmail()
    email!: string;
}

export class ResetPasswordDto {
    @IsString()
    token!: string;

    @IsString()
    @MinLength(6)
    newPassword!: string;
}
