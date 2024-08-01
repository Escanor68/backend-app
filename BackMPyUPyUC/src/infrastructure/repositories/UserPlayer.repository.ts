import { Repository } from 'typeorm';
import { initializeConnection } from '../utils/decorators';
import { Transactional } from 'typeorm-transactional';
import { UserPlayerRepositoryInterface } from '../interfaces/UserPlayer.repository.interface';
import { UserPlayerEntity } from '../../core/entities/UserPlayer.entity';

export class UserPlayerRepository implements UserPlayerRepositoryInterface {
    private userPlayerRepository: Repository<UserPlayerEntity>;

    constructor(userPlayerRepository: Repository<UserPlayerEntity>) {
        this.userPlayerRepository = userPlayerRepository;
    }

    // Método para obtener todos los usuarios
    @initializeConnection()
    async getAll(): Promise<UserPlayerEntity[] | null> {
        // Utilización de un QueryBuilder para obtener los usuarios como objetos crudos
        return (
            (await this.userPlayerRepository
                .createQueryBuilder('userPlayer')
                .select([])
                .getRawMany()) || null
        );
    }

    // Método para obtener un usuario por su ID
    @initializeConnection()
    async getId(id: number): Promise<UserPlayerEntity | null> {
        // Utilización de un QueryBuilder para obtener un usuario por su ID como objeto crudo
        return (
            (await this.userPlayerRepository
                .createQueryBuilder('userPlayer')
                .select([])
                .where('id = :id', { id: id })
                .getRawOne()) || null
        );
    }

    // Método para buscar usuarios por nombre o apellido
    @initializeConnection()
    async search(name: string): Promise<UserPlayerEntity | null> {
        // Utilización de un QueryBuilder para buscar usuarios por nombre o apellido utilizando LIKE
        return (
            (await this.userPlayerRepository
                .createQueryBuilder('userPlayer')
                .select([])
                .where('nombres LIKE :name', {
                    name: `%${name}%`,
                })
                .orWhere('apellidos LIKE :name', {
                    name: `%${name}%`,
                })
                .getRawOne()) || null
        );
    }

    // Método para insertar datos de usuario
    @initializeConnection()
    @Transactional()
    async insertData(data: UserPlayerEntity): Promise<UserPlayerEntity> {
        try {
            const newData = new UserPlayerEntity();
            Object.assign(newData, data);

            // Asignacion de la fecha de nacimiento
            if (newData.nacimiento) {
                newData.nacimiento = new Date(newData.nacimiento);
            }

            // Guardado de los datos del usuario en la base de datos
            return this.userPlayerRepository.save(newData);
        } catch (error) {
            // Captura de errores y lanzamiento de una excepción en caso de error
            throw new Error('Error al insertar datos de usuario: ' + error);
        }
    }
}
