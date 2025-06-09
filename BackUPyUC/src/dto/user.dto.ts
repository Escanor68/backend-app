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
} from 'class-validator';
import { Type } from 'class-transformer';

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
