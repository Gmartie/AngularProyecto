/**
 * 🔍 SCRIPT DE VERIFICACIÓN - Matrículas de Pepito
 * Uso: node verificar-pepito.js
 * 
 * Este script debe ejecutarse desde la carpeta backend
 */

const pool = require('./src/config/database');

async function verificar() {
  try {
    console.log('\n=====================================================');
    console.log('🔍 VERIFICACIÓN: Matrículas de Pepito');
    console.log('=====================================================\n');

    const conn = await pool.getConnection();

    // 1. Buscar usuario Pepito
    console.log('1️⃣  Buscando usuario Pepito...');
    const [usuarios] = await conn.query(
      'SELECT id, usuario, email FROM usuarios WHERE usuario LIKE ? OR email LIKE ?',
      ['%pepito%', '%pepito%']
    );
    
    if (usuarios.length === 0) {
      console.log('❌ No se encontró usuario con "pepito" en nombre o email\n');
      const [all] = await conn.query('SELECT usuario FROM usuarios LIMIT 3');
      console.log('Usuarios disponibles:', all.map(u => u.usuario).join(', '));
      conn.release();
      return;
    }

    const usuario = usuarios[0];
    console.log(`✅ Usuario encontrado: ${usuario.usuario} (ID: ${usuario.id})\n`);

    // 2. Buscar alumno Pepito
    console.log('2️⃣  Buscando alumno Pepito...');
    const [alumnos] = await conn.query(
      'SELECT id, usuario_id, nombre FROM alumnos WHERE nombre LIKE ? OR email LIKE ?',
      ['%pepito%', '%pepito%']
    );

    if (alumnos.length === 0) {
      console.log('❌ No se encontró alumno con "pepito"\n');
      conn.release();
      return;
    }

    const alumno = alumnos[0];
    console.log(`✅ Alumno encontrado: ${alumno.nombre} (ID: ${alumno.id})`);
    console.log(`   usuario_id en BD: ${alumno.usuario_id || 'NULL'}\n`);

    // 3. Verificar vinculación
    if (alumno.usuario_id === null) {
      console.log('⚠️  PROBLEMA: Alumno NO está vinculado con usuario_id');
      console.log(`   Corrigiendo...`);
      await conn.query('UPDATE alumnos SET usuario_id = ? WHERE id = ?', [usuario.id, alumno.id]);
      console.log(`✅ Alumno vinculado correctamente\n`);
    } else {
      console.log(`✅ Alumno vinculado: usuario_id = ${alumno.usuario_id}\n`);
    }

    // 4. Buscar matrículas
    console.log('3️⃣  Buscando matrículas del alumno...');
    const [matriculas] = await conn.query(
      `SELECT m.id, m.estado, mo.nombre 
       FROM matriculas m 
       JOIN modulos mo ON m.modulo_id = mo.id 
       WHERE m.alumno_id = ?`,
      [alumno.id]
    );

    if (matriculas.length === 0) {
      console.log('❌ El alumno NO tiene matrículas\n');
      console.log('   SOLUCIÓN: Crear matrícula desde panel admin');
      console.log('   Ruta: Admin → Matrículas → Nueva Matrícula\n');
    } else {
      console.log(`✅ ${matriculas.length} matrícula(s) encontrada(s):`);
      matriculas.forEach(m => {
        console.log(`   - ${m.nombre} (Estado: ${m.estado})`);
      });
      console.log('');
    }

    // 5. Buscar matrículas ACTIVAS
    console.log('4️⃣  Buscando matrículas ACTIVAS...');
    const [activas] = await conn.query(
      `SELECT m.id, mo.nombre 
       FROM matriculas m 
       JOIN modulos mo ON m.modulo_id = mo.id 
       WHERE m.alumno_id = ? AND m.estado = 'Activa'`,
      [alumno.id]
    );

    if (activas.length === 0) {
      console.log('❌ No hay matrículas con estado ACTIVA\n');
      if (matriculas.length > 0) {
        console.log('   Existen matrículas pero con otro estado.');
        console.log('   Actualizar estado en BD:\n');
        console.log('   UPDATE matriculas SET estado = "Activa" WHERE alumno_id = ' + alumno.id);
      }
    } else {
      console.log(`✅ ${activas.length} matrícula(s) ACTIVA(s):`);
      activas.forEach(m => console.log(`   ✅ ${m.nombre}`));
      console.log('');
    }

    // 6. Resumen
    console.log('=====================================================');
    console.log('📊 RESUMEN');
    console.log('=====================================================\n');
    console.log(`Usuario: ${usuario.usuario}`);
    console.log(`Alumno: ${alumno.nombre}`);
    console.log(`Vinculación: ${alumno.usuario_id === usuario.id ? '✅ OK' : '❌ ERROR'}`);
    console.log(`Matrículas: ${matriculas.length}`);
    console.log(`Matrículas activas: ${activas.length}\n`);

    if (activas.length > 0) {
      console.log('🎉 TODO OK: El alumno tiene matrículas activas');
      console.log('   Si no aparecen en la interfaz, revisar logs del servidor\n');
    } else {
      console.log('⚠️  PROBLEMA: No hay matrículas activas\n');
    }

    conn.release();

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verificar();
