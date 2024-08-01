import { UserPlayerEntity } from '../entities/UserPlayer.entity';
import { UserPlayerObject } from '../../infrastructure/interfaces/UserPlayer.interface';

export interface UserPlayerServiceInterface {
    // Método para obtener todos los usuarios
    getAll(): Promise<Array<UserPlayerObject> | null>;

    // Método para obtener un usuario por su ID
    getId(id: number): Promise<UserPlayerObject | null>;

    // Método para buscar un usuario por su nombre
    search(name: string): Promise<UserPlayerObject | null>;

    // Método para insertar datos de un nuevo usuario
    insertData(user: UserPlayerObject): Promise<void>;

    // Método para actualizar los datos de un usuario existente
    update(id: number, newData: Partial<UserPlayerEntity>): Promise<Boolean>;
}
