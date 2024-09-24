import Joi from 'joi';
import validationSchema from '../validateSchema';

interface Body {
    owner: number;
    fieldName: string;
    schedule: string;
    who_reserved_id: number;
    who_reserved_name: string;
}

const validateFunction = (body: Body) => {
    const schema = Joi.object({
        owner: Joi.number().required(),
        fieldName: Joi.string().required(),
        schedule: Joi.string().required(),
        who_reserved_id: Joi.number().required(),
        who_reserved_name: Joi.string().required(),
    });

    return validationSchema(schema, body);
};

export default validateFunction;
