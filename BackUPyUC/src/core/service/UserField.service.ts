import { UserFieldServiceInterface } from '../interface/UserField.service.interface';
import { UserFieldRepositoryInterface } from '../../infrastructure/interfaces/UserField.repository.interface';
import { ResetPasswordRepositoryInterface } from '../../infrastructure/interfaces/ResetPassword.repository.interface';
import { UserFieldObject } from '../../infrastructure/interfaces/UserField.interface';
import { UserFieldEntity } from '../entities/UserField.entity';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
import axios from 'axios';
dotenv.config();

export class UserFieldService implements UserFieldServiceInterface {
    private userFieldRepository: UserFieldRepositoryInterface;
    private resetPasswordRepository: ResetPasswordRepositoryInterface;
    private saltRounds = 10;
    private jwtSecret = process.env.JWT_SECRET || 'hello';
    private emailUser = process.env.EMAIL_USER;
    private emailPass = process.env.EMAIL_PASS;
    private apiKeyGoogle = process.env.API_GOOGLE;

    constructor(
        userFieldRepository: UserFieldRepositoryInterface,
        resetPasswordRepository: ResetPasswordRepositoryInterface,
    ) {
        this.userFieldRepository = userFieldRepository;
        this.resetPasswordRepository = resetPasswordRepository;
    }
    public async insertData(user: UserFieldEntity): Promise<void> {
        try {
            const hashedPassword = await bcrypt.hash(
                user.password,
                this.saltRounds,
            );

            const coordenadas = await this.getCoordinates(user.address);
            user.status = 'ACTIVE';
            user.password = hashedPassword;
            user.latitude = coordenadas.lat;
            user.latitude = coordenadas.lng;

            await this.userFieldRepository.insertData(user);
        } catch (error) {
            throw new Error('Error in insert data' + error);
        }
    }

    public async update(
        id: number,
        newData: Partial<UserFieldEntity>,
    ): Promise<Boolean> {
        try {
            const user = await this.userFieldRepository.getId(id);

            if (!user) return false;

            if (newData.password) {
                newData.password = await bcrypt.hash(
                    newData.password,
                    this.saltRounds,
                );
            }

            Object.assign(user, newData);

            await this.userFieldRepository.updateData(user);
            return true;
        } catch (error) {
            throw new Error('Error in update data' + error);
        }
    }

    public async authenticate(
        email: string,
        password: string,
    ): Promise<{ token: string; user: UserFieldObject } | null> {
        try {
            const user = await this.userFieldRepository.search(email);
            if (!user) throw new Error('User not found');
            if (!this.jwtSecret) throw new Error('JWT secret is not defined');
            if (user.status != 'ACTIVE') throw new Error('User inactive');

            const isMatch = await this.validatePassword(
                user.password,
                password,
            );

            if (!isMatch) throw new Error('Invalid Passsword');

            const token = jwt.sign(
                { id: user.id, email: user.email },
                this.jwtSecret,
                { expiresIn: '1h' },
            );

            return { token, user };
        } catch (error) {
            throw new Error('Authentication failed: ' + error);
        }
    }

    public async inactivate(id: number): Promise<Boolean> {
        try {
            const user = await this.userFieldRepository.getId(id);

            if (!user) return false;

            user.status = 'INACTIVE';
            await this.userFieldRepository.updateData(user);
            return true;
        } catch (error) {
            throw new Error('Error in inactive user' + error);
        }
    }

    public async sendTokenReset(email: string): Promise<Boolean> {
        try {
            const user = await this.userFieldRepository.search(email);
            if (!user) return false;

            const token = crypto.randomInt(100000, 999999).toString();

            await this.resetPasswordRepository.storeResetToken(
                user.id,
                token,
                new Date(Date.now() + 3600000),
            );

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: this.emailUser, pass: this.emailPass },
            });

            const mailOptions = {
                to: email,
                subject: 'Password Reset',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <title>Password Reset</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 20px;
                            }
                            .container {
                                max-width: 600px;
                                margin: 0 auto;
                                background: #ffffff;
                                padding: 20px;
                                border-radius: 8px;
                                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            }
                            h1 {
                                color: #333333;
                            }
                            .token {
                                display: block;
                                font-size: 18px;
                                color: #333333;
                                margin-top: 10px;
                                font-weight: bold;
                            }
                            .footer {
                                margin-top: 20px;
                                font-size: 14px;
                                color: #666666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>Password Reset Request</h1>
                            <p>Hello,</p>
                            <p>We received a request to reset your password. Here is your token:</p>
                            <p class="token">${token}</p>
                            <p>If you didn't request a password reset, please ignore this email.</p>
                            <p>Best regards,<br>Your Company</p>
                            <div class="footer">
                                <p>If you have any questions, feel free to contact us at support@yourcompany.com.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            };

            await transporter.sendMail(mailOptions);
            return true;
        } catch (error) {
            throw new Error('Send Token Reset Password failed: ' + error);
        }
    }

    public async resetPassword(
        token: string,
        newPassword: string,
    ): Promise<Boolean> {
        try {
            const tokenData =
                await this.resetPasswordRepository.findResetToken(token);
            if (!tokenData || tokenData.expiateToken < new Date(Date.now())) {
                throw new Error('Invalid or expired token');
            }

            const user = await this.userFieldRepository.getId(tokenData.userId);
            if (!user) return false;

            const hashedPassword = await bcrypt.hash(
                newPassword,
                this.saltRounds,
            );

            user.password = hashedPassword;
            await this.userFieldRepository.updateData(user);

            await this.resetPasswordRepository.deleteResetToken(token);

            return true;
        } catch (error) {
            throw new Error('Reset Password failed: ' + error);
        }
    }

    public async getNearbyFields(
        userLat: number,
        userLng: number,
    ): Promise<UserFieldEntity[]> {
        const allFields = await this.userFieldRepository.getAll();

        const nearbyFields = allFields.filter((field: UserFieldEntity) => {
            const distance = this.calculateDistance(
                userLat,
                userLng,
                field.latitude,
                field.longitude,
            );
            return distance <= 20; // Solo las canchas dentro de 20 km
        });

        return nearbyFields;
    }

    private async validatePassword(
        storedPassword: string,
        inputPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(inputPassword, storedPassword);
    }

    private async getCoordinates(
        address: string,
    ): Promise<{ lat: number; lng: number }> {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKeyGoogle}`;

        try {
            const response = await axios.get(url);
            const location = response.data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        } catch (error: any) {
            throw new Error(`Error al obtener coordenadas: ${error?.message}`);
        }
    }

    private calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
                Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance; // Retorna la distancia en km
    }
}
