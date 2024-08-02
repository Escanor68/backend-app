import Joi from 'joi';

// Definición de tipo para el resultado de la validación
interface ValidationResult {
    error?: string;
}

// Función para validar un esquema con Joi
const validateSchema = async (
    schema: Joi.ObjectSchema, // Esquema de Joi
    body: any, // Cuerpo de la solicitud a validar
): Promise<ValidationResult> => {
    // Validar el cuerpo de la solicitud con el esquema dado
    const value = schema.validate(body);

    // Devolver un objeto con el error si la validación falla
    // De lo contrario, devolver un objeto vacío
    return value.error ? { error: value.error.message } : {};
};

export default validateSchema;
