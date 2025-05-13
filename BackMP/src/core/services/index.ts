import { MercadoPagoService } from './MercadoPago.service';
import {
    mercadoPagoClient,
    apiFutbolClient,
} from '../../infrastructure/clients';

export const mercadoPagoService = new MercadoPagoService(
    mercadoPagoClient,
    apiFutbolClient,
);
