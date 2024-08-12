import Joi from 'joi';
import JoiObjectId from 'joi-objectid';
import validateSchema from './validateSchema';

Joi.object = JoiObjectId(Joi);

const validateFunction = (id: string) => {
    const schema = Joi.object().required();
    return validateSchema(schema, id);
};

export default validateFunction;
