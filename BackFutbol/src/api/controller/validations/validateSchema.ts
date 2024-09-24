import Joi from 'joi';

interface ValidationResult {
    error?: string;
}

const validateSchema = async (
    schema: Joi.ObjectSchema,
    body: any,
): Promise<ValidationResult> => {
    const value = schema.validate(body);

    return value.error ? { error: value.error.message } : {};
};

export default validateSchema;
