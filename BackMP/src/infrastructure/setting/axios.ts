import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const axiosApiFutbol = axios.create({
    baseURL: process.env.APIFUTBOL,
});

export const axiosMercadoPagoApi = axios.create({
    baseURL: 'https://api.mercadopago.com',
    headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
    },
    maxBodyLength: Infinity,
});
