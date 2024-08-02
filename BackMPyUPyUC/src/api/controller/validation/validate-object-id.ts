import Joi from 'joi';
import JoiObjectId from 'joi-objectid';
import validateSchema from './validateSchema';

// Extendiendo Joi para admitir ObjectId
Joi.object = JoiObjectId(Joi);

// Función para validar un ID
const validateFunction = (id: string) => {
    // Esquema de validación usando Joi
    const schema = Joi.object().required(); // Se requiere un objeto

    // Llamada a la función de validación genérica
    return validateSchema(schema, id);
};

export default validateFunction;
