import { MercadoPagoService } from './MercadoPago.service';
import { mercadoPagoClient } from '../../infrastructure/clients';

export const mercadoPagoService = new MercadoPagoService(mercadoPagoClient);
