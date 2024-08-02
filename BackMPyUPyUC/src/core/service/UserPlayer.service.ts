import { UserPlayerServiceInterface } from '../interface/UserPlayer.service.interface';
import { UserPlayerRepositoryInterface } from '../../infrastructure/interfaces/UserPlayer.repository.interface';
import { UserPlayerObject } from '../../infrastructure/interfaces/UserPlayer.interface';
import { UserPlayerEntity } from '../entities/UserPlayer.entity';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class UserPlayerService implements UserPlayerServiceInterface {
    private userPlayerRepository: UserPlayerRepositoryInterface;
    private saltRounds = 10;
    private jwtSecret = process.env.JWT_SECRET;

    constructor(userPlayerRepository: UserPlayerRepositoryInterface) {
        this.userPlayerRepository = userPlayerRepository;
    }

    public async insertData(user: UserPlayerObject): Promise<void> {
        try {
            const hashedPassword = await bcrypt.hash(
                user.password,
                this.saltRounds,
            );
            user.status = 'ACTIVE';
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
            if (!user) throw new Error('User not found');
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

    private async validatePassword(
        storedPassword: string,
        inputPassword: string,
    ): Promise<boolean> {
        return bcrypt.compare(inputPassword, storedPassword);
    }
}
