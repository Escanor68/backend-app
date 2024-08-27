import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const axiosApiFutbol = axios.create({
    baseURL: process.env.APIFUTBOL,
});

export const axioMercadoPagoApi = axios.create({
    baseURL: process.env.MERCADOPAGO_API,
});
