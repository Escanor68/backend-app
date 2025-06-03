import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
    private authService: AuthService;

    constructor() {
        console.log('🏗️ [AuthController] Inicializando AuthController...');
        this.authService = new AuthService();

        // Bind methods to maintain context
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.refreshToken = this.refreshToken.bind(this);
        this.logout = this.logout.bind(this);

        console.log(
            '✅ [AuthController] AuthController inicializado correctamente',
        );
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('🔐 [AuthController] login - Iniciando...');
            const { email, password } = req.body;

            console.log('📊 [AuthController] Datos de login:', {
                email,
                passwordLength: password?.length,
            });

            const result = await this.authService.login(email, password);

            console.log('✅ [AuthController] Login exitoso para:', email);
            return res.json(result);
        } catch (error) {
            console.error('❌ [AuthController] Error en login:', error);
            next(error);
        }
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('📝 [AuthController] register - Iniciando...');
            const { email, password, name } = req.body;

            console.log('📊 [AuthController] Datos de registro:', {
                email,
                name,
                passwordLength: password?.length,
            });

            const result = await this.authService.register({
                email,
                password,
                name,
            });

            console.log('✅ [AuthController] Registro exitoso para:', email);
            return res.status(201).json(result);
        } catch (error) {
            console.error('❌ [AuthController] Error en registro:', error);
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('🔄 [AuthController] refreshToken - Iniciando...');
            const { refreshToken } = req.body;

            console.log(
                '🎫 [AuthController] Refresh token presente:',
                !!refreshToken,
            );

            const result = await this.authService.refreshToken(refreshToken);

            console.log('✅ [AuthController] Token actualizado exitosamente');
            return res.json(result);
        } catch (error) {
            console.error(
                '❌ [AuthController] Error actualizando token:',
                error,
            );
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('👋 [AuthController] logout - Iniciando...');
            const { refreshToken } = req.body;

            console.log('🎫 [AuthController] Invalidando refresh token');

            await this.authService.logout(refreshToken);

            console.log('✅ [AuthController] Logout exitoso');
            return res.json({ message: 'Logout exitoso' });
        } catch (error) {
            console.error('❌ [AuthController] Error en logout:', error);
            next(error);
        }
    }
}
