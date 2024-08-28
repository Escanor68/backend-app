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
dotenv.config();

export class UserFieldService implements UserFieldServiceInterface {
    private userFieldRepository: UserFieldRepositoryInterface;
    private resetPasswordRepository: ResetPasswordRepositoryInterface;
    private saltRounds = 10;
    private jwtSecret = process.env.JWT_SECRET || 'hello';
    private emailUser = process.env.EMAIL_USER;
    private emailPass = process.env.EMAIL_PASS;

    constructor(userFieldRepository: UserFieldRepositoryInterface,
        resetPasswordRepository: ResetPasswordRepositoryInterface,
    ) {
        this.userFieldRepository = userFieldRepository;
        this.resetPasswordRepository = this.resetPasswordRepository
    }
    public async insertData(user: UserFieldObject): Promise<void> {
        try {
            const hashedPassword = await bcrypt.hash(
                user.password,
                this.saltRounds,
            );
            user.status = 'ACTIVE';
            user.password = hashedPassword;

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
                text: `Click on this link to reset your password: ${process.env.FRONTEND_URL}/reset-password/${token}`,
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

    private async validatePassword(
        storedPassword: string,
        inputPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(inputPassword, storedPassword);
    }
}
