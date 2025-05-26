import Joi from 'joi';
import { UserCredentials } from '../../core/services/authService';

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        })
});

const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Email must be a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.pattern.base': 'Password must contain at least one letter and one number',
            'any.required': 'Password is required'
        }),
    name: Joi.string()
        .min(2)
        .required()
        .messages({
            'string.min': 'Name must be at least 2 characters long',
            'any.required': 'Name is required'
        }),
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Password confirmation is required'
        })
});

export const validateLoginInput = async (data: any): Promise<UserCredentials> => {
    return loginSchema.validateAsync(data);
};

export const validateRegisterInput = async (data: any): Promise<any> => {
    return registerSchema.validateAsync(data);
}; 