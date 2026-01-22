const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function limpiarAlumnosSinUsuario() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log('🔄 Limpiando alumnos sin usuario_id...\n');

    // 1. Obtener alumnos sin usuario_id
    console.log('1️⃣  Buscando alumnos sin usuario_id...');
    const [alumnosSin] = await pool.query(
      'SELECT id, nombre, email FROM alumnos WHERE usuario_id IS NULL'
    );
    console.log(`   ✓ Encontrados ${alumnosSin.length} alumno(s) sin usuario\n`);

    if (alumnosSin.length === 0) {
      console.log('✅ No hay alumnos sin usuario. Base de datos limpia.\n');
      process.exit(0);
    }

    // 2. Opción 1: Eliminar alumnos sin usuario
    console.log('2️⃣  Opciones:');
    console.log('   a) Eliminar alumnos sin usuario_id');
    console.log('   b) Crear usuario para cada alumno\n');
    console.log('   Ejecutando: Opción b (crear usuarios)\n');

    for (const alumno of alumnosSin) {
      console.log(`3️⃣  Procesando alumno: ${alumno.nombre}`);
      
      if (!alumno.email) {
        console.log(`   ⚠️  No tiene email. Omitido.\n`);
        continue;
      }

      // Verificar si el email ya existe en usuarios
      const [usuarioExistente] = await pool.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [alumno.email]
      );

      if (usuarioExistente.length > 0) {
        console.log(`   ⚠️  Email ya existe como usuario. Vinculando...\n`);
        // Vincular al alumno con el usuario existente
        await pool.query(
          'UPDATE alumnos SET usuario_id = ? WHERE id = ?',
          [usuarioExistente[0].id, alumno.id]
        );
        continue;
      }

      // Crear nuevo usuario
      const passwordDelEmail = alumno.email.split('@')[0];
      const hashedPassword = await bcrypt.hash(passwordDelEmail, 10);

      // Generar nombre de usuario
      let nombreUsuario = alumno.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '.')
        .replace(/[^a-z0-9.]/g, '');

      const [result] = await pool.query(
        'INSERT INTO usuarios (usuario, email, password, activo, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
        [nombreUsuario, alumno.email, hashedPassword, true]
      );

      const usuarioId = result.insertId;

      // Asignar rol Alumno
      const [rol] = await pool.query('SELECT id FROM roles WHERE nombre = ?', ['Alumno']);
      
      if (rol.length > 0) {
        await pool.query(
          'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
          [usuarioId, rol[0].id]
        );
      }

      // Vincular alumno con usuario
      await pool.query(
        'UPDATE alumnos SET usuario_id = ? WHERE id = ?',
        [usuarioId, alumno.id]
      );

      console.log(`   ✓ Usuario creado y vinculado: ${nombreUsuario}\n`);
    }

    // 3. Verificar resultado final
    console.log('4️⃣  Verificando resultado final...');
    const [alumnosSinFinal] = await pool.query(
      'SELECT COUNT(*) as count FROM alumnos WHERE usuario_id IS NULL'
    );
    console.log(`   ✓ Alumnos sin usuario: ${alumnosSinFinal[0].count}\n`);

    console.log('✅ Limpieza completada exitosamente\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.sql) console.error(error.sql);
    process.exit(1);
  }
}

limpiarAlumnosSinUsuario();
