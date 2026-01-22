const bcrypt = require('bcryptjs');
const pool = require('./src/config/database');

pool.query('SELECT usuario, password FROM usuarios WHERE id = 25').then(([users]) => {
  if (users.length > 0) {
    console.log('Usuario:', users[0].usuario);
    console.log('Hash en BD:', users[0].password);
    
    // Prueba con varias contraseñas comunes
    const testPasswords = ['666777777', 'anita', 'password', 'admin', '123456'];
    
    Promise.all(testPasswords.map(pwd => 
      bcrypt.compare(pwd, users[0].password).then(match => ({ pwd, match }))
    )).then(results => {
      console.log('\nResultados de prueba:');
      results.forEach(r => console.log(`  ${r.pwd}: ${r.match ? 'CORRECTO' : 'incorrecto'}`));
      process.exit();
    });
  } else {
    console.log('Usuario no encontrado');
    process.exit();
  }
}).catch(e => { console.error(e); process.exit(1); });
