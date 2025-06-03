// Script de verificación para comprobar que la configuración es correcta
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración del proyecto BackUPyUC...\n');

// Verificar archivos críticos
const criticalFiles = [
    'src/index.ts',
    'src/middleware/errorHandler.ts',
    'src/middleware/notFoundHandler.ts',
    'src/config/database.ts',
    'src/config/index.ts',
    'package.json',
];

console.log('📁 Verificando archivos críticos:');
let allFilesExist = true;

criticalFiles.forEach((file) => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
});

// Verificar package.json
console.log('\n📦 Verificando dependencias:');
try {
    const packageJson = require('./package.json');

    const requiredDevDeps = ['@types/compression', '@types/swagger-ui-express'];

    requiredDevDeps.forEach((dep) => {
        const exists =
            packageJson.devDependencies && packageJson.devDependencies[dep];
        console.log(`${exists ? '✅' : '❌'} ${dep}`);
        if (!exists) allFilesExist = false;
    });
} catch (error) {
    console.log('❌ Error al leer package.json:', error.message);
    allFilesExist = false;
}

console.log('\n🏁 Resultado de la verificación:');
if (allFilesExist) {
    console.log(
        '✅ ¡Configuración completa! El proyecto debería compilar sin errores de TypeScript.',
    );
    console.log('\n🚀 Para iniciar el proyecto:');
    console.log('   npm run dev');
} else {
    console.log(
        '❌ Faltan algunos archivos o dependencias. Revisa los errores arriba.',
    );
}

console.log('\n📋 Logs de debugging implementados:');
console.log('   🚀 Inicialización del servidor');
console.log('   📡 Requests HTTP');
console.log('   🔐 Autenticación');
console.log('   👤 Operaciones de usuario');
console.log('   🔌 Socket.IO events');
console.log('   ❌ Manejo de errores');
console.log('   📦 Conexión a base de datos');
