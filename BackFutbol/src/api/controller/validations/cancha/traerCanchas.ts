import Joi from 'joi';
import validationSchema from '../validateSchema';

interface Body {
    userField: number;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        userField: Joi.number().required(),
    });

    return validationSchema(schema, body);
};

export default validateFunction;
