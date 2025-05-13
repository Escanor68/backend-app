import Joi from 'joi';
import validationSchema from '../validateSchema';

interface Body {
    userField: string;
    availableFrom: string;
    availableUntil: string;
    fieldName: string;
    price: number;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        userField: Joi.string().required(),
        availableFrom: Joi.string().required(),
        availableUntil: Joi.string().required(),
        fieldName: Joi.string().required(),
        price: Joi.number().required(),
    });

    return validationSchema(schema, body);
};

export default validateFunction;
