const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function migrarYCrearAdmin() {
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
    console.log('🔄 Iniciando migración y creación de usuario admin...\n');

    // 1. Verificar alumnos sin usuario
    console.log('1️⃣  Verificando alumnos sin usuario_id...');
    const [alumnosSin] = await pool.query('SELECT COUNT(*) as count FROM alumnos WHERE usuario_id IS NULL');
    console.log(`   ✓ Alumnos sin usuario: ${alumnosSin[0].count}\n`);

    // 2. Verificar profesores sin usuario
    console.log('2️⃣  Verificando profesores sin usuario_id...');
    const [profesoresSin] = await pool.query('SELECT COUNT(*) as count FROM profesores WHERE usuario_id IS NULL');
    console.log(`   ✓ Profesores sin usuario: ${profesoresSin[0].count}\n`);

    // 3. Modificar tabla profesores
    console.log('3️⃣  Modificando tabla profesores...');
    try {
      await pool.query('ALTER TABLE profesores DROP FOREIGN KEY profesores_ibfk_1');
    } catch (e) {
      console.log('   ⚠️  Foreign key no encontrada (puede que ya esté modificada)');
    }
    
    try {
      await pool.query(`
        ALTER TABLE profesores 
          MODIFY usuario_id INT NOT NULL,
          ADD CONSTRAINT fk_profesores_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      `);
      console.log('   ✓ Tabla profesores modificada\n');
    } catch (e) {
      console.log('   ⚠️  Tabla profesores ya está modificada\n');
    }

    // 4. Modificar tabla alumnos
    console.log('4️⃣  Modificando tabla alumnos...');
    try {
      await pool.query('ALTER TABLE alumnos DROP FOREIGN KEY alumnos_ibfk_1');
    } catch (e) {
      console.log('   ⚠️  Foreign key no encontrada (puede que ya esté modificada)');
    }
    
    try {
      await pool.query(`
        ALTER TABLE alumnos 
          MODIFY usuario_id INT NOT NULL,
          ADD CONSTRAINT fk_alumnos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      `);
      console.log('   ✓ Tabla alumnos modificada\n');
    } catch (e) {
      console.log('   ⚠️  Tabla alumnos ya está modificada\n');
    }

    // 5. Crear usuario admin
    console.log('5️⃣  Creando usuario admin...');
    
    // Verificar si admin ya existe
    const [adminExistente] = await pool.query('SELECT id FROM usuarios WHERE usuario = ?', ['admin']);
    
    if (adminExistente.length > 0) {
      console.log('   ⚠️  Usuario admin ya existe. Actualizando contraseña...\n');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query('UPDATE usuarios SET password = ? WHERE usuario = ?', [hashedPassword, 'admin']);
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const [result] = await pool.query(
        'INSERT INTO usuarios (usuario, email, password, activo, fecha_registro) VALUES (?, ?, ?, ?, NOW())',
        ['admin', 'admin@app.local', hashedPassword, true]
      );
      console.log('   ✓ Usuario admin creado\n');
      
      // 6. Asignar rol Administrador
      console.log('6️⃣  Asignando rol Administrador...');
      const [rol] = await pool.query('SELECT id FROM roles WHERE nombre = ?', ['Administrador']);
      
      if (rol.length > 0) {
        // Verificar si la relación ya existe
        const [relacion] = await pool.query(
          'SELECT id FROM usuarios_roles WHERE usuario_id = ? AND rol_id = ?',
          [result.insertId, rol[0].id]
        );
        
        if (relacion.length === 0) {
          await pool.query(
            'INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)',
            [result.insertId, rol[0].id]
          );
          console.log('   ✓ Rol Administrador asignado\n');
        } else {
          console.log('   ⚠️  Rol ya asignado\n');
        }
      } else {
        console.log('   ❌ Rol Administrador no encontrado\n');
      }
    }

    // 7. Verificar resultado final
    console.log('7️⃣  Verificando usuario admin...');
    const [admin] = await pool.query(`
      SELECT u.id, u.usuario, u.email, u.activo,
             GROUP_CONCAT(r.nombre) as roles
      FROM usuarios u
      LEFT JOIN usuarios_roles ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      WHERE u.usuario = ?
      GROUP BY u.id
    `, ['admin']);
    
    if (admin.length > 0) {
      console.log('   ✓ Usuario admin encontrado:');
      console.log(`     • Usuario: ${admin[0].usuario}`);
      console.log(`     • Email: ${admin[0].email}`);
      console.log(`     • Roles: ${admin[0].roles || 'Sin roles'}`);
      console.log(`     • Activo: ${admin[0].activo ? 'Sí' : 'No'}\n`);
    }

    console.log('✅ Migración completada exitosamente');
    console.log('\n📋 Credenciales admin:');
    console.log('   • Usuario: admin');
    console.log('   • Contraseña: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
    console.error(error.sql);
    process.exit(1);
  }
}

migrarYCrearAdmin();
