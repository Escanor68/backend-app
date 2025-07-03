"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MercadoPagoService = void 0;
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
class MercadoPagoService {
    constructor() {
        this.accessToken = config_1.config.mercadoPago.accessToken || '';
        if (!this.accessToken) {
            throw new Error('Access token de Mercado Pago no configurado');
        }
    }
    async createPreference(data) {
        try {
            const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: [
                        {
                            title: `Reserva de cancha ${data.field.name}`,
                            description: `Reserva para ${data.user.name} - ${new Date(data.booking.startTime).toLocaleString()} a ${new Date(data.booking.endTime).toLocaleString()}`,
                            quantity: 1,
                            currency_id: 'ARS',
                            unit_price: data.amount,
                        },
                    ],
                    payer: {
                        name: data.user.name,
                        email: data.user.email,
                    },
                    back_urls: {
                        success: `${config_1.config.app.url}/payment/success`,
                        failure: `${config_1.config.app.url}/payment/failure`,
                        pending: `${config_1.config.app.url}/payment/pending`,
                    },
                    auto_return: 'approved',
                    external_reference: data.booking.id,
                    notification_url: `${config_1.config.app.url}/api/webhooks/mercadopago`,
                }),
            });
            if (!response.ok) {
                throw new Error(`Error creando preferencia: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            logger_1.logger.error('Error creando preferencia de pago:', error);
            throw error;
        }
    }
    async getPayment(paymentId) {
        try {
            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Error obteniendo pago: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo pago de MercadoPago:', error);
            throw error;
        }
    }
    async getRefund(refundId) {
        try {
            const response = await fetch(`https://api.mercadopago.com/v1/refunds/${refundId}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error(`Error obteniendo reembolso: ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            logger_1.logger.error('Error obteniendo reembolso de MercadoPago:', error);
            throw error;
        }
    }
}
exports.MercadoPagoService = MercadoPagoService;
//# sourceMappingURL=mercado-pago.service.js.map