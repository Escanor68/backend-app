import Joi from 'joi';
import validateSchema from '../validateSchema';

interface Body {
    newPassword: string;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        newPassword: Joi.string().required(),
    });

    return validateSchema(schema, body);
};

export default validateFunction;
