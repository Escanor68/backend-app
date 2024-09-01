import Joi from 'joi';
import validateSchema from '../validateSchema';

interface Body {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    birthDate: string;
    gender: string;
    phoneNumber: string;
    dni: string;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        birthDate: Joi.string().required(),
        gender: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        dni: Joi.string().required(),
    });

    return validateSchema(schema, body);
};

export default validateFunction;
