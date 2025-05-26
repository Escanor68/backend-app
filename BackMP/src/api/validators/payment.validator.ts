import Joi from 'joi';

const paymentItemSchema = Joi.object({
    title: Joi.string()
        .required()
        .messages({
            'any.required': 'Item title is required'
        }),
    quantity: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
            'number.base': 'Quantity must be a number',
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity must be at least 1',
            'any.required': 'Quantity is required'
        }),
    unitPrice: Joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Unit price must be a number',
            'number.positive': 'Unit price must be positive',
            'any.required': 'Unit price is required'
        })
});

const createPaymentSchema = Joi.object({
    description: Joi.string()
        .required()
        .messages({
            'any.required': 'Description is required'
        }),
    amount: Joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Amount must be a number',
            'number.positive': 'Amount must be positive',
            'any.required': 'Amount is required'
        }),
    items: Joi.array()
        .items(paymentItemSchema)
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one item is required',
            'any.required': 'Items are required'
        })
});

export const validatePaymentInput = async (data: any) => {
    return createPaymentSchema.validateAsync(data);
}; 