import Joi from 'joi';
import validateSchema from '../validateSchema';

interface Body {
    email: string;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        email: Joi.string().required(),
    });

    return validateSchema(schema, body);
};

export default validateFunction;
