import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsString()
    name!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;
}

export class LoginDto {
    @IsEmail()
    email!: string;

    @IsString()
    password!: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email!: string;
}

export class ResetPasswordDto {
    @IsString()
    token!: string;

    @IsString()
    @MinLength(8)
    password!: string;

    @IsString()
    @MinLength(8)
    confirmPassword!: string;
}

export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;
}

export class ChangePasswordDto {
    @IsString()
    currentPassword!: string;

    @IsString()
    @MinLength(6)
    newPassword!: string;
}
