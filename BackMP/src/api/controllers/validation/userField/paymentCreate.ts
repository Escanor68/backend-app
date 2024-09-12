import Joi from 'joi';
import validateSchema from '../validateSchema';
import { PaymentCreateRequest } from 'mercadopago/dist/clients/payment/create/types';

const validatePaymentCreateRequest = (body: PaymentCreateRequest) => {
    const schema = Joi.object({
        additional_info: Joi.object({
            ip_address: Joi.string().ip(),
            items: Joi.array().items(
                Joi.object({
                    id: Joi.string(),
                    title: Joi.string(),
                    description: Joi.string(),
                    quantity: Joi.number(),
                    unit_price: Joi.number(),
                }),
            ),
            payer: Joi.object({
                first_name: Joi.string(),
                last_name: Joi.string(),
                address: Joi.object({
                    street_name: Joi.string(),
                    street_number: Joi.number(),
                    zip_code: Joi.string(),
                }),
            }),
            shipments: Joi.object({
                receiver_address: Joi.object({
                    street_name: Joi.string(),
                    street_number: Joi.number(),
                    zip_code: Joi.string(),
                }),
            }),
        }),
        application_fee: Joi.number(),
        binary_mode: Joi.boolean(),
        callback_url: Joi.string().uri(),
        campaign_id: Joi.string(),
        capture: Joi.boolean(),
        coupon_amount: Joi.number(),
        coupon_code: Joi.string(),
        date_of_expiration: Joi.string().isoDate(),
        description: Joi.string(),
        differential_pricing_id: Joi.number(),
        external_reference: Joi.string(),
        installments: Joi.number(),
        issuer_id: Joi.number(),
        metadata: Joi.object(),
        notification_url: Joi.string().uri(),
        payment_method_id: Joi.string(),
        payment_method: Joi.object({
            data: Joi.object({
                authentication: Joi.object({
                    acs_trans_id: Joi.string(),
                    authentication_status: Joi.string(),
                    cryptogram: Joi.string(),
                    ds_trans_id: Joi.string(),
                    eci: Joi.string(),
                    three_ds_server_trans_id: Joi.string(),
                    three_ds_version: Joi.string(),
                }),
            }),
        }),
        statement_descriptor: Joi.string(),
        token: Joi.string(),
        transaction_amount: Joi.number().required(),
        payer: Joi.object({
            type: Joi.string(),
            id: Joi.string(),
            email: Joi.string().email(),
            identification: Joi.object({
                type: Joi.string(),
                number: Joi.string(),
            }),
            phone: Joi.object({
                area_code: Joi.string(),
                number: Joi.string(),
            }),
            first_name: Joi.string(),
            last_name: Joi.string(),
            entity_type: Joi.string(),
            address: Joi.object({
                street_name: Joi.string(),
                street_number: Joi.number(),
                zip_code: Joi.string(),
            }),
        }),
        forward_data: Joi.object({
            sub_merchant: Joi.object({
                sub_merchant_id: Joi.string(),
                mcc: Joi.string(),
                country: Joi.string(),
                address_door_number: Joi.number(),
                zip: Joi.string(),
                document_number: Joi.string(),
                city: Joi.string(),
                address_street: Joi.string(),
                business_name: Joi.string(),
                region_code_iso: Joi.string(),
                region_code: Joi.string(),
                document_type: Joi.string(),
                phone: Joi.string(),
                url: Joi.string(),
            }),
        }),
        point_of_interaction: Joi.object({
            linkedTo: Joi.string(),
            type: Joi.string(),
            sub_type: Joi.string(),
            transaction_data: Joi.object({
                first_time_use: Joi.boolean(),
                subscription_sequence: Joi.object({
                    number: Joi.number(),
                    total: Joi.number(),
                }),
                subscription_id: Joi.string(),
                invoice_period: Joi.object({
                    period: Joi.number(),
                    type: Joi.string(),
                }),
                payment_reference: Joi.object({
                    id: Joi.string(),
                }),
                billing_date: Joi.string(),
            }),
        }),
        sponsor_id: Joi.number(),
        transaction_details: Joi.object({
            financial_institution: Joi.string(),
        }),
    });

    return validateSchema(schema, body);
};

export default validatePaymentCreateRequest;
