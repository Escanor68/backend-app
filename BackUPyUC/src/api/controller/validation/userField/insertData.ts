import Joi from 'joi';
import validateSchema from '../validateSchema';

interface Body {
    field_name: string;
    email: string;
    password: string;
    phoneNumber: string;
    tax_id: string;
    address: string;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        field_name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        tax_id: Joi.string().required(),
        address: Joi.string().required(),
    });

    return validateSchema(schema, body);
};

export default validateFunction;
