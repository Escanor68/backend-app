import Joi from 'joi';
import validateSchema from '../validateSchema';

interface Body {
    id: number;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        id: Joi.number().required(),
    });

    return validateSchema(schema, body);
};

export default validateFunction;