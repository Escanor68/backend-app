import { UserPlayerEntity } from '../../core/entities/UserPlayer.entity';

// Interfaz que define los métodos que debe implementar un repositorio de usuarios
export interface UserPlayerRepositoryInterface {
    // Método para obtener todos los usuarios
    getAll(): Promise<any>;

    // Método para obtener un usuario por su ID
    getId(id: number): Promise<any>;

    // Método para buscar un usuario por su nombre
    search(name: string): Promise<any>;

    // Método para insertar datos de un usuario
    insertData(data: object): Promise<any>;
}
