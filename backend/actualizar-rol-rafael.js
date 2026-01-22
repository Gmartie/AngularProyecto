const pool = require('./src/config/database');

async function verificarYCorregir() {
  try {
    // 1. Obtener usuario rafael
    const [usuarios] = await pool.query('SELECT id, usuario, email FROM usuarios WHERE email = ?', ['rafael@gmail.com']);
    
    if (usuarios.length === 0) {
      console.log('❌ No se encontró usuario rafael@gmail.com');
      process.exit(1);
    }
    
    const usuarioId = usuarios[0].id;
    console.log('✅ Usuario encontrado:', usuarios[0]);
    
    // 2. Ver roles actuales
    const [rolesActuales] = await pool.query(`
      SELECT r.id, r.nombre 
      FROM roles r
      INNER JOIN usuarios_roles ur ON r.id = ur.rol_id
      WHERE ur.usuario_id = ?
    `, [usuarioId]);
    
    console.log('📋 Roles actuales:', rolesActuales);
    
    // 3. Obtener ID del rol Jefe Departamento
    const [rolJefe] = await pool.query('SELECT id FROM roles WHERE nombre = ?', ['Jefe Departamento']);
    
    if (rolJefe.length === 0) {
      console.log('❌ Rol "Jefe Departamento" no existe en la BD');
      process.exit(1);
    }
    
    console.log('✅ Rol Jefe Departamento ID:', rolJefe[0].id);
    
    // 4. Actualizar el rol
    await pool.query('DELETE FROM usuarios_roles WHERE usuario_id = ?', [usuarioId]);
    console.log('✅ Roles antiguos eliminados');
    
    await pool.query('INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?, ?)', [usuarioId, rolJefe[0].id]);
    console.log('✅ Nuevo rol asignado: Jefe Departamento');
    
    // 5. Verificar que se actualizó correctamente
    const [rolesNuevos] = await pool.query(`
      SELECT r.id, r.nombre 
      FROM roles r
      INNER JOIN usuarios_roles ur ON r.id = ur.rol_id
      WHERE ur.usuario_id = ?
    `, [usuarioId]);
    
    console.log('✅ Roles después de actualizar:', rolesNuevos);
    console.log('\n✅ Rafael ahora es Jefe Departamento');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verificarYCorregir();
