const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
  });

  console.log('\n📧 PROFESORES EN BD:\n');
  const [profs] = await pool.query('SELECT id, nombre, email, usuario_id FROM profesores');
  if (profs.length === 0) {
    console.log('  (ninguno)\n');
  } else {
    profs.forEach(p => console.log(`  • ${p.nombre} - ${p.email} - usuario_id: ${p.usuario_id}`));
    console.log();
  }

  console.log('👤 USUARIOS EN BD:\n');
  const [users] = await pool.query('SELECT id, usuario, email FROM usuarios');
  users.forEach(u => console.log(`  • ${u.usuario} - ${u.email}`));
  console.log();

  process.exit(0);
})();
