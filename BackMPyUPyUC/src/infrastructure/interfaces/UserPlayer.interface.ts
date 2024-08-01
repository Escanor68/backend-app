// Interfaz que define la estructura de un objeto de usuario
export interface UserPlayerObject {
    id: number; // Identificador único del usuario
    nombres: string; // Nombres del usuario
    apellidos: string; // Apellidos del usuario
    nacimiento: string; // Fecha de nacimiento del usuario (en formato de cadena)
    cuit: string; // CUIT (Clave Única de Identificación Tributaria) del usuario
    domicilio: string; // Domicilio del usuario
    celular: string; // Número de celular del usuario
    email: string; // Dirección de correo electrónico del usuario
}
