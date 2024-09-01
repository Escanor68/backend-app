import { UserPlayerServiceInterface } from '../interface/UserPlayer.service.interface';
import { UserPlayerRepositoryInterface } from '../../infrastructure/interfaces/UserPlayer.repository.interface';
import { ResetPasswordRepositoryInterface } from '../../infrastructure/interfaces/ResetPassword.repository.interface';
import { UserPlayerObject } from '../../infrastructure/interfaces/UserPlayer.interface';
import { UserPlayerEntity } from '../entities/UserPlayer.entity';
import moment from 'moment';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';
dotenv.config();

export class UserPlayerService implements UserPlayerServiceInterface {
    private userPlayerRepository: UserPlayerRepositoryInterface;
    private resetPasswordRepository: ResetPasswordRepositoryInterface;
    private saltRounds = 10;
    private jwtSecret = process.env.JWT_SECRET || 'hello';
    private emailUser = process.env.EMAIL_USER;
    private emailPass = process.env.EMAIL_PASS;

    constructor(
        userPlayerRepository: UserPlayerRepositoryInterface,
        resetPasswordRepository: ResetPasswordRepositoryInterface,
    ) {
        this.userPlayerRepository = userPlayerRepository;
        this.resetPasswordRepository = resetPasswordRepository;
    }

    public async insertData(user: UserPlayerObject): Promise<void> {
        try {
            const hashedPassword = await bcrypt.hash(
                user.password,
                this.saltRounds,
            );

            user.status = 'ACTIVE';
            user.createdAt = moment(new Date()).format();
            user.birthDate = moment(user.birthDate, 'DD/MM/YYYY').format();
            user.password = hashedPassword;

            await this.userPlayerRepository.insertData(user);
        } catch (error) {
            throw new Error('Error in insert data' + error);
        }
    }

    public async inactivate(id: number): Promise<Boolean> {
        try {
            const user = await this.userPlayerRepository.getId(id);

            if (!user) {
                return false;
            }

            user.status = 'INACTIVE';
            await this.userPlayerRepository.updateData(user);
            return true;
        } catch (error) {
            throw new Error('Error in inactivate user' + error);
        }
    }

    public async update(
        id: number,
        newData: Partial<UserPlayerEntity>,
    ): Promise<Boolean> {
        try {
            const user = await this.userPlayerRepository.getId(id);

            if (!user) {
                return false;
            }

            if (newData.password) {
                newData.password = await bcrypt.hash(
                    newData.password,
                    this.saltRounds,
                );
            }

            Object.assign(user, newData);
            user.updateAt = moment(new Date()).format();

            await this.userPlayerRepository.updateData(user);
            return true;
        } catch (error) {
            throw new Error('Error in update data' + error);
        }
    }

    public async authenticate(
        email: string,
        password: string,
    ): Promise<{ token: string; user: UserPlayerObject } | null> {
        try {
            const user = await this.userPlayerRepository.search(email);
            if (!user) return null;
            if (!this.jwtSecret) throw new Error('JWT secret is not defined');
            if (user.status != 'ACTIVE') throw new Error('User inactive');

            const isMatch = await this.validatePassword(
                user.password,
                password,
            );
            if (!isMatch) throw new Error('Invalid password');

            const token = jwt.sign(
                { id: user.id, email: user.email },
                this.jwtSecret,
                {
                    expiresIn: '1h',
                },
            );

            return { token, user };
        } catch (error) {
            throw new Error('Authentication failed: ' + error);
        }
    }

    public async sendTokenReset(email: string): Promise<boolean> {
        try {
            const user = await this.userPlayerRepository.search(email);
            if (!user) return false;

            const token = crypto.randomInt(100000, 999999).toString();

            await this.resetPasswordRepository.storeResetToken(
                user.id,
                token,
                new Date(Date.now() + 3600000),
            );

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: this.emailUser,
                    pass: this.emailPass,
                },
            });

            const mailOptions = {
                to: email,
                subject: 'Password Reset',
                text: `${token}`,
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
    ): Promise<boolean> {
        try {
            const tokenData =
                await this.resetPasswordRepository.findResetToken(token);
            if (!tokenData || tokenData.expiateToken < new Date(Date.now())) {
                throw new Error('Invalid or expired token');
            }

            const user = await this.userPlayerRepository.getId(
                tokenData.userId,
            );
            if (!user) return false;

            const hashedPassword = await bcrypt.hash(
                newPassword,
                this.saltRounds,
            );

            user.password = hashedPassword;
            await this.userPlayerRepository.updateData(user);

            await this.resetPasswordRepository.deleteResetToken(token);
            return true;
        } catch (error) {
            throw new Error('Reset Password failed: ' + error);
        }
    }

    private async validatePassword(
        storedPassword: string,
        inputPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(inputPassword, storedPassword);
    }
}
