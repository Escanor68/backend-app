import Joi from 'joi';
import validateSchema from '../validateSchema';

interface Body {
    Name: string;
    email: string;
    password: string;
    phoneNumber: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    dni: string;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        Name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        createdAt: Joi.string().required(),
        updatedAt: Joi.string().required(),
        status: Joi.string().required(),
        dni: Joi.string().required(),
    });

    return validateSchema(schema, body);
};

export default validateFunction;
