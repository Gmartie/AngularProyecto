/**
 * Script de migración para encriptar contraseñas existentes
 * 
 * Este script lee todas las contraseñas en texto plano de la base de datos
 * y las encripta usando bcrypt.
 * 
 * IMPORTANTE: Ejecutar este script una sola vez después de actualizar el código.
 * 
 * Uso: node migrate-passwords.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function migratePasswords() {
  let connection;
  
  try {
    console.log('🔄 Iniciando migración de contraseñas...\n');

    // Crear conexión a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'fazbearinc'
    });

    console.log('✅ Conectado a la base de datos\n');

    // Obtener todos los usuarios
    const [usuarios] = await connection.query('SELECT id, usuario, pass FROM usuario');

    console.log(`📊 Se encontraron ${usuarios.length} usuarios\n`);

    let actualizados = 0;
    let omitidos = 0;

    // Procesar cada usuario
    for (const user of usuarios) {
      // Verificar si la contraseña ya está encriptada (bcrypt genera hashes de 60 caracteres)
      if (user.pass && user.pass.startsWith('$2a$') && user.pass.length === 60) {
        console.log(`⏭️  Usuario "${user.usuario}" - Contraseña ya encriptada, omitiendo...`);
        omitidos++;
        continue;
      }

      // Encriptar la contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.pass, salt);

      // Actualizar en la base de datos
      await connection.query(
        'UPDATE usuario SET pass = ? WHERE id = ?',
        [hashedPassword, user.id]
      );

      console.log(`✅ Usuario "${user.usuario}" - Contraseña encriptada exitosamente`);
      actualizados++;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`🎉 Migración completada!`);
    console.log(`   - Contraseñas actualizadas: ${actualizados}`);
    console.log(`   - Contraseñas omitidas (ya encriptadas): ${omitidos}`);
    console.log(`   - Total usuarios: ${usuarios.length}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión cerrada\n');
    }
  }
}

// Ejecutar la migración
migratePasswords();
