const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function validarBD() {
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
    console.log('\n📊 VALIDACIÓN DE LA BASE DE DATOS\n');
    console.log('═'.repeat(50) + '\n');

    // 1. Usuarios totales
    const [usuarios] = await pool.query('SELECT COUNT(*) as count FROM usuarios');
    console.log(`👥 Total de usuarios: ${usuarios[0].count}`);

    // 2. Alumnos totales
    const [alumnos] = await pool.query('SELECT COUNT(*) as count FROM alumnos');
    console.log(`📚 Total de alumnos: ${alumnos[0].count}`);

    // 3. Profesores totales
    const [profesores] = await pool.query('SELECT COUNT(*) as count FROM profesores');
    console.log(`👨‍🏫 Total de profesores: ${profesores[0].count}\n`);

    // 4. Alumnos sin usuario
    const [alumnosSin] = await pool.query('SELECT COUNT(*) as count FROM alumnos WHERE usuario_id IS NULL');
    console.log(`⚠️  Alumnos sin usuario_id: ${alumnosSin[0].count}`);

    // 5. Profesores sin usuario
    const [profesoresSin] = await pool.query('SELECT COUNT(*) as count FROM profesores WHERE usuario_id IS NULL');
    console.log(`⚠️  Profesores sin usuario_id: ${profesoresSin[0].count}\n`);

    // 6. Usuario admin
    const [admin] = await pool.query(`
      SELECT u.usuario, u.email, u.activo,
             GROUP_CONCAT(r.nombre) as roles
      FROM usuarios u
      LEFT JOIN usuarios_roles ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      WHERE u.usuario = 'admin'
      GROUP BY u.id
    `);

    console.log('═'.repeat(50));
    console.log('\n🔐 USUARIO ADMINISTRADOR:\n');
    if (admin.length > 0) {
      console.log(`  ✓ Usuario: ${admin[0].usuario}`);
      console.log(`  ✓ Email: ${admin[0].email}`);
      console.log(`  ✓ Activo: ${admin[0].activo ? 'Sí' : 'No'}`);
      console.log(`  ✓ Rol(es): ${admin[0].roles || 'Sin asignar'}`);
      console.log('\n  Contraseña: admin123\n');
    } else {
      console.log('  ❌ No encontrado\n');
    }

    // 7. Resumen de roles
    const [roles] = await pool.query(`
      SELECT r.nombre, COUNT(ur.usuario_id) as cantidad
      FROM roles r
      LEFT JOIN usuarios_roles ur ON r.id = ur.rol_id
      GROUP BY r.id, r.nombre
      ORDER BY r.id
    `);

    console.log('═'.repeat(50));
    console.log('\n📋 USUARIOS POR ROL:\n');
    for (const rol of roles) {
      console.log(`  • ${rol.nombre}: ${rol.cantidad}`);
    }
    console.log('\n' + '═'.repeat(50));
    console.log('\n✅ Validación completada\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.sql) console.error(error.sql);
    process.exit(1);
  }
}

validarBD();
