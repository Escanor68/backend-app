import Joi from 'joi';

export const validateUpdateProfileInput = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().optional(),
    phone: Joi.string().pattern(/^\+?[0-9]{8,15}$/).optional(),
    email: Joi.string().email().optional()
  });

  return schema.validate(data);
}; 