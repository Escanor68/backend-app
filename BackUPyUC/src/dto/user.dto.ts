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
} from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
    @IsLatitude()
    lat: number;

    @IsLongitude()
    lng: number;
}

export class NotificationPreferencesDto {
    @IsBoolean()
    email: boolean;

    @IsBoolean()
    push: boolean;

    @IsBoolean()
    sms: boolean;
}

export class CreateUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @MinLength(2)
    name: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    roles?: string[];

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
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

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

export class UpdatePasswordDto {
    @IsString()
    @MinLength(8)
    currentPassword: string;

    @IsString()
    @MinLength(8)
    newPassword: string;
}

export class ResetPasswordDto {
    @IsString()
    token: string;

    @IsString()
    @MinLength(8)
    newPassword: string;
}

export class RequestPasswordResetDto {
    @IsEmail()
    email: string;
}
