import { MercadoPagoController } from './MercadoPago.controllers';
import { mercadoPagoService } from '../../core/services';

export const mercadoPagoController = new MercadoPagoController(
    mercadoPagoService,
);
