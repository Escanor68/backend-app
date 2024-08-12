# Etapa de construcción
FROM node:18-alpine AS builder

# Actualizar y actualizar los paquetes de Alpine
RUN apk update && apk upgrade

# Establecer el directorio de trabajo en /app
WORKDIR /app

# Copiar los archivos del proyecto al contenedor
COPY . .

# Instalar las dependencias del proyecto
RUN npm install

# Compilar la aplicación
RUN npm run build

# Etapa de producción
FROM node:18-alpine

# Establecer el directorio de trabajo en /app
WORKDIR /app

# Copiar los archivos del directorio de compilación de la etapa de construcción al contenedor
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Exponer el puerto 3000
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["node", "./dist"]
