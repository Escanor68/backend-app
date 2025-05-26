import Joi from 'joi';

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

const registerSchema = Joi.object({
    name: Joi.string()
        .required()
        .messages({
            'any.required': 'Name is required'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(8)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        })
});

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string()
        .required()
        .messages({
            'any.required': 'Current password is required'
        }),
    newPassword: Joi.string()
        .min(8)
        .required()
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .messages({
            'string.min': 'New password must be at least 8 characters long',
            'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'New password is required'
        })
});

export const validateLoginInput = async (data: any) => {
    return loginSchema.validateAsync(data);
};

export const validateRegisterInput = async (data: any) => {
    return registerSchema.validateAsync(data);
};

export const validateChangePasswordInput = async (data: any) => {
    return changePasswordSchema.validateAsync(data);
}; 