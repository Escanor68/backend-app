import Joi from 'joi';
import validationSchema from '../validateSchema';

interface Body {
    id: string;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        id: Joi.string().required(),
    });

    return validationSchema(schema, body);
};

export default validateFunction;
