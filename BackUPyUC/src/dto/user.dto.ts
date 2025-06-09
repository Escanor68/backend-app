import {
    IsEmail,
    IsString,
    MinLength,
    IsOptional,
    IsArray,
    IsBoolean,
    IsObject,
    ValidateNested,
    IsLatitude,
    IsLongitude,
    IsNumber,
    IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../types/user.types';

export class LocationDto {
    @IsNumber()
    lat!: number;

    @IsNumber()
    lng!: number;
}

export class NotificationPreferencesDto {
    @IsBoolean()
    email!: boolean;

    @IsBoolean()
    push!: boolean;

    @IsBoolean()
    sms!: boolean;
}

export class CreateUserDto {
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

    @IsOptional()
    @IsArray()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[];

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => LocationDto)
    preferredLocation?: LocationDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => NotificationPreferencesDto)
    notificationPreferences?: NotificationPreferencesDto;
}

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsArray()
    @IsOptional()
    @IsEnum(UserRole, { each: true })
    roles?: UserRole[];

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => LocationDto)
    preferredLocation?: LocationDto;

    @IsOptional()
    @IsObject()
    @ValidateNested()
    @Type(() => NotificationPreferencesDto)
    notificationPreferences?: NotificationPreferencesDto;
}

export class ChangePasswordDto {
    @IsString()
    currentPassword!: string;

    @IsString()
    @MinLength(6)
    newPassword!: string;
}

export class ResetPasswordDto {
    @IsString()
    token!: string;

    @IsString()
    @MinLength(6)
    newPassword!: string;
}

export class ForgotPasswordDto {
    @IsEmail()
    email!: string;
}
