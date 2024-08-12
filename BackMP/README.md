# Challenge Yappa

## Backend

Básicamente la idea es crear una API para mantener una tabla de clientes (ABM de Clientes).
Los campos son los siguientes:

    * id (numérico)
    * nombres (alfanumérico)
    * apellidos (alfanumérico)
    * nacimiento (fecha)
    * cuit (alfanumérico)
    * domicilio (alfanumérico)
    * teléfono celular (alfanumérico)
    * email (alfanumérico)

Para esto se pide que crees una tabla en una base de datos. Los nombres exactos de las columnas serán definidas por vos mismo, al igual que los parámetros de entrada y salida de los métodos de la API.
Se puede usar cualquier motor de base de datos relacional: MS SQL Server, MySQL, PostgreSQL,
etc...
Se tiene que desarrollar la API en el estilo API REST, la cual debe correr en un servidor HTTP. Puede ser en cualquier versión de .Net. o bien en PHP, NodeJS, etc.

Los puntos a desarrollar son los siguientes:

    1. Crear la tabla y cargar algunos datos de prueba
    2. Crear la API y resolver la conexión a la base de datos
    3. Implementar los siguientes métodos:
        a. GetAll. Obtiene todos los registros de la tabla.
        b. Get (ID). Obtiene un registro correspondiente al ID
        c. Search. Búsqueda por nombre (caracteres centrales)
        d. Insert. Crea un registro nuevo
        e. Update. Actualiza un registro

Los endpoints se ejecutarán desde un cliente tipo PostMan, Insomnia o similar.
Extras:

    * Validar la unicidad del campo ID
    * Validar los datos
        * Nombres, apellidos, CUIT, teléfono celular, email -> que sean obligatorios
        * Que Fecha de nacimiento, Email y CUIT estén correctamente formateados
    * Cualquier mejora propuesta siempre es bienvenida y suma a la evaluación de este challenge.

Ejemplos:

    * Registrar un log de errores que se produzcan
    * Realizar alguna documentación detallando el funcionamiento de la API

# API Reference

## Rutas k8s

```http
  GET /hola-mundo
```

Ruta "/hola-mundo" asociada al controlador de readiness

```http
  GET /readiness
```

Ruta "/readiness" asociada al controlador de readiness

```http
  GET /liveness
```

Ruta "/liveness" asociada al controlador de liveness

```http
  GET /
```

Ruta "/" asociada al controlador de liveness

## Rutas del Backend

### Get

```http
  GET /api/v1/get/all
```

Trae todos los usuarios

```http
  GET /api/v1/get/all
```

| Parameter | Type     | Description                 |
| :-------- | :------- | :-------------------------- |
| `body`    | `object` | **Required** id del usuario |

Trae al usuarios con el id = X

```http
  GET /api/v1/get/search
```

| Parameter | Type     | Description                   |
| :-------- | :------- | :---------------------------- |
| `body`    | `object` | **Required** name del usuario |

Trae al usuarios con el nombre o apellido = X

### Post

```http
  Post /api/v1/insert/data
```

| Parameter | Type     | Description                                                                                                      |
| :-------- | :------- | :--------------------------------------------------------------------------------------------------------------- |
| `body`    | `object` | **Required todos estos valores** (nombres, apellidos, nacimiento, cuit, domicilio, celular, email) del usuarios" |

nombres, apellidos, CUIT, teléfono celular, email -> son obligatorios para que el proceso pueda continuar su flujo. Inserta un nuevo usuario

### Put

```http
  Post /api/v1/update/data
```

| Parameter | Type     | Description                                                  |
| :-------- | :------- | :----------------------------------------------------------- |
| `body`    | `object` | **Required** id del usuario y el campo que se desee cambiar" |

Actualiza el valor o los valores de un usuario

## Authors

-   [@Ricardo Timoteo Grebosz](https://www.github.com/Escanor68)

## Environment Variables

Para ejecutar este proyecto, deberá agregar las siguientes variables de entorno a su archivo .env

`PORT="8080"`

`DB_HOST="timoteodb.cvauq48guhaz.us-east-2.rds.amazonaws.com"`

-   La base de datos se levanto mediante AWS RDS asi que se dejan los datos para poder entrar a la BD.

`DB_PORT="3306"`

`DB_USER="timoteo"`

`DB_PASS="VrSYo9eQLihjkszjXYkA"`

`DB_DATABASE="user"`

`NODE_ENV="dev"`

## Demo

### Comandos para poder correr el proceso

**Importante tener el .env y correr primero el comando npm install**

-   npm run dev : Levanta la api de manera local
-   npm test : Corre una serie de test que se realizaron a la api
