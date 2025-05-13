import Joi from 'joi';
import validateSchema from '../validateSchema';

interface Body {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    birthDate?: string;
    gender?: string;
    phoneNumber?: string;
    dni?: string;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        id: Joi.number().required(),
        firstName: Joi.string(),
        lastName: Joi.string(),
        email: Joi.string(),
        password: Joi.string(),
        birthDate: Joi.string(),
        gender: Joi.string(),
        phoneNumber: Joi.string(),
        dni: Joi.string(),
    });

    return validateSchema(schema, body);
};

export default validateFunction;
